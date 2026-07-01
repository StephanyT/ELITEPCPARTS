// ============================================================
// AUTH — Firebase Authentication + shared header/session glue
// ============================================================
// Firebase Auth is the source of truth. A lightweight profile is mirrored into
// localStorage ('epc_session') so the header/guards can paint synchronously on
// first load; onAuthStateChanged then refines it and drives the cart sync.

// ---------- form helpers (used by login.html / registro.html) ----------
function setError(fieldId, msg) {
  const input = document.getElementById(fieldId);
  const err   = document.getElementById('err-' + fieldId);
  input?.classList.add('error');
  if (err) err.textContent = msg;
}

function clearErrors() {
  document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
  document.querySelectorAll('input.error, select.error, textarea.error')
    .forEach(el => el.classList.remove('error'));
  const alert = document.getElementById('authAlert');
  if (alert) alert.style.display = 'none';
}

function showAlert(msg, type = 'error') {
  const alert = document.getElementById('authAlert');
  if (!alert) return;
  alert.className = 'auth-alert ' + type;
  alert.innerHTML = `<i class="fa fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i> ${msg}`;
  alert.style.display = 'flex';
}

// ---------- path prefix (repo root index.html vs /src/pages/*) ----------
const IN_PAGES    = location.pathname.includes('/src/pages/');
const PAGE_PREFIX = IN_PAGES ? '' : 'src/pages/';
const HOME_HREF   = IN_PAGES ? '../../index.html' : 'index.html';

// ---------- cached session (for instant, synchronous header render) ----------
function getSession() {
  const raw = localStorage.getItem('epc_session') || sessionStorage.getItem('epc_session');
  return raw ? JSON.parse(raw) : null;
}
function cacheSession(profile) {
  localStorage.setItem('epc_session', JSON.stringify(profile));
}
function clearSession() {
  localStorage.removeItem('epc_session');
  sessionStorage.removeItem('epc_session');
}

// ---------- shared auth state for other page scripts ----------
window.EPCAuth = {
  uid: null,
  profile: null,
  _cbs: [],
  onUser(cb) { this._cbs.push(cb); if (this.profile) cb(this.profile); },
};
function notifyUser() {
  EPCAuth._cbs.forEach(cb => { try { cb(EPCAuth.profile); } catch (e) { /* noop */ } });
}

// ---------- header account widget (idempotent) ----------
function accountEl() {
  return document.querySelector('.user-menu-wrap')
      || document.querySelector('a.icon-btn[href*="cuenta"], a.icon-btn[title="Mi cuenta"]');
}

function updateHeaderAuth(session) {
  const el = accountEl();
  if (!el) return;

  if (session) {
    const initials = ((session.firstName?.[0] || session.email?.[0] || 'U') +
                      (session.lastName?.[0] || '')).toUpperCase();
    el.outerHTML = `
      <div class="user-menu-wrap">
        <button class="user-avatar-btn" id="userMenuBtn" title="${session.firstName || session.email}">
          <span class="user-initials">${initials}</span>
        </button>
        <div class="user-dropdown" id="userDropdown">
          <div class="user-dropdown__header">
            <strong>${(session.firstName || '') + ' ' + (session.lastName || '')}</strong>
            <span>${session.email || ''}</span>
          </div>
          <a href="${PAGE_PREFIX}cuenta.html"><i class="fa fa-user"></i> Mi cuenta</a>
          <a href="${PAGE_PREFIX}cuenta.html#orders"><i class="fa fa-box"></i> Mis pedidos</a>
          <a href="${PAGE_PREFIX}pcbuilder.html"><i class="fa fa-tools"></i> Mis builds</a>
          <div class="user-dropdown__divider"></div>
          <button onclick="logout()" class="user-dropdown__logout">
            <i class="fa fa-sign-out-alt"></i> Cerrar sesión
          </button>
        </div>
      </div>`;
    setTimeout(() => {
      const btn      = document.getElementById('userMenuBtn');
      const dropdown = document.getElementById('userDropdown');
      btn?.addEventListener('click', e => { e.stopPropagation(); dropdown.classList.toggle('open'); });
      document.addEventListener('click', () => dropdown?.classList.remove('open'));
    }, 0);
  } else {
    el.outerHTML = `<a href="${PAGE_PREFIX}login.html" class="icon-btn" title="Mi cuenta"><i class="fa fa-user"></i></a>`;
  }
}

// ---------- logout ----------
function logout() {
  const done = () => { clearSession(); localStorage.removeItem('epc_cart'); localStorage.removeItem('epc_cart_owner'); location.href = HOME_HREF; };
  if (window.auth) auth.signOut().then(done).catch(done);
  else done();
}

// ---------- redirect used by login.html / registro.html on success ----------
function loginSuccess(profile) {
  cacheSession(profile);
  const redirect = new URLSearchParams(location.search).get('redirect') || 'cuenta.html';
  location.href = redirect;
}

// ---------- guard for pages that require a logged-in user ----------
function requireAuth() {
  if (!window.auth) return;
  auth.onAuthStateChanged(user => {
    if (!user) {
      const current = encodeURIComponent(location.pathname.split('/').pop() + location.hash);
      location.href = 'login.html?redirect=' + current;
    }
  });
}

// ---------- cart <-> Firestore sync on login ----------
// Merge the anonymous/local cart with the online (Firestore) cart — quantities
// for the same product id are summed — instead of one replacing the other. The
// merged result becomes both the active cart and the persisted online cart.
function mergeCarts(a, b) {
  const merged = [];
  const byId = {};
  [...a, ...b].forEach(item => {
    if (!item || item.id == null) return;
    const existing = byId[item.id];
    if (existing) {
      existing.qty = (existing.qty || 1) + (item.qty || 1);
    } else {
      const copy = { ...item, qty: item.qty || 1 };
      byId[item.id] = copy;
      merged.push(copy);
    }
  });
  return merged;
}

async function syncCartOnLogin(uid) {
  if (!window.db) return;
  try {
    const doc = await db.collection('usuarios').doc(uid).get();
    const remote = doc.exists && Array.isArray(doc.data().cart) ? doc.data().cart : [];
    const local  = (typeof cart !== 'undefined' && Array.isArray(cart)) ? cart : [];

    // The guest-cart sum-merge must run ONCE per account on this device. Because
    // onAuthStateChanged fires on every page load, re-summing local+remote here
    // would double every quantity on each navigation (that's what caused the
    // runaway cart totals). We only fold the guest cart into the account the
    // first time this device's cart meets the account AND the two actually differ:
    //   • epc_cart_owner === uid -> this browser's cart already belongs to the
    //     account and is kept mirrored by saveCart(), so just adopt the online cart.
    //   • local deep-equals remote -> nothing new to fold in (steady mirrored
    //     state), so adopt the online cart instead of summing it with itself.
    const alreadyOwned = localStorage.getItem('epc_cart_owner') === uid;
    const sameCart     = JSON.stringify(local) === JSON.stringify(remote);

    if (alreadyOwned || sameCart) {
      cart = remote;
      localStorage.setItem('epc_cart', JSON.stringify(cart));
    } else {
      const merged = mergeCarts(local, remote);
      cart = merged;
      localStorage.setItem('epc_cart', JSON.stringify(cart));
      // Persist the one-time merged union so the online cart stays in sync.
      await db.collection('usuarios').doc(uid).set({ cart: merged }, { merge: true });
    }
    localStorage.setItem('epc_cart_owner', uid);

    if (typeof updateCartBadge === 'function') updateCartBadge();
    if (typeof renderCart === 'function') renderCart();   // refresh the carrito page if open
  } catch (e) {
    console.error('No se pudo sincronizar el carrito:', e);
  }
}

// ============================================================
// Boot: instant paint from cache, then follow Firebase auth state
// ============================================================
updateHeaderAuth(getSession());

if (window.auth) {
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      EPCAuth.uid = user.uid;
      let data = {};
      try {
        const d = await db.collection('usuarios').doc(user.uid).get();
        if (d.exists) data = d.data();
      } catch (e) { /* profile doc optional */ }

      const parts = (user.displayName || '').split(' ');
      const profile = {
        id:        user.uid,
        firstName: data.firstName || parts[0] || '',
        lastName:  data.lastName  || parts.slice(1).join(' ') || '',
        email:     user.email || data.email || '',
        phone:     data.phone || '',
      };
      EPCAuth.profile = profile;
      cacheSession(profile);
      updateHeaderAuth(profile);
      notifyUser();
      syncCartOnLogin(user.uid);
    } else {
      EPCAuth.uid = null;
      EPCAuth.profile = null;
      clearSession();
      updateHeaderAuth(null);
    }
  });
}