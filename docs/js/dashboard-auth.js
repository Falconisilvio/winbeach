import { getSession, logout, onAuthChange, canWrite, userLabel, applyReadOnlyMode } from './winbeach-auth.js';

function renderAuthBar() {
  const label = document.getElementById('user-label');
  const btnLogin = document.getElementById('btn-login');
  const btnLogout = document.getElementById('btn-logout');
  const banner = document.getElementById('read-only-banner');
  const s = getSession();

  if (label) {
    if (s) {
      label.innerHTML = `<i class="fa-solid fa-user-check"></i> ${userLabel()}`;
      label.className = 'user-label authenticated';
    } else {
      label.innerHTML = '<i class="fa-solid fa-eye"></i> Sola lettura';
      label.className = 'user-label guest';
    }
  }

  if (btnLogin) btnLogin.style.display = s ? 'none' : 'inline-flex';
  if (btnLogout) btnLogout.style.display = s ? 'inline-flex' : 'none';
  if (banner) banner.hidden = canWrite();

  document.body.classList.toggle('dashboard-read-only', !canWrite());
}

function setupAuthBar() {
  document.getElementById('btn-login')?.addEventListener('click', () => {
    window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname.split('/').pop() || 'index.html');
  });

  document.getElementById('btn-logout')?.addEventListener('click', () => {
    logout();
    renderAuthBar();
  });

  onAuthChange(() => { renderAuthBar(); applyReadOnlyMode(); });
  renderAuthBar();
  applyReadOnlyMode();
}

document.addEventListener('DOMContentLoaded', setupAuthBar);