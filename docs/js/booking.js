import {
  getDbStatus, getActiveProfile, getToken, loadPrenotazioniFromDb,
  savePrenotazioneToDb, deletePrenotazioneFromDb, onProfileChange,
  loadTable, calcImportoFromTariffe, findPrenotazioneOverlap,
} from './winbeach-db.js';
import {
  $, formatDate, formatEuro, todayIso, clienteLabel,
  statoPrenBadge, pagamentoBadge,
} from './winbeach-module.js';
import { exportTableCsv } from './winbeach-export.js';

let prenotazioni = [], clienti = [], celle = [], tariffe = [], editingId = null;
const STATI = [
  { id: 'confermata', label: 'Confermata' },
  { id: 'in_attesa', label: 'In attesa' },
  { id: 'cancellata', label: 'Cancellata' },
];

function updateStatus() {
  const el = $('db-status');
  if (!el) return;
  const { state, message } = getDbStatus();
  const profile = getActiveProfile();
  el.className = `db-status ${state}`;
  el.textContent = (profile ? `${profile.name} · ` : '') + (message || 'Pronto');
}

function updateStats() {
  const oggi = todayIso();
  const attive = prenotazioni.filter((p) => p.stato !== 'cancellata');
  $('stat-attive').textContent = attive.length;
  $('stat-oggi').textContent = attive.filter((p) => p.data_inizio <= oggi && p.data_fine >= oggi).length;
  $('stat-scadenza').textContent = attive.filter((p) => p.data_fine === oggi).length;
}

function getFiltered() {
  const q = ($('search-input')?.value || '').toLowerCase().trim();
  const stato = $('filter-stato')?.value || '';
  return prenotazioni.filter((p) => {
    if (stato && p.stato !== stato) return false;
    if (!q) return true;
    return clienteLabel(p.cliente).toLowerCase().includes(q) || String(p.cella).includes(q);
  });
}

function renderTable() {
  const tbody = $('prenotazioni-tbody');
  const empty = $('empty-state');
  const rows = getFiltered();
  if (!rows.length) { tbody.innerHTML = ''; empty.style.display = 'block'; updateStats(); return; }
  empty.style.display = 'none';
  tbody.innerHTML = rows.map((p) => `
    <tr>
      <td>#${p.id}</td>
      <td>${clienteLabel(p.cliente)}</td>
      <td>${formatDate(p.data_inizio)}</td>
      <td>${formatDate(p.data_fine)}</td>
      <td>${p.cella ? `Post. ${p.cella}` : '—'}</td>
      <td>${formatEuro(p.importo)}</td>
      <td>${pagamentoBadge(p.stato_pagamento)}</td>
      <td>${statoPrenBadge(p.stato)}</td>
      <td class="actions-cell">
        <button type="button" class="btn btn-secondary btn-sm" data-edit="${p.id}"><i class="fa-solid fa-pen"></i></button>
        <button type="button" class="btn btn-danger btn-sm" data-delete="${p.id}"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>`).join('');
  updateStats();
  tbody.querySelectorAll('[data-edit]').forEach((b) => b.addEventListener('click', () => openModal(Number(b.dataset.edit))));
  tbody.querySelectorAll('[data-delete]').forEach((b) => b.addEventListener('click', () => removePrenotazione(Number(b.dataset.delete))));
}

function calcPrice() {
  const cella = Number($('f-cella').value);
  const c = celle.find((x) => x.cella === cella);
  const imp = calcImportoFromTariffe(tariffe, c?.settore, $('f-inizio').value, $('f-fine').value);
  if (imp && !$('f-importo').dataset.manual) $('f-importo').value = imp;
}

function fillClienteSelect(selectedId = null) {
  const sel = $('f-cliente');
  sel.innerHTML = '<option value="">— Seleziona —</option>';
  clienti.forEach((c) => {
    const o = document.createElement('option');
    o.value = c.id; o.textContent = clienteLabel(c);
    if (selectedId === c.id) o.selected = true;
    sel.appendChild(o);
  });
}

function fillCellaSelect(selectedCella = null) {
  const sel = $('f-cella');
  sel.innerHTML = '<option value="">— Nessuna —</option>';
  celle.filter((c) => c.cella > 0 && c.attivo).sort((a, b) => a.cella - b.cella).forEach((c) => {
    const o = document.createElement('option');
    o.value = c.cella;
    o.textContent = `Post. ${c.cella} — ${c.elemento} (${c.settore || '?'})`;
    if (selectedCella === c.cella) o.selected = true;
    sel.appendChild(o);
  });
}

function openModal(id = null) {
  editingId = id;
  fillClienteSelect(); fillCellaSelect();
  $('f-stato').innerHTML = STATI.map((s) => `<option value="${s.id}">${s.label}</option>`).join('');
  if (id) {
    const p = prenotazioni.find((x) => x.id === id);
    $('modal-title').textContent = 'Modifica prenotazione';
    fillClienteSelect(p?.cliente_id); fillCellaSelect(p?.cella);
    $('f-inizio').value = p?.data_inizio?.slice(0, 10) || '';
    $('f-fine').value = p?.data_fine?.slice(0, 10) || '';
    $('f-stato').value = p?.stato || 'confermata';
    $('f-note').value = p?.note || '';
    $('f-importo').value = p?.importo || 0;
    $('f-pagato').value = p?.importo_pagato || 0;
    $('f-canale').value = p?.canale || 'offline';
    $('f-pagamento').value = p?.stato_pagamento || 'da_saldare';
    $('f-ora').value = p?.ora_arrivo || '';
    $('f-importo').dataset.manual = '1';
  } else {
    $('modal-title').textContent = 'Nuova prenotazione';
    $('prenotazione-form').reset();
    $('f-inizio').value = todayIso();
    const f = new Date(); f.setDate(f.getDate() + 7);
    $('f-fine').value = f.toISOString().slice(0, 10);
    $('f-stato').value = 'confermata';
    delete $('f-importo').dataset.manual;
    calcPrice();
  }
  $('prenotazione-modal').classList.add('open');
}

function closeModal() { $('prenotazione-modal').classList.remove('open'); editingId = null; }

async function loadData() {
  $('btn-reload').disabled = true;
  const [result, tarRes] = await Promise.all([loadPrenotazioniFromDb(), loadTable('tariffe')]);
  updateStatus();
  $('btn-reload').disabled = false;
  if (result.ok) {
    prenotazioni = result.data || [];
    clienti = result.clienti || [];
    celle = result.celle || [];
    tariffe = tarRes.ok ? tarRes.data : [];
    renderTable();
  }
}

async function savePrenotazione(e) {
  e.preventDefault();
  const { assertCanWrite } = await import('./winbeach-auth.js');
  const authErr = assertCanWrite();
  if (authErr) { alert(authErr); return; }
  if (!getToken()) { alert('Configura il token GitHub prima di salvare.'); return; }
  const clienteId = Number($('f-cliente').value);
  if (!clienteId) { alert('Seleziona un cliente.'); return; }
  const existing = editingId ? prenotazioni.find((x) => x.id === editingId) : null;
  const prenotazione = {
    id: editingId || undefined,
    cliente_id: clienteId,
    cella: Number($('f-cella').value) || 0,
    data_inizio: $('f-inizio').value,
    data_fine: $('f-fine').value,
    stato: $('f-stato').value,
    note: $('f-note').value.trim(),
    importo: Number($('f-importo').value) || 0,
    importo_pagato: Number($('f-pagato').value) || 0,
    canale: $('f-canale').value,
    stato_pagamento: $('f-pagamento').value,
    ora_arrivo: $('f-ora').value,
    check_in: existing?.check_in ?? false,
    check_out: existing?.check_out ?? false,
  };
  if (prenotazione.data_fine < prenotazione.data_inizio) { alert('Data fine non valida.'); return; }
  const overlap = findPrenotazioneOverlap(prenotazione, prenotazioni);
  if (overlap) {
    alert(
      `Postazione ${prenotazione.cella} già occupata dal ${formatDate(overlap.data_inizio)} al ${formatDate(overlap.data_fine)} (prenotazione #${overlap.id}).`
    );
    return;
  }
  $('btn-save').disabled = true;
  const result = await savePrenotazioneToDb(prenotazione, prenotazioni);
  updateStatus();
  $('btn-save').disabled = false;
  if (!result.ok) { alert(result.error); return; }
  closeModal(); await loadData();
}

async function removePrenotazione(id) {
  const { assertCanWrite } = await import('./winbeach-auth.js');
  const authErr = assertCanWrite();
  if (authErr) { alert(authErr); return; }
  if (!getToken() || !confirm('Eliminare?')) return;
  await deletePrenotazioneFromDb(id);
  updateStatus();
  await loadData();
}

document.addEventListener('DOMContentLoaded', async () => {
  $('btn-nuovo')?.addEventListener('click', () => { if (!clienti.length) alert('Aggiungi prima un cliente.'); else openModal(); });
  $('btn-reload')?.addEventListener('click', loadData);
  $('btn-export')?.addEventListener('click', () => {
    const rows = getFiltered();
    const stamp = todayIso();
    exportTableCsv(`prenotazioni-${stamp}.csv`, [
      { key: 'id', label: 'ID' },
      { key: 'cliente', label: 'Cliente', format: (p) => clienteLabel(p.cliente) },
      { key: 'data_inizio', label: 'Inizio' },
      { key: 'data_fine', label: 'Fine' },
      { key: 'cella', label: 'Postazione' },
      { key: 'importo', label: 'Importo' },
      { key: 'stato_pagamento', label: 'Pagamento' },
      { key: 'stato', label: 'Stato' },
      { key: 'canale', label: 'Canale' },
    ], rows);
  });
  $('search-input')?.addEventListener('input', renderTable);
  $('filter-stato')?.addEventListener('change', renderTable);
  $('prenotazione-form')?.addEventListener('submit', savePrenotazione);
  ['f-inizio', 'f-fine', 'f-cella'].forEach((id) => $(id)?.addEventListener('change', () => { delete $('f-importo')?.dataset.manual; calcPrice(); }));
  $('f-importo')?.addEventListener('input', () => { $('f-importo').dataset.manual = '1'; });
  $('modal-close')?.addEventListener('click', closeModal);
  $('btn-cancel')?.addEventListener('click', closeModal);
  const { applyReadOnlyMode, onAuthChange } = await import('./winbeach-auth.js');
  onProfileChange(loadData);
  onAuthChange(() => applyReadOnlyMode());
  applyReadOnlyMode();
  await loadData();
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  const cellaParam = params.get('cella');
  if (q && $('search-input')) { $('search-input').value = q; renderTable(); }
  if (cellaParam && clienti.length) {
    openModal();
    fillCellaSelect(Number(cellaParam));
    $('f-cella').value = cellaParam;
    calcPrice();
  }
});