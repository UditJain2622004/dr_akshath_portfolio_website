// GET    /api/admin/slots — List slots for a date (doctor-aware)
// POST   /api/admin/slots — Block/Unblock a specific slot

import { db } from '../../_utils/firebaseAdmin.js';
import { verifyAuth } from '../../_utils/authMiddleware.js';
import { sendError, sendSuccess, validateRequired, isValidDate, isValidTime } from '../../_utils/apiHelpers.js';
import { generateSlotTimes, buildSlotId, classifyBookingDate } from '../../_utils/slotGenerator.js';

export default async function handler(req, res) {
  if (req.method === 'GET') return handleGet(req, res);
  if (req.method === 'POST') return handlePost(req, res);
  return sendError(res, 405, 'Method not allowed');
}

async function handleGet(req, res) {
  const result = await verifyAuth(req);
  if (result.error) return sendError(res, result.status, result.error);

  const { user } = result;
  const { doctorId, date } = req.query;

  if (!date || !isValidDate(date)) {
    return sendError(res, 400, 'Valid date (YYYY-MM-DD) is required');
  }

  const targetDoctorId = user.role === 'doctor' ? user.doctorId : doctorId;
  if (!targetDoctorId) {
    return sendError(res, 400, 'Doctor ID is required');
  }

  try {
    const doctorDoc = await db.collection('doctors').doc(targetDoctorId).get();
    if (!doctorDoc.exists) return sendError(res, 404, 'Doctor not found');

    const doctor = doctorDoc.data();
    const dateClass = classifyBookingDate(date);

    // 1. Generate valid slots from schedule
    const slotTimes = generateSlotTimes(doctor, date);

    // 2. Check for leaves/full-day blocks
    const leaveSnapshot = await db.collection('doctorLeaves')
      .where('doctorId', '==', targetDoctorId)
      .where('startDate', '<=', date)
      .get();

    const activeLeave = leaveSnapshot.docs.find(doc => {
      const data = doc.data();
      return date <= data.endDate;
    });

    const isOnLeave = !!activeLeave;
    const leaveId = activeLeave?.id || null;

    // 3. Get existing appointments for this day
    const appointmentsSnapshot = await db.collection('appointments')
      .where('doctorId', '==', targetDoctorId)
      .where('appointmentDate', '==', date)
      .where('status', 'in', ['pending', 'confirmed', 'completed'])
      .get();

    const appointmentsByTime = {};
    appointmentsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      appointmentsByTime[data.timeSlot] = { id: doc.id, ...data };
    });

    // 4. Get manual overrides from doctorSlots
    const slotsSnapshot = await db.collection('doctorSlots')
      .where('doctorId', '==', targetDoctorId)
      .where('date', '==', date)
      .get();

    const manualOverrides = {};
    slotsSnapshot.docs.forEach(doc => {
      manualOverrides[doc.data().time] = { id: doc.id, ...doc.data() };
    });

    const slots = slotTimes.map(time => {
      const appointment = appointmentsByTime[time];
      const manual = manualOverrides[time];

      const isBlockedByLeave = isOnLeave;
      const isBlockedManually = manual?.appointmentId === 'BLOCKED';
      const isBookedByPatient = !!appointment;

      return {
        time,
        booked: isBookedByPatient || isBlockedManually || isBlockedByLeave || manual?.booked || false,
        appointmentId: appointment?.id || (isBlockedByLeave ? 'LEAVE' : (isBlockedManually ? 'BLOCKED' : null)),
        isBlocked: isBlockedManually || isBlockedByLeave,
        isLeave: isBlockedByLeave,
        isManual: !!manual,
        patientName: appointment?.patientName || null
      };
    });

    return sendSuccess(res, {
      slots,
      doctorName: doctor.name,
      isOnLeave,
      leaveId,
      dateClass: dateClass.isInstant ? 'instant' : 'request'
    });

  } catch (error) {
    console.error('Error in GET /api/admin/slots:', error);
    return sendError(res, 500, error.message);
  }
}

async function handlePost(req, res) {
  const result = await verifyAuth(req);
  if (result.error) return sendError(res, result.status, result.error);

  const { user } = result;
  const { doctorId, date, time, action } = req.body;

  const validationError = validateRequired(req.body, ['date', 'time', 'action']);
  if (validationError) return sendError(res, 400, validationError);

  const targetDoctorId = user.role === 'doctor' ? user.doctorId : doctorId;
  if (!targetDoctorId) {
    return sendError(res, 400, 'Doctor ID is required');
  }

  if (!isValidDate(date) || !isValidTime(time)) {
    return sendError(res, 400, 'Invalid date or time format');
  }

  try {
    const slotId = buildSlotId(targetDoctorId, date, time);
    const slotRef = db.collection('doctorSlots').doc(slotId);
    const slotDoc = await slotRef.get();

    if (action === 'block') {
      // Check for existing appointment
      const appSnapshot = await db.collection('appointments')
        .where('doctorId', '==', targetDoctorId)
        .where('appointmentDate', '==', date)
        .where('timeSlot', '==', time)
        .where('status', 'in', ['pending', 'confirmed'])
        .get();

      if (!appSnapshot.empty) {
        return sendError(res, 400, 'Cannot block a slot that is already booked by a patient');
      }

      await slotRef.set({
        doctorId: targetDoctorId,
        date,
        time,
        booked: true,
        appointmentId: 'BLOCKED',
        expiresAt: new Date(date + 'T23:59:59+05:30')
      }, { merge: true });

      return sendSuccess(res, { message: 'Slot blocked successfully' });
    }

    if (action === 'unblock') {
      if (slotDoc.exists && slotDoc.data().appointmentId !== 'BLOCKED') {
        const appId = slotDoc.data().appointmentId;
        if (appId) {
          return sendError(res, 400, 'Cannot unblock a slot with a patient booking. Cancel the appointment instead.');
        }
      }

      await slotRef.delete();
      return sendSuccess(res, { message: 'Slot unblocked successfully' });
    }

    return sendError(res, 400, 'Invalid action');

  } catch (error) {
    console.error('Error in POST /api/admin/slots:', error);
    return sendError(res, 500, error.message);
  }
}

