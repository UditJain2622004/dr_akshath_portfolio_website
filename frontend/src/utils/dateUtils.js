/**
 * Returns the current date (or a given date) as "YYYY-MM-DD" in IST / local timezone.
 * NEVER use `toISOString().split('T')[0]` — that converts to UTC first,
 * which shifts the date after 6:30 PM IST.
 */
export function toLocalDateStr(d = new Date()) {
  const date = d instanceof Date ? d : new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
