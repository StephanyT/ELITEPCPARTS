// One-off: add a `type_index` id to each option in the components data.
// Root docs stay keyed by product type (case, cpu, ...); each option gets
// an id like case_0, case_1, cpu_0, ...
// Usage: node scripts/transform-components.mjs [inputJson] [outputJson]
import { readFileSync, writeFileSync } from 'node:fs';

const [input = './components.json', output = './components-with-ids.json'] = process.argv.slice(2);

// Images live in a dedicated S3 bucket (s3://product-images-461839758888-us-east-2-an/component-images/),
// served via its virtual-hosted HTTPS URL. Each option's file is {option_id}.webp.
const IMG_BASE = 'https://product-images-461839758888-us-east-2-an.s3.us-east-2.amazonaws.com/component-images';

const data = JSON.parse(readFileSync(input, 'utf8'));

const transformed = data.map((doc) => ({
  ...doc,
  options: doc.options.map((opt, i) => {
    const id = `${doc.id}_${i}`;
    return { id, ...opt, image: `${IMG_BASE}/${id}.webp` };
  }),
}));

writeFileSync(output, JSON.stringify(transformed, null, 2));
const totalOptions = transformed.reduce((n, d) => n + d.options.length, 0);
console.log(`Wrote ${output}: ${transformed.length} types, ${totalOptions} options with ids.`);
