#!/usr/bin/env node
/**
 * Prueba completa: assets GitHub Pages + 3 BDs + cliente githubDB (fetch binding).
 */
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LIVE = 'https://falconisilvio.github.io/winbeach';
const CDN = 'https://raw.githubusercontent.com/FiveTechSoft/githubdb/main/data';

const DBS = [
  { file: 'winbeach', minClienti: 15, minPren: 30 },
  { file: 'winbeach-lido-sud', minClienti: 5, minPren: 8 },
  { file: 'winbeach-lido-europa', minClienti: 10, minPren: 15 },
];

const errors = [];

async function get(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res;
}

async function testPages() {
  console.log('\n=== Páginas GitHub Pages ===');
  const pagesDir = join(__dirname, '../pages');
  const pages = ['index.html', 'struttura.html', ...readdirSync(pagesDir).map((f) => `pages/${f}`)];
  for (const p of pages) {
    await get(`${LIVE}/${p}`);
    console.log(`  ✓ ${p}`);
  }
}

async function testJsModules() {
  console.log('\n=== Módulos JS críticos ===');
  const mods = [
    'js/githubdb/client.js', 'js/winbeach-db.js', 'js/winbeach-module.js',
    'js/dashboard-stats.js', 'js/dashboard-profiles.js', 'js/cambia.js',
    'js/booking.js', 'js/clienti.js', 'js/spiaggia.js', 'js/cassa.js',
  ];
  for (const m of mods) {
    const txt = await get(`${LIVE}/${m}`).then((r) => r.text());
    if (m === 'js/githubdb/client.js' && !txt.includes('fetchFn.call(globalThis')) {
      errors.push('client.js sin fix fetch');
    }
    if (m === 'js/winbeach-module.js' && !txt.includes('winbeach-profile-change')) {
      errors.push('winbeach-module.js sin listener perfiles');
    }
    console.log(`  ✓ ${m}`);
  }
}

async function testFetchBinding() {
  console.log('\n=== Simulación fetch (Illegal invocation) ===');
  const clientCode = await get(`${LIVE}/js/githubdb/client.js`).then((r) => r.text());
  if (!clientCode.includes('fetchFn.call(globalThis')) {
    errors.push('Fix fetch no desplegado');
    return;
  }
  const boundFetch = (url, init) => fetch.call(globalThis, url, init);
  for (const db of DBS) {
    const url = `${CDN}/${db.file}.json`;
    const data = await boundFetch(url).then((r) => r.json());
    const clienti = data.tables?.clienti?.rows?.length ?? 0;
    const pren = data.tables?.prenotazioni?.rows?.length ?? 0;
    if (clienti < db.minClienti) errors.push(`${db.file}: solo ${clienti} clienti`);
    if (pren < db.minPren) errors.push(`${db.file}: solo ${pren} prenotazioni`);
    console.log(`  ✓ ${db.file}.json → ${clienti} clienti, ${pren} prenotazioni`);
  }
}

async function testProfileIsolation() {
  console.log('\n=== Aislamiento multi-BD (datos distintos) ===');
  const loads = await Promise.all(DBS.map(async (db) => {
    const data = await fetch(`${CDN}/${db.file}.json`).then((r) => r.json());
    const azienda = data.tables?.azienda?.rows?.[0]?.[1] ?? '';
    const clienti = data.tables?.clienti?.rows?.length ?? 0;
    return { file: db.file, azienda, clienti };
  }));
  const names = new Set(loads.map((l) => l.azienda));
  if (names.size < 3) errors.push('Las 3 BDs no tienen azienda distinta');
  loads.forEach((l) => console.log(`  ✓ ${l.file}: "${l.azienda}" (${l.clienti} clienti)`));
}

function testSyntax() {
  console.log('\n=== Sintaxis JS local ===');
  const jsDir = join(__dirname, '../js');
  const walk = (dir) => {
    for (const f of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, f.name);
      if (f.isDirectory()) walk(p);
      else if (f.name.endsWith('.js')) execSync(`node --check "${p}"`, { stdio: 'pipe' });
    }
  };
  walk(jsDir);
  console.log('  ✓ todos los .js OK');
}

async function main() {
  console.log(`Test completo WinBeach — ${LIVE}`);
  testSyntax();
  await testPages();
  await testJsModules();
  await testFetchBinding();
  await testProfileIsolation();

  console.log('\n=== Resumen ===');
  if (errors.length) {
    errors.forEach((e) => console.log(`  ✗ ${e}`));
    process.exit(1);
  }
  console.log('✅ Todo correcto — 3 BDs operativas, web completa OK');
}

main().catch((e) => { console.error('❌', e.message); process.exit(1); });