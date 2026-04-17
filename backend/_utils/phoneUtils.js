// Phone number normalization utility
// Ensures all phone numbers are stored in E.164 format (+91XXXXXXXXXX)

/**
 * Normalize an Indian phone number to E.164 format.
 * Handles inputs like: 9876543210, 09876543210, +919876543210, 919876543210
 * 
 * @param {string} phone - Raw phone number input
 * @returns {string} Normalized phone in E.164 format
 * @throws {Error} If phone number is invalid
 */
export function normalizePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    throw new Error('Phone number is required');
  }

  // Remove all whitespace, dashes, and parentheses
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // Remove leading + if present
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // Remove leading 0 (trunk prefix)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // If starts with 91 and remaining is 10 digits, strip the country code
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  }

  // At this point we should have exactly 10 digits
  if (!/^\d{10}$/.test(cleaned)) {
    throw new Error('Invalid phone number. Expected 10-digit Indian mobile number.');
  }

  // Validate it starts with 6-9 (Indian mobile numbers)
  if (!/^[6-9]/.test(cleaned)) {
    throw new Error('Invalid Indian mobile number. Must start with 6, 7, 8, or 9.');
  }

  return `+91${cleaned}`;
}
