// GET    /api/admin/healthCheckups — List all health checkup bookings
// PATCH  /api/admin/healthCheckups — Update status (complete/cancel)
// DELETE /api/admin/healthCheckups?checkupId=X — Delete a record

import { db } from '../../_utils/firebaseAdmin.js';
import { verifyAuth } from '../../_utils/authMiddleware.js';
import { sendError, sendSuccess, validateRequired } from '../../_utils/apiHelpers.js';

export default async function handler(req, res) {
  if (req.method === 'GET') return handleGet(req, res);
  if (req.method === 'PATCH') return handlePatch(req, res);
  if (req.method === 'DELETE') return handleDelete(req, res);
  return sendError(res, 405, 'Method not allowed');
}

async function handleGet(req, res) {
  const result = await verifyAuth(req);
  if (result.error) return sendError(res, result.status, result.error);

  const { status, dateFrom, dateTo, patientPhone } = req.query;

  try {
    let query = db.collection('healthCheckups');

    if (patientPhone) {
      query = query.where('patientId', '==', patientPhone);
    }

    if (status) {
      const statuses = status.split(',').map(s => s.trim());
      query = query.where('status', 'in', statuses);
    }

    const snapshot = await query.get();

    let checkups = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      };
    });

    if (dateFrom) {
      checkups = checkups.filter(c => c.preferredDate >= dateFrom);
    }
    if (dateTo) {
      checkups = checkups.filter(c => c.preferredDate <= dateTo);
    }

    checkups.sort((a, b) => (a.preferredDate || '').localeCompare(b.preferredDate || ''));

    return sendSuccess(res, { checkups });
  } catch (error) {
    console.error('Error in GET /api/admin/healthCheckups:', error);
    return sendError(res, 500, `Internal server error: ${error.message}`);
  }
}

async function handlePatch(req, res) {
  const result = await verifyAuth(req);
  if (result.error) return sendError(res, result.status, result.error);

  const { checkupId, action } = req.body;

  const validationError = validateRequired(req.body, ['checkupId', 'action']);
  if (validationError) return sendError(res, 400, validationError);

  const validActions = ['cancel', 'complete'];
  if (!validActions.includes(action)) {
    return sendError(res, 400, `Invalid action. Must be one of: ${validActions.join(', ')}`);
  }

  try {
    const checkupRef = db.collection('healthCheckups').doc(checkupId);
    const checkupDoc = await checkupRef.get();

    if (!checkupDoc.exists) return sendError(res, 404, 'Health checkup not found');

    const checkup = checkupDoc.data();

    const allowedTransitions = {
      confirmed: ['cancel', 'complete'],
      cancelled: [],
      completed: [],
    };

    const allowed = allowedTransitions[checkup.status] || [];
    if (!allowed.includes(action)) {
      return sendError(res, 400, `Cannot ${action} a checkup with status "${checkup.status}"`);
    }

    const statusMap = { cancel: 'cancelled', complete: 'completed' };

    await checkupRef.update({ status: statusMap[action] });

    return sendSuccess(res, {
      checkupId,
      newStatus: statusMap[action],
      message: `Health checkup ${statusMap[action]} successfully.`,
    });
  } catch (error) {
    console.error('Error in PATCH /api/admin/healthCheckups:', error);
    return sendError(res, 500, `Internal server error: ${error.message}`);
  }
}

async function handleDelete(req, res) {
  const result = await verifyAuth(req);
  if (result.error) return sendError(res, result.status, result.error);

  if (result.user.role !== 'admin') {
    return sendError(res, 403, 'Admin access required');
  }

  const { checkupId } = req.query;
  if (!checkupId) return sendError(res, 400, 'Missing checkupId');

  try {
    const checkupRef = db.collection('healthCheckups').doc(checkupId);
    const checkupDoc = await checkupRef.get();

    if (!checkupDoc.exists) return sendError(res, 404, 'Health checkup not found');

    await checkupRef.delete();

    return sendSuccess(res, { message: 'Health checkup record deleted.' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/healthCheckups:', error);
    return sendError(res, 500, `Internal server error: ${error.message}`);
  }
}
