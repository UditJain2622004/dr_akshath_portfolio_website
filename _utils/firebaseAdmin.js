// Firebase Admin SDK initialization for Firebase Cloud Functions
// This runs server-side only — bypasses Firestore security rules.

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let _db = null;

function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Cloud Functions environment automatically provides credentials
  return initializeApp();
}

/**
 * Get the Firestore database instance.
 * Lazily initializes Firebase Admin on first call.
 * @returns {FirebaseFirestore.Firestore}
 */
export function getDb() {
  if (!_db) {
    const app = getAdminApp();
    _db = getFirestore(app);
  }
  return _db;
}

// For backward compatibility — but prefer getDb() for lazy init
export const db = new Proxy({}, {
  get(_, prop) {
    return getDb()[prop];
  }
});

export default { getDb };
