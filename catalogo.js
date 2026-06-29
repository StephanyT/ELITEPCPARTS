// ============================================================
// CATÁLOGO
// ============================================================

const allProducts = [
  { id: 1,  name: 'Intel Core i9-13900K',           category: 'Procesadores',   brand: 'Intel',   price: 189999, rating: 4.8, reviews: 124 },
  { id: 2,  name: 'AMD Ryzen 7 7700X',              category: 'Procesadores',   brand: 'AMD',     price: 142000, rating: 4.7, reviews: 98  },
  { id: 3,  name: 'AMD Ryzen 5 7600X',              category: 'Procesadores',   brand: 'AMD',     price: 98000,  rating: 4.6, reviews: 210 },
  { id: 4,  name: 'Intel Core i5-13600K',           category: 'Procesadores',   brand: 'Intel',   price: 115000, rating: 4.7, reviews: 185 },
  { id: 5,  name: 'NVIDIA RTX 4070 Ti 12GB',        category: 'Placas de Video',brand: 'NVIDIA',  price: 425000, rating: 4.9, reviews: 76  },
  { id: 6,  name: 'NVIDIA RTX 4060 Ti 8GB',         category: 'Placas de Video',brand: 'NVIDIA',  price: 258000, rating: 4.7, reviews: 102 },
  { id: 7,  name: 'AMD RX 7900 XTX 24GB',           category: 'Placas de Video',brand: 'AMD',     price: 495000, rating: 4.8, reviews: 54  },
  { id: 8,  name: 'Corsair Vengeance 32GB DDR5',    category: 'Memorias RAM',   brand: 'Corsair', price: 68500,  rating: 4.6, reviews: 210 },
  { id: 9,  name: 'Kingston Fury Beast 16GB DDR4',  category: 'Memorias RAM',   brand: 'Kingston',price: 28000,  rating: 4.5, reviews: 320 },
  { id: 10, name: 'Samsung 980 Pro 1TB NVMe',       category: 'Almacenamiento', brand: 'Samsung', price: 54000,  rating: 4.8, reviews: 305 },
  { id: 11, name: 'WD Black SN850X 2TB NVMe',       category: 'Almacenamiento', brand: 'WD',      price: 89000,  rating: 4.7, reviews: 142 },
  { id: 12, name: 'ASUS ROG Strix B650-E',          category: 'Placas Madre',   brand: 'ASUS',    price: 135000, rating: 4.7, reviews: 55  },
  { id: 13, name: 'MSI MAG Z790 Tomahawk',          category: 'Placas Madre',   brand: 'MSI',     price: 118000, rating: 4.6, reviews: 78  },
  { id: 14, name: 'Corsair RM850x 850W Gold',       category: 'Fuentes',        brand: 'Corsair', price: 72000,  rating: 4.9, reviews: 180 },
  { id: 15, name: 'Seasonic Focus GX-750W Gold',    category: 'Fuentes',        brand: 'Seasonic',price: 64000,  rating: 4.8, reviews: 95  },
  { id: 16, name: 'be quiet! Dark Rock Pro 4',      category: 'Cooling',        brand: 'be quiet!',price:38000,  rating: 4.6, reviews: 92  },
  { id: 17, name: 'Noctua NH-D15',                  category: 'Cooling',        brand: 'Noctua',  price: 45000,  rating: 4.9, reviews: 215 },
  { id: 18, name: 'Logitech G502 Hero',             category: 'Periféricos',    brand: 'Logitech',price: 28500,  rating: 4.8, reviews: 430 },
  { id: 19, name: 'Corsair K70 RGB MK.2',           category: 'Periféricos',    brand: 'Corsair', price: 52000,  rating: 4.6, reviews: 188 },
  { id: 20, name: 'AMD Ryzen 9 7950X',              category: 'Procesadores',   brand: 'AMD',     price: 320000, rating: 4.9, reviews: 62  },
];

const ITEMS_PER_PAGE = 9;
let currentPage = 1;
let filtered = [...allProducts];

function getFilters() {
  const cats = [...document.querySelectorAll('input[name="cat"]:checked')].map(c => c.value);
  const brands = [...document.querySelectorAll('input[name="brand"]:checked')].map(b => b.value);
  const maxPrice = parseInt(document.getElementById('priceSlider').value);
  const rating = parseFloat(document.querySelector('input[name="rating"]:checked').value);
  return { cats, brands, maxPrice, rating };
}

function applyFilters() {
  const { cats, brands, maxPrice, rating } = getFilters();
  const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const sort = document.getElementById('sortSelect').value;

  filtered = allProducts.filter(p => {
    if (cats.length  && !cats.includes(p.category)) return false;
    if (brands.length && !brands.includes(p.brand))  return false;
    if (p.price > maxPrice) return false;
    if (p.rating < rating)  return false;
    if (search && !p.name.toLowerCase().includes(search) && !p.category.toLowerCase().includes(search)) return false;
    return true;
  });

  if (sort === 'price-asc')  filtered.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  if (sort === 'rating')     filtered.sort((a, b) => b.rating - a.rating);
  if (sort === 'name')       filtered.sort((a, b) => a.name.localeCompare(b.name));

  currentPage = 1;
  render();
}

function render() {
  const grid = document.getElementById('catalogGrid');
  const isListView = grid.classList.contains('list-view');

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const page  = filtered.slice(start, start + ITEMS_PER_PAGE);

  document.getElementById('resultCount').textContent = filtered.length;

  if (!page.length) {
    grid.innerHTML = '<p style="color:var(--clr-muted);padding:2rem">No se encontraron productos con esos filtros.</p>';
    document.getElementById('pagination').innerHTML = '';
    return;
  }

  grid.innerHTML = page.map(p => `
    <article class="product-card" onclick="window.location='producto.html'">
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
          <span class="product-card__price">$${p.price.toLocaleString('es-AR')}</span>
          <button class="product-card__add" onclick="event.stopPropagation();addToCart(${p.id})">
            <i class="fa fa-plus"></i>
          </button>
        </div>
      </div>
    </article>
  `).join('');

  renderPagination();
}

function renderPagination() {
  const total = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const el = document.getElementById('pagination');
  if (total <= 1) { el.innerHTML = ''; return; }

  let html = '';
  if (currentPage > 1) html += `<button class="page-btn" data-p="${currentPage-1}"><i class="fa fa-chevron-left"></i></button>`;
  for (let i = 1; i <= total; i++) {
    html += `<button class="page-btn${i===currentPage?' active':''}" data-p="${i}">${i}</button>`;
  }
  if (currentPage < total) html += `<button class="page-btn" data-p="${currentPage+1}"><i class="fa fa-chevron-right"></i></button>`;
  el.innerHTML = html;

  el.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.p);
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

// Price slider
const slider = document.getElementById('priceSlider');
const sliderVal = document.getElementById('priceSliderVal');
slider?.addEventListener('input', () => {
  sliderVal.textContent = '$' + parseInt(slider.value).toLocaleString('es-AR');
});

// Events
document.getElementById('applyFilters')?.addEventListener('click', applyFilters);
document.getElementById('clearFilters')?.addEventListener('click', () => {
  document.querySelectorAll('input[name="cat"]').forEach(c => c.checked = false);
  document.querySelectorAll('input[name="brand"]').forEach(b => b.checked = false);
  document.querySelector('input[name="rating"][value="0"]').checked = true;
  slider.value = 500000;
  sliderVal.textContent = '$500.000';
  document.getElementById('searchInput').value = '';
  applyFilters();
});
document.getElementById('sortSelect')?.addEventListener('change', applyFilters);
document.getElementById('searchInput')?.addEventListener('input', applyFilters);

document.getElementById('gridView')?.addEventListener('click', () => {
  document.getElementById('catalogGrid').classList.remove('list-view');
  document.getElementById('gridView').classList.add('active');
  document.getElementById('listView').classList.remove('active');
});
document.getElementById('listView')?.addEventListener('click', () => {
  document.getElementById('catalogGrid').classList.add('list-view');
  document.getElementById('listView').classList.add('active');
  document.getElementById('gridView').classList.remove('active');
});

// Pre-filtrar por parámetros de URL (?cat=, ?q=)
const urlParams = new URLSearchParams(window.location.search);
const urlCat = urlParams.get('cat');
const urlQ   = urlParams.get('q');
if (urlCat) {
  document.querySelectorAll('input[name="cat"]').forEach(cb => { cb.checked = cb.value === urlCat; });
}
if (urlQ) {
  const si = document.getElementById('searchInput');
  if (si) si.value = urlQ;
}

applyFilters();
