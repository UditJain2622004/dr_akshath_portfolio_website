// Slot generation logic for a single doctor operating across multiple clinics.

export function parseTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function isInBreak(slotStart, slotDuration, breakTimes) {
  if (!breakTimes || breakTimes.length === 0) return false;

  const slotEnd = slotStart + slotDuration;
  return breakTimes.some((brk) => {
    if (!brk || !brk.start || !brk.end) return false;
    const breakStart = parseTime(brk.start);
    const breakEnd = parseTime(brk.end);
    return slotStart < breakEnd && slotEnd > breakStart;
  });
}

export function generateSlotTimesForSchedule(weeklySchedule, breakTimes, dateStr) {
  // Use IST-aware day-of-week to avoid timezone issues on UTC servers
  const istDayOfWeek = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
  }).format(new Date(dateStr + 'T12:00:00+05:30'));
  const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const dayOfWeek = dayMap[istDayOfWeek];

  if (!weeklySchedule) return [];
  const daySchedule = weeklySchedule[String(dayOfWeek)];
  if (!daySchedule) return [];

  const startMinutes = parseTime(daySchedule.startTime);
  const endMinutes = parseTime(daySchedule.endTime);
  const duration = daySchedule.slotDuration;
  // Per-day breakTimes take priority over clinic-level breakTimes
  const effectiveBreakTimes = daySchedule.breakTimes || breakTimes || [];

  const slots = [];
  let current = startMinutes;

  while (current + duration <= endMinutes) {
    if (!isInBreak(current, duration, effectiveBreakTimes)) {
      slots.push(formatTime(current));
    }
    current += duration;
  }

  return slots;
}

export function generateSlotTimes(clinic, dateStr) {
  if (!clinic) return [];
  return generateSlotTimesForSchedule(clinic.weeklySchedule, clinic.breakTimes, dateStr);
}

export function buildSlotId(clinicId, date, time) {
  return `${clinicId}_${date}_${time}`;
}

export function classifyBookingDate(dateStr) {
  // Use IST date strings for comparison to avoid UTC offset issues
  const todayIST = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const targetDate = dateStr; // already YYYY-MM-DD

  if (targetDate < todayIST) {
    return { isInstant: false, isRequest: false, isOutOfRange: true, daysDiff: -1 };
  }

  // Calculate daysDiff using date string math (avoids timezone pitfalls)
  const todayMs = new Date(todayIST + 'T00:00:00+05:30').getTime();
  const targetMs = new Date(targetDate + 'T00:00:00+05:30').getTime();
  const daysDiff = Math.round((targetMs - todayMs) / (1000 * 60 * 60 * 24));

  if (daysDiff <= 20) {
    return { isInstant: true, isRequest: false, isOutOfRange: false, daysDiff };
  }

  if (daysDiff <= 90) {
    return { isInstant: false, isRequest: true, isOutOfRange: false, daysDiff };
  }

  return { isInstant: false, isRequest: false, isOutOfRange: true, daysDiff };
}