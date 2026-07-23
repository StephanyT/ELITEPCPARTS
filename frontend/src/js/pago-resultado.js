// ============================================================
// PAGO RESULTADO — procesa la respuesta de Niubiz
// ============================================================

(async function () {
  const params = Object.fromEntries(new URLSearchParams(window.location.search));

  const iconEl    = document.getElementById('resultIcon');
  const titleEl   = document.getElementById('resultTitle');
  const msgEl     = document.getElementById('resultMsg');
  const actionsEl = document.getElementById('resultActions');

  // Si no hay parámetros en la URL, el usuario llegó directo (no desde Niubiz)
  if (!Object.keys(params).length) {
    window.location.href = 'catalogo.html';
    return;
  }

  // Niubiz devuelve actionCode '000' para aprobado
  // Claves reales: order[actionCode] y dataMap[ACTION_CODE]
  const actionCode = params['order[actionCode]'] || params['dataMap[ACTION_CODE]'] || '';
  const isApproved = actionCode === '000';

  const authCode   = params['order[authorizationCode]'] || params['dataMap[AUTHORIZATION_CODE]'] || '';
  const cardMasked = params['dataMap[CARD]'] || '';
  const brand      = params['dataMap[BRAND]'] || params['dataMap[BRAND_NAME]'] || '';
  const amount     = params['dataMap[AMOUNT]'] || params['order[amount]'] || '';
  const actionDesc = params['dataMap[ACTION_DESCRIPTION]'] || params['errorMessage'] || '';

  if (isApproved) {
    // ---- PAGO APROBADO ----
    iconEl.className  = 'result-icon ok';
    iconEl.innerHTML  = '<i class="fa fa-check"></i>';

    // Guardar pedido en backend y enviar email
    let orderId = 'EPC-' + Date.now().toString().slice(-6);
    const pending = JSON.parse(localStorage.getItem('epc_pending_order') || 'null');

    if (pending) {
      try {
        const res = await fetch(`${BACKEND}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pending),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.orderId) orderId = data.orderId;
        } else {
          const errText = await res.text();
          console.error('Backend orders error:', res.status, errText);
        }
      } catch (e) {
        console.warn('No se pudo guardar el pedido en el servidor:', e);
        console.log('Pending order era:', JSON.stringify(pending));
        // Fallback a localStorage
        const savedOrders = JSON.parse(localStorage.getItem('epc_orders') || '[]');
        savedOrders.unshift({
          id: orderId,
          fecha: new Date().toLocaleDateString('es-PE', { day:'2-digit', month:'2-digit', year:'numeric' }),
          productos: (pending.items || []).map(i => `${i.cantidad}x ${i.nombre || 'Producto'}`).join(', '),
          total: pending.total,
          estado: 'Procesando',
        });
        localStorage.setItem('epc_orders', JSON.stringify(savedOrders));
      }
    }

    // Limpiar carrito (localStorage + backend)
    localStorage.setItem('epc_cart', '[]');
    localStorage.removeItem('epc_pending_order');
    cart.length = 0;
    if (typeof cartBackendClear === 'function') cartBackendClear();

    // Mostrar pantalla de éxito
    titleEl.textContent = '¡Pago aprobado!';

    const cardInfo = cardMasked
      ? `<div class="card-info"><i class="fab fa-cc-${brand.toLowerCase().includes('visa') ? 'visa' : 'mastercard'}"></i> ${cardMasked}</div>`
      : '';

    msgEl.innerHTML = `
      Tu pedido ha sido confirmado. En breve recibirás un correo con los detalles.
      ${cardInfo}
      ${authCode ? `<br><small>Código de autorización: <strong>${authCode}</strong></small>` : ''}
    `;

    const chipEl = document.createElement('div');
    chipEl.className = 'order-chip';
    chipEl.textContent = orderId;
    titleEl.insertAdjacentElement('afterend', chipEl);

    actionsEl.innerHTML = `
      <a href="cuenta.html" class="btn btn--outline"><i class="fa fa-box"></i> Ver mis pedidos</a>
      <a href="catalogo.html" class="btn btn--primary"><i class="fa fa-shopping-bag"></i> Seguir comprando</a>
    `;

  } else {
    // ---- PAGO RECHAZADO / ERROR ----
    iconEl.className  = 'result-icon err';
    iconEl.innerHTML  = '<i class="fa fa-times"></i>';
    titleEl.textContent = 'Pago no aprobado';
    msgEl.textContent   = actionDesc || 'La transacción no pudo ser procesada. Verifica los datos de tu tarjeta e intenta de nuevo.';
    actionsEl.innerHTML = `
      <a href="checkout.html" class="btn btn--primary"><i class="fa fa-redo"></i> Intentar de nuevo</a>
      <a href="carrito.html" class="btn btn--outline"><i class="fa fa-arrow-left"></i> Volver al carrito</a>
    `;
  }
})();
