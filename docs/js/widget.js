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

async function loadData() {
  $('widget-status').textContent = 'Caricamento disponibilità…';
  const db = new GithubDB({ ...config, token: null });
  await db.refresh(config.database);
  const tables = ['celle', 'clienti', 'prenotazioni', 'tariffe', 'settori'];
  const loaded = {};
  for (const t of tables) {
    try {
      loaded[t] = (await db.table(config.database, t)).objects();
    } catch {
      loaded[t] = [];
    }
  }
  data = loaded;
  $('widget-facility').textContent = config.name;
  $('widget-status').textContent = `${loaded.celle.filter((c) => c.cella > 0).length} postazioni · lettura pubblica`;
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
    grid.innerHTML = '<p class="widget-note">Nessuna postazione libera per queste date.</p>';
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
  el.textContent = imp ? `Da ${formatEuro(imp)}` : 'Prezzo su richiesta';
}

document.addEventListener('DOMContentLoaded', async () => {
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
      alert('Data fine non valida.');
      return;
    }
    selectedCella = null;
    renderSlots();
    showStep(2);
  });

  $('btn-back2')?.addEventListener('click', () => showStep(1));
  $('btn-step2')?.addEventListener('click', () => {
    if (!selectedCella) { alert('Seleziona una postazione.'); return; }
    showStep(3);
  });

  $('btn-back3')?.addEventListener('click', () => showStep(2));

  $('widget-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = $('w-nome').value.trim();
    const cognome = $('w-cognome').value.trim();
    const email = $('w-email').value.trim();
    const telefono = $('w-telefono').value.trim();
    if (!nome) { alert('Inserisci il nome.'); return; }

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
      alert('Postazione non più disponibile. Torna indietro e scegli un\'altra.');
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
        alert(cliRes.error || 'Errore salvataggio cliente.');
        $('btn-submit').disabled = false;
        return;
      }
      prenotazione.cliente_id = cliRes.id;
      const preRes = await savePrenotazioneToDb(prenotazione, data.prenotazioni);
      if (!preRes.ok) {
        alert(preRes.error || 'Errore salvataggio prenotazione.');
        $('btn-submit').disabled = false;
        return;
      }
      $('success-ref').textContent = `#${preRes.id}`;
      $('success-msg').textContent = 'Prenotazione registrata in attesa di conferma.';
    } else {
      const ref = `WB-${Date.now().toString(36).toUpperCase()}`;
      $('success-ref').textContent = ref;
      $('success-msg').textContent = 'Richiesta inviata. Lo stabilimento ti contatterà per confermare.';
      const summary = [
        `Riferimento: ${ref}`,
        `Stabilimento: ${config.name}`,
        `Postazione: ${selectedCella}`,
        `Date: ${formatDate(prenotazione.data_inizio)} – ${formatDate(prenotazione.data_fine)}`,
        `Cliente: ${nome} ${cognome}`,
        `Email: ${email}`,
        `Tel: ${telefono}`,
      ].join('\n');
      $('success-copy').dataset.summary = summary;
    }

    showStep(4);
    $('btn-submit').disabled = false;
  });

  $('success-copy')?.addEventListener('click', () => {
    const text = $('success-copy').dataset.summary || '';
    navigator.clipboard?.writeText(text).then(() => alert('Copiato negli appunti.'));
  });

  $('btn-new')?.addEventListener('click', () => {
    $('widget-form').reset();
    selectedCella = null;
    showStep(1);
    loadData();
  });
});