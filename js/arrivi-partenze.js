import { loadPrenotazioniFromDb, savePrenotazioneToDb } from './winbeach-db.js';
import {
  $, escapeHtml, formatDate, formatEuro, todayIso, tomorrowIso, updateDbBar,
  clienteLabel, statoPrenBadge, pagamentoBadge, initModule, requireToken,
} from './winbeach-module.js';

const MODE = document.body.dataset.mode || 'arrivi-oggi';
const [dir, when] = MODE.split('-');
const targetDate = when === 'domani' ? tomorrowIso() : todayIso();
const isArrivi = dir === 'arrivi';

let prenotazioni = [];

function filterRows() {
  return prenotazioni.filter((p) => {
    if (p.stato === 'cancellata') return false;
    const d = isArrivi ? p.data_inizio : p.data_fine;
    return String(d).slice(0, 10) === targetDate;
  });
}

function render() {
  const rows = filterRows();
  $('page-subtitle').textContent = `${isArrivi ? 'Arrivi' : 'Partenze'} — ${formatDate(targetDate)}`;
  $('stat-total').textContent = rows.length;
  $('stat-check').textContent = isArrivi
    ? rows.filter((p) => p.check_in).length
    : rows.filter((p) => p.check_out).length;

  $('data-tbody').innerHTML = rows.map((p) => `
    <tr>
      <td>${clienteLabel(p.cliente)}</td>
      <td>Post. ${p.cella || '—'}</td>
      <td>${p.ora_arrivo || '—'}</td>
      <td>${pagamentoBadge(p.stato_pagamento)}</td>
      <td>${p.canale || 'offline'}</td>
      <td>${statoPrenBadge(p.stato)}</td>
      <td class="actions-cell">
        ${isArrivi ? `<button class="btn btn-success btn-sm" data-checkin="${p.id}" ${p.check_in ? 'disabled' : ''}>Check-in</button>` : ''}
        ${!isArrivi ? `<button class="btn btn-warning btn-sm" data-checkout="${p.id}" ${p.check_out ? 'disabled' : ''}>Check-out</button>` : ''}
      </td>
    </tr>
  `).join('') || '<tr><td colspan="7">Nessun record per questa data.</td></tr>';

  $('data-tbody').querySelectorAll('[data-checkin]').forEach((b) => {
    b.addEventListener('click', () => toggleCheck(Number(b.dataset.checkin), 'check_in'));
  });
  $('data-tbody').querySelectorAll('[data-checkout]').forEach((b) => {
    b.addEventListener('click', () => toggleCheck(Number(b.dataset.checkout), 'check_out'));
  });
}

async function toggleCheck(id, field) {
  if (!requireToken()) return;
  const p = prenotazioni.find((x) => x.id === id);
  if (!p) return;
  const updated = { ...p, [field]: true, cliente: undefined, cellaInfo: undefined };
  await savePrenotazioneToDb(updated, prenotazioni);
  await load();
}

async function load() {
  const res = await loadPrenotazioniFromDb();
  updateDbBar();
  if (res.ok) { prenotazioni = res.data; render(); }
}

initModule(async () => {
  $('btn-reload')?.addEventListener('click', load);
  await load();
});