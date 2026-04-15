// Auth middleware for admin API endpoints.
// Verifies Firebase ID tokens and extracts role/doctorId from custom claims.

import { getAuth } from 'firebase-admin/auth';
import { getDb } from './firebaseAdmin.js';

/**
 * Verify the Firebase ID token from the Authorization header.
 * Returns the decoded user info (uid, email, role, doctorId) or an error.
 *
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<{ user?: object, error?: string, status?: number }>}
 */
export async function verifyAuth(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing or invalid authorization header', status: 401 };
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    // Ensure the admin app is initialized (getDb handles lazy init)
    getDb();

    const auth = getAuth();
    const decoded = await auth.verifyIdToken(token);

    const role = decoded.role;
    const doctorId = decoded.doctorId || null;

    if (!role || !['admin', 'doctor'].includes(role)) {
      return { error: 'Unauthorized: no valid admin role', status: 403 };
    }

    return {
      user: {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name || decoded.email,
        role,
        doctorId,
      },
    };
  } catch (err) {
    console.error('Auth verification failed:', err.message);
    return { error: 'Invalid or expired token', status: 401 };
  }
}

/**
 * Helper to enforce admin-only access.
 * Returns the user if admin, or sends an error response.
 */
export async function requireAdmin(req, res) {
  const result = await verifyAuth(req);
  if (result.error) {
    res.status(result.status).json({ success: false, error: result.error });
    return null;
  }
  if (result.user.role !== 'admin') {
    res.status(403).json({ success: false, error: 'Admin access required' });
    return null;
  }
  return result.user;
}
