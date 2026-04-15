// GET /api/slots?doctorId=X&date=YYYY-MM-DD
//
// Returns available time slots for a doctor on a given date.
// For dates within 20 days: generates and stores slots in Firestore (lazy generation).
// For dates 21-90 days out: generates virtual slots from schedule (not stored).
// Checks doctor leaves and marks booked slots.

import { db } from '../../_utils/firebaseAdmin.js';
import { generateSlotTimes, buildSlotId, classifyBookingDate } from '../../_utils/slotGenerator.js';
import { checkDoctorLeave } from '../../_utils/leaveChecker.js';
import { sendError, sendSuccess, isValidDate } from '../../_utils/apiHelpers.js';

export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return sendError(res, 405, 'Method not allowed');
  }

  const { doctorId, date } = req.query;

  // --- Validate inputs ---
  if (!doctorId || !date) {
    return sendError(res, 400, 'Missing required query params: doctorId, date');
  }

  if (!isValidDate(date)) {
    return sendError(res, 400, 'Invalid date format. Use YYYY-MM-DD');
  }

  try {
    // --- Check if doctor exists and is active ---
    const doctorDoc = await db.collection('doctors').doc(doctorId).get();
    if (!doctorDoc.exists) {
      return sendError(res, 404, 'Doctor not found');
    }

    const doctor = doctorDoc.data();
    if (!doctor.isActive) {
      return sendError(res, 400, 'Doctor is currently unavailable');
    }

    // --- Check doctor leave ---
    const leaveStatus = await checkDoctorLeave(doctorId, date);
    if (leaveStatus.onLeave) {
      return sendSuccess(res, {
        slots: [],
        onLeave: true,
        leaveReason: leaveStatus.reason,
        bookingType: null,
      });
    }

    // --- Classify the booking date ---
    const dateClass = classifyBookingDate(date);

    if (dateClass.isOutOfRange) {
      if (dateClass.daysDiff < 0) {
        return sendError(res, 400, 'Cannot book appointments in the past');
      }
      return sendError(res, 400, 'Appointments can only be booked up to 90 days in advance');
    }

    // --- Generate slot times from doctor schedule ---
    const slotTimes = generateSlotTimes(doctor, date);

    if (slotTimes.length === 0) {
      return sendSuccess(res, {
        slots: [],
        onLeave: false,
        bookingType: dateClass.isInstant ? 'instant' : 'request',
        message: 'Doctor does not have a schedule for this day',
      });
    }

    // --- Get existing appointments for this day ---
    const appointmentsSnapshot = await db.collection('appointments')
      .where('doctorId', '==', doctorId)
      .where('appointmentDate', '==', date)
      .where('status', 'in', ['pending', 'confirmed', 'completed'])
      .get();

    const appointmentsByTime = {};
    appointmentsSnapshot.docs.forEach(doc => {
      appointmentsByTime[doc.data().timeSlot] = doc.id;
    });

    // --- Handling for Instant vs Request ---
    let finalSlots = [];

    if (dateClass.isInstant) {
      // 1. Get current slot overrides
      const existingSlotsSnapshot = await db
        .collection('doctorSlots')
        .where('doctorId', '==', doctorId)
        .where('date', '==', date)
        .get();

      const existingSlotsByTime = {};
      existingSlotsSnapshot.docs.forEach(doc => {
        existingSlotsByTime[doc.data().time] = doc.data();
      });

      const batch = db.batch();
      let hasNewSlots = false;
      const expireDate = new Date(date + 'T23:59:59+05:30');

      finalSlots = slotTimes.map(time => {
        const appointmentId = appointmentsByTime[time];
        const existing = existingSlotsByTime[time];

        // Determine booked status
        let isBooked = !!appointmentId || !!existing?.booked;

        // If it's already in Firestore, use it
        if (existing) {
          // If Firestore says unbooked but we found an appointment, we should ideally sync it, 
          // but for the response, just return it as booked.
          return {
            time,
            booked: isBooked,
          };
        } else {
          // Lazy generate
          const slotId = buildSlotId(doctorId, date, time);
          const slotData = {
            doctorId,
            date,
            time,
            booked: !!appointmentId,
            appointmentId: appointmentId || null,
            expiresAt: expireDate,
          };
          batch.set(db.collection('doctorSlots').doc(slotId), slotData);
          hasNewSlots = true;
          return { time, booked: slotData.booked };
        }
      });

      if (hasNewSlots) await batch.commit();
    } else {
      // Request booking (Virtual slots)
      finalSlots = slotTimes.map(time => ({
        time,
        booked: !!appointmentsByTime[time],
      }));
    }

    // --- Filter out past slots if the date is today (IST) ---
    const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const todayIST = nowIST.toLocaleDateString('en-CA'); // YYYY-MM-DD

    if (date === todayIST) {
      const currentHHmm = `${String(nowIST.getHours()).padStart(2, '0')}:${String(nowIST.getMinutes()).padStart(2, '0')}`;
      finalSlots = finalSlots.filter(s => s.time > currentHHmm);
    }

    return sendSuccess(res, {
      slots: finalSlots,
      onLeave: false,
      bookingType: dateClass.isInstant ? 'instant' : 'request',
    });


  } catch (error) {
    console.error('Error in /api/slots:', error);
    return sendError(res, 500, `Internal server error: ${error.message}`);
  }
}
