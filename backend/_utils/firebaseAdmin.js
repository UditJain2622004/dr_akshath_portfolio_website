import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let _app = null;
let _db = null;
let _auth = null;

function getAdminApp() {
  if (_app) {
    return _app;
  }

  if (getApps().length > 0) {
    _app = getApps()[0];
    return _app;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : null;

  if (projectId && clientEmail && privateKey) {
    _app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    return _app;
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    _app = initializeApp({
      credential: applicationDefault(),
    });
    return _app;
  }

  throw new Error(
    'Firebase Admin credentials are missing. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY (or GOOGLE_APPLICATION_CREDENTIALS).'
  );
}

export function getDb() {
  if (!_db) {
    const app = getAdminApp();
    _db = getFirestore(app);
  }
  return _db;
}

export function getAdminAuth() {
  if (!_auth) {
    const app = getAdminApp();
    _auth = getAuth(app);
  }
  return _auth;
}

export const db = new Proxy({}, {
  get(_, prop) {
    return getDb()[prop];
  },
});

export default { getDb, getAdminAuth };