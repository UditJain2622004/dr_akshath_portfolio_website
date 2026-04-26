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
    id: 'clinic_fortis',
    name: 'Fortis — Koramangala',
    address: '154/9, Hosur Main Rd, Koramangala, Bengaluru 560095',
    isActive: true,
    displayOrder: 1,
    contact: '+91 80 6621 4444',
    weeklySchedule: {
      Mon: { open: '09:00', close: '13:00' },
      Tue: { open: '09:00', close: '13:00' },
      Thu: { open: '09:00', close: '13:00' },
      Fri: { open: '09:00', close: '13:00' },
    },
    breakTimes: [{ start: '11:30', end: '12:00' }],
    slotDuration: 15,
  },
  {
    id: 'clinic_apollo',
    name: 'Apollo — Indiranagar',
    address: '1A, Indiranagar 100ft Rd, Bengaluru 560038',
    isActive: true,
    displayOrder: 2,
    contact: '+91 80 4848 8484',
    weeklySchedule: {
      Mon: { open: '17:00', close: '20:00' },
      Wed: { open: '17:00', close: '20:00' },
      Fri: { open: '15:00', close: '18:00' },
      Sat: { open: '10:00', close: '13:00' },
    },
    breakTimes: [],
    slotDuration: 20,
  },
  {
    id: 'clinic_manipal',
    name: 'Manipal — Whitefield',
    address: 'ITPL Rd, Whitefield, Bengaluru 560066',
    isActive: true,
    displayOrder: 3,
    contact: '+91 80 2502 4444',
    weeklySchedule: {
      Tue: { open: '14:00', close: '18:00' },
      Sat: { open: '09:00', close: '13:00' },
    },
    breakTimes: [],
    slotDuration: 15,
  },
];

// ── 2. Patients ────────────────────────────────────────────────────────────────
const PATIENTS = [
  { phone: '+919876543210', name: 'Meena Iyer', email: 'meena.iyer@gmail.com' },
  { phone: '+919845123456', name: 'Suresh Patel', email: 'suresh.patel@gmail.com' },
  { phone: '+919812345678', name: 'Divya Krishnan', email: 'divya.k@outlook.com' },
  { phone: '+919900112233', name: 'Karthik Rao', email: null },
  { phone: '+919988776655', name: 'Lakshmi Devi', email: 'lakshmi@yahoo.com' },
  { phone: '+919765432100', name: 'Arjun Menon', email: 'arjun.menon@gmail.com' },
  { phone: '+919654321098', name: 'Seetha Raman', email: null },
  { phone: '+919543210987', name: 'Vijay Kumar', email: 'vijay.k@gmail.com' },
  { phone: '+919432109876', name: 'Rahul Sharma', email: 'rahul.sharma@gmail.com' },
  { phone: '+919321098765', name: 'Priya Nair', email: 'priya.nair@gmail.com' },
  { phone: '+919210987654', name: 'Arun Kumar', email: null },
  { phone: '+919109876543', name: 'Ananya Reddy', email: 'ananya.r@gmail.com' },
];

// ── 3. Appointments ────────────────────────────────────────────────────────────
// today = 0, yesterday = -1, tomorrow = +1
const APPOINTMENTS = [
  // ── Today ─ Fortis ──────────────────────────────────────────────
  { clinicId: 'clinic_fortis', date: 0, time: '09:00', patient: 0, status: 'completed', type: 'new' },
  { clinicId: 'clinic_fortis', date: 0, time: '09:15', patient: 1, status: 'completed', type: 'followup' },
  { clinicId: 'clinic_fortis', date: 0, time: '09:30', patient: 2, status: 'confirmed', type: 'new' },
  { clinicId: 'clinic_fortis', date: 0, time: '10:00', patient: 3, status: 'confirmed', type: 'followup' },
  { clinicId: 'clinic_fortis', date: 0, time: '10:15', patient: 4, status: 'pending', type: 'new' },
  { clinicId: 'clinic_fortis', date: 0, time: '11:00', patient: 5, status: 'cancelled', type: 'new' },

  // ── Today ─ Apollo ───────────────────────────────────────────────
  { clinicId: 'clinic_apollo', date: 0, time: '17:00', patient: 6, status: 'confirmed', type: 'new' },
  { clinicId: 'clinic_apollo', date: 0, time: '17:20', patient: 7, status: 'pending', type: 'followup' },
  { clinicId: 'clinic_apollo', date: 0, time: '17:40', patient: 8, status: 'pending', type: 'new' },

  // ── Tomorrow ─ Fortis ────────────────────────────────────────────
  { clinicId: 'clinic_fortis', date: 1, time: '09:00', patient: 9, status: 'confirmed', type: 'new' },
  { clinicId: 'clinic_fortis', date: 1, time: '09:15', patient: 10, status: 'pending', type: 'new' },
  { clinicId: 'clinic_fortis', date: 1, time: '09:30', patient: 11, status: 'pending', type: 'followup' },

  // ── Tomorrow ─ Manipal ───────────────────────────────────────────
  { clinicId: 'clinic_manipal', date: 1, time: '14:00', patient: 0, status: 'confirmed', type: 'followup' },
  { clinicId: 'clinic_manipal', date: 1, time: '14:15', patient: 2, status: 'pending', type: 'new' },

  // ── Day After ─ Apollo ───────────────────────────────────────────
  { clinicId: 'clinic_apollo', date: 2, time: '17:00', patient: 3, status: 'pending', type: 'new' },
  { clinicId: 'clinic_apollo', date: 2, time: '17:20', patient: 4, status: 'confirmed', type: 'new' },

  // ── Yesterday (history) ─ Fortis ────────────────────────────────
  { clinicId: 'clinic_fortis', date: -1, time: '09:00', patient: 5, status: 'completed', type: 'followup' },
  { clinicId: 'clinic_fortis', date: -1, time: '09:15', patient: 6, status: 'completed', type: 'new' },
  { clinicId: 'clinic_fortis', date: -1, time: '09:30', patient: 7, status: 'cancelled', type: 'new' },
  { clinicId: 'clinic_apollo', date: -1, time: '17:00', patient: 8, status: 'completed', type: 'followup' },
  { clinicId: 'clinic_apollo', date: -1, time: '17:20', patient: 9, status: 'completed', type: 'new' },
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
