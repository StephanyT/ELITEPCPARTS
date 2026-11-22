// ============================================================
// ELITE PC PARTS — Main JS
// ============================================================

// ---------- Seguridad: escapar texto antes de meterlo en innerHTML ----------
// Todo lo que escribe un usuario (reseñas, nombres) pasa por aquí.
// Así "<img onerror=...>" se muestra como texto y no se ejecuta.
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------- Mobile nav ----------
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

hamburger?.addEventListener('click', () => {
  mobileNav.classList.toggle('open');
});

// ---------- Products data ----------
// Populated from Firestore (see src/js/data.js). Page scripts assign the loaded
// catalog into this shared global so addToCart() can resolve products by id on
// every page. Starts empty and fills in once EPC.load() resolves.
let products = [];

let cart = JSON.parse(localStorage.getItem('epc_cart') || '[]');

function saveCart() {
  localStorage.setItem('epc_cart', JSON.stringify(cart));
  updateCartBadge();
}

// ---------- Cart ↔ Backend sync helpers ----------
// Solo se sincroniza con el backend si hay sesión con token.
// Sin sesión, el carrito vive solo en localStorage (modo invitado).
function cartBackendAdd(componentId, cantidad) {
  const s = typeof getSession === 'function' ? getSession() : null;
  if (!s?.token) return Promise.resolve(null);
  return fetch(`${BACKEND}/cart`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ component_id: parseInt(componentId), cantidad }),
  }).then(r => r.ok ? r.json() : null).catch(() => null);
}

function cartBackendUpdate(cartItemId, cantidad) {
  const s = typeof getSession === 'function' ? getSession() : null;
  if (!s?.token || !cartItemId) return;
  fetch(`${BACKEND}/cart/${cartItemId}`, {
    method: 'PATCH',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ cantidad }),
  }).catch(() => {});
}

function cartBackendRemove(cartItemId) {
  const s = typeof getSession === 'function' ? getSession() : null;
  if (!s?.token || !cartItemId) return;
  fetch(`${BACKEND}/cart/${cartItemId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  }).catch(() => {});
}

function cartBackendClear() {
  const s = typeof getSession === 'function' ? getSession() : null;
  if (!s?.token) return;
  fetch(`${BACKEND}/cart`, {
    method: 'DELETE',
    headers: authHeaders(),
  }).catch(() => {});
}

function updateCartBadge() {
  const badge = document.querySelector('.cart-badge');
  if (badge) {
    const total = cart.reduce((sum, item) => sum + item.qty, 0);
    badge.textContent = total;
  }
}

function addToCart(productId) {
  const pId = String(productId);
  const product = products.find(p => String(p.id) === pId);
  if (!product) return;
  const existing = cart.find(i => String(i.id) === pId);
  if (existing) {
    existing.qty++;
    saveCart();
    if (existing.cartItemId) cartBackendUpdate(existing.cartItemId, existing.qty);
  } else {
    const newItem = { ...product, id: pId, qty: 1 };
    cart.push(newItem);
    saveCart();
    cartBackendAdd(pId, 1).then(res => {
      if (res?.id) { newItem.cartItemId = res.id; saveCart(); }
    });
  }
  showToast(`${product.name} agregado al carrito`);
}

function showToast(msg) {
  const existing = document.getElementById('epc-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'epc-toast';
  toast.textContent = msg;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '1.5rem',
    right: '1.5rem',
    background: '#3b82f6',
    color: '#fff',
    padding: '.75rem 1.25rem',
    borderRadius: '8px',
    fontSize: '.875rem',
    fontWeight: '600',
    boxShadow: '0 4px 20px rgba(0,0,0,.4)',
    zIndex: '9999',
    transform: 'translateY(20px)',
    opacity: '0',
    transition: 'all .25s ease',
  });
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

function starsHTML(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let html = '';
  for (let i = 0; i < full; i++) html += '<i class="fa fa-star"></i>';
  if (half) html += '<i class="fa fa-star-half-alt"></i>';
  return html;
}

function formatPrice(n) {
  return 'S/ ' + n.toLocaleString('es-PE');
}

// Reusable product thumbnail. Falls back to the box icon if the image fails to load.
function productImg(p, cls = 'product-card__img') {
  return `<div class="${cls}"><img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="imgError(this)"></div>`;
}

function imgError(img) {
  const box = img.parentElement;
  box.classList.add('img-placeholder');
  box.innerHTML = '<i class="fa fa-box-open"></i>';
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  // Home page shows a "featured" subset — the first 8 of the loaded catalog.
  grid.innerHTML = products.slice(0, 8).map(p => `
    <article class="product-card" data-id="${p.id}" onclick="window.location='src/pages/producto.html?id=${p.id}'">
      ${productImg(p)}
      <div class="product-card__body">
        <span class="product-card__cat">${escapeHtml(p.category)}</span>
        <p class="product-card__name">${escapeHtml(p.name)}</p>
        <div class="product-card__stars">
          ${starsHTML(p.rating)}
          <span>(${p.reviews})</span>
        </div>
        <div class="product-card__footer">
          <span class="product-card__price">${formatPrice(p.price)}</span>
          <button class="product-card__add" onclick="event.stopPropagation();addToCart('${p.id}')" title="Agregar al carrito">
            <i class="fa fa-plus"></i>
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

// ---------- Init ----------
updateCartBadge();

// Home page featured grid: load the catalog from Firestore, then render.
// (Other pages own their own EPC.load() call; this only runs where #productsGrid exists.)
if (window.EPC && document.getElementById('productsGrid')) {
  EPC.load()
    .then(data => { products = data.products; renderProducts(); })
    .catch(err => {
      console.error('No se pudo cargar el catálogo desde Firebase:', err);
      document.getElementById('productsGrid').innerHTML =
        '<p style="padding:2rem;color:var(--clr-muted)">No se pudieron cargar los productos.</p>';
    });
}