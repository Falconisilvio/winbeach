import {
  getProfiles,
  getActiveProfile,
  setActiveProfile,
  onProfileChange,
} from './winbeach-db.js';

function renderSwitcher() {
  const nameEl = document.getElementById('active-profile-name');
  const dropdown = document.getElementById('profile-dropdown');
  const active = getActiveProfile();

  if (nameEl) {
    nameEl.textContent = active?.name || 'Stabilimento';
  }

  if (!dropdown) return;

  const profiles = getProfiles();
  dropdown.innerHTML = profiles.map((p) => `
    <button type="button" class="profile-option ${p.id === active?.id ? 'active' : ''}" data-id="${p.id}">
      <i class="fa-solid fa-umbrella-beach"></i>
      <span>${p.name}</span>
      <small>${p.database}.json</small>
    </button>
  `).join('') + `
    <a href="#" class="profile-manage" data-page="cambia">
      <i class="fa-solid fa-gear"></i> Gestisci stabilimenti
    </a>
  `;

  dropdown.querySelectorAll('.profile-option').forEach((btn) => {
    btn.addEventListener('click', () => {
      setActiveProfile(btn.dataset.id);
      dropdown.classList.remove('open');
      reloadIframeIfNeeded();
    });
  });

  dropdown.querySelector('.profile-manage')?.addEventListener('click', (e) => {
    e.preventDefault();
    dropdown.classList.remove('open');
    if (typeof caricaProceduraEsterna === 'function') {
      caricaProceduraEsterna('cambia');
    }
  });
}

function reloadIframeIfNeeded() {
  const procedureView = document.getElementById('procedure-view');
  const iframe = procedureView?.querySelector('iframe');
  if (iframe?.src) {
    const url = new URL(iframe.src, window.location.href);
    iframe.src = url.pathname + '?t=' + Date.now();
  }
}

function setupSwitcher() {
  const btn = document.getElementById('btn-profile');
  const dropdown = document.getElementById('profile-dropdown');

  if (!btn || !dropdown) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });

  document.addEventListener('click', () => dropdown.classList.remove('open'));

  onProfileChange(() => {
    renderSwitcher();
    reloadIframeIfNeeded();
  });

  window.addEventListener('message', (e) => {
    if (e.data?.type === 'winbeach-profile-change') {
      renderSwitcher();
      reloadIframeIfNeeded();
    }
  });

  window.addEventListener('storage', (e) => {
    if (e.key === 'winbeach_active_profile') {
      renderSwitcher();
      reloadIframeIfNeeded();
    }
  });

  renderSwitcher();
}

document.addEventListener('DOMContentLoaded', setupSwitcher);