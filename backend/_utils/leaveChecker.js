import { db } from './firebaseAdmin.js';

export async function checkDoctorLeave(clinicId, dateStr) {
  const leavesSnapshot = await db.collection('doctorLeaves').get();

  for (const doc of leavesSnapshot.docs) {
    const leave = doc.data();
    if (!(leave.startDate <= dateStr && leave.endDate >= dateStr)) {
      continue;
    }

    const scope = leave.scope || 'global';
    if (scope === 'global') {
      return { onLeave: true, reason: leave.reason || 'Doctor is unavailable', leaveId: doc.id, scope: 'global' };
    }

    if (scope === 'clinic' && leave.clinicId === clinicId) {
      return { onLeave: true, reason: leave.reason || 'Doctor is unavailable at this clinic', leaveId: doc.id, scope: 'clinic' };
    }
  }

  return { onLeave: false };
}