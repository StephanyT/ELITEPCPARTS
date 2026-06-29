// ============================================================
// PC BUILDER
// ============================================================

const builderSteps = [
  {
    slot: 'cpu', title: 'Seleccioná un Procesador',
    desc: 'El procesador es el cerebro de tu PC. Elegí según tu uso: gaming, edición o trabajo.',
    components: [
      { id: 'cpu1', name: 'Intel Core i9-13900K', desc: 'Socket LGA1700 · 24C/32T · 5.8GHz · 125W', price: 189999, socket: 'LGA1700' },
      { id: 'cpu2', name: 'AMD Ryzen 7 7700X',    desc: 'Socket AM5 · 8C/16T · 5.4GHz · 105W',      price: 142000, socket: 'AM5' },
      { id: 'cpu3', name: 'Intel Core i5-13600K', desc: 'Socket LGA1700 · 14C/20T · 5.1GHz · 125W', price: 115000, socket: 'LGA1700' },
      { id: 'cpu4', name: 'AMD Ryzen 5 7600X',    desc: 'Socket AM5 · 6C/12T · 5.3GHz · 105W',      price: 98000,  socket: 'AM5' },
      { id: 'cpu5', name: 'AMD Ryzen 9 7950X',    desc: 'Socket AM5 · 16C/32T · 5.7GHz · 170W',     price: 320000, socket: 'AM5' },
    ]
  },
  {
    slot: 'mobo', title: 'Seleccioná una Placa Madre',
    desc: 'La placa madre conecta todos los componentes. Debe ser compatible con tu procesador.',
    components: [
      { id: 'mb1', name: 'ASUS ROG Strix B650-E',    desc: 'Socket AM5 · DDR5 · PCIe 5.0 · ATX',     price: 135000, socket: 'AM5',    memType: 'DDR5' },
      { id: 'mb2', name: 'MSI MAG Z790 Tomahawk',    desc: 'Socket LGA1700 · DDR5 · PCIe 5.0 · ATX', price: 118000, socket: 'LGA1700', memType: 'DDR5' },
      { id: 'mb3', name: 'Gigabyte B760M DS3H DDR4', desc: 'Socket LGA1700 · DDR4 · PCIe 4.0 · mATX', price: 68000,  socket: 'LGA1700', memType: 'DDR4' },
      { id: 'mb4', name: 'ASRock B650M Pro RS',      desc: 'Socket AM5 · DDR5 · PCIe 4.0 · mATX',    price: 82000,  socket: 'AM5',    memType: 'DDR5' },
    ]
  },
  {
    slot: 'ram', title: 'Seleccioná Memoria RAM',
    desc: 'La RAM determina cuántos programas podés tener abiertos simultáneamente.',
    components: [
      { id: 'ram1', name: 'Corsair Vengeance 32GB DDR5-5600', desc: '2x16GB · DDR5 · 5600MHz · CL36', price: 68500, memType: 'DDR5' },
      { id: 'ram2', name: 'G.Skill Trident Z5 32GB DDR5',     desc: '2x16GB · DDR5 · 6000MHz · CL30', price: 82000, memType: 'DDR5' },
      { id: 'ram3', name: 'Kingston Fury Beast 16GB DDR4',    desc: '2x8GB · DDR4 · 3200MHz · CL16',  price: 28000, memType: 'DDR4' },
      { id: 'ram4', name: 'Corsair Vengeance 32GB DDR4',      desc: '2x16GB · DDR4 · 3600MHz · CL18', price: 42000, memType: 'DDR4' },
    ]
  },
  {
    slot: 'storage', title: 'Seleccioná Almacenamiento',
    desc: 'Elegí dónde guardar tu sistema operativo, juegos y archivos.',
    components: [
      { id: 'st1', name: 'Samsung 980 Pro 1TB NVMe',  desc: 'PCIe 4.0 NVMe M.2 · 7000MB/s lectura',   price: 54000 },
      { id: 'st2', name: 'WD Black SN850X 2TB NVMe',  desc: 'PCIe 4.0 NVMe M.2 · 7300MB/s lectura',   price: 89000 },
      { id: 'st3', name: 'Kingston NV2 1TB NVMe',     desc: 'PCIe 4.0 NVMe M.2 · 3500MB/s lectura',   price: 32000 },
      { id: 'st4', name: 'Seagate Barracuda 2TB HDD', desc: 'SATA 3.5" · 7200RPM · Almacenamiento masivo', price: 18000 },
    ]
  },
  {
    slot: 'gpu', title: 'Seleccioná una Placa de Video',
    desc: 'La GPU determina el rendimiento gráfico para gaming, edición y diseño.',
    components: [
      { id: 'gpu1', name: 'NVIDIA RTX 4070 Ti 12GB', desc: 'GDDR6X · 4K Gaming · DLSS 3',          price: 425000 },
      { id: 'gpu2', name: 'NVIDIA RTX 4060 Ti 8GB',  desc: 'GDDR6 · 1440p Gaming · DLSS 3',        price: 258000 },
      { id: 'gpu3', name: 'AMD RX 7900 XTX 24GB',    desc: 'GDDR6 · 4K Gaming · FSR 3',            price: 495000 },
      { id: 'gpu4', name: 'AMD RX 7600 8GB',         desc: 'GDDR6 · 1080p Gaming · FSR 3',         price: 128000 },
      { id: 'gpu5', name: 'NVIDIA RTX 4090 24GB',    desc: 'GDDR6X · 4K Ultra · DLSS 3 · Flagship', price: 780000 },
    ]
  },
  {
    slot: 'psu', title: 'Seleccioná una Fuente de Alimentación',
    desc: 'La fuente debe tener suficientes watts para todos tus componentes.',
    components: [
      { id: 'psu1', name: 'Corsair RM850x 850W Gold',    desc: '80+ Gold · Modular · 850W', price: 72000 },
      { id: 'psu2', name: 'Seasonic Focus GX-750W Gold', desc: '80+ Gold · Modular · 750W', price: 64000 },
      { id: 'psu3', name: 'EVGA SuperNOVA 1000W Platinum', desc: '80+ Platinum · Modular · 1000W', price: 95000 },
      { id: 'psu4', name: 'be quiet! Straight Power 650W', desc: '80+ Gold · Semi-modular · 650W', price: 48000 },
    ]
  },
  {
    slot: 'case', title: 'Seleccioná un Gabinete',
    desc: 'El gabinete aloja todos los componentes. Elegí el que se adapte a tu espacio y estilo.',
    components: [
      { id: 'case1', name: 'Lian Li PC-O11 Dynamic EVO', desc: 'ATX Full Tower · Vidrio templado · 420mm radiador', price: 68000 },
      { id: 'case2', name: 'Fractal Design Meshify C',   desc: 'ATX Mid Tower · Mesh frontal · Airflow optimizado', price: 42000 },
      { id: 'case3', name: 'NZXT H510 Flow',            desc: 'ATX Mid Tower · Vidrio templado · Compacto',        price: 38000 },
      { id: 'case4', name: 'Cooler Master TD500 Mesh',  desc: 'ATX Mid Tower · Mesh 360° · RGB incluido',          price: 45000 },
    ]
  },
];

let currentStep = 0;
let selectedComponents = {};

function renderStep() {
  const step = builderSteps[currentStep];
  document.getElementById('stepTitle').textContent = step.title;
  document.getElementById('stepDesc').textContent  = step.desc;
  document.getElementById('prevStep').disabled = currentStep === 0;
  document.getElementById('nextStep').textContent =
    currentStep === builderSteps.length - 1 ? 'Finalizar' : 'Siguiente ';
  if (currentStep < builderSteps.length - 1) {
    document.getElementById('nextStep').innerHTML = 'Siguiente <i class="fa fa-arrow-right"></i>';
  }

  // Update step indicators
  document.querySelectorAll('.step-item').forEach((el, i) => {
    el.classList.remove('active', 'done');
    if (i < currentStep) el.classList.add('done');
    if (i === currentStep) el.classList.add('active');
  });

  renderComponents(step.components);
}

function renderComponents(components) {
  const search = document.getElementById('builderSearch').value.toLowerCase();
  const sort   = document.getElementById('builderSort').value;

  let list = components.filter(c => c.name.toLowerCase().includes(search));
  if (sort === 'price-asc')  list.sort((a,b) => a.price - b.price);
  if (sort === 'price-desc') list.sort((a,b) => b.price - a.price);

  const slot = builderSteps[currentStep].slot;
  const el   = document.getElementById('componentsList');
  el.innerHTML = list.map(c => `
    <div class="component-item${selectedComponents[slot]?.id === c.id ? ' selected' : ''}"
         onclick="selectComponent('${c.id}')">
      <div class="img-placeholder component-img"><i class="fa fa-box-open"></i></div>
      <div class="component-info">
        <h4>${c.name}</h4>
        <p>${c.desc}</p>
      </div>
      <span class="component-price">$${c.price.toLocaleString('es-AR')}</span>
      <div class="component-select-btn">
        <i class="fa fa-${selectedComponents[slot]?.id === c.id ? 'check' : 'plus'}"></i>
      </div>
    </div>
  `).join('');
}

function selectComponent(id) {
  const step = builderSteps[currentStep];
  const comp = step.components.find(c => c.id === id);
  if (!comp) return;

  if (selectedComponents[step.slot]?.id === id) {
    delete selectedComponents[step.slot];
  } else {
    selectedComponents[step.slot] = comp;
  }
  renderComponents(step.components);
  renderSummary();
  checkCompatibility();
}

function renderSummary() {
  const list = document.getElementById('summaryList');
  const keys = Object.keys(selectedComponents);
  const addBtn = document.getElementById('addBuildToCart');

  if (!keys.length) {
    list.innerHTML = '<p class="summary-empty">Aún no seleccionaste componentes</p>';
    document.getElementById('buildTotal').textContent = '$0';
    addBtn.disabled = true;
    return;
  }

  const slotLabels = { cpu:'CPU', mobo:'Placa Madre', ram:'RAM', storage:'Almacenamiento', gpu:'GPU', psu:'Fuente', case:'Gabinete' };
  let total = 0;
  list.innerHTML = keys.map(slot => {
    const c = selectedComponents[slot];
    total += c.price;
    return `<div class="summary-row">
      <span>${slotLabels[slot]}: ${c.name.substring(0,24)}…</span>
      <strong>$${c.price.toLocaleString('es-AR')}</strong>
    </div>`;
  }).join('');

  document.getElementById('buildTotal').textContent = '$' + total.toLocaleString('es-AR');
  addBtn.disabled = keys.length < 3;
}

function checkCompatibility() {
  const status = document.getElementById('compatStatus');
  const cpu  = selectedComponents['cpu'];
  const mobo = selectedComponents['mobo'];
  const ram  = selectedComponents['ram'];
  const mb   = selectedComponents['mobo'];

  let ok = true;
  let msg = '<i class="fa fa-check-circle"></i> Todos los componentes son compatibles';

  if (cpu && mobo && cpu.socket !== mobo.socket) {
    ok = false;
    msg = `<i class="fa fa-exclamation-triangle"></i> CPU (${cpu.socket}) incompatible con Placa Madre (${mobo.socket})`;
  } else if (ram && mb && mb.memType && ram.memType && ram.memType !== mb.memType) {
    ok = false;
    msg = `<i class="fa fa-exclamation-triangle"></i> RAM (${ram.memType}) incompatible con Placa Madre (${mb.memType})`;
  }

  status.className = 'compatibility-status' + (ok ? '' : ' warning');
  status.innerHTML = msg;
}

// Navigation
document.getElementById('prevStep')?.addEventListener('click', () => {
  if (currentStep > 0) { currentStep--; renderStep(); }
});
document.getElementById('nextStep')?.addEventListener('click', () => {
  if (currentStep < builderSteps.length - 1) { currentStep++; renderStep(); }
  else {
    showToast('¡Build guardado! Componentes agregados al carrito.');
    Object.values(selectedComponents).forEach(c => {
      cart.push({ ...c, qty: 1 });
    });
    saveCart();
  }
});

document.getElementById('resetBuild')?.addEventListener('click', () => {
  selectedComponents = {};
  currentStep = 0;
  renderStep();
  renderSummary();
});

document.getElementById('addBuildToCart')?.addEventListener('click', () => {
  Object.values(selectedComponents).forEach(c => {
    const existing = cart.find(i => i.id === c.id);
    if (existing) existing.qty++;
    else cart.push({ ...c, qty: 1 });
  });
  saveCart();
  showToast('Build completo agregado al carrito');
});

document.getElementById('builderSearch')?.addEventListener('input', () => renderComponents(builderSteps[currentStep].components));
document.getElementById('builderSort')?.addEventListener('change', () => renderComponents(builderSteps[currentStep].components));

document.querySelectorAll('.step-item').forEach((el, i) => {
  el.addEventListener('click', () => { currentStep = i; renderStep(); });
});

// Init
renderStep();
renderSummary();
