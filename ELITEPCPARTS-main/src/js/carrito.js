// ============================================================
// CARRITO
// ============================================================

const COUPON_CODES = { 'ELITE10': .10, 'PCPARTS20': .20 };
let discount = 0;

function renderCart() {
  const itemsEl  = document.getElementById('cartItems');
  const emptyEl  = document.getElementById('cartEmpty');
  const layoutEl = document.querySelector('.cart-layout');
  const clearEl  = document.getElementById('clearCartBtn');

  if (!cart.length) {
    itemsEl?.parentElement && (layoutEl.style.display = 'none');
    emptyEl.style.display = 'flex';
    if (clearEl) clearEl.style.display = 'none';
    return;
  }

  layoutEl.style.display = 'grid';
  emptyEl.style.display  = 'none';
  if (clearEl) clearEl.style.display = 'inline-flex';

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      ${productImg(item, 'cart-item__img')}
      <div class="cart-item__info">
        <span class="cart-item__cat">${item.category || 'Componente'}</span>
        <p class="cart-item__name">${item.name}</p>
        <p class="cart-item__price">$${item.price.toLocaleString('es-AR')} c/u</p>
      </div>
      <div class="cart-item__controls">
        <div class="qty-control">
          <button onclick="changeQty('${item.id}', -1)"><i class="fa fa-minus"></i></button>
          <span>${item.qty}</span>
          <button onclick="changeQty('${item.id}', 1)"><i class="fa fa-plus"></i></button>
        </div>
        <span class="cart-item__subtotal">$${(item.price * item.qty).toLocaleString('es-AR')}</span>
        <button class="cart-item__remove" onclick="removeItem('${item.id}')" title="Eliminar">
          <i class="fa fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');

  renderSummary();
}

function renderSummary() {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmt = Math.round(subtotal * discount);
  const shipping = subtotal >= 50000 ? 0 : 4500;
  const total = subtotal - discountAmt + shipping;

  document.getElementById('summaryRows').innerHTML = `
    <div class="summary-row-line"><span>Subtotal (${cart.reduce((s,i)=>s+i.qty,0)} productos)</span><strong>$${subtotal.toLocaleString('es-AR')}</strong></div>
    ${discount ? `<div class="summary-row-line"><span>Descuento aplicado</span><strong style="color:#22c55e">-$${discountAmt.toLocaleString('es-AR')}</strong></div>` : ''}
    <div class="summary-row-line"><span>Envío</span><strong>${shipping === 0 ? 'GRATIS' : '$'+shipping.toLocaleString('es-AR')}</strong></div>
  `;
  document.getElementById('cartTotal').textContent = '$' + total.toLocaleString('es-AR');
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { removeItem(id); return; }
  saveCart();
  renderCart();
}

function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
  showToast('Producto eliminado del carrito');
}

function emptyCart() {
  if (!cart.length) return;
  if (!confirm('¿Vaciar todo el carrito?')) return;
  cart = [];
  discount = 0;
  saveCart();        // mirrors the empty cart to Firestore when logged in
  renderCart();
  showToast('Carrito vaciado');
}

document.getElementById('clearCartBtn')?.addEventListener('click', emptyCart);

document.getElementById('applyCoupon')?.addEventListener('click', () => {
  const code = document.getElementById('couponInput').value.trim().toUpperCase();
  const msg  = document.getElementById('couponMsg');
  if (COUPON_CODES[code]) {
    discount = COUPON_CODES[code];
    msg.textContent = `¡Cupón aplicado! ${discount * 100}% de descuento`;
    msg.className = 'coupon-msg ok';
    renderSummary();
  } else {
    msg.textContent = 'Código inválido o vencido';
    msg.className = 'coupon-msg error';
  }
});

// Checkout: requires login, then records the order in Firestore and clears the cart.
document.getElementById('checkoutBtn')?.addEventListener('click', () => {
  if (!cart.length) return;
  if (!window.EPCAuth || !EPCAuth.uid) {
    showToast('Iniciá sesión para finalizar tu compra');
    setTimeout(() => { location.href = 'login.html?redirect=carrito.html'; }, 1000);
    return;
  }
  placeOrder();
});

async function placeOrder() {
  const subtotal    = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmt = Math.round(subtotal * discount);
  const shipping    = subtotal >= 50000 ? 0 : 4500;
  const total       = subtotal - discountAmt + shipping;

  const order = {
    id:      '#' + String(Date.now()).slice(-6),
    date:    new Date().toLocaleDateString('es-AR'),
    items:   cart.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
    summary: cart.map(i => `${i.qty}x ${i.name}`).join(', '),
    total,
    status:  'Procesando',
  };

  try {
    await db.collection('usuarios').doc(EPCAuth.uid).set({
      pedidos: firebase.firestore.FieldValue.arrayUnion(order),
      cart: [],
    }, { merge: true });
    cart = [];
    saveCart();
    renderCart();
    showToast('¡Compra realizada! Pedido ' + order.id);
  } catch (e) {
    console.error('checkout', e);
    showToast('No se pudo completar la compra. Intentá de nuevo.');
  }
}

// Productos sugeridos (cargados desde Firestore)
function renderSuggested() {
  const sugGrid = document.getElementById('suggestedGrid');
  if (!sugGrid || !window.EPC) return;
  EPC.load().then(data => {
    products = data.products;
    sugGrid.innerHTML = data.products.slice(0, 4).map(p => `
      <article class="product-card" onclick="window.location='producto.html?id=${p.id}'">
        ${productImg(p)}
        <div class="product-card__body">
          <span class="product-card__cat">${p.category}</span>
          <p class="product-card__name">${p.name}</p>
          <div class="product-card__stars">${starsHTML(p.rating)} <span>(${p.reviews})</span></div>
          <div class="product-card__footer">
            <span class="product-card__price">$${p.price.toLocaleString('es-AR')}</span>
            <button class="product-card__add" onclick="event.stopPropagation();addToCart('${p.id}')"><i class="fa fa-plus"></i></button>
          </div>
        </div>
      </article>
    `).join('');
  }).catch(() => {});
}

renderSuggested();
renderCart();