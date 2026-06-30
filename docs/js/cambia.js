import {
  getProfiles,
  getActiveProfileId,
  setActiveProfile,
  saveProfile,
  deleteProfile,
  getToken,
  saveToken,
  testActiveProfile,
  ensureDemoProfiles,
} from './winbeach-db.js';
import { t } from './app-i18n.js';
import { $, escapeHtml, initModule } from './winbeach-module.js';

let editingId = null;

function connectionLabel(p) {
  return `${p.owner}/${p.repo} · ${p.database}.json`;
}

function widgetUrl(p) {
  const url = new URL('../widget.html', window.location.href);
  url.searchParams.set('owner', p.owner);
  url.searchParams.set('repo', p.repo);
  url.searchParams.set('branch', p.branch || 'main');
  url.searchParams.set('database', p.database);
  url.searchParams.set('name', p.name);
  return url.href;
}

function renderCards() {
  const grid = $('profiles-grid');
  const activeId = getActiveProfileId();
  const profiles = getProfiles();

  if (!profiles.length) {
    grid.innerHTML = `<div class="empty-state"><p>${escapeHtml(t('cambia.empty'))}</p></div>`;
    return;
  }

  grid.innerHTML = profiles.map((p) => {
    const active = p.id === activeId;
    return `
      <div class="profile-card ${active ? 'active' : ''}" data-id="${p.id}">
        <div class="profile-card-head">
          <i class="fa-solid fa-umbrella-beach" style="color:${active ? '#0084ff' : '#ccc'}"></i>
          <h3>${escapeHtml(p.name)}</h3>
          ${active ? `<span class="badge badge-green">${escapeHtml(t('badge.attivo'))}</span>` : ''}
        </div>
        <p class="profile-conn">${escapeHtml(connectionLabel(p))}</p>
        <div class="profile-card-actions">
          ${active ? '' : `<button type="button" class="btn btn-primary btn-sm" data-activate="${p.id}">${escapeHtml(t('cambia.activate'))}</button>`}
          <button type="button" class="btn btn-secondary btn-sm" data-widget="${p.id}" title="${escapeHtml(t('cambia.copyWidgetTitle'))}"><i class="fa-solid fa-link"></i></button>
          <button type="button" class="btn btn-secondary btn-sm" data-edit="${p.id}"><i class="fa-solid fa-pen"></i></button>
          <button type="button" class="btn btn-danger btn-sm" data-delete="${p.id}" ${profiles.length < 2 ? `disabled title="${escapeHtml(t('cambia.minOneTitle'))}"` : ''}><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    `;
  }).join('');

  grid.querySelectorAll('[data-activate]').forEach((btn) => {
    btn.addEventListener('click', () => activate(btn.dataset.activate));
  });
  grid.querySelectorAll('[data-widget]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const p = getProfiles().find((x) => x.id === btn.dataset.widget);
      if (!p) return;
      const link = widgetUrl(p);
      navigator.clipboard?.writeText(link).then(() => alert(`${t('cambia.widgetCopied')}\n${link}`))
        .catch(() => prompt(t('cambia.widgetPrompt'), link));
    });
  });
  grid.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => openModal(btn.dataset.edit));
  });
  grid.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', () => removeProfile(btn.dataset.delete));
  });
}

function openModal(id = null) {
  editingId = id;
  const modal = $('profile-modal');

  if (id) {
    const p = getProfiles().find((x) => x.id === id);
    $('modal-title').textContent = t('cambia.editFacility');
    $('f-name').value = p?.name || '';
    $('f-owner').value = p?.owner || '';
    $('f-repo').value = p?.repo || '';
    $('f-branch').value = p?.branch || 'main';
    $('f-database').value = p?.database || 'winbeach';
    $('f-token').value = getToken(id) || '';
  } else {
    $('modal-title').textContent = t('cambia.newFacility');
    $('profile-form').reset();
    $('f-branch').value = 'main';
    $('f-database').value = 'winbeach';
    $('f-token').value = '';
  }

  modal.classList.add('open');
}

function closeModal() {
  $('profile-modal').classList.remove('open');
  editingId = null;
}

async function saveForm(e) {
  e.preventDefault();
  const { assertAdmin } = await import('./winbeach-auth.js');
  const err = assertAdmin();
  if (err) { alert(err); return; }

  const profile = saveProfile({
    id: editingId || undefined,
    name: $('f-name').value,
    owner: $('f-owner').value,
    repo: $('f-repo').value,
    branch: $('f-branch').value,
    database: $('f-database').value,
  });

  saveToken($('f-token').value.trim(), profile.id);
  closeModal();
  renderCards();
}

function activate(id) {
  setActiveProfile(id);
  renderCards();
}

async function removeProfile(id) {
  if (!confirm(t('cambia.confirmDelete'))) return;
  if (!deleteProfile(id)) {
    alert(t('cambia.minOneProfile'));
    return;
  }
  renderCards();
}

function bindEvents() {
  if (window.__cambiaBound) return;
  window.__cambiaBound = true;
  $('btn-nuovo').addEventListener('click', () => openModal());
  $('profile-form').addEventListener('submit', saveForm);
  $('modal-close').addEventListener('click', closeModal);
  $('btn-cancel').addEventListener('click', closeModal);
  $('btn-test').addEventListener('click', async () => {
    $('btn-test').disabled = true;
    await testActiveProfile();
    $('btn-test').disabled = false;
  });
  $('btn-demo')?.addEventListener('click', () => {
    const n = ensureDemoProfiles();
    renderCards();
    alert(n ? t('cambia.demoAdded').replace('{n}', n) : t('cambia.demoExists'));
  });
  $('profile-modal').addEventListener('click', (e) => {
    if (e.target === $('profile-modal')) closeModal();
  });
}

initModule(async () => {
  bindEvents();
  renderCards();
});