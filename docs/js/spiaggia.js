import { loadOperationalData } from './winbeach-db.js';
import { $, formatDate, updateDbBar, clienteLabel, initModule, todayIso } from './winbeach-module.js';

let data = null;

function render() {
  const date = $('data-spiaggia')?.value || todayIso();
  const celle = data?.celle?.filter((c) => c.attivo && c.cella > 0) || [];
  const pren = (data?.prenotazioniEnriched || []).filter((p) =>
    p.stato !== 'cancellata' && p.data_inizio <= date && p.data_fine >= date
  );
  const occMap = Object.fromEntries(pren.map((p) => [p.cella, p]));

  $('stat-postazioni').textContent = celle.length;
  $('stat-occupate').textContent = pren.length;
  $('stat-libe').textContent = Math.max(0, celle.length - pren.length);
  $('stat-pct').textContent = celle.length ? `${Math.round((pren.length / celle.length) * 100)}%` : '0%';

  const grid = $('spiaggia-grid');
  if (!grid) return;
  grid.innerHTML = celle.sort((a, b) => a.cella - b.cella).map((c) => {
    const p = occMap[c.cella];
    const cls = p ? 'cell-occupied' : 'cell-free';
    const info = p ? `${clienteLabel(p.cliente)}` : 'Libera';
    return `<div class="spiaggia-cell ${cls}" title="Post. ${c.cella} — ${c.elemento} — ${info}">
      <span class="cell-num">${c.cella}</span>
      <span class="cell-settore">${c.settore || ''}</span>
      ${p ? '<span class="cell-client">●</span>' : ''}
    </div>`;
  }).join('');
}

async function load() {
  const res = await loadOperationalData();
  updateDbBar();
  if (res.ok) { data = res.data; render(); }
}

initModule(async () => {
  if (!$('data-spiaggia')) {
    const inp = document.createElement('input');
    inp.type = 'date'; inp.id = 'data-spiaggia'; inp.value = todayIso();
    inp.className = 'filters';
    document.querySelector('.filters')?.appendChild(inp);
  }
  $('data-spiaggia')?.addEventListener('change', render);
  $('btn-reload')?.addEventListener('click', load);
  await load();
});