// ============================================================
// PRODUCTO DETALLE
// ============================================================

let qty = 1;
let currentProduct = null;
let selectedStars = 0;

document.getElementById('qtyMinus')?.addEventListener('click', () => {
  if (qty > 1) { qty--; document.getElementById('qtyVal').textContent = qty; }
});
document.getElementById('qtyPlus')?.addEventListener('click', () => {
  qty++;
  document.getElementById('qtyVal').textContent = qty;
});

document.getElementById('addToCartBtn')?.addEventListener('click', () => {
  if (!currentProduct) return;
  const pId = String(currentProduct.id);
  const existing = cart.find(i => String(i.id) === pId);
  if (existing) {
    existing.qty += qty;
    saveCart();
    if (existing.cartItemId) cartBackendUpdate(existing.cartItemId, existing.qty);
  } else {
    const newItem = { ...currentProduct, id: pId, qty };
    cart.push(newItem);
    saveCart();
    cartBackendAdd(pId, qty).then(res => {
      if (res?.id) { newItem.cartItemId = res.id; saveCart(); }
    });
  }
  showToast(`${qty}x ${currentProduct.name} agregado al carrito`);
});

// ---------- Wishlist ----------
document.getElementById('wishlistBtn')?.addEventListener('click', async () => {
  const session = getSession();
  if (!session) {
    showToast('Inicia sesión para guardar productos');
    return;
  }
  if (!currentProduct) return;

  const btn = document.getElementById('wishlistBtn');
  btn.disabled = true;

  try {
    const res = await fetch(`${BACKEND}/wishlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioId: session.id,
        componentId: parseInt(currentProduct.id),
      }),
    });

    if (res.status === 409) {
      showToast('Ya está en tu lista de deseos');
    } else if (res.ok) {
      btn.innerHTML = '<i class="fa fa-heart" style="color:#ef4444"></i>';
      showToast('Agregado a deseados');
    } else {
      showToast('Error al agregar a deseados');
    }
  } catch {
    showToast('Error al conectar con el servidor');
  } finally {
    btn.disabled = false;
  }
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

// Al hacer click en "(0 reseñas)" abre el tab de reseñas
document.getElementById('reviewsLink')?.addEventListener('click', e => {
  e.preventDefault();
  document.querySelector('.tab-btn[data-tab="reviews"]')?.click();
  document.getElementById('tab-reviews')?.scrollIntoView({ behavior: 'smooth' });
});

// Gallery thumbs
document.querySelectorAll('.gallery-thumb').forEach(thumb => {
  thumb.addEventListener('click', () => {
    document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
  });
});

// ---------- Star picker ----------
const starSpans = document.querySelectorAll('#starPicker span');
starSpans.forEach(span => {
  span.addEventListener('mouseenter', () => {
    const val = +span.dataset.val;
    starSpans.forEach(s => s.classList.toggle('hover', +s.dataset.val <= val));
  });
  span.addEventListener('mouseleave', () => {
    starSpans.forEach(s => s.classList.remove('hover'));
  });
  span.addEventListener('click', () => {
    selectedStars = +span.dataset.val;
    starSpans.forEach(s => s.classList.toggle('active', +s.dataset.val <= selectedStars));
  });
});

// ---------- Reviews ----------
function starsHTML(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) html += '<i class="fa fa-star"></i>';
    else if (rating >= i - 0.5) html += '<i class="fa fa-star-half-alt"></i>';
    else html += '<i class="fa fa-star" style="color:#d1d5db"></i>';
  }
  return html;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

async function loadReviews(componentId) {
  const listEl = document.getElementById('reviewsList');
  const summaryEl = document.getElementById('reviewsSummary');
  if (!listEl) return;

  try {
    const res = await fetch(`${BACKEND}/reviews/component/${componentId}`);
    const reviews = await res.json();

    const count = reviews.length;

    // Actualizar contador en el tab y en el link del rating
    const tabBtn = document.getElementById('reviewsTabBtn');
    if (tabBtn) tabBtn.textContent = `Reseñas (${count})`;
    const reviewLink = document.getElementById('reviewsLink');
    if (reviewLink) reviewLink.textContent = `(${count} ${count === 1 ? 'reseña' : 'reseñas'})`;

    if (count === 0) {
      listEl.innerHTML = '<p style="color:var(--clr-muted);padding:1rem 0">Aún no hay reseñas. ¡Sé el primero!</p>';
      return;
    }

    // Calcular promedio y distribución
    const avg = reviews.reduce((s, r) => s + Number(r.calificacion), 0) / count;
    const dist = [0, 0, 0, 0, 0];
    reviews.forEach(r => {
      const c = Math.round(Number(r.calificacion));
      if (c >= 1 && c <= 5) dist[c - 1]++;
    });

    // Mostrar resumen
    document.getElementById('reviewsAvg').textContent = avg.toFixed(1);
    document.getElementById('reviewsAvgStars').innerHTML = starsHTML(avg);
    document.getElementById('reviewsCount').textContent = `${count} ${count === 1 ? 'reseña' : 'reseñas'}`;
    document.getElementById('reviewsBars').innerHTML = [5, 4, 3, 2, 1].map(star => {
      const pct = Math.round((dist[star - 1] / count) * 100);
      return `<div class="bar-row"><span>${star}★</span><div class="bar"><div style="width:${pct}%"></div></div><span>${pct}%</span></div>`;
    }).join('');
    summaryEl.style.display = 'flex';

    // Render reseñas
    listEl.innerHTML = reviews.map(r => {
      const nombre = r.usuario?.nombre || 'Usuario';
      const initials = nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      return `
        <div class="review-card">
          <div class="review-header">
            <div class="reviewer-avatar">${initials}</div>
            <div>
              <strong>${nombre}</strong>
              <div class="stars">${starsHTML(Number(r.calificacion))}</div>
            </div>
            <span class="review-date">${formatDate(r.creado_en)}</span>
          </div>
          ${r.comentario ? `<p>${r.comentario}</p>` : ''}
        </div>`;
    }).join('');

  } catch (e) {
    listEl.innerHTML = '<p style="color:var(--clr-muted)">No se pudieron cargar las reseñas.</p>';
  }
}

// ---------- Enviar reseña ----------
document.getElementById('submitReviewBtn')?.addEventListener('click', async () => {
  const session = getSession();
  if (!session || !currentProduct) return;

  const msg = document.getElementById('reviewMsg');

  if (selectedStars === 0) {
    msg.textContent = 'Selecciona una calificación con las estrellas.';
    msg.style.color = '#ef4444';
    msg.style.display = 'block';
    return;
  }

  const comentario = document.getElementById('reviewComment').value.trim();
  const btn = document.getElementById('submitReviewBtn');
  btn.disabled = true;
  msg.style.display = 'none';

  try {
    const res = await fetch(`${BACKEND}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuarioId: session.id,
        componentId: parseInt(currentProduct.id),
        calificacion: selectedStars,
        comentario,
      }),
    });

    if (res.ok) {
      msg.textContent = '¡Reseña enviada!';
      msg.style.color = '#22c55e';
      msg.style.display = 'block';
      document.getElementById('reviewComment').value = '';
      selectedStars = 0;
      starSpans.forEach(s => s.classList.remove('active'));
      await loadReviews(parseInt(currentProduct.id));
    } else {
      msg.textContent = 'Error al enviar la reseña.';
      msg.style.color = '#ef4444';
      msg.style.display = 'block';
    }
  } catch {
    msg.textContent = 'Error al conectar con el servidor.';
    msg.style.color = '#ef4444';
    msg.style.display = 'block';
  } finally {
    btn.disabled = false;
  }
});

// ---------- Bind product ----------
function bindProduct(p) {
  currentProduct = p;
  document.title = `${p.name} — Elite PC Parts`;

  const setText = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val; };
  setText('.product-cat', p.category);
  setText('.product-info h1', p.name);
  setText('.product-price-main', 'S/ ' + p.price.toLocaleString('es-PE'));

  const starsEl = document.querySelector('.product-rating .stars');
  if (starsEl) starsEl.innerHTML = starsHTML(p.rating || 0);
  const ratingSpan = document.querySelector('.product-rating > span');
  if (ratingSpan) ratingSpan.textContent = '';

  // Breadcrumb
  const crumbCat = document.querySelector('.breadcrumb a:last-of-type');
  if (crumbCat) crumbCat.textContent = p.category;
  const crumbName = document.querySelector('.breadcrumb span');
  if (crumbName) crumbName.textContent = p.name;

  // Main gallery image
  const galleryMain = document.getElementById('galleryMain');
  if (galleryMain) {
    galleryMain.classList.remove('img-placeholder');
    galleryMain.innerHTML = `<img src="${p.image}" alt="${p.name}" onerror="imgError(this)">`;
  }

  // Specs
  const specsTable = document.querySelector('.product-specs table');
  if (specsTable && p.specs) {
    specsTable.innerHTML = `<tr><td>Especificaciones</td><td>${p.specs}</td></tr>`;
  }

  // Formulario de reseña
  const session = getSession();
  if (session) {
    document.getElementById('reviewFormWrap').style.display = 'block';
  } else {
    document.getElementById('reviewLoginMsg').style.display = 'block';
  }

  // Cargar reseñas reales
  loadReviews(parseInt(p.id));
}

// ---------- Related ----------
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
        <div class="product-card__stars">${starsHTML(p.rating || 0)}<span>(${p.reviews || 0})</span></div>
        <div class="product-card__footer">
          <span class="product-card__price">S/ ${p.price.toLocaleString('es-PE')}</span>
          <button class="product-card__add" onclick="event.stopPropagation();addToCart('${p.id}')"><i class="fa fa-plus"></i></button>
        </div>
      </div>
    </article>
  `).join('');
}

// ---------- Init ----------
EPC.load()
  .then(data => {
    products = data.products;
    const id = new URLSearchParams(window.location.search).get('id');
    const p = data.products.find(x => x.id === id) || data.products[0];
    if (!p) return;
    bindProduct(p);
    renderRelated(data.products, p);
  })
  .catch(err => console.error('No se pudo cargar el producto:', err));
