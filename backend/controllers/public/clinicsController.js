import { db } from '../../_utils/firebaseAdmin.js';
import { sendError, sendSuccess } from '../../_utils/apiHelpers.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendError(res, 405, 'Method not allowed');
  }

  try {
    const snapshot = await db.collection('clinics').where('isActive', '==', true).get();
    const clinics = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    clinics.sort((a, b) => {
      const orderDiff = (a.displayOrder ?? 9999) - (b.displayOrder ?? 9999);
      if (orderDiff !== 0) return orderDiff;
      return (a.name || '').localeCompare(b.name || '');
    });

    return sendSuccess(res, { clinics });
  } catch (error) {
    console.error('Error in GET /api/clinics:', error);
    return sendError(res, 500, 'Internal server error');
  }
}