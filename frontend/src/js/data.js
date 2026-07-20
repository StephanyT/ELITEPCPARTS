// ============================================================
// SHARED DATA LAYER — Firestore `components` -> UI models
// ============================================================
// Loads the Firestore `components` collection (seeded from components.json via
// scripts/import-components.mjs) exactly once, normalizes it into the shapes the
// page scripts expect, and caches the promise. Exposed as a classic global
// (window.EPC) so the non-module page scripts can `EPC.load().then(...)`.
//
// Must be loaded AFTER firebase-init.js (which defines window.db) and BEFORE the
// per-page scripts (main.js / catalogo.js / producto.js / pcbuilder.js).

(function () {
  // Firestore type id -> Spanish category label shown in the UI.
  const CATEGORY_LABELS = {
    cpu: 'Procesadores',
    gpu: 'Placas de Video',
    ram: 'Memorias RAM',
    storage: 'Almacenamiento',
    motherboard: 'Placas Madre',
    psu: 'Fuentes',
    case: 'Gabinetes',
  };

  // Type id -> PC Builder slot id (motherboard -> mobo; the rest map 1:1).
  const TYPE_TO_SLOT = {
    cpu: 'cpu', motherboard: 'mobo', ram: 'ram',
    storage: 'storage', gpu: 'gpu', psu: 'psu', case: 'case',
  };

  // Multi-word brands listed first so "Fractal Design" wins over a bare "Fractal".
  const KNOWN_BRANDS = [
    'Fractal Design', 'Cooler Master', 'Lian Li', 'be quiet!',
    'NVIDIA', 'AMD', 'Intel', 'ASRock', 'ASUS', 'Gigabyte', 'MSI',
    'Corsair', 'Kingston', 'G.SKILL', 'Samsung', 'Seagate', 'Seasonic',
    'EVGA', 'NZXT', 'Noctua', 'Logitech', 'WD',
  ];

  function deriveBrand(name) {
    const n = String(name).toLowerCase();
    for (const b of KNOWN_BRANDS) if (n.includes(b.toLowerCase())) return b;
    return String(name).split(' ')[0];
  }

  // The Firestore `rating` field is a string like "(88)". Per product spec: take
  // the number in the parentheses as a percentage and map it onto 5 stars, where
  // 100% = 5 stars and 1% = 0.05 stars. "(88)" -> 88% -> 4.4 stars.
  function pctFromField(field) {
    const m = String(field).match(/\d+/);
    return m ? parseInt(m[0], 10) : 0;
  }
  function ratingFromField(field) {
    return Math.max(0, Math.min(5, (pctFromField(field) / 100) * 5));
  }

  // Pull a compatibility token out of the free-text specs (best effort).
  function specValue(specs, re) {
    const m = String(specs || '').match(re);
    return m ? m[0].toUpperCase().replace(/\s+/g, '') : null;
  }

  // One Firestore type doc -> flat, UI-ready product records.
  function normalizeType(typeDoc) {
    const type = typeDoc.id;
    return (typeDoc.options || []).map((opt) => ({
      id: opt.id,                                    // e.g. "cpu_0"
      type,                                          // e.g. "cpu"
      name: opt.name,
      category: CATEGORY_LABELS[type] || typeDoc.name || type,
      brand: deriveBrand(opt.name),
      specs: opt.specs || '',
      price: opt.price,
      rating: ratingFromField(opt.rating),           // 0..5 stars
      reviews: pctFromField(opt.rating),             // the raw parenthesised number
      categories: opt.categories || [],              // use-case tags (gaming, budget, ...)
      image: opt.image,
      socket: specValue(opt.specs, /LGA\s?\d+|AM5|AM4/i),
      memType: specValue(opt.specs, /DDR\d/i),
    }));
  }

  let cache = null;

  // Returns a cached promise of { products, byType, bySlot }.
  function load() {
    if (cache) return cache;
    cache = window.db.collection('components').get().then((snap) => {
      const byType = {};
      let products = [];
      snap.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        byType[doc.id] = data;
        products = products.concat(normalizeType(data));
      });

      // Group into PC Builder slots with the fields the builder UI needs.
      const bySlot = {};
      products.forEach((p) => {
        const slot = TYPE_TO_SLOT[p.type];
        if (!slot) return;
        (bySlot[slot] = bySlot[slot] || []).push({
          id: p.id, name: p.name, desc: p.specs, price: p.price,
          socket: p.socket, memType: p.memType, image: p.image,
        });
      });

      return { products, byType, bySlot };
    });
    return cache;
  }

  window.EPC = { load, deriveBrand, CATEGORY_LABELS, TYPE_TO_SLOT };
})();
