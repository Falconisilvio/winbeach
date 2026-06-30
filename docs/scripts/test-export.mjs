import { rowsToCsv } from '../js/winbeach-export.js';

const csv = rowsToCsv(
  [{ key: 'a', label: 'Col A' }, { key: 'b', label: 'Col B' }],
  [{ a: 'test;val', b: 42 }],
);

if (!csv.startsWith('\uFEFF')) {
  console.error('FAIL: missing BOM');
  process.exit(1);
}
if (!csv.includes('"test;val"')) {
  console.error('FAIL: semicolon not escaped');
  process.exit(1);
}
console.log('OK CSV export');