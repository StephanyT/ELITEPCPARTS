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
        <p class="cart-item__price">S/ ${item.price.toLocaleString('es-PE')} c/u</p>
      </div>
      <div class="cart-item__controls">
        <div class="qty-control">
          <button onclick="changeQty('${item.id}', -1)"><i class="fa fa-minus"></i></button>
          <span>${item.qty}</span>
          <button onclick="changeQty('${item.id}', 1)"><i class="fa fa-plus"></i></button>
        </div>
        <span class="cart-item__subtotal">S/ ${(item.price * item.qty).toLocaleString('es-PE')}</span>
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
  const shipping = subtotal >= 500 ? 0 : 45;
  const total = subtotal - discountAmt + shipping;

  document.getElementById('summaryRows').innerHTML = `
    <div class="summary-row-line"><span>Subtotal (${cart.reduce((s,i)=>s+i.qty,0)} productos)</span><strong>S/ ${subtotal.toLocaleString('es-PE')}</strong></div>
    ${discount ? `<div class="summary-row-line"><span>Descuento aplicado</span><strong style="color:#22c55e">-S/ ${discountAmt.toLocaleString('es-PE')}</strong></div>` : ''}
    <div class="summary-row-line"><span>Envío</span><strong>${shipping === 0 ? 'GRATIS' : 'S/'+shipping.toLocaleString('es-PE')}</strong></div>
  `;
  document.getElementById('cartTotal').textContent = 'S/' + total.toLocaleString('es-PE');
}

function changeQty(id, delta) {
  const sId = String(id);
  const item = cart.find(i => String(i.id) === sId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { removeItem(id); return; }
  saveCart();
  renderCart();
  if (item.cartItemId) cartBackendUpdate(item.cartItemId, item.qty);
}

function removeItem(id) {
  const sId = String(id);
  const item = cart.find(i => String(i.id) === sId);
  const cid = item?.cartItemId;
  cart = cart.filter(i => String(i.id) !== sId);
  saveCart();
  renderCart();
  showToast('Producto eliminado del carrito');
  if (cid) cartBackendRemove(cid);
}

function emptyCart() {
  if (!cart.length) return;
  if (!confirm('¿Vaciar todo el carrito?')) return;
  cart = [];
  discount = 0;
  saveCart();
  renderCart();
  showToast('Carrito vaciado');
  cartBackendClear();
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

// Checkout: requiere sesión activa → redirige a la página de checkout
document.getElementById('checkoutBtn')?.addEventListener('click', () => {
  if (!cart.length) return;
  const session = getSession();
  if (!session) {
    showToast('Inicia sesión para finalizar tu compra');
    setTimeout(() => { location.href = 'login.html?redirect=carrito.html'; }, 1000);
    return;
  }
  location.href = 'checkout.html';
});

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
            <span class="product-card__price">S/ ${p.price.toLocaleString('es-PE')}</span>
            <button class="product-card__add" onclick="event.stopPropagation();addToCart('${p.id}')"><i class="fa fa-plus"></i></button>
          </div>
        </div>
      </article>
    `).join('');
  }).catch(() => {});
}

// Cargar carrito desde backend al entrar a la página (si hay sesión activa)
(async function initCart() {
  const session = typeof getSession === 'function' ? getSession() : null;
  if (session?.id) {
    try {
      const res = await fetch(`${BACKEND}/cart`, {
        headers: { 'usuario-id': String(session.id) },
      });
      if (res.ok) {
        const items = await res.json();
        if (items.length) {
          // Backend tiene ítems → usar esos y sincronizar localStorage
          cart = items.map(item => ({
            id: String(item.component.id),
            cartItemId: item.id,
            name: item.component.nombre,
            price: Number(item.component.precio),
            category: item.component.categoria,
            qty: item.cantidad,
            image: item.component.imagen_url,
          }));
          saveCart();
        } else if (cart.length) {
          // Backend vacío pero localStorage tiene ítems → sincronizar al backend
          for (const item of cart) {
            const r = await cartBackendAdd(item.id, item.qty);
            if (r?.id) { item.cartItemId = r.id; }
          }
          saveCart();
        }
      }
    } catch (e) { /* si falla el backend, usar localStorage */ }
  }
  renderCart();
  renderSuggested();
})();