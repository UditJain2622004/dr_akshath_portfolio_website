import { db } from '../../_utils/firebaseAdmin.js';
import { verifyAuth } from '../../_utils/authMiddleware.js';
import { sendError, sendSuccess } from '../../_utils/apiHelpers.js';

export default async function handler(req, res) {
  const result = await verifyAuth(req);
  if (result.error) return sendError(res, result.status, result.error);

  const { method } = req;
  const { user } = result;

  // Determine target doctorId
  // Admins can pass doctorId in query, doctors are locked to their own id
  let targetDoctorId = user.role === 'admin' ? req.query.doctorId : user.doctorId;

  if (!targetDoctorId) {
    return sendError(res, 400, 'Doctor ID required');
  }

  try {
    if (method === 'GET') {
      const doc = await db.collection('doctors').doc(targetDoctorId).get();
      if (!doc.exists) return sendError(res, 404, 'Doctor not found');

      return sendSuccess(res, { profile: { id: doc.id, ...doc.data() } });
    }

    if (method === 'PATCH') {
      const updates = req.body;

      // Basic validation for updates

      const allowedFields = ['name', 'specialization', 'department', 'weeklySchedule', 'breakTimes', 'isActive'];
      const filteredUpdates = {};

      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      await db.collection('doctors').doc(targetDoctorId).update({
        ...filteredUpdates,
        updatedAt: new Date().toISOString()
      });

      return sendSuccess(res, { message: 'Profile updated successfully' });
    }

    return sendError(res, 405, 'Method not allowed');
  } catch (error) {
    console.error(`Error in /api/admin/profile (${method}):`, error);
    return sendError(res, 500, error.message);
  }
}
