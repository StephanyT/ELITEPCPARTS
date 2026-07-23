// Seed automático para Docker — usa la URL interna del backend.
// Este script lo corre el servicio "seeder" en docker-compose.

import { readFileSync } from 'node:fs';

const BACKEND = process.env.BACKEND_URL || 'http://backend:3000';

// Si ya hay productos, no hacer nada
const check = await fetch(`${BACKEND}/components`);
const existing = await check.json();
if (Array.isArray(existing) && existing.length > 0) {
  console.log(`Ya hay ${existing.length} productos cargados. Nada que hacer.`);
  process.exit(0);
}

const raw = JSON.parse(readFileSync('/app/components.json', 'utf-8'));

const products = [];
for (const cat of raw) {
  for (const opt of cat.options) {
    products.push({
      nombre:      opt.name,
      categoria:   cat.id,
      tipo:        cat.id,
      precio:      opt.price,
      imagen_url:  `/src/assets/images/products/${opt.id}.webp`,
      descripcion: opt.specs || '',
      disponible:  true,
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
