const store = new Map();
globalThis.localStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, v),
};
globalThis.sessionStorage = localStorage;

const { findPrenotazioneOverlap } = await import('../js/winbeach-db.js');

const rows = [
  { id: 1, cella: 10, data_inizio: '2026-07-01', data_fine: '2026-07-07', stato: 'confermata' },
  { id: 2, cella: 11, data_inizio: '2026-07-05', data_fine: '2026-07-10', stato: 'confermata' },
  { id: 3, cella: 10, data_inizio: '2026-07-20', data_fine: '2026-07-25', stato: 'cancellata' },
];

let ok = true;

const hit = findPrenotazioneOverlap(
  { cella: 10, data_inizio: '2026-07-05', data_fine: '2026-07-08', stato: 'confermata' },
  rows,
);
if (!hit || hit.id !== 1) {
  console.error('FAIL: expected overlap with #1');
  ok = false;
}

const miss = findPrenotazioneOverlap(
  { id: 1, cella: 10, data_inizio: '2026-07-01', data_fine: '2026-07-07', stato: 'confermata' },
  rows,
);
if (miss) {
  console.error('FAIL: editing same record should not overlap');
  ok = false;
}

const diffCell = findPrenotazioneOverlap(
  { cella: 12, data_inizio: '2026-07-05', data_fine: '2026-07-08', stato: 'confermata' },
  rows,
);
if (diffCell) {
  console.error('FAIL: different cella should not overlap');
  ok = false;
}

const cancelled = findPrenotazioneOverlap(
  { cella: 10, data_inizio: '2026-07-21', data_fine: '2026-07-22', stato: 'confermata' },
  rows,
);
if (cancelled) {
  console.error('FAIL: cancelled booking should not block');
  ok = false;
}

if (!ok) process.exit(1);
console.log('OK booking overlap logic');