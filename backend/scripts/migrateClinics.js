/**
 * Clinic Migration Script
 * -----------------------
 * Removes all existing dummy clinics and adds the real Dr. Akshath clinics.
 * 
 * Usage:  node --experimental-vm-modules scripts/migrateClinics.js
 *   (or)  node scripts/migrateClinics.js
 * 
 * Requires: serviceAccountKey.json in the backend root
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const keyPath = resolve(__dirname, '../serviceAccountKey.json');
const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a weeklySchedule object for all 7 days (0=Sun … 6=Sat)
 * with split morning + evening sessions encoded as breakTimes.
 */
function buildWeeklySchedule(morningStart, morningEnd, eveningStart, eveningEnd, slotDuration) {
  const dayEntry = {
    startTime: morningStart,
    endTime: eveningEnd,
    slotDuration,
    breakTimes: [{ start: morningEnd, end: eveningStart }],
  };

  const schedule = {};
  for (let d = 0; d <= 6; d++) {
    schedule[String(d)] = { ...dayEntry, breakTimes: [...dayEntry.breakTimes] };
  }
  return schedule;
}

/**
 * Build schedule for a single-session day
 */
function buildSingleSessionSchedule(start, end, slotDuration) {
  const dayEntry = { startTime: start, endTime: end, slotDuration, breakTimes: [] };
  const schedule = {};
  for (let d = 0; d <= 6; d++) {
    schedule[String(d)] = { ...dayEntry };
  }
  return schedule;
}

// ─────────────────────────────────────────────────────────────────────────────
// Clinic Data
// ─────────────────────────────────────────────────────────────────────────────

const CLINICS = [
  {
    id: 'vijay_polyclinic',
    name: 'Vijay Polyclinic & Diagnostic Centre',
    address: '1st Abish Business Centre, Above Vijay Medicals, Surathkal, 575014',
    phone: null,
    isActive: true,
    appointmentOnly: true,
    weeklySchedule: buildWeeklySchedule('07:00', '09:00', '18:00', '20:00', 10),
    breakTimes: [],  // per-day breakTimes are used instead
    notes: 'Availability only based on appointments',
  },
  {
    id: 'ishaanvi_polyclinic',
    name: 'Ishaanvi Polyclinic & Diagnostic Centre',
    address: 'Near Kana bus stand, MRPL Road, opposite Kana Masjid, Surathkal, 575014',
    phone: null,
    isActive: true,
    appointmentOnly: true,
    weeklySchedule: buildWeeklySchedule('07:00', '09:00', '18:00', '22:00', 10),
    breakTimes: [],
    notes: 'Availability only based on appointments',
  },
  {
    id: 'nexus_enliven',
    name: 'Nexus Enliven Health Centre',
    address: 'Door No.4-57/A, Vijaya Mahal, Surathkal, Iddya, Mangaluru Taluk, Dakshina Kannada District, Karnataka - 575014',
    phone: null,
    isActive: true,
    appointmentOnly: false,
    weeklySchedule: buildWeeklySchedule('08:00', '09:00', '18:00', '22:00', 10),
    breakTimes: [],
    notes: null,
  },
  {
    id: 'bodycraft_clinic',
    name: 'BodyCraft Clinic',
    address: 'Sai Arya, D.No: 1-15/5(2) & 1-15/5(3), Pumpwell Circle, opposite Ganesh Medicals, Mangaluru, Karnataka - 575002',
    phone: null,
    isActive: true,
    appointmentOnly: true,
    weeklySchedule: null,  // No fixed schedule — admin creates bookings manually
    breakTimes: [],
    specialty: 'Aesthetic Medicine / Cosmetology Procedures',
    notes: 'Only on appointments — no fixed schedule',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Migration Logic
// ─────────────────────────────────────────────────────────────────────────────

async function run() {
  console.log('\n🏥 Clinic Migration Script');
  console.log('═'.repeat(50));

  // ── Step 1: Delete all existing clinics ──
  console.log('\n🗑️  Step 1: Removing existing clinics...');
  const existingClinics = await db.collection('clinics').get();

  if (existingClinics.empty) {
    console.log('   No existing clinics found.');
  } else {
    const deleteBatch = db.batch();
    existingClinics.docs.forEach(doc => {
      console.log(`   Deleting: ${doc.id} (${doc.data().name || 'unnamed'})`);
      deleteBatch.delete(doc.ref);
    });
    await deleteBatch.commit();
    console.log(`   ✅ Deleted ${existingClinics.size} clinic(s).`);
  }

  // ── Step 2: Also clean up orphaned doctorSlots ──
  console.log('\n🧹 Step 2: Cleaning up orphaned slot data...');
  const slotsSnap = await db.collection('doctorSlots').limit(500).get();
  if (!slotsSnap.empty) {
    const slotBatch = db.batch();
    slotsSnap.docs.forEach(doc => slotBatch.delete(doc.ref));
    await slotBatch.commit();
    console.log(`   ✅ Deleted ${slotsSnap.size} orphaned slot document(s).`);
  } else {
    console.log('   No orphaned slots found.');
  }

  // ── Step 3: Add new clinics ──
  console.log('\n➕ Step 3: Adding real clinics...');
  const addBatch = db.batch();
  for (const clinic of CLINICS) {
    const { id, ...data } = clinic;
    const ref = db.collection('clinics').doc(id);
    addBatch.set(ref, {
      ...data,
      createdAt: new Date().toISOString(),
    });
    console.log(`   Adding: ${id} → ${data.name}`);
  }
  await addBatch.commit();
  console.log(`   ✅ Added ${CLINICS.length} clinic(s).`);

  // ── Step 4: Verify slot generation ──
  console.log('\n🔍 Step 4: Verifying slot generation...');
  // Dynamically import slot generator
  const { generateSlotTimes } = await import('../_utils/slotGenerator.js');
  const today = new Date().toISOString().split('T')[0];

  for (const clinic of CLINICS) {
    const slots = generateSlotTimes(clinic, today);
    if (clinic.weeklySchedule) {
      // Find today's schedule
      const dayOfWeek = new Date().getDay();
      const daySchedule = clinic.weeklySchedule[String(dayOfWeek)];
      const breaks = daySchedule?.breakTimes || [];
      const breakStr = breaks.length > 0 ? breaks.map(b => `${b.start}–${b.end}`).join(', ') : 'none';
      console.log(`   ${clinic.name}`);
      console.log(`     Schedule: ${daySchedule.startTime} → ${daySchedule.endTime} | Break: ${breakStr}`);
      console.log(`     Slots (${slots.length}): ${slots.slice(0, 5).join(', ')}${slots.length > 5 ? ` … ${slots.slice(-3).join(', ')}` : ''}`);
    } else {
      console.log(`   ${clinic.name}`);
      console.log(`     No fixed schedule (appointment-only). Slots: ${slots.length}`);
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log('✅ Migration complete!\n');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
