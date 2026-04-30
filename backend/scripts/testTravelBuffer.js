/**
 * Test: Cross-Clinic Travel Buffer Logic
 * 
 * Verifies that the 30-minute travel buffer between different clinics
 * is correctly applied to slot availability calculations.
 * 
 * Usage: node scripts/testTravelBuffer.js
 */

import { parseTime } from '../_utils/slotGenerator.js';

const TRAVEL_BUFFER_MINUTES = 30;

/**
 * Simulates checkSlotAvailability from slotsController.js
 */
function checkSlotAvailability(time, clinicId, appointmentsByTime) {
  const slotMinutes = parseTime(time);

  for (const [apptTime, appts] of Object.entries(appointmentsByTime)) {
    const apptMinutes = parseTime(apptTime);
    const diff = Math.abs(slotMinutes - apptMinutes);

    if (diff === 0) {
      return { available: false, reason: 'booked', conflictClinicId: appts[0]?.clinicId };
    }

    if (diff < TRAVEL_BUFFER_MINUTES) {
      const crossClinicAppt = appts.find(a => a.clinicId !== clinicId);
      if (crossClinicAppt) {
        return { available: false, reason: 'travel_buffer', conflictClinicId: crossClinicAppt.clinicId };
      }
    }
  }

  return { available: true };
}

// ─── Test Scenarios ──────────────────────────────────────────────────────────

console.log('\n🧪 Cross-Clinic Travel Buffer Tests');
console.log('═'.repeat(60));

// Scenario: Doctor has a booking at Vijay Polyclinic at 18:30
const appointments = {
  '18:30': [{ clinicId: 'vijay_polyclinic', id: 'appt1' }],
};

const tests = [
  // Same clinic — should be fine (no travel needed)
  { time: '18:20', clinic: 'vijay_polyclinic', expect: true,  desc: 'Same clinic, 10 min before → OK (no travel)' },
  { time: '18:40', clinic: 'vijay_polyclinic', expect: true,  desc: 'Same clinic, 10 min after  → OK (no travel)' },
  
  // Different clinic — within 30 min → blocked
  { time: '18:00', clinic: 'ishaanvi_polyclinic', expect: true,  desc: 'Diff clinic, 30 min before → OK (exactly at boundary)' },
  { time: '18:10', clinic: 'ishaanvi_polyclinic', expect: false, desc: 'Diff clinic, 20 min before → BLOCKED (within buffer)' },
  { time: '18:20', clinic: 'ishaanvi_polyclinic', expect: false, desc: 'Diff clinic, 10 min before → BLOCKED (within buffer)' },
  { time: '18:30', clinic: 'ishaanvi_polyclinic', expect: false, desc: 'Diff clinic, same time     → BLOCKED (booked)' },
  { time: '18:40', clinic: 'ishaanvi_polyclinic', expect: false, desc: 'Diff clinic, 10 min after  → BLOCKED (within buffer)' },
  { time: '18:50', clinic: 'ishaanvi_polyclinic', expect: false, desc: 'Diff clinic, 20 min after  → BLOCKED (within buffer)' },
  { time: '19:00', clinic: 'ishaanvi_polyclinic', expect: true,  desc: 'Diff clinic, 30 min after  → OK (exactly at boundary)' },
  
  // No bookings at all
  { time: '07:00', clinic: 'nexus_enliven', expect: true, desc: 'No nearby bookings           → OK' },
];

let passed = 0;
let failed = 0;

for (const t of tests) {
  const result = checkSlotAvailability(t.time, t.clinic, appointments);
  const ok = result.available === t.expect;
  const icon = ok ? '✅' : '❌';
  console.log(`  ${icon} ${t.desc}`);
  if (!ok) {
    console.log(`     Expected: available=${t.expect}, Got: available=${result.available} (${result.reason || 'n/a'})`);
    failed++;
  } else {
    passed++;
  }
}

console.log('\n' + '═'.repeat(60));
console.log(`Results: ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
