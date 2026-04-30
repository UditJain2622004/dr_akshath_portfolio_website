import { db } from '../../_utils/firebaseAdmin.js';
import { verifyAuth, requireAdmin } from '../../_utils/authMiddleware.js';
import { sendError, sendSuccess, validateRequired, isValidDate, isValidTime } from '../../_utils/apiHelpers.js';
import { generateSlotTimes, buildSlotId, classifyBookingDate, parseTime } from '../../_utils/slotGenerator.js';
import { normalizePhone } from '../../_utils/phoneUtils.js';
import { checkDoctorLeave } from '../../_utils/leaveChecker.js';
import { FieldValue } from 'firebase-admin/firestore';

const ACTIVE_STATUSES = ['pending', 'confirmed', 'completed'];
const TRAVEL_BUFFER_MINUTES = 30;

export default async function handler(req, res) {
  if (req.method === 'GET' && req.query.checkFollowup === 'true') {
    return handleFollowupCheck(req, res);
  }

  if (req.method === 'GET') return handleGet(req, res);
  if (req.method === 'POST') return handlePost(req, res);
  if (req.method === 'PATCH') return handlePatch(req, res);
  if (req.method === 'DELETE') return handleDelete(req, res);

  return sendError(res, 405, 'Method not allowed');
}

async function handleDelete(req, res) {
  const result = await verifyAuth(req);
  if (result.error) return sendError(res, result.status, result.error);

  const { appointmentId } = req.query;
  if (!appointmentId) return sendError(res, 400, 'Missing appointmentId');

  try {
    const appointmentRef = db.collection('appointments').doc(appointmentId);
    const doc = await appointmentRef.get();
    if (!doc.exists) return sendError(res, 404, 'Appointment not found');

    const appointment = doc.data();
    const batch = db.batch();
    batch.delete(appointmentRef);

    if (appointment.bookingType === 'instant') {
      const slotRef = db.collection('doctorSlots').doc(buildSlotId(appointment.clinicId, appointment.appointmentDate, appointment.timeSlot));

      const activeAtSameTimeSnapshot = await db.collection('appointments')
        .where('appointmentDate', '==', appointment.appointmentDate)
        .where('timeSlot', '==', appointment.timeSlot)
        .where('status', 'in', ACTIVE_STATUSES)
        .get();
      const otherActive = activeAtSameTimeSnapshot.docs.find((d) => d.id !== appointmentId);

      batch.set(slotRef, {
        booked: !!otherActive,
        appointmentId: otherActive ? otherActive.id : null,
      }, { merge: true });
    }

    await batch.commit();
    return sendSuccess(res, { message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/bookings:', error);
    return sendError(res, 500, 'Internal server error');
  }
}

async function handleGet(req, res) {
  const auth = await verifyAuth(req);
  if (auth.error) return sendError(res, auth.status, auth.error);

  const { clinicId, dateFrom, dateTo, status, patientPhone, limit = 50, lastId } = req.query;

  try {
    let query = db.collection('appointments');

    if (clinicId) query = query.where('clinicId', '==', clinicId);
    if (patientPhone) query = query.where('patientId', '==', patientPhone);

    if (status) {
      const statuses = status.split(',').map((s) => s.trim());
      query = query.where('status', 'in', statuses);
    }

    const snapshot = await query.get();

    let bookings = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        confirmedAt: data.confirmedAt?.toDate?.()?.toISOString() || null,
      };
    });

    if (dateFrom) bookings = bookings.filter((b) => b.appointmentDate >= dateFrom);
    if (dateTo) bookings = bookings.filter((b) => b.appointmentDate <= dateTo);

    bookings.sort((a, b) => {
      const dateDiff = (b.appointmentDate || '').localeCompare(a.appointmentDate || '');
      if (dateDiff !== 0) return dateDiff;
      return (a.timeSlot || '').localeCompare(b.timeSlot || '');
    });

    // Pagination logic
    let startIndex = 0;
    if (lastId) {
      const idx = bookings.findIndex(b => b.id === lastId);
      if (idx !== -1) startIndex = idx + 1;
    }

    const pageSize = parseInt(limit);
    const paginated = bookings.slice(startIndex, startIndex + pageSize);
    const hasMore = startIndex + pageSize < bookings.length;

    const clinicIds = [...new Set(paginated.map((b) => b.clinicId).filter(Boolean))];
    const clinicNames = {};

    if (clinicIds.length > 0) {
      const clinicDocs = await Promise.all(clinicIds.map((id) => db.collection('clinics').doc(id).get()));
      clinicDocs.forEach((doc) => {
        if (doc.exists) clinicNames[doc.id] = doc.data().name;
      });
    }

    const resultBookings = paginated.map((b) => ({
      ...b,
      clinicName: clinicNames[b.clinicId] || b.clinicId,
    }));

    return sendSuccess(res, { 
      bookings: resultBookings,
      hasMore,
      totalCount: bookings.length 
    });
  } catch (error) {
    console.error('Error in GET /api/admin/bookings:', error);
    return sendError(res, 500, `Internal server error: ${error.message}`);
  }
}

async function handlePost(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const body = req.body;
  const validationError = validateRequired(body, ['clinicId', 'date', 'time', 'patientName', 'patientPhone']);
  if (validationError) return sendError(res, 400, validationError);

  const { clinicId, date, time, patientName, patientEmail, status: requestedStatus } = body;

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
    if (leaveStatus.onLeave) return sendError(res, 400, `Doctor is unavailable: ${leaveStatus.reason}`);

    const validSlotTimes = generateSlotTimes(clinic, date);
    if (!validSlotTimes.includes(time)) {
      return sendError(res, 400, 'Invalid time slot for this clinic on this date.');
    }

    const appointmentStatus = requestedStatus || 'confirmed';
    const dateClass = classifyBookingDate(date);
    const bookingType = dateClass.isInstant ? 'instant' : 'request';

    const appointmentRef = db.collection('appointments').doc();
    const slotRef = db.collection('doctorSlots').doc(buildSlotId(clinicId, date, time));

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
        if (diff === 0) throw new Error('TIME_CONFLICT');
        if (diff < TRAVEL_BUFFER_MINUTES && appt.clinicId !== clinicId) throw new Error('TRAVEL_BUFFER_CONFLICT');
      }

      transaction.set(appointmentRef, {
        patientId: patientPhone,
        clinicId,
        patientName,
        patientPhone,
        patientEmail: patientEmail || null,
        appointmentDate: date,
        timeSlot: time,
        bookingType,
        type: await detectFollowUp(patientPhone),
        status: appointmentStatus,
        createdAt: FieldValue.serverTimestamp(),
        confirmedAt: appointmentStatus === 'confirmed' ? FieldValue.serverTimestamp() : null,
        createdByAdmin: true,
      });

      if (dateClass.isInstant) {
        const slotDoc = await transaction.get(slotRef);
        if (slotDoc.exists && slotDoc.data().booked) throw new Error('SLOT_ALREADY_BOOKED');

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
    await patientRef.set({
      name: patientName,
      phone: patientPhone,
      ...(patientEmail ? { email: patientEmail } : {}),
      lastAppointmentAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    return sendSuccess(res, {
      appointmentId: appointmentRef.id,
      message: 'Booking created successfully by admin.',
    });
  } catch (error) {
    if (error.message === 'TIME_CONFLICT') {
      return sendError(res, 409, 'Doctor is already booked at this time.');
    }
    if (error.message === 'TRAVEL_BUFFER_CONFLICT') {
      return sendError(res, 409, 'Too close to an appointment at another clinic. A 30-minute travel gap is required.');
    }
    if (error.message === 'SLOT_ALREADY_BOOKED') {
      return sendError(res, 409, 'Slot already booked.');
    }
    console.error('Error in POST /api/admin/bookings:', error);
    return sendError(res, 500, `Internal server error: ${error.message}`);
  }
}

async function handlePatch(req, res) {
  const result = await verifyAuth(req);
  if (result.error) return sendError(res, result.status, result.error);

  const { appointmentId, action, patientName, patientPhone, patientEmail, clinicId } = req.body;
  if (!appointmentId) return sendError(res, 400, 'Missing appointmentId');

  try {
    const appointmentRef = db.collection('appointments').doc(appointmentId);
    const appointmentDoc = await appointmentRef.get();
    if (!appointmentDoc.exists) return sendError(res, 404, 'Appointment not found');

    const appointment = appointmentDoc.data();
    const updateData = {};

    if (action) {
      const statusMap = {
        confirm: 'confirmed',
        reject: 'rejected',
        cancel: 'cancelled',
        complete: 'completed',
      };

      const allowedTransitions = {
        pending: ['confirm', 'reject', 'cancel'],
        confirmed: ['complete', 'cancel'],
        rejected: [],
        cancelled: [],
        completed: [],
      };

      if (!statusMap[action]) return sendError(res, 400, `Invalid action: ${action}`);
      if (!(allowedTransitions[appointment.status] || []).includes(action)) {
        return sendError(res, 400, `Cannot ${action} an appointment with status "${appointment.status}"`);
      }

      updateData.status = statusMap[action];
      if (action === 'confirm') updateData.confirmedAt = FieldValue.serverTimestamp();

      if ((action === 'reject' || action === 'cancel') && appointment.bookingType === 'instant') {
        const slotRef = db.collection('doctorSlots').doc(buildSlotId(appointment.clinicId, appointment.appointmentDate, appointment.timeSlot));
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
          message: `Appointment ${statusMap[action]}.`,
        });
      }
    }

    if (patientName) updateData.patientName = patientName;
    if (patientPhone) {
      const normalizedPhone = normalizePhone(patientPhone);
      updateData.patientPhone = normalizedPhone;
      updateData.patientId = normalizedPhone;
    }
    if (patientEmail !== undefined) updateData.patientEmail = patientEmail || null;
    if (clinicId) updateData.clinicId = clinicId;

    if (Object.keys(updateData).length === 0) {
      return sendError(res, 400, 'No valid updates provided');
    }

    await appointmentRef.update(updateData);

    return sendSuccess(res, {
      appointmentId,
      message: 'Appointment updated successfully.',
      ...(updateData.status ? { newStatus: updateData.status } : {}),
    });
  } catch (error) {
    console.error('Error in PATCH /api/admin/bookings:', error);
    return sendError(res, 500, `Internal server error: ${error.message}`);
  }
}

async function handleFollowupCheck(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const { patientPhone } = req.query;
  if (!patientPhone) return sendError(res, 400, 'Missing patientPhone');

  const normalizedPhone = normalizePhone(patientPhone);
  const type = await detectFollowUp(normalizedPhone);
  return sendSuccess(res, { type });
}

async function detectFollowUp(patientId) {
  try {
    const recentAppointments = await db.collection('appointments')
      .where('patientId', '==', patientId)
      .get();

    if (recentAppointments.empty) return 'new';

    const matching = recentAppointments.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
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
  } catch (error) {
    console.error('detectFollowUp error:', error);
    return 'new';
  }
}