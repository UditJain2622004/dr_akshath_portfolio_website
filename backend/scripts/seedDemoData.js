/**
 * Seed script — populates Firestore with realistic demo data for Dr. Akshath's admin panel.
 *
 * Run from backend directory:
 *   node scripts/seedDemoData.js
 *
 * Requires env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 */

import 'dotenv/config';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync(new URL("../serviceAccountKey.json", import.meta.url))
);
// ── Init ───────────────────────────────────────────────────────────────────────
const app = initializeApp({
  credential: cert(serviceAccount),
});
const db = getFirestore(app);
const auth = getAuth(app);

// ── Helpers ────────────────────────────────────────────────────────────────────
function ymd(date) {
  return date.toISOString().split('T')[0];
}
function daysFromToday(n) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return ymd(d);
}

// ── 1. Clinics ─────────────────────────────────────────────────────────────────
const CLINICS = [
  {
    id: 'clinic_kmc',
    name: 'KMC Hospital — Mangalore',
    address: 'KMC Hospital, Mangalore, Karnataka (per CV)',
    isActive: true,
    displayOrder: 1,
    contact: '+91 95381 07758',
    weeklySchedule: {
      1: { startTime: '09:00', endTime: '13:00', slotDuration: 15 },
      2: { startTime: '09:00', endTime: '13:00', slotDuration: 15 },
      4: { startTime: '09:00', endTime: '13:00', slotDuration: 15 },
      5: { startTime: '09:00', endTime: '13:00', slotDuration: 15 },
    },
    breakTimes: [{ start: '11:30', end: '12:00' }],
  },
  {
    id: 'clinic_nitk',
    name: 'NIT Karnataka — Health Care Center',
    address: 'NITK Campus, Surathkal, Mangalore, Karnataka',
    isActive: true,
    displayOrder: 2,
    contact: '+91 95381 07758',
    weeklySchedule: {
      1: { startTime: '18:00', endTime: '21:00', slotDuration: 20 },
      3: { startTime: '18:00', endTime: '21:00', slotDuration: 20 },
      5: { startTime: '18:00', endTime: '21:00', slotDuration: 20 },
    },
    breakTimes: [],
  },
];

// ── 2. Patients ────────────────────────────────────────────────────────────────
/** Synthetic demo patients for local/staging admin testing only — not real individuals. */
const PATIENTS = [
  { phone: '+919800000001', name: 'Demo Patient A', email: null },
  { phone: '+919800000002', name: 'Demo Patient B', email: null },
  { phone: '+919800000003', name: 'Demo Patient C', email: null },
  { phone: '+919800000004', name: 'Demo Patient D', email: null },
  { phone: '+919800000005', name: 'Demo Patient E', email: null },
  { phone: '+919800000006', name: 'Demo Patient F', email: null },
  { phone: '+919800000007', name: 'Demo Patient G', email: null },
  { phone: '+919800000008', name: 'Demo Patient H', email: null },
  { phone: '+919800000009', name: 'Demo Patient I', email: null },
  { phone: '+919800000010', name: 'Demo Patient J', email: null },
  { phone: '+919800000011', name: 'Demo Patient K', email: null },
  { phone: '+919800000012', name: 'Demo Patient L', email: null },
];

// ── 3. Appointments ────────────────────────────────────────────────────────────
// today = 0, yesterday = -1, tomorrow = +1
const APPOINTMENTS = [
  { clinicId: 'clinic_kmc', date: 0, time: '09:00', patient: 0, status: 'completed', type: 'new' },
  { clinicId: 'clinic_kmc', date: 0, time: '09:15', patient: 1, status: 'completed', type: 'followup' },
  { clinicId: 'clinic_kmc', date: 0, time: '09:30', patient: 2, status: 'confirmed', type: 'new' },
  { clinicId: 'clinic_kmc', date: 0, time: '10:00', patient: 3, status: 'confirmed', type: 'followup' },
  { clinicId: 'clinic_kmc', date: 0, time: '10:15', patient: 4, status: 'pending', type: 'new' },
  { clinicId: 'clinic_kmc', date: 0, time: '11:00', patient: 5, status: 'cancelled', type: 'new' },

  { clinicId: 'clinic_nitk', date: 0, time: '18:00', patient: 6, status: 'confirmed', type: 'new' },
  { clinicId: 'clinic_nitk', date: 0, time: '18:20', patient: 7, status: 'pending', type: 'followup' },
  { clinicId: 'clinic_nitk', date: 0, time: '18:40', patient: 8, status: 'pending', type: 'new' },

  { clinicId: 'clinic_kmc', date: 1, time: '09:00', patient: 9, status: 'confirmed', type: 'new' },
  { clinicId: 'clinic_kmc', date: 1, time: '09:15', patient: 10, status: 'pending', type: 'new' },
  { clinicId: 'clinic_kmc', date: 1, time: '09:30', patient: 11, status: 'pending', type: 'followup' },

  { clinicId: 'clinic_nitk', date: 1, time: '18:00', patient: 0, status: 'confirmed', type: 'followup' },
  { clinicId: 'clinic_nitk', date: 1, time: '18:20', patient: 2, status: 'pending', type: 'new' },

  { clinicId: 'clinic_nitk', date: 2, time: '18:00', patient: 3, status: 'pending', type: 'new' },
  { clinicId: 'clinic_nitk', date: 2, time: '18:20', patient: 4, status: 'confirmed', type: 'new' },

  { clinicId: 'clinic_kmc', date: -1, time: '09:00', patient: 5, status: 'completed', type: 'followup' },
  { clinicId: 'clinic_kmc', date: -1, time: '09:15', patient: 6, status: 'completed', type: 'new' },
  { clinicId: 'clinic_kmc', date: -1, time: '09:30', patient: 7, status: 'cancelled', type: 'new' },
  { clinicId: 'clinic_nitk', date: -1, time: '18:00', patient: 8, status: 'completed', type: 'followup' },
  { clinicId: 'clinic_nitk', date: -1, time: '18:20', patient: 9, status: 'completed', type: 'new' },
];

// ── Admin user ─────────────────────────────────────────────────────────────────
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin@123';

// ══════════════════════════════════════════════════════════════════════════════
async function seed() {
  console.log('\n🌱  Starting seed...\n');

  // ── Clinics ──────────────────────────────────────────────────────────────────
  console.log('📍  Seeding clinics...');
  for (const clinic of CLINICS) {
    const { id, ...data } = clinic;
    await db.collection('clinics').doc(id).set({ ...data, updatedAt: new Date().toISOString() }, { merge: true });
    console.log(`    ✔ ${clinic.name}`);
  }

  // ── Patients ─────────────────────────────────────────────────────────────────
  console.log('\n👤  Seeding patients...');
  for (const p of PATIENTS) {
    await db.collection('patients').doc(p.phone).set({
      name: p.name,
      phone: p.phone,
      email: p.email || null,
      createdAt: FieldValue.serverTimestamp(),
      lastAppointmentAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    console.log(`    ✔ ${p.name}`);
  }

  // ── Appointments ─────────────────────────────────────────────────────────────
  console.log('\n📋  Seeding appointments...');
  for (const appt of APPOINTMENTS) {
    const patient = PATIENTS[appt.patient];
    const date = daysFromToday(appt.date);
    const ref = db.collection('appointments').doc();
    await ref.set({
      patientId: patient.phone,
      patientName: patient.name,
      patientPhone: patient.phone,
      patientEmail: patient.email || null,
      clinicId: appt.clinicId,
      appointmentDate: date,
      timeSlot: appt.time,
      bookingType: 'request',
      type: appt.type,
      status: appt.status,
      createdAt: FieldValue.serverTimestamp(),
      confirmedAt: ['confirmed', 'completed'].includes(appt.status) ? FieldValue.serverTimestamp() : null,
      createdByAdmin: true,
    });
    console.log(`    ✔ ${patient.name} @ ${appt.clinicId}  ${date} ${appt.time}  [${appt.status}]`);
  }

  // ── Admin Firebase Auth user ──────────────────────────────────────────────────
  console.log('\n🔐  Creating admin auth user...');
  try {
    let adminUser;
    try {
      adminUser = await auth.getUserByEmail(ADMIN_EMAIL);
      console.log(`    ↻ User already exists: ${ADMIN_EMAIL}`);
    } catch {
      adminUser = await auth.createUser({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, displayName: 'Dr. Akshath Admin' });
      console.log(`    ✔ Created user: ${ADMIN_EMAIL}  password: ${ADMIN_PASSWORD}`);
    }

    // Set custom claim: role = admin
    await auth.setCustomUserClaims(adminUser.uid, { role: 'admin' });
    console.log(`    ✔ Set custom claim: role = admin`);
  } catch (err) {
    console.error('    ✗ Auth user creation failed:', err.message);
  }

  console.log('\n✅  Seed complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Admin login credentials:');
  console.log(`    Email   : ${ADMIN_EMAIL}`);
  console.log(`    Password: ${ADMIN_PASSWORD}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
