import { db } from '../../_utils/firebaseAdmin.js';
import { generateSlotTimes, buildSlotId, classifyBookingDate, parseTime } from '../../_utils/slotGenerator.js';
import { checkDoctorLeave } from '../../_utils/leaveChecker.js';
import { sendError, sendSuccess, isValidDate, isValidTime } from '../../_utils/apiHelpers.js';

const ACTIVE_STATUSES = ['pending', 'confirmed', 'completed'];
const TRAVEL_BUFFER_MINUTES = 30;
const SLOT_DURATION_MINUTES = 10;
// Minimum gap between start times at different clinics:
// the first appointment must END, then 30 min travel, then the next can START.
const CROSS_CLINIC_GAP = SLOT_DURATION_MINUTES + TRAVEL_BUFFER_MINUTES; // 40

/**
 * Public Slots Controller
 * 
 * Two query modes:
 * 
 * MODE 1 — "Show slots for a clinic"
 *   GET /slots?date=YYYY-MM-DD&clinicId=xxx
 *   Returns available time slots for a specific clinic, respecting
 *   the 30-min cross-clinic travel buffer.
 * 
 * MODE 2 — "Show clinics available at a time"
 *   GET /slots?date=YYYY-MM-DD&time=HH:mm
 *   Returns which clinics can accept the doctor at the given time.
 * 
 * DEFAULT — no clinicId, no time:
 *   Returns all clinics with their slots (with buffer applied).
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendError(res, 405, 'Method not allowed');
  }

  const { date, clinicId, time } = req.query;

  if (!date) return sendError(res, 400, 'Missing required query param: date');
  if (!isValidDate(date)) return sendError(res, 400, 'Invalid date format. Use YYYY-MM-DD');
  if (time && !isValidTime(time)) return sendError(res, 400, 'Invalid time format. Use HH:mm');

  try {
    const dateClass = classifyBookingDate(date);

    if (dateClass.isOutOfRange) {
      if (dateClass.daysDiff < 0) return sendError(res, 400, 'Cannot book appointments in the past');
      return sendError(res, 400, 'Appointments can only be booked up to 90 days in advance');
    }

    // ── Always fetch ALL active clinics + ALL appointments for cross-clinic logic ──
    const [allClinicsSnap, appointmentsSnap, slotsSnap] = await Promise.all([
      db.collection('clinics').where('isActive', '==', true).get(),
      db.collection('appointments')
        .where('appointmentDate', '==', date)
        .where('status', 'in', ACTIVE_STATUSES)
        .get(),
      db.collection('doctorSlots').where('date', '==', date).get(),
    ]);

    if (allClinicsSnap.empty) return sendError(res, 404, 'No active clinics found');

    const allClinics = allClinicsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Build appointment lookup: time -> [{ clinicId, id }]
    const appointmentsByTime = {};
    appointmentsSnap.docs.forEach(doc => {
      const data = doc.data();
      if (!appointmentsByTime[data.timeSlot]) appointmentsByTime[data.timeSlot] = [];
      appointmentsByTime[data.timeSlot].push({ clinicId: data.clinicId, id: doc.id });
    });

    // Build manual slot lookup: "clinicId__time" -> data
    const manualSlots = {};
    slotsSnap.docs.forEach(doc => {
      const data = doc.data();
      manualSlots[`${data.clinicId}__${data.time}`] = data;
    });

    // Current IST time (for filtering past slots on "today")
    const nowISTStr = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata', hour12: false });
    const todayIST = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const currentHHmm = nowISTStr.split(', ')[1].split(':').slice(0, 2).join(':');

    // ── MODE 2: Find clinics available at a specific time ──
    if (time) {
      return await handleTimeQuery(res, { date, time, allClinics, appointmentsByTime, manualSlots, todayIST, currentHHmm, dateClass });
    }

    // ── MODE 1 / DEFAULT: Return slots per clinic ──
    const targetClinics = clinicId
      ? allClinics.filter(c => c.id === clinicId)
      : allClinics;

    if (clinicId && targetClinics.length === 0) {
      return sendError(res, 404, 'Clinic not found or inactive');
    }

    return await handleClinicQuery(res, { date, targetClinics, allClinics, appointmentsByTime, manualSlots, todayIST, currentHHmm, dateClass });

  } catch (error) {
    console.error('Error in /api/slots:', error);
    return sendError(res, 500, `Internal server error: ${error.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MODE 1 / DEFAULT: Slots for specific clinic(s)
// ─────────────────────────────────────────────────────────────────────────────

async function handleClinicQuery(res, ctx) {
  const { date, targetClinics, appointmentsByTime, manualSlots, todayIST, currentHHmm, dateClass } = ctx;

  const responseClinics = [];
  const createBatch = db.batch();
  let hasNewSlots = false;

  for (const clinic of targetClinics) {
    const leaveStatus = await checkDoctorLeave(clinic.id, date);
    const slotTimes = leaveStatus.onLeave ? [] : generateSlotTimes(clinic, date);
    const slots = [];

    for (const time of slotTimes) {
      // Skip past slots for today
      if (date === todayIST && time <= currentHHmm) continue;

      const manual = manualSlots[`${clinic.id}__${time}`];
      const manuallyBlocked = manual?.appointmentId === 'BLOCKED';

      // Check availability with cross-clinic buffer
      const availability = checkSlotAvailability(time, clinic.id, appointmentsByTime);

      const isLeave = manual?.appointmentId === 'LEAVE' || manual?.isLeave;
      const booked = !availability.available || manuallyBlocked || isLeave;

      slots.push({
        time,
        booked: !!booked,
        reason: booked
          ? (manuallyBlocked ? 'blocked' : (isLeave ? 'on_leave' : (availability.reason || 'booked')))
          : null,
      });

    }

    responseClinics.push({
      clinicId: clinic.id,
      clinicName: clinic.name || clinic.id,
      address: clinic.address || null,
      appointmentOnly: clinic.appointmentOnly || false,
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
    travelBufferMinutes: TRAVEL_BUFFER_MINUTES,
    clinics: responseClinics,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// MODE 2: Which clinics are available at a given time?
// ─────────────────────────────────────────────────────────────────────────────

async function handleTimeQuery(res, ctx) {
  const { date, time, allClinics, appointmentsByTime, manualSlots, todayIST, currentHHmm, dateClass } = ctx;

  // Skip if time is in the past
  if (date === todayIST && time <= currentHHmm) {
    return sendError(res, 400, 'Cannot check availability for a time that has already passed');
  }

  const results = [];

  for (const clinic of allClinics) {
    const leaveStatus = await checkDoctorLeave(clinic.id, date);

    // Check if clinic even has this time slot
    const slotTimes = leaveStatus.onLeave ? [] : generateSlotTimes(clinic, date);
    const hasSlot = slotTimes.includes(time);

    if (!hasSlot) {
      results.push({
        clinicId: clinic.id,
        clinicName: clinic.name || clinic.id,
        address: clinic.address || null,
        appointmentOnly: clinic.appointmentOnly || false,
        available: false,
        reason: leaveStatus.onLeave ? 'on_leave' : 'no_slot',
      });
      continue;
    }

    // Check manual blocks
    const manual = manualSlots[`${clinic.id}__${time}`];
    if (manual?.appointmentId === 'BLOCKED') {
      results.push({
        clinicId: clinic.id,
        clinicName: clinic.name || clinic.id,
        address: clinic.address || null,
        appointmentOnly: clinic.appointmentOnly || false,
        available: false,
        reason: 'blocked',
      });
      continue;
    }

    // Check Leave
    const isLeave = manual?.appointmentId === 'LEAVE' || manual?.isLeave;
    if (isLeave) {
      results.push({
        clinicId: clinic.id,
        clinicName: clinic.name || clinic.id,
        address: clinic.address || null,
        appointmentOnly: clinic.appointmentOnly || false,
        available: false,
        reason: 'on_leave',
      });
      continue;
    }

    // Check cross-clinic buffer
    const availability = checkSlotAvailability(time, clinic.id, appointmentsByTime);

    results.push({
      clinicId: clinic.id,
      clinicName: clinic.name || clinic.id,
      address: clinic.address || null,
      appointmentOnly: clinic.appointmentOnly || false,
      available: availability.available,
      reason: availability.available ? null : availability.reason,
      conflictClinicId: availability.conflictClinicId || null,
    });
  }

  return sendSuccess(res, {
    date,
    time,
    bookingType: dateClass.isInstant ? 'instant' : 'request',
    travelBufferMinutes: TRAVEL_BUFFER_MINUTES,
    clinics: results,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Core: Cross-clinic availability check
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if a slot at `time` for `clinicId` is available,
 * considering:
 *   1. Exact-time conflict at ANY clinic → booked
 *   2. Start-to-start gap < 40 min with a DIFFERENT clinic → travel_buffer
 *      (ensures 30 min gap between END of one 10-min appt and START of next)
 *
 * @returns {{ available: boolean, reason?: string, conflictClinicId?: string }}
 */
function checkSlotAvailability(time, clinicId, appointmentsByTime) {
  const slotMinutes = parseTime(time);

  for (const [apptTime, appts] of Object.entries(appointmentsByTime)) {
    const apptMinutes = parseTime(apptTime);
    const diff = Math.abs(slotMinutes - apptMinutes);

    // Exact time conflict — booked at ANY clinic means doctor is busy
    if (diff === 0) {
      return { available: false, reason: 'booked', conflictClinicId: appts[0]?.clinicId };
    }

    // Cross-clinic: need SLOT_DURATION + TRAVEL_BUFFER gap between start times
    if (diff < CROSS_CLINIC_GAP) {
      const crossClinicAppt = appts.find(a => a.clinicId !== clinicId);
      if (crossClinicAppt) {
        return {
          available: false,
          reason: 'travel_buffer',
          conflictClinicId: crossClinicAppt.clinicId,
        };
      }
    }
  }

  return { available: true };
}
