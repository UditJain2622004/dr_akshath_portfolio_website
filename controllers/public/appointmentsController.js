// GET /api/appointments?doctorId=X&date=YYYY-MM-DD&status=pending
// POST /api/appointments (to create a new booking)
// PATCH /api/appointments { appointmentId, action: "confirm"|"reject"|"complete"|"cancel" }
//
// GET: Fetches appointments filtered by doctorId, date, and/or status.
// POST: Creates a new appointment booking (formerly createAppointment.js).
// PATCH: Updates appointment status (confirm/reject/complete/cancel).

import { db } from '../../_utils/firebaseAdmin.js';
import { normalizePhone } from '../../_utils/phoneUtils.js';
import { generateSlotTimes, buildSlotId, classifyBookingDate } from '../../_utils/slotGenerator.js';
import { checkDoctorLeave } from '../../_utils/leaveChecker.js';
import { sendError, sendSuccess, validateRequired, isValidDate, isValidTime } from '../../_utils/apiHelpers.js';
import { FieldValue } from 'firebase-admin/firestore';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  }

  if (req.method === 'POST') {
    return handlePost(req, res);
  }

  if (req.method === 'PATCH') {
    return handlePatch(req, res);
  }

  return sendError(res, 405, 'Method not allowed');
}

// ─── GET: Fetch appointments ────────────────────────────────────────────────────

async function handleGet(req, res) {
  const { doctorId, date, status, patientPhone } = req.query;

  try {
    let query = db.collection('appointments');

    if (doctorId) {
      query = query.where('doctorId', '==', doctorId);
    } else if (patientPhone) {
      query = query.where('patientId', '==', patientPhone);
    }

    if (status) {
      const statuses = status.split(',').map(s => s.trim());
      query = query.where('status', 'in', statuses);
    }

    const snapshot = await query.get();

    let appointments = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        confirmedAt: data.confirmedAt?.toDate?.()?.toISOString() || null,
      };
    });

    if (doctorId && patientPhone) {
      appointments = appointments.filter(a => a.patientId === patientPhone);
    }

    if (date) {
      appointments = appointments.filter(a => a.appointmentDate === date);
    }

    appointments.sort((a, b) => (a.appointmentDate || '').localeCompare(b.appointmentDate || ''));

    return sendSuccess(res, { appointments });

  } catch (error) {
    console.error('Error in GET /api/appointments:', error);
    return sendError(res, 500, `Internal server error: ${error.message}`);
  }
}

// ─── POST: Create appointment ───────────────────────────────────────────────────

async function handlePost(req, res) {
  const body = req.body;

  const validationError = validateRequired(body, ['doctorId', 'date', 'time', 'patientName', 'patientPhone']);
  if (validationError) {
    return sendError(res, 400, validationError);
  }

  const { doctorId, date, time, patientName, patientEmail } = body;

  if (!isValidDate(date)) {
    return sendError(res, 400, 'Invalid date format. Use YYYY-MM-DD');
  }

  if (!isValidTime(time)) {
    return sendError(res, 400, 'Invalid time format. Use HH:mm');
  }

  let patientPhone;
  try {
    patientPhone = normalizePhone(body.patientPhone);
  } catch (err) {
    return sendError(res, 400, err.message);
  }

  try {
    const doctorDoc = await db.collection('doctors').doc(doctorId).get();
    if (!doctorDoc.exists) {
      return sendError(res, 404, 'Doctor not found');
    }

    const doctor = doctorDoc.data();
    if (!doctor.isActive) {
      return sendError(res, 400, 'Doctor is currently unavailable');
    }

    const leaveStatus = await checkDoctorLeave(doctorId, date);
    if (leaveStatus.onLeave) {
      return sendError(res, 400, `Doctor is on leave: ${leaveStatus.reason}`);
    }

    const dateClass = classifyBookingDate(date);
    if (dateClass.isOutOfRange) {
      if (dateClass.daysDiff < 0) {
        return sendError(res, 400, 'Cannot book appointments in the past');
      }
      return sendError(res, 400, 'Appointments can only be booked up to 90 days in advance');
    }

    const validSlotTimes = generateSlotTimes(doctor, date);
    if (!validSlotTimes.includes(time)) {
      return sendError(res, 400, 'Invalid time slot. This time is not available in the doctor\'s schedule.');
    }

    const appointmentType = await detectFollowUp(patientPhone, doctorId);
    const bookingType = dateClass.isInstant ? 'instant' : 'request';

    let appointmentId;

    if (dateClass.isInstant) {
      const slotId = buildSlotId(doctorId, date, time);
      const slotRef = db.collection('doctorSlots').doc(slotId);

      appointmentId = await db.runTransaction(async (transaction) => {
        const slotDoc = await transaction.get(slotRef);
        if (!slotDoc.exists) throw new Error('SLOT_NOT_FOUND');

        const slotData = slotDoc.data();
        if (slotData.booked) throw new Error('SLOT_ALREADY_BOOKED');

        const appointmentRef = db.collection('appointments').doc();
        const appointmentData = {
          patientId: patientPhone,
          doctorId,
          patientName,
          patientPhone,
          patientEmail: patientEmail || null,
          appointmentDate: date,
          timeSlot: time,
          bookingType: 'instant',
          type: appointmentType,
          status: 'pending',
          createdAt: FieldValue.serverTimestamp(),
          confirmedAt: null,
        };

        transaction.set(appointmentRef, appointmentData);
        transaction.update(slotRef, {
          booked: true,
          appointmentId: appointmentRef.id,
        });

        return appointmentRef.id;
      });

    } else {
      const appointmentRef = db.collection('appointments').doc();
      const appointmentData = {
        patientId: patientPhone,
        doctorId,
        patientName,
        patientPhone,
        patientEmail: patientEmail || null,
        appointmentDate: date,
        timeSlot: time,
        bookingType: 'request',
        type: appointmentType,
        status: 'pending',
        createdAt: FieldValue.serverTimestamp(),
        confirmedAt: null,
      };

      await appointmentRef.set(appointmentData);
      appointmentId = appointmentRef.id;
    }

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
      appointmentId,
      bookingType,
      appointmentType,
      message: bookingType === 'instant'
        ? 'Appointment booked successfully. Awaiting doctor confirmation.'
        : 'Appointment request submitted. The doctor will review and confirm.',
    });

  } catch (error) {
    if (error.message === 'SLOT_NOT_FOUND') return sendError(res, 400, 'Slot no longer available.');
    if (error.message === 'SLOT_ALREADY_BOOKED') return sendError(res, 409, 'Slot already booked. Please select another slot.');
    console.error('Error in POST /api/appointments:', error);
    return sendError(res, 500, `Internal server error: ${error.message}`);
  }
}

// ─── PATCH: Update appointment status ──────────────────────────────────────────

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
      rejected: [], cancelled: [], completed: [],
    };

    if (!(allowedTransitions[appointment.status] || []).includes(action)) {
      return sendError(res, 400, `Cannot ${action} from status ${appointment.status}`);
    }

    const statusMap = { confirm: 'confirmed', reject: 'rejected', cancel: 'cancelled', complete: 'completed' };
    const updateData = { status: statusMap[action] };
    if (action === 'confirm') updateData.confirmedAt = FieldValue.serverTimestamp();

    if ((action === 'reject' || action === 'cancel') && appointment.bookingType === 'instant') {
      const slotId = `${appointment.doctorId}_${appointment.appointmentDate}_${appointment.timeSlot}`;
      const slotRef = db.collection('doctorSlots').doc(slotId);
      const slotDoc = await slotRef.get();

      if (slotDoc.exists && slotDoc.data().booked) {
        const batch = db.batch();
        batch.update(appointmentRef, updateData);
        batch.update(slotRef, { booked: false, appointmentId: null });
        await batch.commit();

        return sendSuccess(res, { appointmentId, newStatus: statusMap[action], slotFreed: true });
      }
    }

    await appointmentRef.update(updateData);
    return sendSuccess(res, { appointmentId, newStatus: statusMap[action] });

  } catch (error) {
    console.error('Error in PATCH /api/appointments:', error);
    return sendError(res, 500, error.message);
  }
}

async function detectFollowUp(patientId, doctorId) {
  try {
    const recentAppointments = await db.collection('appointments').where('patientId', '==', patientId).get();
    if (recentAppointments.empty) return 'new';
    const matching = recentAppointments.docs.map(doc => doc.data())
      .filter(a => a.doctorId === doctorId && ['confirmed', 'completed'].includes(a.status))
      .sort((a, b) => (b.appointmentDate || '').localeCompare(a.appointmentDate || ''));
    if (matching.length === 0) return 'new';
    const lastDate = new Date(matching[0].appointmentDate + 'T00:00:00');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 ? 'followup' : 'new';
  } catch { return 'new'; }
}
