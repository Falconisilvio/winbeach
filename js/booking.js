import {
  getDbStatus,
  getToken,
  loadPrenotazioniFromDb,
  savePrenotazioneToDb,
  deletePrenotazioneFromDb,
} from './winbeach-db.js';

let prenotazioni = [];
let clienti = [];
let celle = [];
let editingId = null;

const STATI = [
  { id: 'confermata', label: 'Confermata', badge: 'badge-green' },
  { id: 'in_attesa', label: 'In attesa', badge: 'badge-orange' },
  { id: 'cancellata', label: 'Cancellata', badge: 'badge-red' },
];

function $(id) {
  return document.getElementById(id);
}

function updateStatus() {
  const { state, message } = getDbStatus();
  const el = $('db-status');
  if (!el) return;
  el.className = `db-status ${state}`;
  el.textContent = message || 'Listo';
}

function clienteLabel(c) {
  if (!c) return '—';
  return [c.nome, c.cognome].filter(Boolean).join(' ').trim() || `Cliente #${c.id}`;
}

function statoBadge(stato) {
  const s = STATI.find((x) => x.id === stato) || { label: stato, badge: 'badge-gray' };
  return `<span class="badge ${s.badge}">${s.label}</span>`;
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = iso.slice(0, 10).split('-');
  if (d.length !== 3) return iso;
  return `${d[2]}/${d[1]}/${d[0]}`;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function updateStats() {
  const oggi = todayIso();
  const attive = prenotazioni.filter((p) => p.stato === 'confermata' || p.stato === 'in_attesa');
  const oggiAttive = attive.filter((p) => p.data_inizio <= oggi && p.data_fine >= oggi);
  const inScadenza = attive.filter((p) => p.data_fine === oggi);

  $('stat-attive').textContent = attive.length;
  $('stat-oggi').textContent = oggiAttive.length;
  $('stat-scadenza').textContent = inScadenza.length;
}

function getFiltered() {
  const q = ($('search-input')?.value || '').toLowerCase().trim();
  const stato = $('filter-stato')?.value || '';
  return prenotazioni.filter((p) => {
    if (stato && p.stato !== stato) return false;
    if (!q) return true;
    const nome = clienteLabel(p.cliente).toLowerCase();
    const note = (p.note || '').toLowerCase();
    return nome.includes(q) || String(p.cella).includes(q) || note.includes(q);
  });
}

function renderTable() {
  const tbody = $('prenotazioni-tbody');
  const empty = $('empty-state');
  const rows = getFiltered();

  if (!rows.length) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    updateStats();
    return;
  }

  empty.style.display = 'none';
  tbody.innerHTML = rows.map((p) => `
    <tr>
      <td>#${p.id}</td>
      <td>${clienteLabel(p.cliente)}</td>
      <td>${formatDate(p.data_inizio)}</td>
      <td>${formatDate(p.data_fine)}</td>
      <td>${p.cella ? `Post. ${p.cella}` : '—'}</td>
      <td>${statoBadge(p.stato)}</td>
      <td class="actions-cell">
        <button type="button" class="btn btn-secondary btn-sm" data-edit="${p.id}"><i class="fa-solid fa-pen"></i></button>
        <button type="button" class="btn btn-danger btn-sm" data-delete="${p.id}"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join('');

  updateStats();

  tbody.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => openModal(Number(btn.dataset.edit)));
  });
  tbody.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', () => removePrenotazione(Number(btn.dataset.delete)));
  });
}

function fillClienteSelect(selectedId = null) {
  const sel = $('f-cliente');
  sel.innerHTML = '<option value="">— Seleziona cliente —</option>';
  clienti.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = clienteLabel(c);
    if (selectedId === c.id) opt.selected = true;
    sel.appendChild(opt);
  });
}

function fillCellaSelect(selectedCella = null) {
  const sel = $('f-cella');
  const numerate = celle
    .filter((c) => c.cella > 0 && c.attivo)
    .sort((a, b) => a.cella - b.cella);

  sel.innerHTML = '<option value="">— Nessuna —</option>';
  numerate.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c.cella;
    const settore = c.settore ? ` (${c.settore})` : '';
    opt.textContent = `Post. ${c.cella} — ${c.elemento}${settore}`;
    if (selectedCella === c.cella) opt.selected = true;
    sel.appendChild(opt);
  });
}

function openModal(id = null) {
  editingId = id;
  fillClienteSelect();
  fillCellaSelect();

  const statoSel = $('f-stato');
  statoSel.innerHTML = STATI.map((s) => `<option value="${s.id}">${s.label}</option>`).join('');

  if (id) {
    const p = prenotazioni.find((x) => x.id === id);
    $('modal-title').textContent = 'Modifica prenotazione';
    fillClienteSelect(p?.cliente_id);
    fillCellaSelect(p?.cella);
    $('f-inizio').value = p?.data_inizio?.slice(0, 10) || '';
    $('f-fine').value = p?.data_fine?.slice(0, 10) || '';
    $('f-stato').value = p?.stato || 'confermata';
    $('f-note').value = p?.note || '';
  } else {
    $('modal-title').textContent = 'Nuova prenotazione';
    $('prenotazione-form').reset();
    $('f-inizio').value = todayIso();
    const fine = new Date();
    fine.setDate(fine.getDate() + 7);
    $('f-fine').value = fine.toISOString().slice(0, 10);
    $('f-stato').value = 'confermata';
  }

  $('prenotazione-modal').classList.add('open');
}

function closeModal() {
  $('prenotazione-modal').classList.remove('open');
  editingId = null;
}

async function loadData() {
  $('btn-reload').disabled = true;
  const result = await loadPrenotazioniFromDb();
  updateStatus();
  $('btn-reload').disabled = false;

  if (result.ok) {
    prenotazioni = result.data || [];
    clienti = result.clienti || [];
    celle = result.celle || [];
    renderTable();
  }
}

async function savePrenotazione(e) {
  e.preventDefault();
  if (!getToken()) {
    alert('Introduce el token de GitHub en Struttura → Base de datos antes de guardar.');
    return;
  }

  const clienteId = Number($('f-cliente').value);
  if (!clienteId) {
    alert('Seleziona un cliente.');
    return;
  }

  const prenotazione = {
    id: editingId || undefined,
    cliente_id: clienteId,
    cella: Number($('f-cella').value) || 0,
    data_inizio: $('f-inizio').value,
    data_fine: $('f-fine').value,
    stato: $('f-stato').value,
    note: $('f-note').value.trim(),
  };

  if (!prenotazione.data_inizio || !prenotazione.data_fine) {
    alert('Inserisci le date.');
    return;
  }

  if (prenotazione.data_fine < prenotazione.data_inizio) {
    alert('La data fine deve essere successiva alla data inizio.');
    return;
  }

  $('btn-save').disabled = true;
  $('btn-save').textContent = 'Salvataggio…';

  const result = await savePrenotazioneToDb(prenotazione, prenotazioni);
  updateStatus();
  $('btn-save').disabled = false;
  $('btn-save').textContent = 'Salva';

  if (!result.ok) {
    alert(result.error || 'Errore nel salvataggio');
    return;
  }

  closeModal();
  await loadData();
}

async function removePrenotazione(id) {
  if (!getToken()) {
    alert('Introduce el token de GitHub en Struttura → Base de datos antes de eliminar.');
    return;
  }
  if (!confirm('Eliminare questa prenotazione?')) return;

  const result = await deletePrenotazioneFromDb(id);
  updateStatus();
  if (!result.ok) {
    alert(result.error || 'Errore');
    return;
  }
  await loadData();
}

function bindEvents() {
  $('btn-nuovo').addEventListener('click', () => {
    if (!clienti.length) {
      alert('Nessun cliente in anagrafica. Aggiungi prima un cliente nella sezione Clienti.');
      return;
    }
    openModal();
  });
  $('btn-reload').addEventListener('click', loadData);
  $('search-input').addEventListener('input', renderTable);
  $('filter-stato').addEventListener('change', renderTable);
  $('prenotazione-form').addEventListener('submit', savePrenotazione);
  $('modal-close').addEventListener('click', closeModal);
  $('btn-cancel').addEventListener('click', closeModal);
  $('prenotazione-modal').addEventListener('click', (e) => {
    if (e.target === $('prenotazione-modal')) closeModal();
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  bindEvents();
  await loadData();
});