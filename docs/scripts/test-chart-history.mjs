const store = new Map();
globalThis.localStorage = {
  getItem: (k) => store.get(k) ?? null,
  setItem: (k, v) => store.set(k, v),
};
globalThis.sessionStorage = localStorage;

const { computeChartHistory } = await import('../js/winbeach-db.js');

function isoOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const pren = [
  { id: 1, stato: 'confermata', data_inizio: isoOffset(-2), data_fine: isoOffset(0) },
  { id: 2, stato: 'confermata', data_inizio: isoOffset(-1), data_fine: isoOffset(-1) },
  { id: 3, stato: 'cancellata', data_inizio: isoOffset(0), data_fine: isoOffset(2) },
];

const h = computeChartHistory(pren, 3);
if (h.labels.length !== 3) {
  console.error('FAIL: expected 3 labels');
  process.exit(1);
}
if (h.presenze[2] !== 1) {
  console.error(`FAIL: expected 1 presenza today, got ${h.presenze[2]}`);
  process.exit(1);
}
if (h.presenze[1] !== 2) {
  console.error(`FAIL: expected 2 presenze yesterday, got ${h.presenze[1]}`);
  process.exit(1);
}
if (h.arrivi[1] !== 1) {
  console.error(`FAIL: expected 1 arrivo yesterday, got ${h.arrivi[1]}`);
  process.exit(1);
}
console.log('OK chart history');