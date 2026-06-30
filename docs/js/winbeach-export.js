/**
 * Exportación CSV (separador ; + BOM para Excel italiano).
 */

export function rowsToCsv(columns, rows) {
  const esc = (v) => {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""');
    return /[;"\n\r]/.test(s) ? `"${s}"` : s;
  };
  const header = columns.map((c) => c.label).join(';');
  const lines = rows.map((row) => columns.map((c) => {
    const v = typeof c.format === 'function' ? c.format(row) : row[c.key];
    return esc(v);
  }).join(';'));
  return `\uFEFF${header}\n${lines.join('\n')}`;
}

export function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function exportTableCsv(filename, columns, rows) {
  downloadCsv(filename, rowsToCsv(columns, rows));
}