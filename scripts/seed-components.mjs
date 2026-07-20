// Carga los productos del components.json al backend NestJS.
// Uso: node scripts/seed-components.mjs
// (correr DESPUÉS de que Docker esté levantado)

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BACKEND = 'http://localhost:3000';

const raw = JSON.parse(readFileSync(join(__dirname, '../components.json'), 'utf-8'));

const products = [];
for (const cat of raw) {
  for (const opt of cat.options) {
    products.push({
      nombre: opt.name,
      categoria: cat.id,
      tipo: cat.id,
      precio: opt.price,
      imagen_url: `/src/assets/images/products/${opt.id}.webp`,
      descripcion: opt.specs || '',
      disponible: true,
    });
  }
}

console.log(`Cargando ${products.length} productos...`);

let ok = 0;
for (const p of products) {
  const res = await fetch(`${BACKEND}/components`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(p),
  });
  if (res.ok) { ok++; console.log(`✓ ${p.nombre}`); }
  else { console.error(`✗ ${p.nombre} → ${res.status}`); }
}

console.log(`\nListo: ${ok}/${products.length} productos cargados.`);
