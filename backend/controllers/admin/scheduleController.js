import { db } from '../../_utils/firebaseAdmin.js';
import { verifyAuth } from '../../_utils/authMiddleware.js';
import { sendError, sendSuccess, isValidDate } from '../../_utils/apiHelpers.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return sendError(res, 405, 'Method not allowed');

  const result = await verifyAuth(req);
  if (result.error) return sendError(res, result.status, result.error);

  const { dateFrom, dateTo, clinicId } = req.query;
  if (!dateFrom || !dateTo || !isValidDate(dateFrom) || !isValidDate(dateTo)) {
    return sendError(res, 400, 'dateFrom and dateTo in YYYY-MM-DD format are required');
  }

  try {
    let query = db.collection('appointments');
    if (clinicId) query = query.where('clinicId', '==', clinicId);

    const snapshot = await query.get();
    const appointments = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((a) => a.appointmentDate >= dateFrom && a.appointmentDate <= dateTo)
      .sort((a, b) => {
        const dateDiff = (a.appointmentDate || '').localeCompare(b.appointmentDate || '');
        if (dateDiff !== 0) return dateDiff;
        return (a.timeSlot || '').localeCompare(b.timeSlot || '');
      });

    const clinicIds = [...new Set(appointments.map((a) => a.clinicId).filter(Boolean))];
    const clinicMap = {};
    if (clinicIds.length > 0) {
      const clinics = await Promise.all(clinicIds.map((id) => db.collection('clinics').doc(id).get()));
      clinics.forEach((doc) => {
        if (doc.exists) clinicMap[doc.id] = doc.data().name;
      });
    }

    const schedule = appointments.map((a) => ({
      ...a,
      clinicName: clinicMap[a.clinicId] || a.clinicId,
    }));

    return sendSuccess(res, { schedule });
  } catch (error) {
    console.error('Error in GET /api/admin/schedule:', error);
    return sendError(res, 500, error.message);
  }
}