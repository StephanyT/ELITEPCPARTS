// One-off: dump the entire Firestore `components` collection to JSON.
// Usage: node scripts/dump-components.mjs
// Auth: service account at ./credentials.json (gitignored).
import { readFileSync } from 'node:fs';
import { writeFileSync } from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(readFileSync(new URL('../credentials.json', import.meta.url)));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const COLLECTION = 'components';
const OUT_FILE = 'components.json';

const snap = await db.collection(COLLECTION).get();
const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

writeFileSync(OUT_FILE, JSON.stringify(docs, null, 2));
console.log(`Pulled ${docs.length} docs from "${COLLECTION}" -> ${OUT_FILE}`);
