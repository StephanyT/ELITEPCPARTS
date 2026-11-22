// Seed automático para Docker — usa la URL interna del backend.
// Este script lo corre el servicio "seeder" en docker-compose.
// Crear productos ahora es solo para admin, así que primero inicia sesión con la cuenta admin del .env.

import { readFileSync } from 'node:fs';

const BACKEND = process.env.BACKEND_URL || 'http://backend:3000';
const COMPONENTS_FILE = process.env.COMPONENTS_FILE || '/app/components.json';
const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

// Si ya hay productos, no hacer nada
const check = await fetch(`${BACKEND}/components`);
const existing = await check.json();
if (Array.isArray(existing) && existing.length > 0) {
  console.log(`Ya hay ${existing.length} productos cargados. Nada que hacer.`);
  process.exit(0);
}

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Faltan ADMIN_EMAIL y ADMIN_PASSWORD para cargar los productos.');
  process.exit(1);
}

const login = await fetch(`${BACKEND}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
});
if (!login.ok) {
  console.error(`No se pudo iniciar sesión como admin (${login.status}).`);
  process.exit(1);
}
const { token } = await login.json();

const raw = JSON.parse(readFileSync(COMPONENTS_FILE, 'utf-8'));

const products = [];
for (const cat of raw) {
  for (const opt of cat.options) {
    products.push({
      nombre:     opt.name,
      categoria:  cat.id,
      precio:     opt.price,
      imagen_url: `/src/assets/images/products/${opt.id}.webp`,
      disponible: true,
    });
  }
}

console.log(`Cargando ${products.length} productos...`);

let ok = 0;
for (const p of products) {
  const res = await fetch(`${BACKEND}/components`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(p),
  });
  if (res.ok) { ok++; console.log(`✓ ${p.nombre}`); }
  else { console.error(`✗ ${p.nombre} → ${res.status}`); }
}

console.log(`\nListo: ${ok}/${products.length} productos cargados.`);