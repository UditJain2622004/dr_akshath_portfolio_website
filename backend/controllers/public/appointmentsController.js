import { db } from '../../_utils/firebaseAdmin.js';
import { normalizePhone } from '../../_utils/phoneUtils.js';
import { generateSlotTimes, buildSlotId, classifyBookingDate, parseTime } from '../../_utils/slotGenerator.js';
import { checkDoctorLeave } from '../../_utils/leaveChecker.js';
import { sendError, sendSuccess, validateRequired, isValidDate, isValidTime } from '../../_utils/apiHelpers.js';
import { FieldValue } from 'firebase-admin/firestore';

const ACTIVE_STATUSES = ['pending', 'confirmed', 'completed'];
const TRAVEL_BUFFER_MINUTES = 30;

export default async function handler(req, res) {
  if (req.method === 'GET') return handleGet(req, res);
  if (req.method === 'POST') return handlePost(req, res);
  if (req.method === 'PATCH') return handlePatch(req, res);
  return sendError(res, 405, 'Method not allowed');
}

async function handleGet(req, res) {
  const { clinicId, date, status, patientPhone } = req.query;

  try {
    let query = db.collection('appointments');

    if (clinicId) {
      query = query.where('clinicId', '==', clinicId);
    }

    if (patientPhone) {
      query = query.where('patientId', '==', patientPhone);
    }

    if (status) {
      const statuses = status.split(',').map((s) => s.trim());
      query = query.where('status', 'in', statuses);
    }

    const snapshot = await query.get();

    let appointments = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        confirmedAt: data.confirmedAt?.toDate?.()?.toISOString() || null,
      };
    });

    if (date) {
      appointments = appointments.filter((a) => a.appointmentDate === date);
    }

    appointments.sort((a, b) => {
      const dateDiff = (a.appointmentDate || '').localeCompare(b.appointmentDate || '');
      if (dateDiff !== 0) return dateDiff;
      return (a.timeSlot || '').localeCompare(b.timeSlot || '');
    });

    return sendSuccess(res, { appointments });
  } catch (error) {
    console.error('Error in GET /api/appointments:', error);
    return sendError(res, 500, `Internal server error: ${error.message}`);
  }
}

async function handlePost(req, res) {
  const body = req.body;
  const validationError = validateRequired(body, ['clinicId', 'date', 'time', 'patientName', 'patientPhone']);
  if (validationError) return sendError(res, 400, validationError);

  const { clinicId, date, time, patientName, patientEmail } = body;

  if (!isValidDate(date)) return sendError(res, 400, 'Invalid date format. Use YYYY-MM-DD');
  if (!isValidTime(time)) return sendError(res, 400, 'Invalid time format. Use HH:mm');

  let patientPhone;
  try {
    patientPhone = normalizePhone(body.patientPhone);
  } catch (err) {
    return sendError(res, 400, err.message);
  }

  try {
    const clinicDoc = await db.collection('clinics').doc(clinicId).get();
    if (!clinicDoc.exists) return sendError(res, 404, 'Clinic not found');

    const clinic = clinicDoc.data();
    if (!clinic.isActive) return sendError(res, 400, 'Clinic is currently unavailable');

    const leaveStatus = await checkDoctorLeave(clinicId, date);
    if (leaveStatus.onLeave) {
      return sendError(res, 400, `Doctor is unavailable: ${leaveStatus.reason}`);
    }

    const dateClass = classifyBookingDate(date);
    if (dateClass.isOutOfRange) {
      if (dateClass.daysDiff < 0) return sendError(res, 400, 'Cannot book appointments in the past');
      return sendError(res, 400, 'Appointments can only be booked up to 90 days in advance');
    }

    const validSlotTimes = generateSlotTimes(clinic, date);
    if (!validSlotTimes.includes(time)) {
      return sendError(res, 400, 'Invalid time slot. This time is not available for this clinic.');
    }

    const appointmentType = await detectFollowUp(patientPhone);
    const bookingType = dateClass.isInstant ? 'instant' : 'request';
    const slotId = buildSlotId(clinicId, date, time);
    const slotRef = db.collection('doctorSlots').doc(slotId);
    const appointmentRef = db.collection('appointments').doc();

    await db.runTransaction(async (transaction) => {
      // Fetch ALL active appointments for this date to check cross-clinic buffer
      const allApptQuery = db.collection('appointments')
        .where('appointmentDate', '==', date)
        .where('status', 'in', ACTIVE_STATUSES);
      const allApptSnapshot = await transaction.get(allApptQuery);

      const slotMinutes = parseTime(time);

      for (const doc of allApptSnapshot.docs) {
        const appt = doc.data();
        const apptMinutes = parseTime(appt.timeSlot);
        const diff = Math.abs(slotMinutes - apptMinutes);

        // Exact time conflict — doctor is busy at this time
        if (diff === 0) {
          throw new Error('TIME_CONFLICT');
        }

        // Cross-clinic travel buffer — ±30 min gap required between different clinics
        if (diff < TRAVEL_BUFFER_MINUTES && appt.clinicId !== clinicId) {
          throw new Error('TRAVEL_BUFFER_CONFLICT');
        }
      }

      const appointmentData = {
        patientId: patientPhone,
        clinicId,
        patientName,
        patientPhone,
        patientEmail: patientEmail || null,
        appointmentDate: date,
        timeSlot: time,
        bookingType,
        type: appointmentType,
        status: 'pending',
        createdAt: FieldValue.serverTimestamp(),
        confirmedAt: null,
      };

      transaction.set(appointmentRef, appointmentData);

      if (dateClass.isInstant) {
        const slotDoc = await transaction.get(slotRef);
        if (slotDoc.exists && slotDoc.data().booked) {
          throw new Error('SLOT_ALREADY_BOOKED');
        }

        transaction.set(slotRef, {
          clinicId,
          date,
          time,
          booked: true,
          appointmentId: appointmentRef.id,
          expiresAt: new Date(date + 'T23:59:59+05:30'),
        }, { merge: true });
      }
    });

    const patientRef = db.collection('patients').doc(patientPhone);
    const patientDoc = await patientRef.get();

    if (patientDoc.exists) {
      await patientRef.update({
        name: patientName,
        phone: patientPhone,
        ...(patientEmail ? { email: patientEmail } : {}),
        lastAppointmentAt: FieldValue.serverTimestamp(),
      });
    } else {
      await patientRef.set({
        name: patientName,
        phone: patientPhone,
        ...(patientEmail ? { email: patientEmail } : {}),
        createdAt: FieldValue.serverTimestamp(),
        lastAppointmentAt: FieldValue.serverTimestamp(),
      });
    }

    return sendSuccess(res, {
      appointmentId: appointmentRef.id,
      bookingType,
      appointmentType,
      message: bookingType === 'instant'
        ? 'Appointment booked successfully. Awaiting doctor confirmation.'
        : 'Appointment request submitted. The doctor will review and confirm.',
    });
  } catch (error) {
    if (error.message === 'SLOT_ALREADY_BOOKED') {
      return sendError(res, 409, 'Slot already booked. Please select another slot.');
    }
    if (error.message === 'TIME_CONFLICT') {
      return sendError(res, 409, 'Doctor is already booked at this time.');
    }
    if (error.message === 'TRAVEL_BUFFER_CONFLICT') {
      return sendError(res, 409, 'The doctor has an appointment at another clinic too close to this time. A 30-minute travel gap is required between clinics.');
    }
    console.error('Error in POST /api/appointments:', error);
    return sendError(res, 500, `Internal server error: ${error.message}`);
  }
}

async function handlePatch(req, res) {
  const { appointmentId, action } = req.body;

  const validationError = validateRequired(req.body, ['appointmentId', 'action']);
  if (validationError) return sendError(res, 400, validationError);

  const validActions = ['confirm', 'reject', 'cancel', 'complete'];
  if (!validActions.includes(action)) return sendError(res, 400, 'Invalid action.');

  try {
    const appointmentRef = db.collection('appointments').doc(appointmentId);
    const appointmentDoc = await appointmentRef.get();
    if (!appointmentDoc.exists) return sendError(res, 404, 'Appointment not found');

    const appointment = appointmentDoc.data();
    const allowedTransitions = {
      pending: ['confirm', 'reject', 'cancel'],
      confirmed: ['complete', 'cancel'],
      rejected: [],
      cancelled: [],
      completed: [],
    };

    if (!(allowedTransitions[appointment.status] || []).includes(action)) {
      return sendError(res, 400, `Cannot ${action} from status ${appointment.status}`);
    }

    const statusMap = {
      confirm: 'confirmed',
      reject: 'rejected',
      cancel: 'cancelled',
      complete: 'completed',
    };

    const updateData = { status: statusMap[action] };
    if (action === 'confirm') updateData.confirmedAt = FieldValue.serverTimestamp();

    if ((action === 'reject' || action === 'cancel') && appointment.bookingType === 'instant') {
      const slotId = buildSlotId(appointment.clinicId, appointment.appointmentDate, appointment.timeSlot);
      const slotRef = db.collection('doctorSlots').doc(slotId);

      const activeAtSameTimeSnapshot = await db.collection('appointments')
        .where('appointmentDate', '==', appointment.appointmentDate)
        .where('timeSlot', '==', appointment.timeSlot)
        .where('status', 'in', ACTIVE_STATUSES)
        .get();

      const otherActive = activeAtSameTimeSnapshot.docs.find((doc) => doc.id !== appointmentId);

      const batch = db.batch();
      batch.update(appointmentRef, updateData);
      batch.set(slotRef, {
        booked: !!otherActive,
        appointmentId: otherActive ? otherActive.id : null,
      }, { merge: true });
      await batch.commit();

      return sendSuccess(res, {
        appointmentId,
        newStatus: statusMap[action],
        slotFreed: !otherActive,
      });
    }

    await appointmentRef.update(updateData);
    return sendSuccess(res, { appointmentId, newStatus: statusMap[action] });
  } catch (error) {
    console.error('Error in PATCH /api/appointments:', error);
    return sendError(res, 500, error.message);
  }
}

async function detectFollowUp(patientId) {
  try {
    const recentAppointments = await db.collection('appointments').where('patientId', '==', patientId).get();
    if (recentAppointments.empty) return 'new';

    const matching = recentAppointments.docs
      .map((doc) => doc.data())
      .filter((a) => ['confirmed', 'completed'].includes(a.status))
      .sort((a, b) => {
        const dateDiff = (b.appointmentDate || '').localeCompare(a.appointmentDate || '');
        if (dateDiff !== 0) return dateDiff;
        return (b.timeSlot || '').localeCompare(a.timeSlot || '');
      });

    if (matching.length === 0) return 'new';

    const lastDate = new Date(matching[0].appointmentDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 ? 'followup' : 'new';
  } catch {
    return 'new';
  }
}