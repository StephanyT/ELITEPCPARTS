// ============================================================
// PRODUCTO DETALLE
// ============================================================

let qty = 1;
const PRODUCT_ID = 1; // i9-13900K

document.getElementById('qtyMinus')?.addEventListener('click', () => {
  if (qty > 1) { qty--; document.getElementById('qtyVal').textContent = qty; }
});
document.getElementById('qtyPlus')?.addEventListener('click', () => {
  qty++;
  document.getElementById('qtyVal').textContent = qty;
});

document.getElementById('addToCartBtn')?.addEventListener('click', () => {
  const product = products.find(p => p.id === PRODUCT_ID);
  if (!product) return;
  const existing = cart.find(i => i.id === PRODUCT_ID);
  if (existing) existing.qty += qty;
  else cart.push({ ...product, qty });
  saveCart();
  showToast(`${qty}x ${product.name} agregado al carrito`);
});

document.getElementById('wishlistBtn')?.addEventListener('click', () => {
  showToast('Agregado a tu lista de deseos');
});

document.getElementById('builderBtn')?.addEventListener('click', () => {
  window.location.href = 'pcbuilder.html';
});

// Tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + tab)?.classList.add('active');
  });
});

// Gallery thumbs
document.querySelectorAll('.gallery-thumb').forEach(thumb => {
  thumb.addEventListener('click', () => {
    document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
  });
});

// Related products
const related = products.filter(p => p.id !== PRODUCT_ID).slice(0, 4);
const relatedGrid = document.getElementById('relatedGrid');
if (relatedGrid) {
  relatedGrid.innerHTML = related.map(p => `
    <article class="product-card" onclick="window.location='producto.html'">
      <div class="img-placeholder product-card__img"><i class="fa fa-box-open"></i></div>
      <div class="product-card__body">
        <span class="product-card__cat">${p.category}</span>
        <p class="product-card__name">${p.name}</p>
        <div class="product-card__stars">${starsHTML(p.rating)}<span>(${p.reviews})</span></div>
        <div class="product-card__footer">
          <span class="product-card__price">$${p.price.toLocaleString('es-AR')}</span>
          <button class="product-card__add" onclick="event.stopPropagation();addToCart(${p.id})"><i class="fa fa-plus"></i></button>
        </div>
      </div>
    </article>
  `).join('');
}
