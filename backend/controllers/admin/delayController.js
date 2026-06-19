import { db } from '../../_utils/firebaseAdmin.js';
import { verifyAuth } from '../../_utils/authMiddleware.js';
import { sendError, sendSuccess, isValidDate } from '../../_utils/apiHelpers.js';
import { sendDelayNotification } from '../../_utils/brevoNotifications.js';
import { FieldValue } from 'firebase-admin/firestore';

const ACTIVE_STATUSES = ['pending', 'confirmed'];

/**
 * Build the composite document ID for a clinic delay on a given date.
 */
function delayDocId(clinicId, date) {
  return `${clinicId}_${date}`;
}

/**
 * Get IST "end of day" for a given YYYY-MM-DD date string.
 * Used as the auto-expiry time for delay documents.
 */
function endOfDayIST(dateStr) {
  return new Date(dateStr + 'T23:59:59+05:30');
}

/**
 * Get current IST date and time without relying on server timezone.
 */
function currentISTDateTime() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    date: `${values.year}-${values.month}-${values.day}`,
    minutes: Number(values.hour) * 60 + Number(values.minute),
  };
}

function toMinutes(hhmm) {
  const match = /^(\d{2}):(\d{2})$/.exec(String(hhmm || ''));
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (Number.isNaN(h) || Number.isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

/**
 * Fetch upcoming appointments for a clinic on a date (status in ACTIVE_STATUSES,
 * excluding past dates; for today, timeSlot >= current IST time).
 */
async function getUpcomingAppointments(clinicId, date) {
  const nowIST = currentISTDateTime();
  if (date < nowIST.date) return [];

  const snapshot = await db.collection('appointments')
    .where('clinicId', '==', clinicId)
    .where('appointmentDate', '==', date)
    .where('status', 'in', ACTIVE_STATUSES)
    .get();

  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(a => {
      if (date > nowIST.date) return true;
      const slotMinutes = toMinutes(a.timeSlot);
      if (slotMinutes == null) return false;
      return slotMinutes >= nowIST.minutes;
    });
}

function isPastISTDate(date) {
  return date < currentISTDateTime().date;
}

function effectiveDelayMinutes(appointment, clinicDelayMinutes) {
  return Math.max(appointment.delayMinutes || 0, clinicDelayMinutes || 0);
}

export default async function handler(req, res) {
  if (req.method === 'GET') return handleGet(req, res);
  if (req.method === 'POST') return handlePost(req, res);
  if (req.method === 'DELETE') return handleDelete(req, res);
  return sendError(res, 405, 'Method not allowed');
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /admin/delay?date=YYYY-MM-DD  — list active delays for a date
// ─────────────────────────────────────────────────────────────────────────────

async function handleGet(req, res) {
  const auth = await verifyAuth(req);
  if (auth.error) return sendError(res, auth.status, auth.error);

  const { date } = req.query;
  if (!date || !isValidDate(date)) return sendError(res, 400, 'Valid date (YYYY-MM-DD) is required');

  try {
    const now = new Date();
    const snapshot = await db.collection('delays')
      .where('date', '==', date)
      .get();

    const delays = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
          expiresAt: data.expiresAt?.toDate?.()?.toISOString() || null,
        };
      })
      // Filter out expired delays
      .filter(d => {
        if (!d.expiresAt) return true;
        return new Date(d.expiresAt) > now;
      });

    return sendSuccess(res, { delays });
  } catch (error) {
    console.error('Error in GET /admin/delay:', error);
    return sendError(res, 500, error.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /admin/delay  — set or update a clinic-level delay
// Body: { clinicId, date, delayMinutes, reason? }
// ─────────────────────────────────────────────────────────────────────────────

async function handlePost(req, res) {
  const auth = await verifyAuth(req);
  if (auth.error) return sendError(res, auth.status, auth.error);

  const { clinicId, date, delayMinutes, reason } = req.body;

  if (!clinicId) return sendError(res, 400, 'Missing required field: clinicId');
  if (!date || !isValidDate(date)) return sendError(res, 400, 'Valid date (YYYY-MM-DD) is required');
  if (isPastISTDate(date)) return sendError(res, 400, 'Cannot set delay for a past date');
  if (!Number.isInteger(delayMinutes) || delayMinutes < 1) {
    return sendError(res, 400, 'delayMinutes must be a positive integer');
  }
  if (delayMinutes > 180) {
    return sendError(res, 400, 'delayMinutes cannot exceed 180');
  }

  try {
    // Verify clinic exists
    const clinicDoc = await db.collection('clinics').doc(clinicId).get();
    if (!clinicDoc.exists) return sendError(res, 404, 'Clinic not found');

    const docId = delayDocId(clinicId, date);
    const delayRef = db.collection('delays').doc(docId);

    // Check if there's an existing delay to detect if this is an update
    const existingDoc = await delayRef.get();
    const previousMinutes = existingDoc.exists ? existingDoc.data().delayMinutes : null;

    // Upsert the delay document
    await delayRef.set({
      clinicId,
      date,
      delayMinutes,
      reason: reason || null,
      expiresAt: endOfDayIST(date),
      createdBy: auth.user.uid,
      ...(existingDoc.exists
        ? { updatedAt: FieldValue.serverTimestamp() }
        : { createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }),
    }, { merge: true });

    // Notify upcoming patients only when their effective delay changes.
    let notifiedCount = 0;
    if (previousMinutes !== delayMinutes) {
      const upcoming = await getUpcomingAppointments(clinicId, date);
      const clinicName = clinicDoc.data().name || clinicId;

      const notifications = upcoming
        .filter(a => effectiveDelayMinutes(a, previousMinutes) !== effectiveDelayMinutes(a, delayMinutes))
        .map(a =>
          sendDelayNotification('booking_delayed', a, effectiveDelayMinutes(a, delayMinutes), clinicName)
            .then(() => 1)
            .catch(err => {
              console.error(`[Delay] Notification failed for ${a.id}:`, err.message);
              return 0;
            })
        );

      const results = await Promise.all(notifications);
      notifiedCount = results.reduce((sum, v) => sum + v, 0);
    }

    return sendSuccess(res, {
      delayId: docId,
      delayMinutes,
      previousMinutes,
      notifiedCount,
      message: previousMinutes
        ? `Delay updated from ${previousMinutes} to ${delayMinutes} minutes. ${notifiedCount} patient(s) notified.`
        : `Delay of ${delayMinutes} minutes set. ${notifiedCount} patient(s) notified.`,
    });
  } catch (error) {
    console.error('Error in POST /admin/delay:', error);
    return sendError(res, 500, error.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /admin/delay?clinicId=xxx&date=YYYY-MM-DD  — clear a clinic-level delay
// ─────────────────────────────────────────────────────────────────────────────

async function handleDelete(req, res) {
  const auth = await verifyAuth(req);
  if (auth.error) return sendError(res, auth.status, auth.error);

  const { clinicId, date } = req.query;

  if (!clinicId) return sendError(res, 400, 'Missing required param: clinicId');
  if (!date || !isValidDate(date)) return sendError(res, 400, 'Valid date (YYYY-MM-DD) is required');
  if (isPastISTDate(date)) return sendError(res, 400, 'Cannot clear delay for a past date');

  try {
    const docId = delayDocId(clinicId, date);
    const delayRef = db.collection('delays').doc(docId);
    const delayDoc = await delayRef.get();

    if (!delayDoc.exists) {
      return sendError(res, 404, 'No active delay found for this clinic and date');
    }

    const previousMinutes = delayDoc.data().delayMinutes || 0;

    await delayRef.delete();

    // Notify patients that doctor is back on schedule
    const clinicDoc = await db.collection('clinics').doc(clinicId).get();
    const clinicName = clinicDoc.exists ? clinicDoc.data().name : clinicId;

    const upcoming = await getUpcomingAppointments(clinicId, date);
    let notifiedCount = 0;

    const notifications = upcoming
      .filter(a => effectiveDelayMinutes(a, previousMinutes) !== effectiveDelayMinutes(a, 0))
      .map(a => {
        const newEffectiveDelay = effectiveDelayMinutes(a, 0);
        const event = newEffectiveDelay > 0 ? 'booking_delayed' : 'booking_back_on_schedule';
        return sendDelayNotification(event, a, newEffectiveDelay, clinicName)
          .then(() => 1)
          .catch(err => {
            console.error(`[Delay] Clear notification failed for ${a.id}:`, err.message);
            return 0;
          });
      });

    const results = await Promise.all(notifications);
    notifiedCount = results.reduce((sum, v) => sum + v, 0);

    return sendSuccess(res, {
      message: `Delay cleared. ${notifiedCount} patient(s) notified.`,
      notifiedCount,
    });
  } catch (error) {
    console.error('Error in DELETE /admin/delay:', error);
    return sendError(res, 500, error.message);
  }
}
