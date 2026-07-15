// ============================================================
// PRODUCTO DETALLE — bound to a Firestore product via ?id=
// (falls back to the first catalog product). See src/js/data.js.
// ============================================================

let qty = 1;
let currentProduct = null;

document.getElementById('qtyMinus')?.addEventListener('click', () => {
  if (qty > 1) { qty--; document.getElementById('qtyVal').textContent = qty; }
});
document.getElementById('qtyPlus')?.addEventListener('click', () => {
  qty++;
  document.getElementById('qtyVal').textContent = qty;
});

document.getElementById('addToCartBtn')?.addEventListener('click', () => {
  if (!currentProduct) return;
  const existing = cart.find(i => i.id === currentProduct.id);
  if (existing) existing.qty += qty;
  else cart.push({ ...currentProduct, qty });
  saveCart();
  showToast(`${qty}x ${currentProduct.name} agregado al carrito`);
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

// Bind the page's identity fields to a product record.
function bindProduct(p) {
  currentProduct = p;
  document.title = `${p.name} — Elite PC Parts`;

  const setText = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val; };
  setText('.product-cat', p.category);
  setText('.product-info h1', p.name);
  setText('.product-price-main', '$' + p.price.toLocaleString('es-AR'));

  const starsEl = document.querySelector('.product-rating .stars');
  if (starsEl) starsEl.innerHTML = starsHTML(p.rating);
  setText('.product-rating > span', p.rating.toFixed(1));
  const reviewLink = document.querySelector('.product-rating .link-more');
  if (reviewLink) reviewLink.textContent = `(${p.reviews} reseñas)`;

  // Breadcrumb: the category link + the final name span.
  const crumbCat = document.querySelector('.breadcrumb a:last-of-type');
  if (crumbCat) crumbCat.textContent = p.category;
  const crumbName = document.querySelector('.breadcrumb span');
  if (crumbName) crumbName.textContent = p.name;

  // Main gallery image.
  const galleryMain = document.getElementById('galleryMain');
  if (galleryMain) {
    galleryMain.classList.remove('img-placeholder');
    galleryMain.innerHTML = `<img src="${p.image}" alt="${p.name}" onerror="imgError(this)">`;
  }

  // Replace the (previously CPU-specific) spec table with the spec string we have.
  const specsTable = document.querySelector('.product-specs table');
  if (specsTable && p.specs) {
    specsTable.innerHTML = `<tr><td>Especificaciones</td><td>${p.specs}</td></tr>`;
  }
}

// Related products — same category first, else anything else.
function renderRelated(list, current) {
  const sameCat = list.filter(p => p.id !== current.id && p.category === current.category);
  const pool = sameCat.length ? sameCat : list.filter(p => p.id !== current.id);
  const relatedGrid = document.getElementById('relatedGrid');
  if (!relatedGrid) return;
  relatedGrid.innerHTML = pool.slice(0, 4).map(p => `
    <article class="product-card" onclick="window.location='producto.html?id=${p.id}'">
      ${productImg(p)}
      <div class="product-card__body">
        <span class="product-card__cat">${p.category}</span>
        <p class="product-card__name">${p.name}</p>
        <div class="product-card__stars">${starsHTML(p.rating)}<span>(${p.reviews})</span></div>
        <div class="product-card__footer">
          <span class="product-card__price">$${p.price.toLocaleString('es-AR')}</span>
          <button class="product-card__add" onclick="event.stopPropagation();addToCart('${p.id}')"><i class="fa fa-plus"></i></button>
        </div>
      </div>
    </article>
  `).join('');
}

// ---------- Init: load catalog, bind the requested product ----------
EPC.load()
  .then(data => {
    products = data.products;          // share with main.js addToCart()
    const id = new URLSearchParams(window.location.search).get('id');
    const p = data.products.find(x => x.id === id) || data.products[0];
    if (!p) return;
    bindProduct(p);
    renderRelated(data.products, p);
  })
  .catch(err => console.error('No se pudo cargar el producto desde Firebase:', err));
