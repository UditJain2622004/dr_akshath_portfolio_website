// GET /api/admin/doctors — List all doctors for admin selection

import { db } from '../../_utils/firebaseAdmin.js';
import { requireAdmin } from '../../_utils/authMiddleware.js';
import { sendError, sendSuccess } from '../../_utils/apiHelpers.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') return sendError(res, 405, 'Method not allowed');

    const admin = await requireAdmin(req, res);
    if (!admin) return;

    try {
        const snapshot = await db.collection('doctors').get();
        const doctors = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return sendSuccess(res, { doctors });
    } catch (error) {
        console.error('Error in GET /api/admin/doctors:', error);
        return sendError(res, 500, error.message);
    }
}
