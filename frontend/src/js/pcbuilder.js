// ============================================================
// PC BUILDER
// ============================================================

// Datos de cada etapa del PC Builder.
// Los componentes se cargan desde el backend mediante EPC.load().
const stepMeta = [
  {
    slot: 'cpu',
    title: 'Seleccioná un Procesador',
    desc: 'El procesador es el cerebro de tu PC. Elegí según tu uso: gaming, edición o trabajo.',
  },
  {
    slot: 'mobo',
    title: 'Seleccioná una Placa Madre',
    desc: 'La placa madre conecta todos los componentes. Debe ser compatible con tu procesador.',
  },
  {
    slot: 'ram',
    title: 'Seleccioná Memoria RAM',
    desc: 'La RAM determina cuántos programas puedes tener abiertos simultáneamente.',
  },
  {
    slot: 'storage',
    title: 'Seleccioná Almacenamiento',
    desc: 'Elegí dónde guardar tu sistema operativo, juegos y archivos.',
  },
  {
    slot: 'gpu',
    title: 'Seleccioná una Placa de Video',
    desc: 'La GPU determina el rendimiento gráfico para gaming, edición y diseño.',
  },
  {
    slot: 'psu',
    title: 'Seleccioná una Fuente de Alimentación',
    desc: 'La fuente debe tener suficientes watts para todos tus componentes.',
  },
  {
    slot: 'case',
    title: 'Seleccioná un Gabinete',
    desc: 'El gabinete aloja todos los componentes. Elegí el que se adapte a tu espacio y estilo.',
  },
];

// Se llenará con los componentes enviados por el backend.
let builderSteps = stepMeta.map(step => ({
  ...step,
  components: [],
}));

let currentStep = 0;
let selectedComponents = {};

// ============================================================
// RENDERIZAR ETAPA ACTUAL
// ============================================================

function renderStep() {
  const step = builderSteps[currentStep];

  document.getElementById('stepTitle').textContent = step.title;
  document.getElementById('stepDesc').textContent = step.desc;
  document.getElementById('prevStep').disabled = currentStep === 0;

  const nextButton = document.getElementById('nextStep');

  if (currentStep === builderSteps.length - 1) {
    nextButton.textContent = 'Ver resumen';
  } else {
    nextButton.innerHTML =
      'Siguiente <i class="fa fa-arrow-right"></i>';
  }

  // Actualizar los indicadores de pasos.
  document.querySelectorAll('.step-item').forEach((element, index) => {
    element.classList.remove('active', 'done');

    if (index < currentStep) {
      element.classList.add('done');
    }

    if (index === currentStep) {
      element.classList.add('active');
    }
  });

  renderComponents(step.components);
}

// ============================================================
// MOSTRAR COMPONENTES
// ============================================================

function renderComponents(components) {
  const searchInput = document.getElementById('builderSearch');
  const sortSelect = document.getElementById('builderSort');

  const search = searchInput.value.toLowerCase().trim();
  const sort = sortSelect.value;

  let list = components.filter(component =>
    component.name.toLowerCase().includes(search)
  );

  if (sort === 'price-asc') {
    list.sort((a, b) => a.price - b.price);
  }

  if (sort === 'price-desc') {
    list.sort((a, b) => b.price - a.price);
  }

  const slot = builderSteps[currentStep].slot;
  const container = document.getElementById('componentsList');

  if (!list.length) {
    container.innerHTML =
      '<p style="padding:2rem;color:var(--clr-muted)">No se encontraron componentes.</p>';
    return;
  }

  container.innerHTML = list
    .map(component => {
      const isSelected =
        selectedComponents[slot]?.id === component.id;

      return `
        <div
          class="component-item${isSelected ? ' selected' : ''}"
          onclick="selectComponent('${component.id}')"
        >
          <div class="component-img">
            ${component.image
          ? `
                  <img
                    src="${component.image}"
                    alt="${component.name}"
                    loading="lazy"
                    onerror="imgError(this)"
                  >
                `
          : `
                  <span class="img-placeholder">
                    <i class="fa fa-box-open"></i>
                  </span>
                `
        }
          </div>

          <div class="component-info">
            <h4>${component.name}</h4>
            <p>${component.desc || ''}</p>
          </div>

          <span class="component-price">
            S/ ${component.price.toLocaleString('es-PE')}
          </span>

          <div class="component-select-btn">
            <i class="fa fa-${isSelected ? 'check' : 'plus'}"></i>
          </div>
        </div>
      `;
    })
    .join('');
}

// ============================================================
// SELECCIONAR COMPONENTE
// ============================================================

function selectComponent(id) {
  const step = builderSteps[currentStep];

  const component = step.components.find(item => item.id === id);

  if (!component) {
    return;
  }

  const alreadySelected =
    selectedComponents[step.slot]?.id === id;

  if (alreadySelected) {
    delete selectedComponents[step.slot];
  } else {
    selectedComponents[step.slot] = component;
  }

  renderComponents(step.components);
  renderSummary();
  checkCompatibility();
}

// Hacer disponible la función para el onclick del HTML generado.
window.selectComponent = selectComponent;

// ============================================================
// RESUMEN DE LA BUILD
// ============================================================

function renderSummary() {
  const summaryList = document.getElementById('summaryList');
  const selectedSlots = Object.keys(selectedComponents);
  const addButton = document.getElementById('addBuildToCart');
  const selectedCount = document.getElementById('selectedCount');

  if (selectedCount) {
    selectedCount.innerHTML =
      `<strong>${selectedSlots.length} de ${builderSteps.length}</strong> componentes`;
  }

  if (!selectedSlots.length) {
    summaryList.innerHTML =
      '<p class="summary-empty">Aún no seleccionaste componentes</p>';

    document.getElementById('buildTotal').textContent = 'S/ 0';
    addButton.disabled = true;

    return;
  }

  const slotLabels = {
    cpu: 'CPU',
    mobo: 'Placa Madre',
    ram: 'RAM',
    storage: 'Almacenamiento',
    gpu: 'GPU',
    psu: 'Fuente',
    case: 'Gabinete',
  };

  let total = 0;

  summaryList.innerHTML = selectedSlots
    .map(slot => {
      const component = selectedComponents[slot];

      total += component.price;

      return `
        <div class="summary-row">
          <span>
            ${slotLabels[slot]}:
            ${component.name.substring(0, 24)}…
          </span>

          <strong>
            S/ ${component.price.toLocaleString('es-PE')}
          </strong>
        </div>
      `;
    })
    .join('');

  document.getElementById('buildTotal').textContent =
    'S/' + total.toLocaleString('es-PE');

  // Se habilita cuando existen al menos tres componentes elegidos.
  addButton.disabled = selectedSlots.length < 3;
}

// ============================================================
// COMPATIBILIDAD
// ============================================================

function checkCompatibility() {
  const status = document.getElementById('compatStatus');

  const cpu = selectedComponents.cpu;
  const motherboard = selectedComponents.mobo;
  const ram = selectedComponents.ram;

  let isCompatible = true;

  let message =
    '<i class="fa fa-check-circle"></i> Todos los componentes son compatibles';

  if (
    cpu &&
    motherboard &&
    cpu.socket &&
    motherboard.socket &&
    cpu.socket !== motherboard.socket
  ) {
    isCompatible = false;

    message = `
      <i class="fa fa-exclamation-triangle"></i>
      CPU (${cpu.socket}) incompatible con Placa Madre (${motherboard.socket})
    `;
  } else if (
    ram &&
    motherboard &&
    motherboard.memType &&
    ram.memType &&
    ram.memType !== motherboard.memType
  ) {
    isCompatible = false;

    message = `
      <i class="fa fa-exclamation-triangle"></i>
      RAM (${ram.memType}) incompatible con Placa Madre (${motherboard.memType})
    `;
  }

  status.className =
    'compatibility-status' +
    (isCompatible ? '' : ' warning');

  status.innerHTML = message;
}

// ============================================================
// CAMBIAR DE ETAPA
// ============================================================

function goToStep(stepIndex) {
  currentStep = stepIndex;

  // Limpiar la búsqueda de la etapa anterior.
  const searchInput = document.getElementById('builderSearch');

  if (searchInput) {
    searchInput.value = '';
  }

  // Reiniciar el ordenamiento.
  const sortSelect = document.getElementById('builderSort');

  if (sortSelect) {
    sortSelect.value = 'default';
  }

  renderStep();

  // Llevar al usuario al inicio del selector.
  document.querySelector('.builder-selector')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

// ============================================================
// BOTONES DE NAVEGACIÓN
// ============================================================

document
  .getElementById('prevStep')
  ?.addEventListener('click', () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  });

document
  .getElementById('nextStep')
  ?.addEventListener('click', () => {
    if (currentStep < builderSteps.length - 1) {
      goToStep(currentStep + 1);
      return;
    }

    // En la última etapa no se agrega nada al carrito.
    // Solo se lleva al usuario al inicio para revisar el resumen.
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    showToast(
      '¡Build completado! Revisa el resumen y agrégalo al carrito.'
    );
  });

// ============================================================
// REINICIAR BUILD
// ============================================================

document
  .getElementById('resetBuild')
  ?.addEventListener('click', () => {
    selectedComponents = {};

    renderSummary();
    checkCompatibility();
    goToStep(0);
  });

// ============================================================
// AGREGAR BUILD AL CARRITO
// ============================================================

document
  .getElementById('addBuildToCart')
  ?.addEventListener('click', () => {
    Object.values(selectedComponents).forEach(component => {
      const pId = String(component.id);
      const existing = cart.find(item => String(item.id) === pId);

      if (existing) {
        existing.qty++;
        saveCart();
        if (existing.cartItemId) cartBackendUpdate(existing.cartItemId, existing.qty);
      } else {
        const newItem = { ...component, id: pId, qty: 1 };
        cart.push(newItem);
        saveCart();
        cartBackendAdd(pId, 1).then(res => {
          if (res?.id) { newItem.cartItemId = res.id; saveCart(); }
        });
      }
    });

    showToast('Build completo agregado al carrito');
  });

// ============================================================
// BUSCADOR Y ORDENAMIENTO
// ============================================================

document
  .getElementById('builderSearch')
  ?.addEventListener('input', () => {
    renderComponents(
      builderSteps[currentStep].components
    );
  });

document
  .getElementById('builderSort')
  ?.addEventListener('change', () => {
    renderComponents(
      builderSteps[currentStep].components
    );
  });

// ============================================================
// INDICADORES DE ETAPA
// ============================================================

document
  .querySelectorAll('.step-item')
  .forEach((element, index) => {
    element.addEventListener('click', () => {
      goToStep(index);
    });
  });

// ============================================================
// INICIALIZACIÓN
// ============================================================

EPC.load()
  .then(({ bySlot }) => {
    builderSteps = stepMeta.map(step => ({
      ...step,
      components: bySlot[step.slot] || [],
    }));

    renderStep();
    renderSummary();
    checkCompatibility();
  })
  .catch(error => {
    console.error(
      'No se pudieron cargar los componentes desde el backend:',
      error
    );

    const container =
      document.getElementById('componentsList');

    if (container) {
      container.innerHTML =
        '<p style="padding:2rem;color:var(--clr-muted)">No se pudieron cargar los componentes.</p>';
    }
  });