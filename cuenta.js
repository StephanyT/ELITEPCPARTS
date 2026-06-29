// ============================================================
// MI CUENTA
// ============================================================

// Requiere sesión activa
requireAuth();

// Cargar datos del usuario en el sidebar
const session = getSession();
if (session) {
  const initials = (session.firstName[0] + (session.lastName?.[0] || '')).toUpperCase();
  const avatarEl = document.querySelector('.avatar');
  if (avatarEl) avatarEl.textContent = initials;
  const nameEl  = document.querySelector('.profile-name');
  const emailEl = document.querySelector('.profile-email');
  if (nameEl)  nameEl.textContent  = session.firstName + ' ' + session.lastName;
  if (emailEl) emailEl.textContent = session.email;

  // Pre-llenar formulario de perfil
  const fnInput = document.querySelector('#tab-profile input[type="text"]:first-of-type');
  const lnInput = document.querySelectorAll('#tab-profile input[type="text"]')[1];
  const emInput = document.querySelector('#tab-profile input[type="email"]');
  const phInput = document.querySelector('#tab-profile input[type="tel"]');
  if (fnInput) fnInput.value = session.firstName;
  if (lnInput) lnInput.value = session.lastName;
  if (emInput) emInput.value = session.email;
  if (phInput) phInput.value = session.phone || '';
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

// Wishlist tab
const wishlistProducts = products.slice(2, 6);
const wishGrid = document.getElementById('wishlistGrid');
if (wishGrid) {
  wishGrid.innerHTML = wishlistProducts.map(p => `
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

// Profile form
document.getElementById('profileForm')?.addEventListener('submit', e => {
  e.preventDefault();
  showToast('Cambios guardados correctamente');
});

// Add address
document.getElementById('addAddress')?.addEventListener('click', () => {
  showToast('Formulario de dirección (próximamente)');
});
