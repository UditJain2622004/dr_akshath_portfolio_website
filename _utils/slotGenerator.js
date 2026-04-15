// Slot generation logic
// Generates time slots based on a doctor's weekly schedule and break times.

/**
 * Parse a "HH:mm" time string into total minutes since midnight.
 * @param {string} timeStr - Time in "HH:mm" format
 * @returns {number} Minutes since midnight
 */
function parseTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Format total minutes since midnight back to "HH:mm" string.
 * @param {number} totalMinutes - Minutes since midnight
 * @returns {string} Time in "HH:mm" format
 */
function formatTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Check if a given time falls within any break period.
 * A slot is blocked if ANY part of the slot overlaps with a break.
 * 
 * @param {number} slotStart - Slot start in minutes since midnight
 * @param {number} slotDuration - Slot duration in minutes
 * @param {Array} breakTimes - Array of {start: "HH:mm", end: "HH:mm"}
 * @returns {boolean} True if the slot overlaps with a break
 */
function isInBreak(slotStart, slotDuration, breakTimes) {
  if (!breakTimes || breakTimes.length === 0) return false;

  const slotEnd = slotStart + slotDuration;

  return breakTimes.some(brk => {
    const breakStart = parseTime(brk.start);
    const breakEnd = parseTime(brk.end);
    // Overlap: slot starts before break ends AND slot ends after break starts
    return slotStart < breakEnd && slotEnd > breakStart;
  });
}

/**
 * Generate time slot strings for a given date based on doctor schedule.
 * 
 * @param {object} doctor - Doctor document with weeklySchedule and breakTimes
 * @param {string} dateStr - Date in "YYYY-MM-DD" format
 * @returns {string[]} Array of time strings in "HH:mm" format
 */
export function generateSlotTimes(doctor, dateStr) {
  // Get day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
  const date = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = date.getDay();

  const schedule = doctor.weeklySchedule;
  if (!schedule) return [];

  const daySchedule = schedule[String(dayOfWeek)];
  if (!daySchedule) return []; // Doctor doesn't work this day

  const startMinutes = parseTime(daySchedule.startTime);
  const endMinutes = parseTime(daySchedule.endTime);
  const duration = daySchedule.slotDuration;
  const breakTimes = doctor.breakTimes || [];

  const slots = [];
  let current = startMinutes;

  while (current + duration <= endMinutes) {
    if (!isInBreak(current, duration, breakTimes)) {
      slots.push(formatTime(current));
    }
    current += duration;
  }

  return slots;
}

/**
 * Build a deterministic slot document ID.
 * Format: {doctorId}_{date}_{time}
 * 
 * @param {string} doctorId 
 * @param {string} date - "YYYY-MM-DD"
 * @param {string} time - "HH:mm"
 * @returns {string} Slot document ID
 */
export function buildSlotId(doctorId, date, time) {
  return `${doctorId}_${date}_${time}`;
}

/**
 * Check if a date string falls within the instant booking window (today + 20 days).
 * 
 * @param {string} dateStr - Date in "YYYY-MM-DD" format
 * @returns {{ isInstant: boolean, isRequest: boolean, isOutOfRange: boolean, daysDiff: number }}
 */
export function classifyBookingDate(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(dateStr + 'T00:00:00');
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  const daysDiff = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (daysDiff < 0) {
    return { isInstant: false, isRequest: false, isOutOfRange: true, daysDiff };
  }

  if (daysDiff <= 20) {
    return { isInstant: true, isRequest: false, isOutOfRange: false, daysDiff };
  }

  if (daysDiff <= 90) {
    return { isInstant: false, isRequest: true, isOutOfRange: false, daysDiff };
  }

  return { isInstant: false, isRequest: false, isOutOfRange: true, daysDiff };
}
