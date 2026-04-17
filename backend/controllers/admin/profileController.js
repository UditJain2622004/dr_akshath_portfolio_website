import { db } from '../../_utils/firebaseAdmin.js';
import { verifyAuth } from '../../_utils/authMiddleware.js';
import { sendError, sendSuccess } from '../../_utils/apiHelpers.js';

export default async function handler(req, res) {
  const result = await verifyAuth(req);
  if (result.error) return sendError(res, result.status, result.error);

  const { method } = req;

  try {
    const profileRef = db.collection('doctorProfile').doc('main');

    if (method === 'GET') {
      const doc = await profileRef.get();
      if (!doc.exists) return sendError(res, 404, 'Doctor profile not found');
      return sendSuccess(res, { profile: { id: doc.id, ...doc.data() } });
    }

    if (method === 'PATCH') {
      const updates = req.body;
      const allowedFields = ['name', 'specialization', 'department', 'bio', 'qualifications', 'experienceYears', 'photoUrl', 'isActive'];
      const filteredUpdates = {};

      Object.keys(updates).forEach((key) => {
        if (allowedFields.includes(key)) filteredUpdates[key] = updates[key];
      });

      if (Object.keys(filteredUpdates).length === 0) {
        return sendError(res, 400, 'No valid updates provided');
      }

      await profileRef.set({
        ...filteredUpdates,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      return sendSuccess(res, { message: 'Profile updated successfully' });
    }

    return sendError(res, 405, 'Method not allowed');
  } catch (error) {
    console.error(`Error in /api/admin/profile (${method}):`, error);
    return sendError(res, 500, error.message);
  }
}