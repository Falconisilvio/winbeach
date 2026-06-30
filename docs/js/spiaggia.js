import { loadOperationalData } from './winbeach-db.js';
import {
  $, escapeHtml, formatDate, formatEuro, updateDbBar, clienteLabel,
  initModule, todayIso, navigateApp, pagamentoBadge, statoPrenBadge,
} from './winbeach-module.js';
import { t } from './app-i18n.js';

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
    const info = p ? clienteLabel(p.cliente) : t('spiaggia.free');
    const title = t('spiaggia.cellTitle', { n: c.cella, element: c.elemento, info });
    return `<button type="button" class="spiaggia-cell ${cls}${sel}" data-cella="${c.cella}" title="${escapeHtml(title)}">
      <span class="cell-num">${c.cella}</span>
      <span class="cell-settore">${escapeHtml(c.settore || '')}</span>
      ${p ? '<span class="cell-client">●</span>' : ''}
    </button>`;
  }).join('');

  grid.querySelectorAll('[data-cella]').forEach((btn) => {
    btn.addEventListener('click', () => openDetail(Number(btn.dataset.cella)));
  });

  if (selectedCella != null && $('cell-detail')?.classList.contains('open')) {
    fillDetail(selectedCella);
  }
}

function fillDetail(cella) {
  const date = getDate();
  const { occMap } = getOccupancyMaps(date);
  const c = data?.celle?.find((x) => x.cella === cella);
  const p = occMap[cella];

  $('detail-title').textContent = t('spiaggia.spotTitle', { n: cella });
  const body = $('detail-body');
  const actions = $('detail-actions');
  const sector = c?.settore || '—';

  if (p) {
    body.innerHTML = `
      <p><strong>${escapeHtml(clienteLabel(p.cliente))}</strong></p>
      <p>${formatDate(p.data_inizio)} → ${formatDate(p.data_fine)}</p>
      <p>${escapeHtml(t('spiaggia.amount'))} ${formatEuro(p.importo)} · ${pagamentoBadge(p.stato_pagamento)}</p>
      <p>${escapeHtml(t('spiaggia.state'))} ${statoPrenBadge(p.stato)}</p>
      <p class="detail-meta">${escapeHtml(c?.elemento || '')} · ${escapeHtml(t('spiaggia.sector', { s: sector }))}</p>`;
    actions.innerHTML = `
      <button type="button" class="btn btn-primary" id="btn-open-booking"><i class="fa-solid fa-calendar-days"></i> ${escapeHtml(t('spiaggia.openBooking'))}</button>
      <button type="button" class="btn btn-secondary" id="btn-open-arrivi"><i class="fa-solid fa-plane-arrival"></i> ${escapeHtml(t('spiaggia.arrivalsToday'))}</button>`;
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
      <p class="detail-free"><i class="fa-solid fa-circle-check"></i> ${escapeHtml(t('spiaggia.freeOnDate', { date: formatDate(date) }))}</p>
      <p class="detail-meta">${escapeHtml(c?.elemento || '')} · ${escapeHtml(t('spiaggia.sector', { s: sector }))}</p>`;
    actions.innerHTML = `
      <button type="button" class="btn btn-primary" id="btn-new-booking"><i class="fa-solid fa-plus"></i> ${escapeHtml(t('spiaggia.newBooking'))}</button>`;
    $('btn-new-booking')?.addEventListener('click', () => {
      closeDetail();
      navigateApp('booking', { q: String(cella), cella });
    });
  }

  $('cell-detail').classList.add('open');
}

function openDetail(cella) {
  selectedCella = cella;
  render();
  fillDetail(cella);
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