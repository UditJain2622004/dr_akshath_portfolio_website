import { db } from '../../_utils/firebaseAdmin.js';
import { generateSlotTimes, buildSlotId, classifyBookingDate } from '../../_utils/slotGenerator.js';
import { checkDoctorLeave } from '../../_utils/leaveChecker.js';
import { sendError, sendSuccess, isValidDate } from '../../_utils/apiHelpers.js';

const ACTIVE_STATUSES = ['pending', 'confirmed', 'completed'];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendError(res, 405, 'Method not allowed');
  }

  const { clinicId, date } = req.query;

  if (!date) {
    return sendError(res, 400, 'Missing required query param: date');
  }

  if (!isValidDate(date)) {
    return sendError(res, 400, 'Invalid date format. Use YYYY-MM-DD');
  }

  try {
    let clinics = [];
    if (clinicId) {
      const clinicDoc = await db.collection('clinics').doc(clinicId).get();
      if (!clinicDoc.exists) return sendError(res, 404, 'Clinic not found');
      const clinicData = clinicDoc.data();
      if (!clinicData.isActive) return sendError(res, 400, 'Clinic is currently unavailable');
      clinics = [{ id: clinicDoc.id, ...clinicData }];
    } else {
      const clinicsSnapshot = await db.collection('clinics').where('isActive', '==', true).get();
      if (clinicsSnapshot.empty) return sendError(res, 404, 'No active clinics found');
      clinics = clinicsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    const dateClass = classifyBookingDate(date);

    if (dateClass.isOutOfRange) {
      if (dateClass.daysDiff < 0) return sendError(res, 400, 'Cannot book appointments in the past');
      return sendError(res, 400, 'Appointments can only be booked up to 90 days in advance');
    }

    const appointmentsSnapshot = await db.collection('appointments')
      .where('appointmentDate', '==', date)
      .where('status', 'in', ACTIVE_STATUSES)
      .get();

    const globallyBookedTimes = new Set();
    appointmentsSnapshot.docs.forEach((doc) => globallyBookedTimes.add(doc.data().timeSlot));

    let slotQuery = db.collection('doctorSlots').where('date', '==', date);
    if (clinicId) {
      slotQuery = slotQuery.where('clinicId', '==', clinicId);
    }
    const slotsSnapshot = await slotQuery.get();

    const manualSlotsByClinicTime = {};
    slotsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      manualSlotsByClinicTime[`${data.clinicId}__${data.time}`] = data;
    });

    const nowIST = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const todayIST = nowIST.toLocaleDateString('en-CA');
    const currentHHmm = `${String(nowIST.getHours()).padStart(2, '0')}:${String(nowIST.getMinutes()).padStart(2, '0')}`;

    const responseClinics = [];
    const createBatch = db.batch();
    let hasNewSlots = false;

    for (const clinic of clinics) {
      const leaveStatus = await checkDoctorLeave(clinic.id, date);
      const slotTimes = leaveStatus.onLeave ? [] : generateSlotTimes(clinic, date);
      const slots = [];

      for (const time of slotTimes) {
        if (date === todayIST && time <= currentHHmm) {
          continue;
        }

        const key = `${clinic.id}__${time}`;
        const manual = manualSlotsByClinicTime[key];

        const booked = globallyBookedTimes.has(time) || !!manual?.booked;
        slots.push({
          time,
          booked,
        });

        if (dateClass.isInstant && !manual) {
          const slotId = buildSlotId(clinic.id, date, time);
          createBatch.set(db.collection('doctorSlots').doc(slotId), {
            clinicId: clinic.id,
            date,
            time,
            booked,
            appointmentId: booked ? 'GLOBAL_BOOKED' : null,
            expiresAt: new Date(date + 'T23:59:59+05:30'),
          }, { merge: true });
          hasNewSlots = true;
        }
      }

      responseClinics.push({
        clinicId: clinic.id,
        clinicName: clinic.name || clinic.id,
        onLeave: leaveStatus.onLeave,
        leaveReason: leaveStatus.reason || null,
        slots,
      });
    }

    if (hasNewSlots) {
      await createBatch.commit();
    }

    return sendSuccess(res, {
      bookingType: dateClass.isInstant ? 'instant' : 'request',
      clinics: responseClinics,
    });
  } catch (error) {
    console.error('Error in /api/slots:', error);
    return sendError(res, 500, `Internal server error: ${error.message}`);
  }
}
