import { loadTable, saveTableRow } from './winbeach-db.js';
import { $, escapeHtml, formatEuro, todayIso, nowIso, updateDbBar, requireWrite, bindModal, initModule, badge } from './winbeach-module.js';
import { exportTableCsv } from './winbeach-export.js';
import { printTableReport } from './winbeach-pdf.js';

const EXPORT_COLS = [
  { key: 'data', label: 'Data', format: (m) => String(m.data).slice(0, 16) },
  { key: 'tipo', label: 'Tipo' },
  { key: 'descrizione', label: 'Descrizione' },
  { key: 'importo', label: 'Importo' },
  { key: 'metodo', label: 'Metodo' },
  { key: 'operatore', label: 'Operatore' },
  { key: 'note', label: 'Note' },
];

let movimenti = [];

function render() {
  const tbody = $('data-tbody');
  const entrate = movimenti.filter((m) => m.tipo === 'entrata').reduce((s, m) => s + (Number(m.importo) || 0), 0);
  const uscite = movimenti.filter((m) => m.tipo === 'uscita').reduce((s, m) => s + (Number(m.importo) || 0), 0);
  const oggi = todayIso();
  const entrateOggi = movimenti.filter((m) => m.tipo === 'entrata' && String(m.data).startsWith(oggi)).reduce((s, m) => s + (Number(m.importo) || 0), 0);
  const usciteOggi = movimenti.filter((m) => m.tipo === 'uscita' && String(m.data).startsWith(oggi)).reduce((s, m) => s + (Number(m.importo) || 0), 0);

  if ($('stat-entrate')) $('stat-entrate').textContent = formatEuro(entrateOggi);
  if ($('stat-uscite')) $('stat-uscite').textContent = formatEuro(usciteOggi);
  if ($('stat-saldo')) $('stat-saldo').textContent = formatEuro(entrate - uscite);

  tbody.innerHTML = movimenti.map((m) => `
    <tr>
      <td>${escapeHtml(String(m.data).slice(0, 16))}</td>
      <td>${m.tipo === 'entrata' ? badge('Entrata', 'green') : badge('Uscita', 'red')}</td>
      <td>${escapeHtml(m.descrizione)}</td>
      <td>${m.tipo === 'entrata' ? '+' : '-'}${formatEuro(m.importo)}</td>
      <td>${escapeHtml(m.operatore || '—')}</td>
    </tr>
  `).join('');
}

async function load() {
  const res = await loadTable('movimenti_cassa');
  updateDbBar();
  if (res.ok) { movimenti = res.data.sort((a, b) => String(b.data).localeCompare(String(a.data))); render(); }
}

async function save(e) {
  e.preventDefault();
  if (!requireWrite()) return;
  const tipo = $('f-tipo').value;
  const row = {
    data: nowIso(),
    tipo,
    descrizione: $('f-desc').value.trim(),
    importo: Number($('f-importo').value) || 0,
    metodo: $('f-metodo').value,
    prenotazione_id: Number($('f-pren').value) || 0,
    operatore: $('f-op').value.trim() || 'operatore',
    note: $('f-note').value.trim(),
  };
  await saveTableRow('movimenti_cassa', row, ['data', 'tipo', 'descrizione', 'importo', 'metodo', 'prenotazione_id', 'operatore', 'note'], movimenti);
  $('data-modal')?.classList.remove('open');
  await load();
}

initModule(async () => {
  $('btn-nuovo')?.addEventListener('click', () => $('data-modal')?.classList.add('open'));
  $('btn-reload')?.addEventListener('click', load);
  $('btn-export')?.addEventListener('click', () => {
    exportTableCsv(`cassa-${todayIso()}.csv`, EXPORT_COLS, movimenti);
  });
  $('btn-pdf')?.addEventListener('click', () => {
    printTableReport({
      title: document.title || 'Cassa',
      subtitle: todayIso(),
      columns: EXPORT_COLS,
      rows: movimenti,
    });
  });
  bindModal('data-modal', ['modal-close', 'btn-cancel'], save);
  await load();
});