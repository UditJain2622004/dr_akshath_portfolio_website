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

  const { scope, clinicId } = req.query;

  try {
    const snapshot = await db.collection('doctorLeaves').get();
    let leaves = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    if (scope) leaves = leaves.filter((l) => (l.scope || 'global') === scope);
    if (clinicId) leaves = leaves.filter((l) => l.clinicId === clinicId);

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

  const { startDate, endDate, reason, scope = 'global', clinicId } = req.body;
  const validationError = validateRequired(req.body, ['startDate', 'endDate']);
  if (validationError) return sendError(res, 400, validationError);

  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return sendError(res, 400, 'Invalid date format. Use YYYY-MM-DD');
  }

  if (!['global', 'clinic'].includes(scope)) {
    return sendError(res, 400, 'Invalid scope. Use global or clinic');
  }

  if (scope === 'clinic' && !clinicId) {
    return sendError(res, 400, 'clinicId is required for clinic-scoped leave');
  }

  try {
    const payload = {
      scope,
      clinicId: scope === 'clinic' ? clinicId : null,
      startDate,
      endDate,
      reason: reason || (scope === 'global' ? 'Doctor unavailable' : 'Clinic-specific leave'),
      createdAt: new Date().toISOString(),
      createdBy: result.user.uid,
      createdRole: result.user.role,
    };

    const docRef = await db.collection('doctorLeaves').add(payload);
    return sendSuccess(res, { id: docRef.id, message: 'Leave created successfully' });
  } catch (error) {
    console.error('Error in POST /api/admin/leaves:', error);
    return sendError(res, 500, error.message);
  }
}

async function handleDelete(req, res) {
  const result = await verifyAuth(req);
  if (result.error) return sendError(res, result.status, result.error);

  const { id } = req.query;
  if (!id) return sendError(res, 400, 'Missing leave ID');

  try {
    const docRef = db.collection('doctorLeaves').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return sendError(res, 404, 'Leave record not found');

    await docRef.delete();
    return sendSuccess(res, { message: 'Leave removed successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/leaves:', error);
    return sendError(res, 500, error.message);
  }
}