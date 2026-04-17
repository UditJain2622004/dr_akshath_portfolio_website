import { getDb, getAdminAuth } from './firebaseAdmin.js';

export async function verifyAuth(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing or invalid authorization header', status: 401 };
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    getDb();
    const auth = getAdminAuth();
    const decoded = await auth.verifyIdToken(token);

    const role = decoded.role;
    if (!role || !['admin', 'doctor'].includes(role)) {
      return { error: 'Unauthorized: no valid admin role', status: 403 };
    }

    return {
      user: {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name || decoded.email,
        role,
      },
    };
  } catch (err) {
    console.error('Auth verification failed:', err.message);
    return { error: 'Invalid or expired token', status: 401 };
  }
}

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
