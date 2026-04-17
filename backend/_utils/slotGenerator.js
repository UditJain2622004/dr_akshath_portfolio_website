// Slot generation logic for a single doctor operating across multiple clinics.

function parseTime(timeStr) {
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
    const breakStart = parseTime(brk.start);
    const breakEnd = parseTime(brk.end);
    return slotStart < breakEnd && slotEnd > breakStart;
  });
}

export function generateSlotTimesForSchedule(weeklySchedule, breakTimes, dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = date.getDay();

  if (!weeklySchedule) return [];
  const daySchedule = weeklySchedule[String(dayOfWeek)];
  if (!daySchedule) return [];

  const startMinutes = parseTime(daySchedule.startTime);
  const endMinutes = parseTime(daySchedule.endTime);
  const duration = daySchedule.slotDuration;
  const effectiveBreakTimes = breakTimes || [];

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