// Shared response helpers and validation for API routes

/**
 * Send a JSON error response.
 */
export function sendError(res, status, message) {
  return res.status(status).json({ success: false, error: message });
}

/**
 * Send a JSON success response.
 */
export function sendSuccess(res, data = {}) {
  return res.status(200).json({ success: true, ...data });
}

/**
 * Validate that required fields exist in the request body.
 * @param {object} body - Request body
 * @param {string[]} fields - Required field names
 * @returns {string|null} Error message or null if valid
 */
export function validateRequired(body, fields) {
  const missing = fields.filter(f => !body[f] && body[f] !== 0);
  if (missing.length > 0) {
    return `Missing required fields: ${missing.join(', ')}`;
  }
  return null;
}

/**
 * Validate date string format (YYYY-MM-DD).
 * @param {string} dateStr
 * @returns {boolean}
 */
export function isValidDate(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const date = new Date(dateStr + 'T00:00:00');
  return !isNaN(date.getTime());
}

/**
 * Validate time string format (HH:mm).
 * @param {string} timeStr 
 * @returns {boolean}
 */
export function isValidTime(timeStr) {
  if (!/^\d{2}:\d{2}$/.test(timeStr)) return false;
  const [h, m] = timeStr.split(':').map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}
