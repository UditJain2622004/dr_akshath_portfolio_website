import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore, initializeFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let _app = null;
let _db = null;
let _auth = null;

/** GCP / Firebase project id for Admin SDK (required for reliable Firestore on ADC). */
function resolvedProjectId() {
  return (
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    process.env.GCP_PROJECT ||
    process.env.FIREBASE_PROJECT_ID ||
    null
  );
}

/** True when running on Firebase App Hosting backend / Cloud Run / GCF / App Engine */
function isManagedRuntime() {
  return Boolean(
    process.env.K_SERVICE ||
    process.env.FUNCTION_TARGET ||
    process.env.GAE_ENV ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT,
  );
}

function getAdminApp() {
  if (_app) {
    return _app;
  }

  if (getApps().length > 0) {
    _app = getApps()[0];
    return _app;
  }

  const envProjectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : null;
  const keyPath = resolve(__dirname, '../serviceAccountKey.json');
  const pid = resolvedProjectId();
  const managed = isManagedRuntime();

  // 1. Managed GCP / App Hosting — always ADC first so a bundled local key file never hijacks prod.
  if (managed) {
    const options = {
      credential: applicationDefault(),
      ...(pid ? { projectId: pid } : {}),
    };
    if (!pid) {
      console.warn(
        'Firebase: No GOOGLE_CLOUD_PROJECT / GCLOUD_PROJECT / FIREBASE_PROJECT_ID — Firestore may fail on ADC. Set one in App Hosting env.',
      );
    }
    console.log('Firebase: Initializing via managed runtime ADC');
    _app = initializeApp(options);
    return _app;
  }

  // 2. Local dev: optional serviceAccountKey.json
  if (existsSync(keyPath)) {
    console.log('Firebase: Initializing via local serviceAccountKey.json');
    const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));
    _app = initializeApp({ credential: cert(serviceAccount) });
    return _app;
  }

  // 3. Explicit service account env vars
  if (envProjectId && clientEmail && privateKey) {
    console.log('Firebase: Initializing via environment variables');
    _app = initializeApp({
      credential: cert({ projectId: envProjectId, clientEmail, privateKey }),
    });
    return _app;
  }

  // 4. GOOGLE_APPLICATION_CREDENTIALS (e.g. CI or local key path)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.log('Firebase: Initializing via GOOGLE_APPLICATION_CREDENTIALS');
    _app = initializeApp({
      credential: applicationDefault(),
      ...(pid ? { projectId: pid } : {}),
    });
    return _app;
  }

  throw new Error(
    'Firebase Admin credentials are missing. Place serviceAccountKey.json in the backend root or set appropriate environment variables.',
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