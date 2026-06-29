// ============================================================
// ELITE PC PARTS — Main JS
// ============================================================

// ---------- Mobile nav ----------
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

hamburger?.addEventListener('click', () => {
  mobileNav.classList.toggle('open');
});

// ---------- Sample products data ----------
const products = [
  { id: 1, name: 'Intel Core i9-13900K', category: 'Procesadores', price: 189999, rating: 4.8, reviews: 124 },
  { id: 2, name: 'AMD Ryzen 7 7700X', category: 'Procesadores', price: 142000, rating: 4.7, reviews: 98 },
  { id: 3, name: 'NVIDIA RTX 4070 Ti 12GB', category: 'Placas de Video', price: 425000, rating: 4.9, reviews: 76 },
  { id: 4, name: 'Corsair Vengeance 32GB DDR5', category: 'Memorias RAM', price: 68500, rating: 4.6, reviews: 210 },
  { id: 5, name: 'Samsung 980 Pro 1TB NVMe', category: 'Almacenamiento', price: 54000, rating: 4.8, reviews: 305 },
  { id: 6, name: 'ASUS ROG Strix B650-E', category: 'Placas Madre', price: 135000, rating: 4.7, reviews: 55 },
  { id: 7, name: 'Corsair RM850x 850W Gold', category: 'Fuentes', price: 72000, rating: 4.9, reviews: 180 },
  { id: 8, name: 'be quiet! Dark Rock Pro 4', category: 'Cooling', price: 38000, rating: 4.6, reviews: 92 },
];

let cart = JSON.parse(localStorage.getItem('epc_cart') || '[]');

function saveCart() {
  localStorage.setItem('epc_cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.querySelector('.cart-badge');
  if (badge) {
    const total = cart.reduce((sum, item) => sum + item.qty, 0);
    badge.textContent = total;
  }
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  const existing = cart.find(i => i.id === productId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
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
  return '$' + n.toLocaleString('es-AR');
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  grid.innerHTML = products.map(p => `
    <article class="product-card" data-id="${p.id}">
      <div class="img-placeholder product-card__img">
        <i class="fa fa-box-open"></i>
      </div>
      <div class="product-card__body">
        <span class="product-card__cat">${p.category}</span>
        <p class="product-card__name">${p.name}</p>
        <div class="product-card__stars">
          ${starsHTML(p.rating)}
          <span>(${p.reviews})</span>
        </div>
        <div class="product-card__footer">
          <span class="product-card__price">${formatPrice(p.price)}</span>
          <button class="product-card__add" onclick="addToCart(${p.id})" title="Agregar al carrito">
            <i class="fa fa-plus"></i>
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

// ---------- Init ----------
renderProducts();
updateCartBadge();
