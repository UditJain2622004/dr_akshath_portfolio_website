// Doctor leave checking utility

import { db } from './firebaseAdmin.js';

/**
 * Check if a doctor is on leave for a given date.
 * 
 * Uses a single equality filter (doctorId) and filters dates in memory.
 * This avoids needing a composite Firestore index, and is efficient
 * because doctors typically have very few leave records.
 * 
 * @param {string} doctorId - Doctor document ID
 * @param {string} dateStr - Date in "YYYY-MM-DD" format
 * @returns {Promise<{onLeave: boolean, reason?: string}>}
 */
export async function checkDoctorLeave(doctorId, dateStr) {
  const leavesSnapshot = await db
    .collection('doctorLeaves')
    .where('doctorId', '==', doctorId)
    .get();

  // Filter in memory: date must fall within [startDate, endDate]
  for (const doc of leavesSnapshot.docs) {
    const leave = doc.data();
    if (leave.startDate <= dateStr && leave.endDate >= dateStr) {
      return { onLeave: true, reason: leave.reason || 'Doctor is on leave' };
    }
  }

  return { onLeave: false };
}
