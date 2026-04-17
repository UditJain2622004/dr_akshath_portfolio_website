import 'dotenv/config';
import { db } from '../_utils/firebaseAdmin.js';

const doctorProfile = {
  name: 'Dr. Akshath',
  specialization: 'General Physician',
  department: 'General Medicine',
  bio: 'Consultant physician available across multiple clinic locations.',
  qualifications: ['MBBS', 'MD (General Medicine)'],
  experienceYears: 8,
  isActive: true,
  updatedAt: new Date().toISOString(),
};

const clinics = [
  {
    id: 'clinic_central',
    data: {
      name: 'Akshath Clinic - Central',
      address: '12 Central Avenue, Bengaluru',
      isActive: true,
      displayOrder: 1,
      contact: '+91-90000-00001',
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
    id: 'clinic_north',
    data: {
      name: 'Akshath Clinic - North',
      address: '44 North Ring Road, Bengaluru',
      isActive: true,
      displayOrder: 2,
      contact: '+91-90000-00002',
      weeklySchedule: {
        '1': { startTime: '16:00', endTime: '19:00', slotDuration: 20 },
        '3': { startTime: '16:00', endTime: '19:00', slotDuration: 20 },
        '5': { startTime: '16:00', endTime: '19:00', slotDuration: 20 },
      },
      breakTimes: [{ start: '17:20', end: '17:40' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  {
    id: 'clinic_east',
    data: {
      name: 'Akshath Clinic - East',
      address: '7 Lake View Street, Bengaluru',
      isActive: true,
      displayOrder: 3,
      contact: '+91-90000-00003',
      weeklySchedule: {
        '2': { startTime: '15:00', endTime: '18:00', slotDuration: 20 },
        '4': { startTime: '15:00', endTime: '18:00', slotDuration: 20 },
        '6': { startTime: '10:00', endTime: '13:00', slotDuration: 20 },
      },
      breakTimes: [{ start: '16:20', end: '16:40' }],
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

  console.log('Seed complete: doctorProfile/main + 3 clinics upserted.');
  console.log(`Clinics: ${clinics.map((c) => c.id).join(', ')}`);
}

run().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});