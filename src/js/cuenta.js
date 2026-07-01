// ============================================================
// MI CUENTA
// ============================================================

// Requiere sesión activa (verificado contra Firebase en auth.js)
requireAuth();

// Rellenar el sidebar/perfil con el usuario actual.
function fillProfile(session) {
  if (!session) return;
  const initials = ((session.firstName?.[0] || session.email?.[0] || 'U') +
                    (session.lastName?.[0] || '')).toUpperCase();
  const avatarEl = document.querySelector('.avatar');
  if (avatarEl) avatarEl.textContent = initials;
  const nameEl  = document.querySelector('.profile-name');
  const emailEl = document.querySelector('.profile-email');
  if (nameEl)  nameEl.textContent  = ((session.firstName || '') + ' ' + (session.lastName || '')).trim() || 'Mi cuenta';
  if (emailEl) emailEl.textContent = session.email || '';

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
  set('pfFirst', session.firstName);
  set('pfLast',  session.lastName);
  set('pfEmail', session.email);
  set('pfPhone', session.phone);
}

// Paint immediately from cache, then refine when Firebase confirms the user.
fillProfile(getSession());
EPCAuth.onUser(profile => { fillProfile(profile); loadOrders(profile.id); });

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

// ---------- Orders from Firestore ----------
async function loadOrders(uid) {
  const body = document.getElementById('ordersBody');
  if (!body || !window.db) return;
  try {
    const doc = await db.collection('usuarios').doc(uid).get();
    const orders = (doc.exists && Array.isArray(doc.data().pedidos)) ? doc.data().pedidos.slice().reverse() : [];
    if (!orders.length) {
      body.innerHTML = '<tr><td colspan="6" style="padding:1.5rem;color:var(--clr-muted)">Todavía no tenés pedidos.</td></tr>';
      return;
    }
    body.innerHTML = orders.map(o => `
      <tr>
        <td>${o.id}</td>
        <td>${o.date}</td>
        <td>${(o.summary || '').slice(0, 48)}${(o.summary || '').length > 48 ? '…' : ''}</td>
        <td>$${(o.total || 0).toLocaleString('es-AR')}</td>
        <td><span class="badge-status shipping">${o.status || 'Procesando'}</span></td>
        <td></td>
      </tr>
    `).join('');
  } catch (e) {
    console.error('No se pudieron cargar los pedidos:', e);
  }
}

// ---------- Wishlist (from Firestore catalog) ----------
if (window.EPC) {
  EPC.load().then(data => {
    products = data.products;
    const wishGrid = document.getElementById('wishlistGrid');
    if (!wishGrid) return;
    wishGrid.innerHTML = data.products.slice(2, 6).map(p => `
      <article class="product-card" onclick="window.location='producto.html?id=${p.id}'">
        ${productImg(p)}
        <div class="product-card__body">
          <span class="product-card__cat">${p.category}</span>
          <p class="product-card__name">${p.name}</p>
          <div class="product-card__stars">${starsHTML(p.rating)} <span>(${p.reviews})</span></div>
          <div class="product-card__footer">
            <span class="product-card__price">$${p.price.toLocaleString('es-AR')}</span>
            <button class="product-card__add" onclick="event.stopPropagation();addToCart('${p.id}')"><i class="fa fa-plus"></i></button>
          </div>
        </div>
      </article>
    `).join('');
  }).catch(() => {});
}

// ---------- Profile form: save name/phone + optional password change ----------
document.getElementById('profileForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  if (!EPCAuth.uid) { showToast('Iniciá sesión para guardar cambios'); return; }

  const firstName = document.getElementById('pfFirst').value.trim();
  const lastName  = document.getElementById('pfLast').value.trim();
  const phone     = document.getElementById('pfPhone').value.trim();
  const pass      = document.getElementById('pfPass').value;
  const pass2     = document.getElementById('pfPass2').value;

  if (pass && pass.length < 6)   { showToast('La contraseña debe tener al menos 6 caracteres'); return; }
  if (pass && pass !== pass2)    { showToast('Las contraseñas no coinciden'); return; }

  try {
    await db.collection('usuarios').doc(EPCAuth.uid).set({ firstName, lastName, phone }, { merge: true });
    if (auth.currentUser) await auth.currentUser.updateProfile({ displayName: `${firstName} ${lastName}`.trim() });
    if (pass && auth.currentUser) await auth.currentUser.updatePassword(pass);

    const profile = { ...EPCAuth.profile, firstName, lastName, phone };
    EPCAuth.profile = profile;
    cacheSession(profile);
    updateHeaderAuth(profile);
    fillProfile(profile);
    document.getElementById('pfPass').value = '';
    document.getElementById('pfPass2').value = '';
    showToast('Cambios guardados correctamente');
  } catch (err) {
    if (err.code === 'auth/requires-recent-login') {
      showToast('Por seguridad, volvé a iniciar sesión para cambiar la contraseña');
    } else {
      showToast('No se pudieron guardar los cambios');
    }
    console.error('profile save', err);
  }
});

// Add address (placeholder)
document.getElementById('addAddress')?.addEventListener('click', () => {
  showToast('Formulario de dirección (próximamente)');
});
