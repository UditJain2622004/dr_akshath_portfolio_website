// GET /api/doctors
// Returns the list of active doctors with their schedules.
// Optional query param: ?id=doctor_1 to get a specific doctor.

import { db } from '../../_utils/firebaseAdmin.js';
import { sendError, sendSuccess } from '../../_utils/apiHelpers.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendError(res, 405, 'Method not allowed');
  }

  const { id } = req.query;

  try {
    if (id) {
      // Get a specific doctor
      const doctorDoc = await db.collection('doctors').doc(id).get();

      if (!doctorDoc.exists) {
        return sendError(res, 404, 'Doctor not found');
      }

      return sendSuccess(res, {
        doctor: { id: doctorDoc.id, ...doctorDoc.data() },
      });
    }

    // Get all active doctors
    const snapshot = await db
      .collection('doctors')
      .where('isActive', '==', true)
      .get();

    const doctors = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return sendSuccess(res, { doctors });

  } catch (error) {
    console.error('Error in /api/doctors:', error);
    return sendError(res, 500, 'Internal server error');
  }
}
