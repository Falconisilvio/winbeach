import { GithubDB } from './githubdb/client.js';
import {
  findPrenotazioneOverlap,
  calcImportoFromTariffe,
  saveClienteToDb,
  savePrenotazioneToDb,
  getToken,
} from './winbeach-db.js';
import { canWrite, isAuthenticated } from './winbeach-auth.js';
import { formatEuro, formatDate, todayIso } from './winbeach-module.js';
import { t, applyAllI18n, onLangChange } from './app-i18n.js';

const $ = (id) => document.getElementById(id);

function getConfig() {
  const p = new URLSearchParams(location.search);
  return {
    owner: p.get('owner') || 'FiveTechSoft',
    repo: p.get('repo') || 'githubdb',
    branch: p.get('branch') || 'main',
    database: p.get('database') || 'winbeach',
    name: p.get('name') || 'Stabilimento balneare',
  };
}

let config = getConfig();
let step = 1;
let data = null;
let selectedCella = null;
let lastSummary = '';

function applyWidgetI18n() {
  applyAllI18n(document);
  const docTitle = t('page.widget.docTitle');
  if (docTitle !== 'page.widget.docTitle') document.title = docTitle;
  refreshDynamicText();
}

function refreshDynamicText() {
  if (data) {
    const n = data.celle.filter((c) => c.cella > 0).length;
    $('widget-status').textContent = t('widget.spotsCount', { n });
  }
  if (step === 2) renderSlots();
  if (step === 2 || step === 3) updatePrice();
  if (step === 4 && $('success-msg')) {
    const registered = $('success-msg').dataset.mode === 'registered';
    $('success-msg').textContent = registered ? t('widget.successRegistered') : t('widget.successSent');
  }
}

async function loadData() {
  $('widget-status').textContent = t('widget.loading');
  const db = new GithubDB({ ...config, token: null });
  await db.refresh(config.database);
  const tables = ['celle', 'clienti', 'prenotazioni', 'tariffe', 'settori'];
  const loaded = {};
  for (const tbl of tables) {
    try {
      loaded[tbl] = (await db.table(config.database, tbl)).objects();
    } catch {
      loaded[tbl] = [];
    }
  }
  data = loaded;
  $('widget-facility').textContent = config.name;
  $('widget-status').textContent = t('widget.spotsCount', { n: loaded.celle.filter((c) => c.cella > 0).length });
}

function showStep(n) {
  step = n;
  [1, 2, 3, 4].forEach((i) => {
    $(`step-${i}`)?.classList.toggle('hidden', i !== n);
    $(`dot-${i}`)?.classList.toggle('active', i === n);
    $(`dot-${i}`)?.classList.toggle('done', i < n);
  });
}

function getFreeSlots() {
  const start = $('w-inizio').value;
  const end = $('w-fine').value;
  if (!start || !end || end < start) return [];
  const celle = data.celle.filter((c) => c.attivo && c.cella > 0);
  const busy = new Set();
  data.prenotazioni.forEach((p) => {
    if (p.stato === 'cancellata') return;
    if (p.data_inizio <= end && p.data_fine >= start) busy.add(p.cella);
  });
  return celle.filter((c) => !busy.has(c.cella));
}

function renderSlots() {
  const free = getFreeSlots();
  const grid = $('widget-slots');
  if (!free.length) {
    grid.innerHTML = `<p class="widget-note">${t('widget.noSlots')}</p>`;
    selectedCella = null;
    return;
  }
  grid.innerHTML = free.sort((a, b) => a.cella - b.cella).map((c) =>
    `<button type="button" class="widget-slot${selectedCella === c.cella ? ' selected' : ''}" data-cella="${c.cella}">${c.cella}</button>`
  ).join('');
  grid.querySelectorAll('.widget-slot').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedCella = Number(btn.dataset.cella);
      renderSlots();
      updatePrice();
    });
  });
}

function updatePrice() {
  const el = $('widget-price');
  if (!selectedCella || !data) { el.textContent = ''; return; }
  const cella = data.celle.find((c) => c.cella === selectedCella);
  const imp = calcImportoFromTariffe(
    data.tariffe,
    cella?.settore,
    $('w-inizio').value,
    $('w-fine').value,
  );
  el.textContent = imp ? t('widget.priceFrom', { price: formatEuro(imp) }) : t('widget.priceOnRequest');
}

function buildSummary(ref, prenotazione, nome, cognome, email, telefono) {
  return [
    t('widget.summary.ref', { ref }),
    t('widget.summary.facility', { name: config.name }),
    t('widget.summary.spot', { n: selectedCella }),
    t('widget.summary.dates', { from: formatDate(prenotazione.data_inizio), to: formatDate(prenotazione.data_fine) }),
    t('widget.summary.client', { name: `${nome} ${cognome}`.trim() }),
    t('widget.summary.email', { email }),
    t('widget.summary.phone', { phone: telefono }),
  ].join('\n');
}

document.addEventListener('DOMContentLoaded', async () => {
  applyWidgetI18n();
  onLangChange(applyWidgetI18n);
  window.addEventListener('message', (e) => {
    if (e.data?.type === 'winbeach-lang-change') applyWidgetI18n();
  });

  $('w-inizio')?.addEventListener('change', () => {
    const f = $('w-fine');
    if (f.value && f.value < $('w-inizio').value) {
      const d = new Date($('w-inizio').value);
      d.setDate(d.getDate() + 3);
      f.value = d.toISOString().slice(0, 10);
    }
  });
  const today = todayIso();
  $('w-inizio').value = today;
  const end = new Date();
  end.setDate(end.getDate() + 7);
  $('w-fine').value = end.toISOString().slice(0, 10);

  await loadData();

  $('btn-step1')?.addEventListener('click', () => {
    if ($('w-fine').value < $('w-inizio').value) {
      alert(t('err.invalidEndDate'));
      return;
    }
    selectedCella = null;
    renderSlots();
    showStep(2);
  });

  $('btn-back2')?.addEventListener('click', () => showStep(1));
  $('btn-step2')?.addEventListener('click', () => {
    if (!selectedCella) { alert(t('widget.selectSpot')); return; }
    showStep(3);
  });

  $('btn-back3')?.addEventListener('click', () => showStep(2));

  $('widget-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = $('w-nome').value.trim();
    const cognome = $('w-cognome').value.trim();
    const email = $('w-email').value.trim();
    const telefono = $('w-telefono').value.trim();
    if (!nome) { alert(t('widget.errName')); return; }

    const prenotazione = {
      cliente_id: 0,
      cella: selectedCella,
      data_inizio: $('w-inizio').value,
      data_fine: $('w-fine').value,
      stato: 'in_attesa',
      note: `Richiesta widget online · ${email}`,
      importo: calcImportoFromTariffe(
        data.tariffe,
        data.celle.find((c) => c.cella === selectedCella)?.settore,
        $('w-inizio').value,
        $('w-fine').value,
      ) || 0,
      importo_pagato: 0,
      canale: 'widget',
      stato_pagamento: 'da_saldare',
      ora_arrivo: '',
      check_in: false,
      check_out: false,
    };

    const overlap = findPrenotazioneOverlap(prenotazione, data.prenotazioni);
    if (overlap) {
      alert(t('widget.errOverlap'));
      showStep(2);
      renderSlots();
      return;
    }

    const canSave = isAuthenticated() && canWrite() && getToken();
    $('btn-submit').disabled = true;

    if (canSave) {
      const cliente = { nome, cognome, email, telefono, note: 'Widget' };
      const cliRes = await saveClienteToDb(cliente, data.clienti);
      if (!cliRes.ok) {
        alert(cliRes.error || t('widget.errSaveClient'));
        $('btn-submit').disabled = false;
        return;
      }
      prenotazione.cliente_id = cliRes.id;
      const preRes = await savePrenotazioneToDb(prenotazione, data.prenotazioni);
      if (!preRes.ok) {
        alert(preRes.error || t('widget.errSaveBooking'));
        $('btn-submit').disabled = false;
        return;
      }
      $('success-ref').textContent = `#${preRes.id}`;
      $('success-msg').dataset.mode = 'registered';
      $('success-msg').textContent = t('widget.successRegistered');
      lastSummary = buildSummary(`#${preRes.id}`, prenotazione, nome, cognome, email, telefono);
    } else {
      const ref = `WB-${Date.now().toString(36).toUpperCase()}`;
      $('success-ref').textContent = ref;
      $('success-msg').dataset.mode = 'sent';
      $('success-msg').textContent = t('widget.successSent');
      lastSummary = buildSummary(ref, prenotazione, nome, cognome, email, telefono);
    }
    $('success-copy').dataset.summary = lastSummary;

    showStep(4);
    $('btn-submit').disabled = false;
  });

  $('success-copy')?.addEventListener('click', () => {
    const text = $('success-copy').dataset.summary || lastSummary || '';
    navigator.clipboard?.writeText(text).then(() => alert(t('widget.copied')));
  });

  $('btn-new')?.addEventListener('click', () => {
    $('widget-form').reset();
    selectedCella = null;
    showStep(1);
    loadData();
  });
});