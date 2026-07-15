// One-off: import a JSON array of docs into a Firestore collection on ANOTHER instance.
//
// Usage:
//   node scripts/import-components.mjs [credentialsPath] [inputJson] [collection]
//
// Defaults:
//   credentialsPath = ./credentials.json   (service-account key of the TARGET project)
//   inputJson       = ./components.json     (output of dump-components.mjs)
//   collection      = components
//
// Each array element must have an `id` (used as the document id); the remaining
// fields become the document body. Existing docs with the same id are overwritten.
//
// To import into a different instance, pass that project's service-account JSON:
//   node scripts/import-components.mjs ./target-credentials.json
import { readFileSync } from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const [credentialsPath = './credentials.json', inputJson = './components.json', collection = 'components'] =
  process.argv.slice(2);

const serviceAccount = JSON.parse(readFileSync(new URL(credentialsPath, `file://${process.cwd()}/`)));
const docs = JSON.parse(readFileSync(new URL(inputJson, `file://${process.cwd()}/`)));

if (!Array.isArray(docs)) {
  throw new Error(`${inputJson} must contain a JSON array of documents`);
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

console.log(`Importing ${docs.length} docs into "${collection}" of project "${serviceAccount.project_id}"...`);

// Firestore batches cap at 500 writes; chunk to stay safe for larger datasets.
const CHUNK = 450;
let written = 0;
for (let i = 0; i < docs.length; i += CHUNK) {
  const batch = db.batch();
  for (const doc of docs.slice(i, i + CHUNK)) {
    const { id, ...data } = doc;
    if (!id) throw new Error(`Document is missing an "id": ${JSON.stringify(doc).slice(0, 80)}`);
    batch.set(db.collection(collection).doc(String(id)), data); // overwrite (use {merge:true} to merge)
    written++;
  }
  await batch.commit();
}

console.log(`Done. Wrote ${written} docs to "${collection}".`);
