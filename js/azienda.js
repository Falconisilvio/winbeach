import { loadTable, saveTableRow } from './winbeach-db.js';
import { $, updateDbBar, requireToken, initModule } from './winbeach-module.js';

const FIELDS = ['ragione_sociale', 'piva', 'indirizzo', 'email', 'telefono', 'stagione'];

async function load() {
  const res = await loadTable('azienda');
  updateDbBar();
  if (!res.ok) return;
  const row = res.data[0] || {};
  FIELDS.forEach((f) => { const el = $(`f-${f.replace(/_/g, '-')}`); if (el) el.value = row[f] || ''; });
  window._aziendaId = row.id || null;
}

async function save(e) {
  e.preventDefault();
  if (!requireToken()) return;
  const row = { id: window._aziendaId || undefined };
  FIELDS.forEach((f) => { row[f] = $(`f-${f.replace(/_/g, '-')}`)?.value.trim() || ''; });
  await saveTableRow('azienda', row, FIELDS, window._aziendaRows || []);
  updateDbBar();
  await load();
}

initModule(async () => {
  $('azienda-form')?.addEventListener('submit', save);
  const res = await loadTable('azienda');
  window._aziendaRows = res.data || [];
  await load();
});