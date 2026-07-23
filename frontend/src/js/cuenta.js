// ============================================================
// MI CUENTA
// ============================================================

// Requiere sesión activa
requireAuth();

const BACKEND = 'http://localhost:3000';

// Rellenar el sidebar/perfil con el usuario actual.
function fillProfile(session) {
  if (!session) return;
  const nombre = session.nombre || session.firstName || '';
  const initials = (nombre[0] || session.email?.[0] || 'U').toUpperCase();
  const avatarEl = document.querySelector('.avatar');
  if (avatarEl) avatarEl.textContent = initials;
  const nameEl  = document.querySelector('.profile-name');
  const emailEl = document.querySelector('.profile-email');
  if (nameEl)  nameEl.textContent  = nombre || 'Mi cuenta';
  if (emailEl) emailEl.textContent = session.email || '';

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
  set('pfFirst', nombre);
  set('pfEmail', session.email);
}

// Cargar datos al iniciar
const _session = getSession();
fillProfile(_session);
if (_session?.id) {
  loadWishlist(_session.id);
}

// Logout
document.querySelector('.account-nav__item.logout')?.addEventListener('click', e => {
  e.preventDefault();
  logout();
});

// Tab navigation
document.querySelectorAll('.account-nav__item[data-tab]').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const tab = item.dataset.tab;
    document.querySelectorAll('.account-nav__item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    item.classList.add('active');
    const pane = document.getElementById('tab-' + tab);
    if (pane) pane.classList.add('active');
  });
});

// Deep-link (#orders etc.) so the header dropdown "Mis pedidos" opens the right tab.
if (location.hash) {
  const link = document.querySelector(`.account-nav__item[data-tab="${location.hash.slice(1)}"]`);
  link?.click();
}

// ---------- Wishlist desde backend ----------
async function loadWishlist(usuarioId) {
  const wishGrid = document.getElementById('wishlistGrid');
  if (!wishGrid) return;

  try {
    const res = await fetch(`${BACKEND}/wishlist/usuario/${usuarioId}`);
    const items = await res.json();

    // Actualizar stat de deseados
    const statEl = document.getElementById('statDeseados');
    if (statEl) statEl.textContent = items.length;

    if (!items.length) {
      wishGrid.innerHTML = '<p style="color:var(--clr-muted);grid-column:1/-1;padding:1rem 0">No tienes productos en tu lista de deseos.</p>';
      return;
    }

    wishGrid.innerHTML = items.map(item => {
      const c = item.component;
      const precio = Number(c.precio).toLocaleString('es-PE');
      return `
        <article class="product-card">
          <div style="position:relative">
            <img src="${c.imagen_url}" alt="${c.nombre}" style="width:100%;height:180px;object-fit:contain;background:#f5f5f5;border-radius:8px 8px 0 0" onerror="this.style.display='none'">
            <button class="wishlist-remove-btn" data-id="${item.id}" title="Quitar de deseados" style="position:absolute;top:8px;right:8px;background:#fff;border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,.15)">
              <i class="fa fa-times" style="color:#ef4444;font-size:.8rem"></i>
            </button>
          </div>
          <div class="product-card__body" onclick="window.location='producto.html?id=${c.id}'" style="cursor:pointer">
            <span class="product-card__cat">${c.categoria}</span>
            <p class="product-card__name">${c.nombre}</p>
            <div class="product-card__footer">
              <span class="product-card__price">S/ ${precio}</span>
              <button class="product-card__add" onclick="event.stopPropagation();addToCart('${c.id}')"><i class="fa fa-plus"></i></button>
            </div>
          </div>
        </article>`;
    }).join('');

    // Botones de quitar
    wishGrid.querySelectorAll('.wishlist-remove-btn').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        const wishlistId = btn.dataset.id;
        await fetch(`${BACKEND}/wishlist/${wishlistId}`, { method: 'DELETE' });
        loadWishlist(usuarioId);
        showToast('Eliminado de deseados');
      });
    });

  } catch (e) {
    if (wishGrid) wishGrid.innerHTML = '<p style="color:var(--clr-muted)">No se pudo cargar tu lista de deseos.</p>';
  }
}

// ---------- Profile form (placeholder — actualización de nombre próximamente) ----------
document.getElementById('profileForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  showToast('Perfil guardado (próximamente)');
});

// Add address (placeholder)
document.getElementById('addAddress')?.addEventListener('click', () => {
  showToast('Formulario de dirección (próximamente)');
});
