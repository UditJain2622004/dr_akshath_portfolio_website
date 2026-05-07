import 'dotenv/config';
import { db } from '../_utils/firebaseAdmin.js';

const doctorProfile = {
  name: 'Dr. Akshath Ramesh Acharya',
  specialization: 'Medical consultation · Cardiac critical care training · Occupational health · Aesthetic medicine',
  department: 'General / multi-specialty hospital practice (per CV)',
  bio: 'MBBS (A.J. IMS, Mangalore, 2011). Resident Doctor at KMC Hospital, Mangalore (Nov 2012 – Apr 2025). Medical Officer, NIT Karnataka Health Care Center (since 2014, evenings). Qualifications include FAM, APGD(OHSM), FICCC, FICD, FECHO, FECMO.',
  qualifications: ['MBBS', 'FAM', 'APGD(OHSM)', 'FICCC', 'FICD', 'FECHO', 'FECMO'],
  experienceYears: 13,
  email: 'akshath_surathkal@yahoo.com',
  phone: '+91-9538107758',
  address: '5-21/1, Sapthagiri, Old Post Office Road, Surathkal, Mangalore – 575014, Karnataka',
  isActive: true,
  updatedAt: new Date().toISOString(),
};

const clinics = [
  {
    id: 'clinic_kmc',
    data: {
      name: 'KMC Hospital — Mangalore',
      address: 'KMC Hospital, Mangalore, Karnataka (affiliation per CV)',
      isActive: true,
      displayOrder: 1,
      contact: '+91-9538107758',
      weeklySchedule: {
        '1': { startTime: '09:00', endTime: '13:00', slotDuration: 20 },
        '2': { startTime: '09:00', endTime: '13:00', slotDuration: 20 },
        '3': { startTime: '09:00', endTime: '13:00', slotDuration: 20 },
        '4': { startTime: '09:00', endTime: '13:00', slotDuration: 20 },
        '5': { startTime: '09:00', endTime: '13:00', slotDuration: 20 },
      },
      breakTimes: [{ start: '11:00', end: '11:20' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: 'clinic_nitk',
    data: {
      name: 'NIT Karnataka — Health Care Center',
      address: 'National Institute of Technology Karnataka, Surathkal, Karnataka',
      isActive: true,
      displayOrder: 2,
      contact: '+91-9538107758',
      weeklySchedule: {
        '1': { startTime: '18:00', endTime: '21:00', slotDuration: 20 },
        '2': { startTime: '18:00', endTime: '21:00', slotDuration: 20 },
        '3': { startTime: '18:00', endTime: '21:00', slotDuration: 20 },
        '4': { startTime: '18:00', endTime: '21:00', slotDuration: 20 },
        '5': { startTime: '18:00', endTime: '21:00', slotDuration: 20 },
      },
      breakTimes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: 'clinic_private',
    data: {
      name: 'Private / tele appointment (Surathkal–Mangalore)',
      address: '5-21/1, Sapthagiri, Old Post Office Road, Surathkal, Mangalore – 575014, Karnataka',
      isActive: true,
      displayOrder: 3,
      contact: '+91-9538107758',
      weeklySchedule: {
        '6': { startTime: '10:00', endTime: '13:00', slotDuration: 30 },
      },
      breakTimes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
];

async function run() {
  const batch = db.batch();

  const doctorRef = db.collection('doctorProfile').doc('main');
  batch.set(doctorRef, doctorProfile, { merge: true });

  for (const clinic of clinics) {
    const clinicRef = db.collection('clinics').doc(clinic.id);
    batch.set(clinicRef, clinic.data, { merge: true });
  }

  await batch.commit();

  console.log('Seed complete: doctorProfile/main + clinics upserted.');
  console.log(`Clinics: ${clinics.map((c) => c.id).join(', ')}`);
}

run().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
