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
  const icon = type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle';
  alert.innerHTML = `<i class="fa fa-${icon}"></i> `;
  // El mensaje va como texto: si trae HTML, no se ejecuta
  alert.appendChild(document.createTextNode(msg));
  alert.style.display = 'flex';
}

// Lee el "exp" (vencimiento) del JWT. El payload es base64, no está cifrado.
function tokenVencido(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return !payload.exp || payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

// La sesión guarda { id, nombre, email, rol, token }.
// Si no hay token o ya venció, se considera que no hay sesión.
function getSession() {
  const raw = localStorage.getItem('epc_session') || sessionStorage.getItem('epc_session');
  if (!raw) return null;
  try {
    const session = JSON.parse(raw);
    if (!session?.token || tokenVencido(session.token)) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    clearSession();
    return null;
  }
}
function cacheSession(profile) {
  localStorage.setItem('epc_session', JSON.stringify(profile));
}

// Headers para llamar a rutas protegidas: "Authorization: Bearer <token>"
function authHeaders(extra = {}) {
  const session = getSession();
  return session?.token ? { ...extra, Authorization: `Bearer ${session.token}` } : { ...extra };
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
        <button class="user-avatar-btn" id="userMenuBtn" title="${escapeHtml(nombre || session.email)}">
          <span class="user-initials">${escapeHtml(initials)}</span>
        </button>
        <div class="user-dropdown" id="userDropdown">
          <div class="user-dropdown__header">
            <strong>${escapeHtml(nombre)}</strong>
            <span>${escapeHtml(session.email || '')}</span>
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

// El backend responde { token, usuario }. Guardamos los dos juntos.
function loginSuccess(data) {
  cacheSession({ ...data.usuario, token: data.token });
  // Solo se permite redirigir a páginas de la propia tienda (evita mandar al usuario a otro sitio)
  const redirect = new URLSearchParams(location.search).get('redirect') || 'cuenta.html';
  location.href = /^[a-z0-9_-]+\.html(#[a-z0-9_-]*)?$/i.test(redirect) ? redirect : 'cuenta.html';
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
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(mensajeDeError(data, 'Error al registrar'));
    err.status = res.status;
    throw err;
  }
  return data;
}

// Los errores de validación de NestJS vienen como lista: tomamos el primero
function mensajeDeError(data, porDefecto) {
  if (Array.isArray(data?.message)) return data.message[0];
  return data?.message || porDefecto;
}

async function loginWithBackend(email, password) {
  const res = await fetch(`${BACKEND}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // 403 = cuenta sin verificar, 429 = demasiados intentos, 401 = datos incorrectos
    const porDefecto = res.status === 429
      ? 'Demasiados intentos. Espera un minuto e inténtalo de nuevo.'
      : 'Email o contraseña incorrectos';
    const err = new Error(res.status === 429 ? porDefecto : mensajeDeError(data, porDefecto));
    err.status = res.status;
    throw err;
  }
  return data;
}

async function reenviarVerificacion(email) {
  const res = await fetch(`${BACKEND}/auth/reenviar-verificacion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(mensajeDeError(data, 'No se pudo reenviar el correo'));
  return data;
}

updateHeaderAuth(getSession());