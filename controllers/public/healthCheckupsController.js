// GET /api/healthCheckups?patientPhone=X&status=confirmed&date=YYYY-MM-DD
// POST /api/healthCheckups (to create a new health checkup booking)
// PATCH /api/healthCheckups { checkupId, action: "cancel"|"complete" }
//
// GET: Fetches health checkup bookings filtered by phone, status, and/or date.
// POST: Creates a new health checkup package booking (formerly createHealthCheckup.js).
// PATCH: Updates health checkup status (cancel/complete).

import { db } from '../../_utils/firebaseAdmin.js';
import { normalizePhone } from '../../_utils/phoneUtils.js';
import { sendError, sendSuccess, validateRequired, isValidDate } from '../../_utils/apiHelpers.js';
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

// ─── GET: Fetch health checkup bookings ──────────────────────────────────────

async function handleGet(req, res) {
  const { patientPhone, status, date } = req.query;

  try {
    let query = db.collection('healthCheckups');

    if (patientPhone) {
      query = query.where('patientId', '==', patientPhone);
    }

    if (status) {
      const statuses = status.split(',').map(s => s.trim());
      query = query.where('status', 'in', statuses);
    }

    const snapshot = await query.get();

    let checkups = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      };
    });

    if (date) {
      checkups = checkups.filter(c => c.preferredDate === date);
    }

    checkups.sort((a, b) => (a.preferredDate || '').localeCompare(b.preferredDate || ''));

    return sendSuccess(res, { checkups });

  } catch (error) {
    console.error('Error in GET /api/healthCheckups:', error);
    return sendError(res, 500, `Internal server error: ${error.message}`);
  }
}

// ─── POST: Create health checkup package booking ─────────────────────────────

async function handlePost(req, res) {
  const body = req.body;

  const validationError = validateRequired(body, [
    'packageId', 'packageName', 'patientName', 'patientPhone', 'preferredDate',
  ]);
  if (validationError) {
    return sendError(res, 400, validationError);
  }

  const { packageId, packageName, packagePrice, patientName, patientEmail, preferredDate } = body;

  if (!isValidDate(preferredDate)) {
    return sendError(res, 400, 'Invalid date format. Use YYYY-MM-DD');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(preferredDate + 'T00:00:00');
  if (selectedDate <= today) {
    return sendError(res, 400, 'Health checkups can only be booked from the next day onwards');
  }

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 90);
  if (selectedDate > maxDate) {
    return sendError(res, 400, 'Health checkups can only be booked up to 90 days in advance');
  }

  let patientPhone;
  try {
    patientPhone = normalizePhone(body.patientPhone);
  } catch (err) {
    return sendError(res, 400, err.message);
  }

  try {
    const checkupRef = db.collection('healthCheckups').doc();
    const checkupData = {
      patientId: patientPhone,
      patientName,
      patientPhone,
      patientEmail: patientEmail || null,
      packageId: String(packageId),
      packageName,
      packagePrice: packagePrice || null,
      preferredDate,
      status: 'confirmed',
      createdAt: FieldValue.serverTimestamp(),
    };

    await checkupRef.set(checkupData);

    const patientRef = db.collection('patients').doc(patientPhone);
    const patientDoc = await patientRef.get();

    if (patientDoc.exists) {
      await patientRef.update({
        name: patientName,
        phone: patientPhone,
        ...(patientEmail ? { email: patientEmail } : {}),
        lastHealthCheckupAt: FieldValue.serverTimestamp(),
      });
    } else {
      await patientRef.set({
        name: patientName,
        phone: patientPhone,
        ...(patientEmail ? { email: patientEmail } : {}),
        createdAt: FieldValue.serverTimestamp(),
        lastHealthCheckupAt: FieldValue.serverTimestamp(),
      });
    }

    return sendSuccess(res, {
      checkupId: checkupRef.id,
      status: 'confirmed',
      message: 'Health checkup booked successfully! No further approval needed.',
    });

  } catch (error) {
    console.error('Error in POST /api/healthCheckups:', error);
    return sendError(res, 500, `Internal server error: ${error.message}`);
  }
}

// ─── PATCH: Update health checkup status ─────────────────────────────────────

async function handlePatch(req, res) {
  const { checkupId, action } = req.body;

  const validationError = validateRequired(req.body, ['checkupId', 'action']);
  if (validationError) {
    return sendError(res, 400, validationError);
  }

  const validActions = ['cancel', 'complete'];
  if (!validActions.includes(action)) {
    return sendError(res, 400, `Invalid action. Must be one of: ${validActions.join(', ')}`);
  }

  try {
    const checkupRef = db.collection('healthCheckups').doc(checkupId);
    const checkupDoc = await checkupRef.get();

    if (!checkupDoc.exists) {
      return sendError(res, 404, 'Health checkup booking not found');
    }

    const checkup = checkupDoc.data();

    const allowedTransitions = {
      confirmed: ['cancel', 'complete'],
      cancelled: [],
      completed: [],
    };

    const allowed = allowedTransitions[checkup.status] || [];
    if (!allowed.includes(action)) {
      return sendError(
        res,
        400,
        `Cannot ${action} a health checkup with status "${checkup.status}"`
      );
    }

    const statusMap = {
      cancel: 'cancelled',
      complete: 'completed',
    };

    await checkupRef.update({
      status: statusMap[action],
    });

    return sendSuccess(res, {
      checkupId,
      newStatus: statusMap[action],
      message: `Health checkup ${statusMap[action]} successfully.`,
    });

  } catch (error) {
    console.error('Error in PATCH /api/healthCheckups:', error);
    return sendError(res, 500, `Internal server error: ${error.message}`);
  }
}
