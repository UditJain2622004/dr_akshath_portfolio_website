import { db } from '../../_utils/firebaseAdmin.js';
import { verifyAuth } from '../../_utils/authMiddleware.js';
import { sendError, sendSuccess, isValidDate } from '../../_utils/apiHelpers.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return sendError(res, 405, 'Method not allowed');

  const result = await verifyAuth(req);
  if (result.error) return sendError(res, result.status, result.error);

  const date = req.query.date;
  if (!date || !isValidDate(date)) return sendError(res, 400, 'Valid date (YYYY-MM-DD) is required');

  try {
    const [snapshot, backlogSnapshot] = await Promise.all([
      db.collection('appointments').where('appointmentDate', '==', date).get(),
      db.collection('appointments').where('status', '==', 'pending').get()
    ]);

    const appointments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const totals = {
      total: appointments.length,
      pending: appointments.filter((a) => a.status === 'pending').length,
      confirmed: appointments.filter((a) => a.status === 'confirmed').length,
      cancelled: appointments.filter((a) => a.status === 'cancelled').length,
      completed: appointments.filter((a) => a.status === 'completed').length,
      rejected: appointments.filter((a) => a.status === 'rejected').length,
    };

    const backlog = {
      pending: backlogSnapshot.size
    };

    const byClinic = {};
    appointments.forEach((appointment) => {
      const key = appointment.clinicId || 'unknown';
      if (!byClinic[key]) {
        byClinic[key] = {
          clinicId: key,
          total: 0,
          pending: 0,
          confirmed: 0,
          cancelled: 0,
          completed: 0,
          rejected: 0,
        };
      }

      byClinic[key].total += 1;
      if (byClinic[key][appointment.status] !== undefined) {
        byClinic[key][appointment.status] += 1;
      }
    });

    return sendSuccess(res, {
      date,
      totals,
      backlog,
      byClinic: Object.values(byClinic),
    });
  } catch (error) {
    console.error('Error in GET /api/admin/dashboard:', error);
    return sendError(res, 500, error.message);
  }
}