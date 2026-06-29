// ============================================================
// CARRITO
// ============================================================

const COUPON_CODES = { 'ELITE10': .10, 'PCPARTS20': .20 };
let discount = 0;

function renderCart() {
  const itemsEl  = document.getElementById('cartItems');
  const emptyEl  = document.getElementById('cartEmpty');
  const layoutEl = document.querySelector('.cart-layout');

  if (!cart.length) {
    itemsEl?.parentElement && (layoutEl.style.display = 'none');
    emptyEl.style.display = 'flex';
    return;
  }

  layoutEl.style.display = 'grid';
  emptyEl.style.display  = 'none';

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="img-placeholder cart-item__img"><i class="fa fa-box-open"></i></div>
      <div class="cart-item__info">
        <span class="cart-item__cat">${item.category || 'Componente'}</span>
        <p class="cart-item__name">${item.name}</p>
        <p class="cart-item__price">$${item.price.toLocaleString('es-AR')} c/u</p>
      </div>
      <div class="cart-item__controls">
        <div class="qty-control">
          <button onclick="changeQty(${item.id}, -1)"><i class="fa fa-minus"></i></button>
          <span>${item.qty}</span>
          <button onclick="changeQty(${item.id}, 1)"><i class="fa fa-plus"></i></button>
        </div>
        <span class="cart-item__subtotal">$${(item.price * item.qty).toLocaleString('es-AR')}</span>
        <button class="cart-item__remove" onclick="removeItem(${item.id})" title="Eliminar">
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

document.getElementById('checkoutBtn')?.addEventListener('click', () => {
  if (!cart.length) return;
  showToast('¡Redirigiendo al checkout! (demo)');
});

// Productos sugeridos
const suggested = products.slice(0, 4);
const sugGrid = document.getElementById('suggestedGrid');
if (sugGrid) {
  sugGrid.innerHTML = suggested.map(p => `
    <article class="product-card">
      <div class="img-placeholder product-card__img"><i class="fa fa-box-open"></i></div>
      <div class="product-card__body">
        <span class="product-card__cat">${p.category}</span>
        <p class="product-card__name">${p.name}</p>
        <div class="product-card__stars">${starsHTML(p.rating)} <span>(${p.reviews})</span></div>
        <div class="product-card__footer">
          <span class="product-card__price">$${p.price.toLocaleString('es-AR')}</span>
          <button class="product-card__add" onclick="addToCart(${p.id})"><i class="fa fa-plus"></i></button>
        </div>
      </div>
    </article>
  `).join('');
}

renderCart();
