// ============================================================
// CHECKOUT — Integración Niubiz Botón de Pago (Sandbox)
// ============================================================

requireAuth();

// ---------- Credenciales sandbox Niubiz ----------
const NIUBIZ = {
  merchantId:  '456879852',
  user:        'integraciones@niubiz.com.pe',
  password:    '_7z3@8fF',
  urlSecurity: 'https://apisandbox.vnforappstest.com/api.security/v1/security',
  urlSession:  'https://apisandbox.vnforappstest.com/api.ecommerce/v2/ecommerce/token/session/',
  urlJS:       'https://static-content-qas.vnforapps.com/env/sandbox/js/checkout.js',
  proxyUrl:    'https://app.blocmin.com/api/capture_pay',
};

// ---------- Cargar carrito ----------
const checkoutCart = JSON.parse(localStorage.getItem('epc_cart') || '[]');
if (!checkoutCart.length) window.location.href = 'carrito.html';

const subtotal    = checkoutCart.reduce((s, i) => s + i.price * i.qty, 0);
const shippingAmt = subtotal >= 500 ? 0 : 45;
const totalAmt    = subtotal + shippingAmt;

// ---------- Renderizar resumen ----------
function renderOrderSummary() {
  const itemsEl = document.getElementById('summaryItems');
  if (itemsEl) {
    itemsEl.innerHTML = checkoutCart.map(item => `
      <div class="summary-item">
        <div class="summary-item__qty">${item.qty}</div>
        <div class="summary-item__name">${item.name}</div>
        <div class="summary-item__price">S/ ${(item.price * item.qty).toLocaleString('es-PE')}</div>
      </div>`).join('');
  }
  const fmt = n => 'S/ ' + n.toLocaleString('es-PE');
  const sub = document.getElementById('summarySubtotal');
  const shi = document.getElementById('summaryShipping');
  const tot = document.getElementById('summaryTotal');
  const pay = document.getElementById('payTotal');
  if (sub) sub.textContent = fmt(subtotal);
  if (shi) shi.textContent = shippingAmt === 0 ? 'GRATIS' : fmt(shippingAmt);
  if (tot) tot.textContent = fmt(totalAmt);
  if (pay) pay.textContent = fmt(totalAmt);

  const niubizAmt = document.getElementById('niubizAmount');
  if (niubizAmt) niubizAmt.textContent = 'S/ ' + totalAmt.toLocaleString('es-PE', { minimumFractionDigits: 2 });
}
renderOrderSummary();

// ---------- Pre-rellenar datos de sesión ----------
const _session = getSession();
if (_session) {
  const nombre  = _session.nombre || _session.firstName || '';
  const partes  = nombre.split(' ');
  const inp = id => document.getElementById(id);
  if (inp('shpNombre'))   inp('shpNombre').value   = partes[0] || '';
  if (inp('shpApellido')) inp('shpApellido').value = partes.slice(1).join(' ') || '';
  if (inp('shpEmail'))    inp('shpEmail').value    = _session.email || '';
}

// ---------- Navegación entre pasos ----------
let currentStep = 1;

function goToStep(n) {
  document.querySelectorAll('.checkout-step').forEach(s => s.classList.remove('active'));
  document.getElementById('step' + n)?.classList.add('active');

  document.querySelectorAll('.progress-step').forEach(step => {
    const sn = parseInt(step.dataset.step);
    step.classList.remove('active', 'done');
    if (sn === n) step.classList.add('active');
    if (sn < n)  step.classList.add('done');
  });

  const line1 = document.getElementById('line1');
  const line2 = document.getElementById('line2');
  if (line1) line1.classList.toggle('done', n > 1);
  if (line2) line2.classList.toggle('done', n > 2);

  currentStep = n;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------- Paso 1 → Paso 2 ----------
document.getElementById('continueToPayment')?.addEventListener('click', () => {
  const required = ['shpNombre', 'shpApellido', 'shpEmail', 'shpDireccion', 'shpCiudad'];
  let valid = true;
  required.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (!el.value.trim()) { el.classList.add('error'); valid = false; }
    else el.classList.remove('error');
  });
  const emailEl = document.getElementById('shpEmail');
  if (emailEl?.value && !emailEl.value.includes('@')) {
    emailEl.classList.add('error'); valid = false;
  }
  const errEl = document.getElementById('shpErr');
  if (!valid) { errEl?.classList.add('show'); return; }
  errEl?.classList.remove('show');
  goToStep(2);
});

['shpNombre','shpApellido','shpEmail','shpDireccion','shpCiudad'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', function() {
    this.classList.remove('error');
    document.getElementById('shpErr')?.classList.remove('show');
  });
});

// ---------- Volver ----------
document.getElementById('backToShipping')?.addEventListener('click', () => goToStep(1));

// ---------- Niubiz SDK ----------
async function niubizSetup() {
  const btn    = document.getElementById('niubizPayBtn');
  const errEl  = document.getElementById('niubizErr');
  if (errEl) errEl.classList.remove('show');

  btn.disabled = true;
  btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i>&nbsp; Conectando con Niubiz...';

  try {
    // 1. Token de seguridad
    const secRes = await fetch(NIUBIZ.urlSecurity, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${NIUBIZ.user}:${NIUBIZ.password}`),
        'Accept': '*/*',
      },
    });
    if (!secRes.ok) throw new Error('Error obteniendo token de seguridad');
    const token = await secRes.text();

    // 2. Session key con monto y datos antifraude
    const sesRes = await fetch(`${NIUBIZ.urlSession}${NIUBIZ.merchantId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({
        amount: parseFloat(totalAmt.toFixed(2)),
        antifraud: {
          clientIp: '127.0.0.1',
          merchantDefineData: {
            MDD4:  _session?.email || '',
            MDD21: 1,
            MDD32: 'EPC' + Date.now(),
            MDD75: 'Registrado',
            MDD77: 1,
          },
        },
        dataMap: {
          cardholderCity:        document.getElementById('shpCiudad')?.value || 'Lima',
          cardholderCountry:     'PE',
          cardholderAddress:     document.getElementById('shpDireccion')?.value || 'Av. Sin Nombre 123',
          cardholderPostalCode:  document.getElementById('shpCp')?.value || '15001',
          cardholderState:       'LIM',
          cardholderPhoneNumber: document.getElementById('shpTel')?.value || '987654321',
        },
        channel: 'web',
      }),
    });
    if (!sesRes.ok) throw new Error('Error creando sesión de pago');
    const sesData    = await sesRes.json();
    const sessionKey = sesData.sessionKey;

    // 3. Guardar pedido pendiente en localStorage (se usará en pago-resultado.html)
    const direccion = [
      document.getElementById('shpDireccion')?.value,
      document.getElementById('shpCiudad')?.value,
      document.getElementById('shpPais')?.value,
    ].filter(Boolean).join(', ');

    localStorage.setItem('epc_pending_order', JSON.stringify({
      usuarioId: _session?.id,
      total: totalAmt,
      direccion,
      items: checkoutCart.map(i => ({
        componentId: parseInt(i.id),
        cantidad:    i.qty,
        precio_unitario: i.price,
        nombre: i.name,
      })),
    }));

    // 4. Configurar acción del form (proxy de Niubiz)
    const purchaseNumber = Date.now().toString().slice(-12);
    const responseUrl    = `${window.location.origin}/src/pages/pago-resultado.html`;

    const params = {
      purchaseNumber,
      amount:      totalAmt.toString(),
      responseUrl,
      token,
      production:  'false',
      merchantId:  NIUBIZ.merchantId,
    };
    const qs = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');

    const form   = document.getElementById('frmVisaNet');
    form.action  = `${NIUBIZ.proxyUrl}?${qs}`;

    // 5. Cargar el SDK de Niubiz → detectar su botón y hacer clic automáticamente
    const script = document.createElement('script');
    script.src   = NIUBIZ.urlJS;
    script.setAttribute('data-sessiontoken',     sessionKey);
    script.setAttribute('data-channel',          'web');
    script.setAttribute('data-merchantid',       NIUBIZ.merchantId);
    script.setAttribute('data-purchasenumber',   purchaseNumber);
    script.setAttribute('data-amount',           totalAmt.toFixed(2));
    script.setAttribute('data-expirationminutes','5');
    script.setAttribute('data-timeouturl',       `${window.location.origin}/src/pages/carrito.html`);

    // Función que resetea el botón (se llama si el usuario cierra el popup)
    const resetBtn = () => {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa fa-lock"></i>&nbsp; Pagar &nbsp;S/ ' + totalAmt.toLocaleString('es-PE');
    };

    // Cuando el SDK inyecte su botón en el form, hacer clic automáticamente
    const observer = new MutationObserver(() => {
      const sdkBtn = form.querySelector('input[type="button"], input[type="submit"], button');
      if (sdkBtn) {
        observer.disconnect();
        setTimeout(() => {
          sdkBtn.click();
          // Escuchar cuando el foco vuelve a la ventana (popup cerrado sin pagar)
          // Se agrega con delay para evitar que se dispare antes de que el popup abra
          setTimeout(() => {
            const onFocus = () => {
              window.removeEventListener('focus', onFocus);
              // Pequeño delay por si Niubiz redirige (en ese caso el botón ya no importa)
              setTimeout(() => {
                if (btn.disabled) resetBtn();
              }, 400);
            };
            window.addEventListener('focus', onFocus);
          }, 1200);
        }, 100);
      }
    });
    observer.observe(form, { childList: true, subtree: true });

    // Timeout de seguridad: si el SDK no inyecta nada en 8s, resetear
    setTimeout(() => {
      observer.disconnect();
      if (btn.disabled) resetBtn();
    }, 8000);

    form.appendChild(script);

    btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i>&nbsp; Abriendo ventana de pago...';

  } catch (e) {
    console.error('Niubiz error:', e);
    btn.disabled  = false;
    btn.innerHTML = '<i class="fa fa-lock"></i>&nbsp; Pagar &nbsp;S/ ' + totalAmt.toLocaleString('es-PE');
    if (errEl) {
      errEl.textContent = 'No se pudo conectar con Niubiz. Intenta de nuevo.';
      errEl.classList.add('show');
    }
  }
}

document.getElementById('niubizPayBtn')?.addEventListener('click', niubizSetup);
