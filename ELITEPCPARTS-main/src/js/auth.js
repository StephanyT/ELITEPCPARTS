const BACKEND = 'http://localhost:3000';

const IN_PAGES    = location.pathname.includes('/src/pages/');
const PAGE_PREFIX = IN_PAGES ? '' : 'src/pages/';
const HOME_HREF   = IN_PAGES ? '../../index.html' : 'index.html';

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

window.EPCAuth = {
  uid: null,
  profile: null,
  _cbs: [],
  onUser(cb) { this._cbs.push(cb); if (this.profile) cb(this.profile); },
};
function notifyUser() {
  EPCAuth._cbs.forEach(cb => { try { cb(EPCAuth.profile); } catch (e) {} });
}

function accountEl() {
  return document.querySelector('.user-menu-wrap')
      || document.querySelector('a.icon-btn[href*="cuenta"], a.icon-btn[title="Mi cuenta"]');
}

function updateHeaderAuth(session) {
  const el = accountEl();
  if (!el) return;
  if (session) {
    const nombre = session.nombre || session.firstName || '';
    const initials = (nombre[0] || session.email?.[0] || 'U').toUpperCase();
    el.outerHTML = `
      <div class="user-menu-wrap">
        <button class="user-avatar-btn" id="userMenuBtn" title="${nombre || session.email}">
          <span class="user-initials">${initials}</span>
        </button>
        <div class="user-dropdown" id="userDropdown">
          <div class="user-dropdown__header">
            <strong>${nombre}</strong>
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

function logout() {
  clearSession();
  localStorage.removeItem('epc_cart');
  localStorage.removeItem('epc_cart_owner');
  location.href = HOME_HREF;
}

function loginSuccess(profile) {
  cacheSession(profile);
  const redirect = new URLSearchParams(location.search).get('redirect') || 'cuenta.html';
  location.href = redirect;
}

function requireAuth() {
  const session = getSession();
  if (!session) {
    const current = encodeURIComponent(location.pathname.split('/').pop() + location.hash);
    location.href = 'login.html?redirect=' + current;
  }
}

async function registerWithBackend(nombre, email, password) {
  const res = await fetch(`${BACKEND}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Error al registrar');
  }
  return res.json();
}

async function loginWithBackend(email, password) {
  const res = await fetch(`${BACKEND}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Email o contraseña incorrectos');
  return res.json();
}

updateHeaderAuth(getSession());