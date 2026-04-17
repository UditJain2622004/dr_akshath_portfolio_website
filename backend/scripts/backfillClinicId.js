import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../_utils/firebaseAdmin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs(argv) {
  const args = {};
  for (const arg of argv.slice(2)) {
    if (arg === '--help' || arg === '-h') {
      args.help = true;
      continue;
    }
    if (arg === '--apply') {
      args.apply = true;
      continue;
    }
    if (arg === '--legacyLeavesAsClinic') {
      args.legacyLeavesAsClinic = true;
      continue;
    }
    if (arg.startsWith('--defaultClinicId=')) {
      args.defaultClinicId = arg.split('=')[1];
      continue;
    }
    if (arg.startsWith('--mapFile=')) {
      args.mapFile = arg.split('=')[1];
      continue;
    }
    if (arg.startsWith('--only=')) {
      args.only = arg.split('=')[1].split(',').map((v) => v.trim()).filter(Boolean);
      continue;
    }
  }
  return args;
}

function loadDoctorClinicMap(mapFile) {
  if (!mapFile) return {};

  const absolute = path.isAbsolute(mapFile) ? mapFile : path.resolve(__dirname, '..', mapFile);
  const raw = fs.readFileSync(absolute, 'utf8');
  const parsed = JSON.parse(raw);

  if (Array.isArray(parsed)) {
    const out = {};
    for (const row of parsed) {
      if (row?.doctorId && row?.clinicId) {
        out[row.doctorId] = row.clinicId;
      }
    }
    return out;
  }

  if (parsed && typeof parsed === 'object') {
    return parsed;
  }

  throw new Error('Invalid map file format. Use object {"doctorId":"clinicId"} or array of {doctorId, clinicId}.');
}

function resolveClinicId(data, doctorClinicMap, defaultClinicId) {
  if (data.clinicId) return data.clinicId;
  if (data.doctorId && doctorClinicMap[data.doctorId]) return doctorClinicMap[data.doctorId];
  if (defaultClinicId) return defaultClinicId;
  return null;
}

async function processCollection({
  name,
  apply,
  only,
  doctorClinicMap,
  defaultClinicId,
  legacyLeavesAsClinic,
}) {
  if (only.length > 0 && !only.includes(name)) {
    return { name, scanned: 0, updated: 0, skipped: 0, unresolved: 0 };
  }

  const snapshot = await db.collection(name).get();
  let scanned = 0;
  let updated = 0;
  let skipped = 0;
  let unresolved = 0;

  let batch = db.batch();
  let batchOps = 0;

  const flush = async () => {
    if (apply && batchOps > 0) {
      await batch.commit();
      batch = db.batch();
      batchOps = 0;
    }
  };

  for (const doc of snapshot.docs) {
    scanned += 1;
    const data = doc.data();
    let update = null;

    if (name === 'appointments' || name === 'doctorSlots') {
      if (data.clinicId && !data.doctorId) {
        skipped += 1;
        continue;
      }

      const clinicId = resolveClinicId(data, doctorClinicMap, defaultClinicId);
      if (!clinicId) {
        unresolved += 1;
        continue;
      }

      update = {
        clinicId,
        doctorId: FieldValue.delete(),
      };
    }

    if (name === 'doctorLeaves') {
      const hasLegacyDoctorId = !!data.doctorId;
      const hasScope = !!data.scope;
      const hasClinicId = !!data.clinicId;

      if (!hasLegacyDoctorId && hasScope) {
        skipped += 1;
        continue;
      }

      if (legacyLeavesAsClinic) {
        const clinicId = resolveClinicId(data, doctorClinicMap, defaultClinicId);
        if (!clinicId) {
          unresolved += 1;
          continue;
        }

        update = {
          scope: 'clinic',
          clinicId,
          doctorId: FieldValue.delete(),
        };
      } else {
        update = {
          scope: hasClinicId ? 'clinic' : 'global',
          ...(hasClinicId ? {} : { clinicId: null }),
          doctorId: FieldValue.delete(),
        };
      }
    }

    if (!update) {
      skipped += 1;
      continue;
    }

    updated += 1;

    if (apply) {
      batch.update(doc.ref, update);
      batchOps += 1;

      if (batchOps === 400) {
        await flush();
      }
    }
  }

  await flush();

  return { name, scanned, updated, skipped, unresolved };
}

async function main() {
  const args = parseArgs(process.argv);

  if (args.help) {
    console.log('Usage: node scripts/backfillClinicId.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --defaultClinicId=<id>       Default clinic for unresolved legacy doctorId');
    console.log('  --mapFile=<path>             JSON map file for doctorId -> clinicId');
    console.log('  --only=appointments,doctorSlots,doctorLeaves');
    console.log('  --legacyLeavesAsClinic       Convert legacy doctor leaves to clinic scoped');
    console.log('  --apply                      Write changes (default is dry-run)');
    console.log('  --help, -h                   Show this help');
    return;
  }

  const apply = !!args.apply;
  const defaultClinicId = args.defaultClinicId || '';
  const only = args.only || [];
  const legacyLeavesAsClinic = !!args.legacyLeavesAsClinic;

  const doctorClinicMap = loadDoctorClinicMap(args.mapFile);

  if (!defaultClinicId && Object.keys(doctorClinicMap).length === 0) {
    console.error('Provide --defaultClinicId=<clinicId> or --mapFile=<path> to resolve legacy doctorId records.');
    process.exit(1);
  }

  console.log(apply ? 'Running in APPLY mode' : 'Running in DRY-RUN mode');
  console.log(`defaultClinicId: ${defaultClinicId || '(none)'}`);
  console.log(`map entries: ${Object.keys(doctorClinicMap).length}`);
  console.log(`only: ${only.length ? only.join(', ') : 'appointments, doctorSlots, doctorLeaves'}`);
  console.log(`legacyLeavesAsClinic: ${legacyLeavesAsClinic}`);

  const results = [];
  results.push(await processCollection({ name: 'appointments', apply, only, doctorClinicMap, defaultClinicId, legacyLeavesAsClinic }));
  results.push(await processCollection({ name: 'doctorSlots', apply, only, doctorClinicMap, defaultClinicId, legacyLeavesAsClinic }));
  results.push(await processCollection({ name: 'doctorLeaves', apply, only, doctorClinicMap, defaultClinicId, legacyLeavesAsClinic }));

  console.log('\nBackfill summary:');
  for (const row of results) {
    console.log(`- ${row.name}: scanned=${row.scanned}, updated=${row.updated}, skipped=${row.skipped}, unresolved=${row.unresolved}`);
  }

  const unresolvedTotal = results.reduce((sum, r) => sum + r.unresolved, 0);
  if (unresolvedTotal > 0) {
    console.log('\nSome records are unresolved. Provide a better map/default and rerun.');
  }

  if (!apply) {
    console.log('\nDry-run only. Re-run with --apply to write changes.');
  }
}

main().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
