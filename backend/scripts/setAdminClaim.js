/**
 * One-time script: Set role: "admin" custom claim on a Firebase Auth user.
 *
 * Usage:
 *   node scripts/setAdminClaim.js <email>
 *
 * Example:
 *   node scripts/setAdminClaim.js doctor@example.com
 */

import 'dotenv/config';
import { getAdminAuth } from '../_utils/firebaseAdmin.js';

const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/setAdminClaim.js <email>');
  process.exit(1);
}

async function run() {
  const auth = getAdminAuth();

  const user = await auth.getUserByEmail(email);
  console.log(`Found user: ${user.uid} (${user.email})`);
  console.log(`Current claims: ${JSON.stringify(user.customClaims || {})}`);

  await auth.setCustomUserClaims(user.uid, { role: 'admin' });

  const updated = await auth.getUser(user.uid);
  console.log(`\n✅ Claims set successfully!`);
  console.log(`New claims: ${JSON.stringify(updated.customClaims)}`);
  console.log(`\nThe user must log out and log back in for the new claim to take effect.`);
}

run().catch((err) => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
