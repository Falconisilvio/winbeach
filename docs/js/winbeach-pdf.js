import { getActiveProfile } from './winbeach-db.js';

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Apre finestra di stampa (Salva come PDF dal browser).
 */
export function printTableReport({ title, columns, rows, subtitle = '' }) {
  const facility = getActiveProfile()?.name || 'WinBeach';
  const date = new Date().toLocaleString('it-IT');
  const head = columns.map((c) => `<th>${esc(c.label)}</th>`).join('');
  const body = rows.map((row) =>
    `<tr>${columns.map((c) => {
      const v = typeof c.format === 'function' ? c.format(row) : row[c.key];
      return `<td>${esc(v)}</td>`;
    }).join('')}</tr>`
  ).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${esc(title)}</title>
<style>
  body { font-family: system-ui, sans-serif; padding: 24px; color: #1e293b; }
  h1 { font-size: 1.25rem; margin: 0 0 4px; }
  .meta { font-size: 0.85rem; color: #64748b; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
  th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
  th { background: #f1f5f9; }
  @media print { body { padding: 12px; } }
</style></head><body>
  <h1>${esc(title)}</h1>
  <p class="meta">${esc(facility)} · ${esc(subtitle)} · ${esc(date)} · ${rows.length} record</p>
  <table><thead><tr>${head}</tr></thead><tbody>${body || '<tr><td colspan="' + columns.length + '">—</td></tr>'}</tbody></table>
  <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 300); }<\/script>
</body></html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) {
    alert('Consenti i popup per esportare il PDF.');
    return;
  }
  win.document.write(html);
  win.document.close();
}