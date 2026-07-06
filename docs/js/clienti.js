import {
  getToken,
  loadClientiFromDb,
  saveClienteToDb,
  deleteClienteFromDb,
} from './winbeach-db.js';
import { applyReadOnlyMode, onAuthChange } from './winbeach-auth.js';
import { checkPermission } from './winbeach-permessi.js';
import { t } from './app-i18n.js';
import { $, escapeHtml, initModule, updateDbBar } from './winbeach-module.js';

let clienti = [];
let editingId = null;
let canEdit = false;

function fullName(c) {
  return [c.nome, c.cognome].filter(Boolean).join(' ').trim() || '—';
}

function getFiltered() {
  const q = ($('search-input')?.value || '').toLowerCase().trim();
  if (!q) return clienti;
  return clienti.filter((c) => {
    const hay = [c.nome, c.cognome, c.email, c.telefono, c.note].join(' ').toLowerCase();
    return hay.includes(q);
  });
}

function renderTable() {
  const tbody = $('clienti-tbody');
  const empty = $('empty-state');
  const rows = getFiltered();

  if (!rows.length) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    $('stat-total').textContent = clienti.length;
    return;
  }

  empty.style.display = 'none';
  tbody.innerHTML = rows.map((c) => `
    <tr>
      <td>${fullName(c)}</td>
      <td>${c.email || '—'}</td>
      <td>${c.telefono || '—'}</td>
      <td>${c.note ? `<span class="badge badge-blue">${escapeHtml(c.note)}</span>` : `<span class="badge badge-green">${t('badge.attivo')}</span>`}</td>
      <td class="actions-cell">
        ${canEdit ? `
          <button type="button" class="btn btn-secondary btn-sm" data-edit="${c.id}"><i class="fa-solid fa-pen"></i></button>
          <button type="button" class="btn btn-danger btn-sm" data-delete="${c.id}"><i class="fa-solid fa-trash"></i></button>
        ` : ''}
      </td>
    </tr>
  `).join('');

  $('stat-total').textContent = clienti.length;

  if (canEdit) {
    tbody.querySelectorAll('[data-edit]').forEach((btn) => {
      btn.addEventListener('click', () => openModal(Number(btn.dataset.edit)));
    });
    tbody.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', () => removeCliente(Number(btn.dataset.delete)));
    });
  }
}

function openModal(id = null) {
  editingId = id;
  const modal = $('cliente-modal');
  const title = $('modal-title');

  if (id) {
    const c = clienti.find((x) => x.id === id);
    title.textContent = t('clienti.edit');
    $('f-nome').value = c?.nome || '';
    $('f-cognome').value = c?.cognome || '';
    $('f-email').value = c?.email || '';
    $('f-telefono').value = c?.telefono || '';
    $('f-note').value = c?.note || '';
  } else {
    title.textContent = t('clienti.new');
    $('cliente-form').reset();
  }

  modal.classList.add('open');
}

function closeModal() {
  $('cliente-modal').classList.remove('open');
  editingId = null;
}

async function loadData() {
  $('btn-reload').disabled = true;
  const result = await loadClientiFromDb();
  updateDbBar();
  $('btn-reload').disabled = false;

  if (result.ok) {
    clienti = result.data || [];
    renderTable();
  }
}

async function saveCliente(e) {
  e.preventDefault();
  const { assertCanWrite } = await import('./winbeach-auth.js');
  const authErr = assertCanWrite();
  if (authErr) { alert(authErr); return; }
  if (!getToken()) {
    alert(t('err.tokenCambia'));
    return;
  }

  const cliente = {
    id: editingId || undefined,
    nome: $('f-nome').value.trim(),
    cognome: $('f-cognome').value.trim(),
    email: $('f-email').value.trim(),
    telefono: $('f-telefono').value.trim(),
    note: $('f-note').value.trim(),
  };

  if (!cliente.nome) {
    alert(t('err.nameRequired'));
    return;
  }

  $('btn-save').disabled = true;
  $('btn-save').textContent = t('common.saving');

  const result = await saveClienteToDb(cliente, clienti);
  updateDbBar();
  $('btn-save').disabled = false;
  $('btn-save').textContent = t('common.save');

  if (!result.ok) {
    alert(result.error || t('err.saveFailed'));
    return;
  }

  closeModal();
  await loadData();
}

async function removeCliente(id) {
  const { assertCanWrite } = await import('./winbeach-auth.js');
  const authErr = assertCanWrite();
  if (authErr) { alert(authErr); return; }
  if (!getToken()) {
    alert(t('err.tokenDelete'));
    return;
  }
  if (!confirm(t('common.confirmDelete'))) return;

  const result = await deleteClienteFromDb(id);
  updateDbBar();
  if (!result.ok) {
    alert(result.error || t('err.generic'));
    return;
  }
  await loadData();
}

function bindEvents() {
  if (window.__clientiBound) return;
  window.__clientiBound = true;
  $('btn-nuovo').addEventListener('click', () => openModal());
  $('btn-reload').addEventListener('click', loadData);
  $('search-input').addEventListener('input', renderTable);
  $('cliente-form').addEventListener('submit', saveCliente);
  $('modal-close').addEventListener('click', closeModal);
  $('btn-cancel').addEventListener('click', closeModal);
  $('cliente-modal').addEventListener('click', (e) => {
    if (e.target === $('cliente-modal')) closeModal();
  });
}

initModule(async () => {
  const { allowed, permesso, message } = await checkPermission('clienti', true);
  
  if (!allowed) {
    alert(message);
    window.location.href = '../index.html';
    return;
  }
  
  canEdit = permesso === 'scrittura';
  
  if (!canEdit) {
    $('btn-nuovo').style.display = 'none';
    $('btn-reload').style.display = 'none';
  }
  
  bindEvents();
  onAuthChange(() => { applyReadOnlyMode(); });
  applyReadOnlyMode();
  await loadData();
  const q = new URLSearchParams(window.location.search).get('q');
  if (q && $('search-input')) { $('search-input').value = q; renderTable(); }
});