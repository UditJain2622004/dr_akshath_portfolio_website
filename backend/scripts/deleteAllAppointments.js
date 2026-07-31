/**
 * Delete every document in `appointments` and `doctorSlots`.
 *
 * doctorSlots are booking holds tied to appointments; clearing both avoids orphaned
 * "booked" slots after appointments are removed.
 *
 * Usage (from backend/):
 *   node scripts/deleteAllAppointments.js --confirm
 *
 * Requires backend/drAkshathPortfolioServiceAccountKey.json (same as other seed scripts).
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

if (!process.argv.includes('--confirm')) {
  console.error('\n❌ Refusing to run without --confirm');
  console.error('   Usage: node scripts/deleteAllAppointments.js --confirm\n');
  process.exit(1);
}

const keyPath = resolve(__dirname, '../drAkshathPortfolioServiceAccountKey.json');
const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));
const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);

const BATCH_SIZE = 400;

async function deleteInBatches(collectionId) {
  const col = db.collection(collectionId);
  let total = 0;
  for (; ;) {
    const snap = await col.limit(BATCH_SIZE).get();
    if (snap.empty) break;
    const batch = db.batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    total += snap.size;
    process.stdout.write(`\r   ${collectionId}: ${total} deleted…`);
  }
  console.log(`\r   ${collectionId}: ${total} deleted (done)    `);
  return total;
}

async function run() {
  console.log('\n🗑️  Deleting ALL appointments and doctorSlots');
  console.log('═'.repeat(55));

  const appts = await deleteInBatches('appointments');
  const slots = await deleteInBatches('doctorSlots');

  console.log('═'.repeat(55));
  console.log(`✅ Finished. appointments: ${appts}, doctorSlots: ${slots}\n`);
  process.exit(0);
}

run().catch((err) => {
  console.error('❌', err);
  process.exit(1);
});
