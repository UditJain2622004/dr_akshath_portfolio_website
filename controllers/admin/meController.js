// GET /api/admin/me
// Returns the authenticated user's profile info.
// Uses Firebase ID token custom claims for role/doctorId.

import { verifyAuth } from '../../_utils/authMiddleware.js';
import { db } from '../../_utils/firebaseAdmin.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const result = await verifyAuth(req);
  if (result.error) {
    return res.status(result.status).json({ success: false, error: result.error });
  }

  try {
    // Get additional profile data from Firestore
    const userDoc = await db.collection('adminUsers').doc(result.user.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    return res.status(200).json({
      success: true,
      user: {
        uid: result.user.uid,
        email: result.user.email,
        name: userData.name || result.user.name,
        role: result.user.role,
        doctorId: result.user.doctorId,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/admin/me:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
