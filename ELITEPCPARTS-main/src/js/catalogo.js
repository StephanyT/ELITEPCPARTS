// ============================================================
// CATÁLOGO — products loaded from Firestore (see src/js/data.js)
// ============================================================

let allProducts = [];
const ITEMS_PER_PAGE = 9;
let currentPage = 1;
let filtered = [];

function buildFilters() {
  const cats   = [...new Set(allProducts.map(p => p.category))].sort();
  const brands = [...new Set(allProducts.map(p => p.brand))].sort();

  const catBox = document.getElementById('catFilters');
  if (catBox) catBox.innerHTML = cats.map(c =>
    `<label><input type="checkbox" name="cat" value="${c}" /> ${c}</label>`).join('');

  const brandBox = document.getElementById('brandFilters');
  if (brandBox) brandBox.innerHTML = brands.map(b =>
    `<label><input type="checkbox" name="brand" value="${b}" /> ${b}</label>`).join('');

  const maxPrice = Math.max(...allProducts.map(p => p.price), 0);
  const slider = document.getElementById('priceSlider');
  if (slider) {
    slider.min = 0;
    slider.max = maxPrice;
    slider.value = maxPrice;
    slider.step = Math.max(1, Math.round(maxPrice / 100));
    const sliderVal = document.getElementById('priceSliderVal');
    if (sliderVal) sliderVal.textContent = '$' + maxPrice.toLocaleString('es-AR');
  }
}

function getFilters() {
  const cats   = [...document.querySelectorAll('input[name="cat"]:checked')].map(c => c.value);
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
    if (cats.length   && !cats.includes(p.category)) return false;
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
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const page  = filtered.slice(start, start + ITEMS_PER_PAGE);

  document.getElementById('resultCount').textContent = filtered.length;

  if (!page.length) {
    grid.innerHTML = '<p style="color:var(--clr-muted);padding:2rem">No se encontraron productos con esos filtros.</p>';
    document.getElementById('pagination').innerHTML = '';
    return;
  }

  grid.innerHTML = page.map(p => `
    <article class="product-card" onclick="window.location='producto.html?id=${p.id}'">
      ${productImg(p)}
      <div class="product-card__body">
        <span class="product-card__cat">${p.category}</span>
        <p class="product-card__name">${p.name}</p>
        <div class="product-card__stars">
          ${starsHTML(p.rating)}
          <span>(${p.reviews})</span>
        </div>
        <div class="product-card__footer">
          <span class="product-card__price">$${p.price.toLocaleString('es-AR')}</span>
          <button class="product-card__add" onclick="event.stopPropagation();addToCart('${p.id}')">
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

const slider = document.getElementById('priceSlider');
const sliderVal = document.getElementById('priceSliderVal');
slider?.addEventListener('input', () => {
  sliderVal.textContent = '$' + parseInt(slider.value).toLocaleString('es-AR');
});

document.getElementById('applyFilters')?.addEventListener('click', applyFilters);
document.getElementById('clearFilters')?.addEventListener('click', () => {
  document.querySelectorAll('input[name="cat"]').forEach(c => c.checked = false);
  document.querySelectorAll('input[name="brand"]').forEach(b => b.checked = false);
  document.querySelector('input[name="rating"][value="0"]').checked = true;
  if (slider) { slider.value = slider.max; sliderVal.textContent = '$' + parseInt(slider.max).toLocaleString('es-AR'); }
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

window.addEventListener('load', function() {
  EPC.load()
    .then(data => {
      allProducts = data.products;
      products = allProducts;
      filtered = [...allProducts];
      buildFilters();

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
    })
    .catch(err => {
      console.error('No se pudo cargar el catálogo desde Firebase:', err);
      const grid = document.getElementById('catalogGrid');
      if (grid) grid.innerHTML = '<p style="color:var(--clr-muted);padding:2rem">No se pudieron cargar los productos.</p>';
    });
});