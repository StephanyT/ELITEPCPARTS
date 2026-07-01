// ============================================================
// PC BUILDER
// ============================================================

// Step metadata (titles/descriptions). The `components` list of each step is
// filled from Firestore (grouped by slot) once EPC.load() resolves.
const stepMeta = [
  { slot: 'cpu',     title: 'Seleccioná un Procesador',              desc: 'El procesador es el cerebro de tu PC. Elegí según tu uso: gaming, edición o trabajo.' },
  { slot: 'mobo',    title: 'Seleccioná una Placa Madre',            desc: 'La placa madre conecta todos los componentes. Debe ser compatible con tu procesador.' },
  { slot: 'ram',     title: 'Seleccioná Memoria RAM',                desc: 'La RAM determina cuántos programas podés tener abiertos simultáneamente.' },
  { slot: 'storage', title: 'Seleccioná Almacenamiento',            desc: 'Elegí dónde guardar tu sistema operativo, juegos y archivos.' },
  { slot: 'gpu',     title: 'Seleccioná una Placa de Video',         desc: 'La GPU determina el rendimiento gráfico para gaming, edición y diseño.' },
  { slot: 'psu',     title: 'Seleccioná una Fuente de Alimentación', desc: 'La fuente debe tener suficientes watts para todos tus componentes.' },
  { slot: 'case',    title: 'Seleccioná un Gabinete',                desc: 'El gabinete aloja todos los componentes. Elegí el que se adapte a tu espacio y estilo.' },
];

// Populated from Firestore in the init block below.
let builderSteps = stepMeta.map(m => ({ ...m, components: [] }));

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
      <div class="component-img">${c.image ? `<img src="${c.image}" alt="${c.name}" loading="lazy" onerror="imgError(this)">` : '<span class="img-placeholder"><i class="fa fa-box-open"></i></span>'}</div>
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

// ---------- Init: load components from Firestore, then render ----------
EPC.load()
  .then(({ bySlot }) => {
    builderSteps = stepMeta.map(m => ({ ...m, components: bySlot[m.slot] || [] }));
    renderStep();
    renderSummary();
  })
  .catch(err => {
    console.error('No se pudieron cargar los componentes desde Firebase:', err);
    const el = document.getElementById('componentsList');
    if (el) el.innerHTML = '<p style="padding:2rem;color:var(--clr-muted)">No se pudieron cargar los componentes.</p>';
  });
