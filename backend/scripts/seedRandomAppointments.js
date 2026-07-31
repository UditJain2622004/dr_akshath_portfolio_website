/**
 * Seed random appointments across 3 consecutive days (for testing / demos).
 * Each row is randomly either confirmed (schedule + dashboard) or pending (Requests queue).
 *
 * Usage (from backend/):
 *   node scripts/seedRandomAppointments.js 2026-05-06
 *   node scripts/seedRandomAppointments.js          # defaults to today (local)
 *
 * Optional env:
 *   SEED_CONFIRM_RATIO=0.4   # fraction confirmed (default 0.5)
 *
 * Each run removes only appointments (and matching doctorSlots, when present) it previously
 * created for those three dates via seedSource === 'seedRandomAppointments'.
 *
 * Matches public POST behaviour: bookingType instant vs request from classifyBookingDate();
 * doctorSlots are written only for instant dates (≤20 days from run date), for both statuses.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { classifyBookingDate } from '../_utils/slotGenerator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const keyPath = resolve(__dirname, '../drAkshathPortfolioServiceAccountKey.json');
const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));
const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);

const SEED_SOURCE = 'seedRandomAppointments';

/** Same clinic ids as seedTestBookings.js — adjust if your Firestore uses others */
const CLINIC_IDS = ['vijay_polyclinic', 'ishaanvi_polyclinic', 'nexus_enliven'];

const FIRST_NAMES = ['Rahul', 'Ananya', 'Vikram', 'Divya', 'Karthik', 'Meera', 'Arjun', 'Sneha', 'Nikhil', 'Pooja'];
const LAST_NAMES = ['Sharma', 'Nair', 'Reddy', 'Iyer', 'Patel', 'Menon', 'Kumar', 'Rao', 'Desai', 'Kulkarni'];

/** 10-minute grid, aligned with typical booking UI */
const SLOT_MINUTES = [];
for (let m = 7 * 60; m < 22 * 60; m += 10) {
  const hh = String(Math.floor(m / 60)).padStart(2, '0');
  const mm = String(m % 60).padStart(2, '0');
  SLOT_MINUTES.push(`${hh}:${mm}`);
}

function parseStartDateArg() {
  const arg = process.argv[2];
  if (!arg) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toLocaleDateString('en-CA');
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(arg)) {
    throw new Error(`Invalid date "${arg}". Use YYYY-MM-DD (e.g. 2026-05-06).`);
  }
  return arg;
}

function addDaysYmd(ymd, deltaDays) {
  const [y, mo, da] = ymd.split('-').map(Number);
  const d = new Date(y, mo - 1, da);
  d.setDate(d.getDate() + deltaDays);
  return d.toLocaleDateString('en-CA');
}

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function randomPick(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

/** Fraction of seeded rows that are confirmed (rest are pending). Default ~half/half. */
function confirmedRatio() {
  const raw = process.env.SEED_CONFIRM_RATIO;
  if (raw === undefined || raw === '') return 0.5;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0 || n > 1) {
    console.warn(`⚠️  Invalid SEED_CONFIRM_RATIO="${raw}", using 0.5`);
    return 0.5;
  }
  return n;
}

function slotExpiryIso(dateYmd) {
  return new Date(`${dateYmd}T23:59:59+05:30`);
}

async function clearPreviousSeed(dates) {
  const snap = await db.collection('appointments').where('seedSource', '==', SEED_SOURCE).get();
  const dateSet = new Set(dates);
  const batchDeletes = [];

  for (const doc of snap.docs) {
    const data = doc.data();
    const apptDate = data.appointmentDate;
    if (!dateSet.has(apptDate)) continue;

    batchDeletes.push({ docRef: doc.ref, clinicId: data.clinicId, time: data.timeSlot, date: apptDate });
  }

  if (batchDeletes.length === 0) return;

  const chunkSize = 400;
  for (let i = 0; i < batchDeletes.length; i += chunkSize) {
    const chunk = batchDeletes.slice(i, i + chunkSize);
    const b = db.batch();
    for (const row of chunk) {
      b.delete(row.docRef);
      const slotId = `${row.clinicId}_${row.date}_${row.time}`;
      b.delete(db.collection('doctorSlots').doc(slotId));
    }
    await b.commit();
  }

  console.log(`🗑️  Cleared ${batchDeletes.length} previous seed appointment(s) (+ doctorSlots) for the target window`);
}

async function run() {
  const startYmd = parseStartDateArg();
  const dates = [startYmd, addDaysYmd(startYmd, 1), addDaysYmd(startYmd, 2)];

  const ratio = confirmedRatio();
  console.log(`\n🎲 Seeding random appointments for ${dates.join(', ')} (~${Math.round(ratio * 100)}% confirmed)`);
  console.log('═'.repeat(55));

  await clearPreviousSeed(dates);

  const appointmentsPerDay = randomInt(6, 12);
  const seedWrites = [];
  let nConfirmed = 0;
  let nPending = 0;

  for (const date of dates) {
    const dateClass = classifyBookingDate(date);
    const bookingType = dateClass.isInstant ? 'instant' : 'request';

    const usedKeys = new Set();
    let added = 0;
    let attempts = 0;
    const maxAttempts = appointmentsPerDay * 40;

    while (added < appointmentsPerDay && attempts < maxAttempts) {
      attempts += 1;
      const clinicId = randomPick(CLINIC_IDS);
      const time = randomPick(SLOT_MINUTES);
      const key = `${clinicId}|${time}`;
      if (usedKeys.has(key)) continue;
      usedKeys.add(key);

      const name = `${randomPick(FIRST_NAMES)} ${randomPick(LAST_NAMES)}`;
      const phone = `+919${String(randomInt(100000000, 999999999))}`;

      const ref = db.collection('appointments').doc();
      const isConfirmed = Math.random() < ratio;
      if (isConfirmed) nConfirmed += 1;
      else nPending += 1;

      const row = {
        apptRef: ref,
        payload: {
          patientId: phone,
          clinicId,
          patientName: name,
          patientPhone: phone,
          patientEmail: null,
          appointmentDate: date,
          timeSlot: time,
          bookingType,
          type: 'new',
          status: isConfirmed ? 'confirmed' : 'pending',
          createdAt: FieldValue.serverTimestamp(),
          confirmedAt: isConfirmed ? FieldValue.serverTimestamp() : null,
          seedSource: SEED_SOURCE,
        },
        slotDocId: null,
        slotPayload: null,
      };

      if (dateClass.isInstant) {
        row.slotDocId = `${clinicId}_${date}_${time}`;
        row.slotPayload = {
          clinicId,
          date,
          time,
          booked: true,
          appointmentId: ref.id,
          expiresAt: slotExpiryIso(date),
        };
      }

      seedWrites.push(row);

      added += 1;
      const st = isConfirmed ? 'confirmed' : 'pending';
      console.log(`   📌 ${date} ${time} @ ${clinicId} → ${name} (${bookingType}, ${st})`);
    }

    if (added < appointmentsPerDay) {
      console.warn(`   ⚠️  Only placed ${added}/${appointmentsPerDay} on ${date} (collision retries exhausted)`);
    }
  }

  const chunkSize = 250;
  for (let i = 0; i < seedWrites.length; i += chunkSize) {
    const chunk = seedWrites.slice(i, i + chunkSize);
    const batch = db.batch();
    for (const row of chunk) {
      batch.set(row.apptRef, row.payload);
      if (row.slotPayload && row.slotDocId) {
        batch.set(db.collection('doctorSlots').doc(row.slotDocId), row.slotPayload);
      }
    }
    await batch.commit();
  }

  console.log('\n' + '═'.repeat(55));
  console.log(`✅ Done! ${seedWrites.length} total → ${nConfirmed} confirmed, ${nPending} pending (Requests).\n`);
  process.exit(0);
}

run().catch(err => {
  console.error('❌', err);
  process.exit(1);
});
