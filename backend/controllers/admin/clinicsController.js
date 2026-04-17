import { db } from '../../_utils/firebaseAdmin.js';
import { verifyAuth, requireAdmin } from '../../_utils/authMiddleware.js';
import { sendError, sendSuccess, validateRequired } from '../../_utils/apiHelpers.js';

export default async function handler(req, res) {
  if (req.method === 'GET') return handleGet(req, res);
  if (req.method === 'POST') return handlePost(req, res);
  if (req.method === 'PATCH') return handlePatch(req, res);
  if (req.method === 'DELETE') return handleDelete(req, res);
  return sendError(res, 405, 'Method not allowed');
}

async function handleGet(req, res) {
  const result = await verifyAuth(req);
  if (result.error) return sendError(res, result.status, result.error);

  const { id } = req.query;

  try {
    if (id) {
      const clinicDoc = await db.collection('clinics').doc(id).get();
      if (!clinicDoc.exists) return sendError(res, 404, 'Clinic not found');
      return sendSuccess(res, { clinic: { id: clinicDoc.id, ...clinicDoc.data() } });
    }

    const snapshot = await db.collection('clinics').get();
    const clinics = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    clinics.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return sendSuccess(res, { clinics });
  } catch (error) {
    console.error('Error in GET /api/admin/clinics:', error);
    return sendError(res, 500, error.message);
  }
}

async function handlePost(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const validationError = validateRequired(req.body, ['name', 'address']);
  if (validationError) return sendError(res, 400, validationError);

  const payload = {
    name: req.body.name,
    address: req.body.address,
    isActive: req.body.isActive !== false,
    weeklySchedule: req.body.weeklySchedule || {},
    breakTimes: req.body.breakTimes || [],
    contact: req.body.contact || null,
    location: req.body.location || null,
    displayOrder: Number.isInteger(req.body.displayOrder) ? req.body.displayOrder : 9999,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const ref = await db.collection('clinics').add(payload);
    return sendSuccess(res, { clinicId: ref.id, message: 'Clinic created successfully' });
  } catch (error) {
    console.error('Error in POST /api/admin/clinics:', error);
    return sendError(res, 500, error.message);
  }
}

async function handlePatch(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const { clinicId, ...updates } = req.body;
  if (!clinicId) return sendError(res, 400, 'Missing clinicId');

  const allowedFields = ['name', 'address', 'isActive', 'weeklySchedule', 'breakTimes', 'contact', 'location', 'displayOrder'];
  const filteredUpdates = {};
  Object.keys(updates).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredUpdates[key] = updates[key];
    }
  });

  if (Object.keys(filteredUpdates).length === 0) {
    return sendError(res, 400, 'No valid updates provided');
  }

  try {
    await db.collection('clinics').doc(clinicId).update({
      ...filteredUpdates,
      updatedAt: new Date().toISOString(),
    });

    return sendSuccess(res, { message: 'Clinic updated successfully' });
  } catch (error) {
    console.error('Error in PATCH /api/admin/clinics:', error);
    return sendError(res, 500, error.message);
  }
}

async function handleDelete(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const { id } = req.query;
  if (!id) return sendError(res, 400, 'Missing clinic ID');

  try {
    await db.collection('clinics').doc(id).delete();
    return sendSuccess(res, { message: 'Clinic deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/clinics:', error);
    return sendError(res, 500, error.message);
  }
}