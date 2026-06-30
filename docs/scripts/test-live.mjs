#!/usr/bin/env node
const BASE = 'https://falconisilvio.github.io/winbeach';
const DB_URL = 'https://raw.githubusercontent.com/FiveTechSoft/githubdb/main/data/winbeach.json';

const pages = [
  'index.html', 'struttura.html',
  'pages/spiaggia.html', 'pages/booking.html', 'pages/clienti.html',
  'pages/cassa.html', 'pages/flussi-cassa.html', 'pages/elementi.html',
  'pages/settori.html', 'pages/tariffe.html', 'pages/azienda.html',
  'pages/arrivi-oggi.html', 'pages/tutte-prenotazioni.html',
  'pages/statistiche-ombrellone.html', 'pages/qr-scan.html', 'pages/cambia.html',
];

const modules = [
  'js/winbeach-db.js', 'js/winbeach-module.js', 'js/githubdb/client.js',
  'js/dashboard-stats.js', 'js/booking.js', 'js/clienti.js', 'js/cassa.js',
  'js/spiaggia.js', 'js/struttura.js',
];

async function get(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res;
}

async function main() {
  console.log('=== GitHub Pages: https://falconisilvio.github.io/winbeach ===\n');

  const db = await get(DB_URL).then((r) => r.json());
  const tableNames = Object.keys(db.tables || {});
  console.log(`githubDB: ${tableNames.length} tablas`);
  for (const t of ['prenotazioni', 'clienti', 'celle', 'movimenti_cassa', 'elementi']) {
    const n = db.tables[t]?.rows?.length ?? 0;
    console.log(`  ${t}: ${n} filas seed`);
  }

  console.log('\n--- Páginas ---');
  for (const p of pages) {
    await get(`${BASE}/${p}`);
    console.log(`  ✓ ${p}`);
  }

  console.log('\n--- Módulos JS ---');
  for (const m of modules) {
    const txt = await get(`${BASE}/${m}`).then((r) => r.text());
    if (!txt.includes('import ') && !txt.includes('export ')) {
      throw new Error(`${m}: no parece ES module`);
    }
    console.log(`  ✓ ${m}`);
  }

  const index = await get(`${BASE}/`).then((r) => r.text());
  if (!index.includes('dashboard-stats.js')) throw new Error('index sin dashboard-stats.js');
  if (!index.includes('dashboard-profiles.js')) throw new Error('index sin dashboard-profiles.js');
  console.log('\n  ✓ Dashboard con stats y perfiles');

  const flussi = await get(`${BASE}/pages/flussi-cassa.html`).then((r) => r.text());
  if (!flussi.includes('cassa.js')) throw new Error('flussi-cassa script incorrecto');
  console.log('  ✓ flussi-cassa → cassa.js');

  console.log('\n✅ Todo funciona en GitHub Pages');
}

main().catch((e) => { console.error('\n❌', e.message); process.exit(1); });