// GET    /api/admin/leaves  — List doctor leaves
// POST   /api/admin/leaves  — Create a leave (block days)
// DELETE /api/admin/leaves  — Remove a leave

import { db } from '../../_utils/firebaseAdmin.js';
import { verifyAuth } from '../../_utils/authMiddleware.js';
import { sendError, sendSuccess, validateRequired, isValidDate } from '../../_utils/apiHelpers.js';

export default async function handler(req, res) {
  if (req.method === 'GET') return handleGet(req, res);
  if (req.method === 'POST') return handlePost(req, res);
  if (req.method === 'DELETE') return handleDelete(req, res);
  return sendError(res, 405, 'Method not allowed');
}

async function handleGet(req, res) {
  const result = await verifyAuth(req);
  if (result.error) return sendError(res, result.status, result.error);

  const { user } = result;
  const { doctorId } = req.query;

  try {
    let query = db.collection('doctorLeaves');

    // Permission check
    const targetDoctorId = user.role === 'admin' ? doctorId : user.doctorId;

    if (targetDoctorId) {
      query = query.where('doctorId', '==', targetDoctorId);
    }

    const snapshot = await query.get();
    const leaves = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort by start date
    leaves.sort((a, b) => (b.startDate || '').localeCompare(a.startDate || ''));

    return sendSuccess(res, { leaves });
  } catch (error) {
    console.error('Error in GET /api/admin/leaves:', error);
    return sendError(res, 500, error.message);
  }
}

async function handlePost(req, res) {
  const result = await verifyAuth(req);
  if (result.error) return sendError(res, result.status, result.error);

  const { user } = result;
  const { doctorId, startDate, endDate, reason } = req.body;

  const targetDoctorId = user.role === 'admin' ? doctorId : user.doctorId;

  if (!targetDoctorId) return sendError(res, 400, 'Doctor ID is required');

  const validationError = validateRequired(req.body, ['startDate', 'endDate']);
  if (validationError) return sendError(res, 400, validationError);

  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return sendError(res, 400, 'Invalid date format. Use YYYY-MM-DD');
  }

  try {
    const docRef = await db.collection('doctorLeaves').add({
      doctorId: targetDoctorId,
      startDate,
      endDate,
      reason: reason || (user.role === 'admin' ? 'Blocked by admin' : 'Personal Leave'),
      createdAt: new Date().toISOString(),
      createdBy: user.uid,
      createdRole: user.role
    });

    return sendSuccess(res, { id: docRef.id, message: 'Block created successfully' });
  } catch (error) {
    console.error('Error in POST /api/admin/leaves:', error);
    return sendError(res, 500, error.message);
  }
}

async function handleDelete(req, res) {
  const result = await verifyAuth(req);
  if (result.error) return sendError(res, result.status, result.error);

  const { user } = result;
  const { id } = req.query;
  if (!id) return sendError(res, 400, 'Missing leave ID');

  try {
    const docRef = db.collection('doctorLeaves').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) return sendError(res, 404, 'Blockage records not found');

    // Permission check
    if (user.role === 'doctor' && doc.data().doctorId !== user.doctorId) {
      return sendError(res, 403, 'You can only remove your own blockages');
    }

    await docRef.delete();
    return sendSuccess(res, { message: 'Blockage removed successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/leaves:', error);
    return sendError(res, 500, error.message);
  }
}

