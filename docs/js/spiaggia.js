import { loadOperationalData } from './winbeach-db.js';
import {
  $, escapeHtml, formatDate, formatEuro, updateDbBar, clienteLabel,
  initModule, todayIso, navigateApp, pagamentoBadge, statoPrenBadge,
} from './winbeach-module.js';

let data = null;
let selectedCella = null;

function getDate() {
  return $('data-spiaggia')?.value || todayIso();
}

function getOccupancyMaps(date) {
  const celle = data?.celle?.filter((c) => c.attivo && c.cella > 0) || [];
  const pren = (data?.prenotazioniEnriched || []).filter((p) =>
    p.stato !== 'cancellata' && p.data_inizio <= date && p.data_fine >= date
  );
  const occMap = Object.fromEntries(pren.map((p) => [p.cella, p]));
  return { celle, pren, occMap };
}

function render() {
  const date = getDate();
  const { celle, pren, occMap } = getOccupancyMaps(date);

  $('stat-postazioni').textContent = celle.length;
  $('stat-occupate').textContent = pren.length;
  $('stat-libe').textContent = Math.max(0, celle.length - pren.length);
  $('stat-pct').textContent = celle.length ? `${Math.round((pren.length / celle.length) * 100)}%` : '0%';

  const grid = $('spiaggia-grid');
  if (!grid) return;
  grid.innerHTML = celle.sort((a, b) => a.cella - b.cella).map((c) => {
    const p = occMap[c.cella];
    const cls = p ? 'cell-occupied' : 'cell-free';
    const sel = selectedCella === c.cella ? ' cell-selected' : '';
    const info = p ? clienteLabel(p.cliente) : 'Libera';
    return `<button type="button" class="spiaggia-cell ${cls}${sel}" data-cella="${c.cella}" title="Post. ${c.cella} — ${c.elemento} — ${info}">
      <span class="cell-num">${c.cella}</span>
      <span class="cell-settore">${escapeHtml(c.settore || '')}</span>
      ${p ? '<span class="cell-client">●</span>' : ''}
    </button>`;
  }).join('');

  grid.querySelectorAll('[data-cella]').forEach((btn) => {
    btn.addEventListener('click', () => openDetail(Number(btn.dataset.cella)));
  });
}

function openDetail(cella) {
  selectedCella = cella;
  render();
  const date = getDate();
  const { occMap } = getOccupancyMaps(date);
  const c = data?.celle?.find((x) => x.cella === cella);
  const p = occMap[cella];

  $('detail-title').textContent = `Postazione ${cella}`;
  const body = $('detail-body');
  const actions = $('detail-actions');

  if (p) {
    body.innerHTML = `
      <p><strong>${escapeHtml(clienteLabel(p.cliente))}</strong></p>
      <p>${formatDate(p.data_inizio)} → ${formatDate(p.data_fine)}</p>
      <p>Importo: ${formatEuro(p.importo)} · ${pagamentoBadge(p.stato_pagamento)}</p>
      <p>Stato: ${statoPrenBadge(p.stato)}</p>
      <p class="detail-meta">${escapeHtml(c?.elemento || '')} · Settore ${escapeHtml(c?.settore || '—')}</p>`;
    actions.innerHTML = `
      <button type="button" class="btn btn-primary" id="btn-open-booking"><i class="fa-solid fa-calendar-days"></i> Apri prenotazione</button>
      <button type="button" class="btn btn-secondary" id="btn-open-arrivi"><i class="fa-solid fa-plane-arrival"></i> Arrivi oggi</button>`;
    $('btn-open-booking')?.addEventListener('click', () => {
      closeDetail();
      navigateApp('booking', { q: String(p.id) });
    });
    $('btn-open-arrivi')?.addEventListener('click', () => {
      closeDetail();
      navigateApp('arrivi-oggi');
    });
  } else {
    body.innerHTML = `
      <p class="detail-free"><i class="fa-solid fa-circle-check"></i> Postazione libera il ${formatDate(date)}</p>
      <p class="detail-meta">${escapeHtml(c?.elemento || '')} · Settore ${escapeHtml(c?.settore || '—')}</p>`;
    actions.innerHTML = `
      <button type="button" class="btn btn-primary" id="btn-new-booking"><i class="fa-solid fa-plus"></i> Nuova prenotazione</button>`;
    $('btn-new-booking')?.addEventListener('click', () => {
      closeDetail();
      navigateApp('booking', { q: String(cella), cella });
    });
  }

  $('cell-detail').classList.add('open');
}

function closeDetail() {
  $('cell-detail')?.classList.remove('open');
  selectedCella = null;
  render();
}

async function load() {
  const res = await loadOperationalData();
  updateDbBar();
  if (res.ok) { data = res.data; render(); }
}

initModule(async () => {
  const dateInput = $('data-spiaggia');
  if (dateInput && !dateInput.value) dateInput.value = todayIso();
  dateInput?.addEventListener('change', () => { closeDetail(); render(); });
  $('btn-reload')?.addEventListener('click', load);
  $('detail-close')?.addEventListener('click', closeDetail);
  $('cell-detail')?.addEventListener('click', (e) => {
    if (e.target === $('cell-detail')) closeDetail();
  });
  await load();
});