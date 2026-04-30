/**
 * Seed test bookings for travel buffer testing
 * 
 * Usage: node scripts/seedTestBookings.js
 * 
 * Creates confirmed appointments at different clinics so you can
 * verify the 30-min cross-clinic travel buffer on the frontend.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const keyPath = resolve(__dirname, '../serviceAccountKey.json');
const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));
const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);

const DATE = '2026-05-01';

const BOOKINGS = [
  // Vijay Polyclinic — morning 07:20
  { clinicId: 'vijay_polyclinic', time: '07:20', name: 'Ramesh Kumar',    phone: '+919000000001' },
  // Ishaanvi — morning 08:00  (40 min after Vijay 07:20 → OK, but blocks Vijay/Nexus 07:30-08:30)
  { clinicId: 'ishaanvi_polyclinic', time: '08:00', name: 'Priya Sharma', phone: '+919000000002' },
  // Nexus — evening 18:30
  { clinicId: 'nexus_enliven', time: '18:30', name: 'Suresh Nayak',       phone: '+919000000003' },
  // Vijay — evening 19:20  (50 min after Nexus 18:30 → OK, but blocks Ishaanvi/Nexus 18:50-19:50)
  { clinicId: 'vijay_polyclinic', time: '19:20', name: 'Lakshmi Devi',    phone: '+919000000004' },
  // Ishaanvi — evening 20:30
  { clinicId: 'ishaanvi_polyclinic', time: '20:30', name: 'Anil Rao',     phone: '+919000000005' },
];

async function run() {
  console.log(`\n🧪 Seeding ${BOOKINGS.length} test bookings for ${DATE}`);
  console.log('═'.repeat(55));

  // Clean up any previous test bookings for this date
  const existing = await db.collection('appointments')
    .where('appointmentDate', '==', DATE)
    .get();

  if (!existing.empty) {
    const batch = db.batch();
    existing.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    console.log(`🗑️  Cleared ${existing.size} existing appointment(s) for ${DATE}`);
  }

  // Also clear doctorSlots for this date
  const existingSlots = await db.collection('doctorSlots')
    .where('date', '==', DATE)
    .get();
  if (!existingSlots.empty) {
    const batch = db.batch();
    existingSlots.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    console.log(`🗑️  Cleared ${existingSlots.size} slot doc(s) for ${DATE}`);
  }

  // Insert bookings
  const batch = db.batch();
  for (const b of BOOKINGS) {
    const ref = db.collection('appointments').doc();
    batch.set(ref, {
      patientId: b.phone,
      clinicId: b.clinicId,
      patientName: b.name,
      patientPhone: b.phone,
      patientEmail: null,
      appointmentDate: DATE,
      timeSlot: b.time,
      bookingType: 'instant',
      type: 'new',
      status: 'confirmed',
      createdAt: FieldValue.serverTimestamp(),
      confirmedAt: FieldValue.serverTimestamp(),
      createdByAdmin: true,
    });

    // Also create matching doctorSlot
    const slotId = `${b.clinicId}_${DATE}_${b.time}`;
    batch.set(db.collection('doctorSlots').doc(slotId), {
      clinicId: b.clinicId,
      date: DATE,
      time: b.time,
      booked: true,
      appointmentId: ref.id,
      expiresAt: new Date(DATE + 'T23:59:59+05:30'),
    });

    console.log(`   ✅ ${b.time} @ ${b.clinicId} → ${b.name}`);
  }

  await batch.commit();

  console.log('\n📋 Expected buffer effects:');
  console.log('   Vijay 07:20  → blocks other clinics 06:50–07:50');
  console.log('   Ishaanvi 08:00 → blocks other clinics 07:30–08:30');
  console.log('   Nexus 18:30  → blocks other clinics 18:00–19:00');
  console.log('   Vijay 19:20  → blocks other clinics 18:50–19:50');
  console.log('   Ishaanvi 20:30 → blocks other clinics 20:00–21:00');
  console.log('\n' + '═'.repeat(55));
  console.log('✅ Done! Refresh the booking page to test.\n');
  process.exit(0);
}

run().catch(err => { console.error('❌', err); process.exit(1); });
