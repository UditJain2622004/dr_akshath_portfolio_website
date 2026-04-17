import { db } from '../../_utils/firebaseAdmin.js';
import { verifyAuth } from '../../_utils/authMiddleware.js';
import { sendError, sendSuccess, validateRequired, isValidDate, isValidTime } from '../../_utils/apiHelpers.js';
import { generateSlotTimes, buildSlotId, classifyBookingDate } from '../../_utils/slotGenerator.js';
import { checkDoctorLeave } from '../../_utils/leaveChecker.js';

const ACTIVE_STATUSES = ['pending', 'confirmed', 'completed'];

export default async function handler(req, res) {
  if (req.method === 'GET') return handleGet(req, res);
  if (req.method === 'POST') return handlePost(req, res);
  return sendError(res, 405, 'Method not allowed');
}

async function handleGet(req, res) {
  const result = await verifyAuth(req);
  if (result.error) return sendError(res, result.status, result.error);

  const { clinicId, date } = req.query;
  if (!date || !isValidDate(date)) return sendError(res, 400, 'Valid date (YYYY-MM-DD) is required');

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

    const appointmentsSnapshot = await db.collection('appointments')
      .where('appointmentDate', '==', date)
      .where('status', 'in', ACTIVE_STATUSES)
      .get();

    const appointmentsByTime = {};
    appointmentsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      appointmentsByTime[data.timeSlot] = { id: doc.id, ...data };
    });

    let slotQuery = db.collection('doctorSlots').where('date', '==', date);
    if (clinicId) slotQuery = slotQuery.where('clinicId', '==', clinicId);

    const slotsSnapshot = await slotQuery.get();
    const manualByClinicTime = {};
    slotsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      manualByClinicTime[`${data.clinicId}__${data.time}`] = { id: doc.id, ...data };
    });

    const dateClass = classifyBookingDate(date);
    const response = [];

    for (const clinic of clinics) {
      const leaveStatus = await checkDoctorLeave(clinic.id, date);
      const slotTimes = leaveStatus.onLeave ? [] : generateSlotTimes(clinic, date);

      const slots = slotTimes.map((time) => {
        const appointment = appointmentsByTime[time];
        const manual = manualByClinicTime[`${clinic.id}__${time}`];

        const isBlockedByLeave = leaveStatus.onLeave;
        const isBlockedManually = manual?.appointmentId === 'BLOCKED';
        const isBookedByPatient = !!appointment;

        return {
          time,
          booked: isBookedByPatient || isBlockedManually || isBlockedByLeave || manual?.booked || false,
          appointmentId: appointment?.id || (isBlockedByLeave ? 'LEAVE' : (isBlockedManually ? 'BLOCKED' : null)),
          isBlocked: isBlockedManually || isBlockedByLeave,
          isLeave: isBlockedByLeave,
          isManual: !!manual,
          patientName: appointment?.patientName || null,
          patientClinicId: appointment?.clinicId || null,
        };
      });

      response.push({
        clinicId: clinic.id,
        clinicName: clinic.name,
        isOnLeave: leaveStatus.onLeave,
        leaveReason: leaveStatus.reason || null,
        dateClass: dateClass.isInstant ? 'instant' : 'request',
        slots,
      });
    }

    return sendSuccess(res, { clinics: response });
  } catch (error) {
    console.error('Error in GET /api/admin/slots:', error);
    return sendError(res, 500, error.message);
  }
}

async function handlePost(req, res) {
  const result = await verifyAuth(req);
  if (result.error) return sendError(res, result.status, result.error);

  const { clinicId, date, time, action } = req.body;
  const validationError = validateRequired(req.body, ['clinicId', 'date', 'time', 'action']);
  if (validationError) return sendError(res, 400, validationError);

  if (!isValidDate(date) || !isValidTime(time)) {
    return sendError(res, 400, 'Invalid date or time format');
  }

  try {
    const clinicDoc = await db.collection('clinics').doc(clinicId).get();
    if (!clinicDoc.exists) return sendError(res, 404, 'Clinic not found');

    const slotRef = db.collection('doctorSlots').doc(buildSlotId(clinicId, date, time));
    const slotDoc = await slotRef.get();

    if (action === 'block') {
      const appSnapshot = await db.collection('appointments')
        .where('appointmentDate', '==', date)
        .where('timeSlot', '==', time)
        .where('status', 'in', ['pending', 'confirmed'])
        .get();

      if (!appSnapshot.empty) {
        return sendError(res, 400, 'Cannot block a slot that is already booked by a patient');
      }

      await slotRef.set({
        clinicId,
        date,
        time,
        booked: true,
        appointmentId: 'BLOCKED',
        expiresAt: new Date(date + 'T23:59:59+05:30'),
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
