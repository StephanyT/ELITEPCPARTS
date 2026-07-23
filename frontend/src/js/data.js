// ============================================================
// SHARED DATA LAYER — Backend NestJS -> UI models
// ============================================================

(function () {
  const API_URL = (typeof BACKEND !== 'undefined' ? BACKEND : 'http://localhost:3000') + '/components';

  const CATEGORY_LABELS = {
    cpu: 'Procesadores',
    gpu: 'Placas de Video',
    ram: 'Memorias RAM',
    storage: 'Almacenamiento',
    motherboard: 'Placas Madre',
    psu: 'Fuentes',
    case: 'Gabinetes',
  };

  const TYPE_TO_SLOT = {
    cpu: 'cpu',
    motherboard: 'mobo',
    ram: 'ram',
    storage: 'storage',
    gpu: 'gpu',
    psu: 'psu',
    case: 'case',
  };

  const KNOWN_BRANDS = [
    'Fractal Design',
    'Cooler Master',
    'Lian Li',
    'be quiet!',
    'NVIDIA',
    'AMD',
    'Intel',
    'ASRock',
    'ASUS',
    'Gigabyte',
    'MSI',
    'Corsair',
    'Kingston',
    'G.SKILL',
    'Samsung',
    'Seagate',
    'Seasonic',
    'EVGA',
    'NZXT',
    'Noctua',
    'Logitech',
    'WD',
  ];

  function deriveBrand(name) {
    const productName = String(name || '').toLowerCase();

    for (const brand of KNOWN_BRANDS) {
      if (productName.includes(brand.toLowerCase())) {
        return brand;
      }
    }

    return String(name || '').split(' ')[0];
  }

  function specValue(specs, expression) {
    const match = String(specs || '').match(expression);

    return match
      ? match[0].toUpperCase().replace(/\s+/g, '')
      : null;
  }

  function normalizeComponent(component) {
    const type = component.categoria;

    /*
     * PostgreSQL puede devolver el precio como texto.
     * Number() lo convierte a un número para poder sumarlo.
     */
    const price = Number(component.precio);

    return {
      id: String(component.id),
      type: type,
      name: component.nombre,
      category: CATEGORY_LABELS[type] || type,
      brand: deriveBrand(component.nombre),

      /*
       * Actualmente el backend no devuelve descripción.
       * Se deja vacío para no romper el PC Builder.
       */
      specs: component.descripcion || '',

      price: Number.isNaN(price) ? 0 : price,
      rating: 0,
      reviews: 0,
      categories: [],
      image: component.imagen_url,
      available: component.disponible,

      socket: specValue(
        component.descripcion,
        /LGA\s?\d+|AM5|AM4/i
      ),

      memType: specValue(
        component.descripcion,
        /DDR\d/i
      ),
    };
  }

  let cache = null;

  async function loadComponents() {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(
        `No se pudieron cargar los componentes. Código: ${response.status}`
      );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('El backend no devolvió una lista de componentes');
    }

    const products = data
      .filter((component) => component.disponible !== false)
      .map(normalizeComponent);

    const byType = {};
    const bySlot = {};

    products.forEach((product) => {
      /*
       * Agrupación por categoría.
       */
      if (!byType[product.type]) {
        byType[product.type] = {
          id: product.type,
          name: CATEGORY_LABELS[product.type] || product.type,
          options: [],
        };
      }

      byType[product.type].options.push(product);

      /*
       * Agrupación para el PC Builder.
       */
      const slot = TYPE_TO_SLOT[product.type];

      if (!slot) {
        return;
      }

      if (!bySlot[slot]) {
        bySlot[slot] = [];
      }

      bySlot[slot].push({
        id: product.id,
        name: product.name,
        desc: product.specs,
        price: product.price,
        socket: product.socket,
        memType: product.memType,
        image: product.image,
      });
    });

    return {
      products,
      byType,
      bySlot,
    };
  }

  function load() {
    if (!cache) {
      cache = loadComponents().catch((error) => {
        /*
         * Permite volver a intentar la carga después de un error.
         */
        cache = null;
        console.error('Error al cargar componentes:', error);
        throw error;
      });
    }

    return cache;
  }

  window.EPC = {
    load,
    deriveBrand,
    CATEGORY_LABELS,
    TYPE_TO_SLOT,
  };
})();