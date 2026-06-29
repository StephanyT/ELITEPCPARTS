// ============================================================
// AUTH — helpers compartidos entre login.html y registro.html
// ============================================================

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

function loginSuccess(user, remember) {
  const sessionData = {
    id: user.id,
    firstName: user.firstName,
    lastName:  user.lastName,
    email:     user.email,
    phone:     user.phone || '',
  };

  if (remember) {
    localStorage.setItem('epc_session', JSON.stringify(sessionData));
  } else {
    sessionStorage.setItem('epc_session', JSON.stringify(sessionData));
  }

  // Redirigir a donde vino el usuario, o a cuenta
  const redirect = new URLSearchParams(window.location.search).get('redirect') || 'cuenta.html';
  window.location.href = redirect;
}

// ============================================================
// Auth guard — llamado en todas las páginas para actualizar el header
// ============================================================
function getSession() {
  const ls = localStorage.getItem('epc_session');
  const ss = sessionStorage.getItem('epc_session');
  return ls ? JSON.parse(ls) : ss ? JSON.parse(ss) : null;
}

function logout() {
  localStorage.removeItem('epc_session');
  sessionStorage.removeItem('epc_session');
  window.location.href = 'index.html';
}

function updateHeaderAuth() {
  const session = getSession();
  const userIcon = document.querySelector('.icon-btn[title="Mi cuenta"]');
  if (!userIcon) return;

  if (session) {
    // Reemplazar ícono de usuario por menú desplegable
    const initials = (session.firstName[0] + (session.lastName?.[0] || '')).toUpperCase();
    userIcon.outerHTML = `
      <div class="user-menu-wrap">
        <button class="user-avatar-btn" id="userMenuBtn" title="${session.firstName}">
          <span class="user-initials">${initials}</span>
        </button>
        <div class="user-dropdown" id="userDropdown">
          <div class="user-dropdown__header">
            <strong>${session.firstName} ${session.lastName}</strong>
            <span>${session.email}</span>
          </div>
          <a href="cuenta.html"><i class="fa fa-user"></i> Mi cuenta</a>
          <a href="cuenta.html#orders"><i class="fa fa-box"></i> Mis pedidos</a>
          <a href="pcbuilder.html"><i class="fa fa-tools"></i> Mis builds</a>
          <div class="user-dropdown__divider"></div>
          <button onclick="logout()" class="user-dropdown__logout">
            <i class="fa fa-sign-out-alt"></i> Cerrar sesión
          </button>
        </div>
      </div>
    `;

    // Toggle dropdown
    setTimeout(() => {
      const btn      = document.getElementById('userMenuBtn');
      const dropdown = document.getElementById('userDropdown');
      btn?.addEventListener('click', e => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
      });
      document.addEventListener('click', () => dropdown?.classList.remove('open'));
    }, 0);

  } else {
    userIcon.href = 'login.html';
  }
}

// Redirigir si la página requiere auth
function requireAuth() {
  if (!getSession()) {
    const current = encodeURIComponent(window.location.pathname.split('/').pop());
    window.location.href = 'login.html?redirect=' + current;
  }
}

// Actualizar header en todas las páginas
updateHeaderAuth();
