import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

  // 1. Local serviceAccountKey.json (Highest priority for local dev)
  const keyPath = resolve(__dirname, '../serviceAccountKey.json');
  if (existsSync(keyPath)) {
    console.log('Firebase: Initializing via local serviceAccountKey.json');
    const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));
    _app = initializeApp({ credential: cert(serviceAccount) });
    return _app;
  }

  // 2. Explicit environment variables
  if (projectId && clientEmail && privateKey) {
    console.log('Firebase: Initializing via environment variables');
    _app = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
    return _app;
  }

  // 3. Google Application Default Credentials
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log('Firebase: Initializing via GOOGLE_APPLICATION_CREDENTIALS');
    _app = initializeApp({ credential: applicationDefault() });
    return _app;
  }

  throw new Error(
    'Firebase Admin credentials are missing. Place serviceAccountKey.json in the backend root or set appropriate environment variables.'
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