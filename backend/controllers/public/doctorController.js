import { db } from '../../_utils/firebaseAdmin.js';
import { sendError, sendSuccess } from '../../_utils/apiHelpers.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendError(res, 405, 'Method not allowed');
  }

  try {
    const profileDoc = await db.collection('doctorProfile').doc('main').get();
    if (!profileDoc.exists) {
      return sendError(res, 404, 'Doctor profile not found');
    }

    return sendSuccess(res, {
      doctor: {
        id: profileDoc.id,
        ...profileDoc.data(),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/doctor:', error);
    return sendError(res, 500, 'Internal server error');
  }
}