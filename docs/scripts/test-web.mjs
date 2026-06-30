#!/usr/bin/env node
/**
 * Verifica páginas HTML, scripts referenciados y acceso a githubDB.
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS = join(__dirname, '..');
const BASE = process.env.TEST_BASE || 'http://localhost:3456';

const errors = [];
const warnings = [];

function ok(msg) { console.log(`  ✓ ${msg}`); }
function fail(msg) { errors.push(msg); console.log(`  ✗ ${msg}`); }
function warn(msg) { warnings.push(msg); console.log(`  ⚠ ${msg}`); }

async function fetchStatus(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    return { status: res.status, ok: res.ok };
  } catch (e) {
    return { status: 0, ok: false, error: e.message };
  }
}

function extractScripts(html) {
  const scripts = [];
  const re = /<script[^>]+src=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html))) scripts.push(m[1]);
  return scripts;
}

async function testLocal() {
  console.log(`\n=== Test local: ${BASE} ===\n`);

  const pages = ['index.html', 'struttura.html', 'widget.html', 'manifest.webmanifest', 'sw.js', ...readdirSync(join(DOCS, 'pages')).map((f) => `pages/${f}`)];

  for (const page of pages) {
    const url = `${BASE}/${page}`;
    const res = await fetchStatus(url);
    if (!res.ok) {
      fail(`${page} → HTTP ${res.status || res.error}`);
      continue;
    }
    ok(`${page}`);

    const html = readFileSync(join(DOCS, page), 'utf8');
    for (const src of extractScripts(html)) {
      if (src.startsWith('http')) continue;
      const rel = src.replace(/^\.\//, '').replace(/^\.\.\//, '');
      const localPath = join(DOCS, rel);
      const norm = `${BASE}/${rel.replace(/\\/g, '/')}`;
      if (!existsSync(localPath)) {
        fail(`${page}: script no existe → ${src}`);
      } else {
        const sres = await fetchStatus(norm);
        if (!sres.ok) fail(`${page}: script 404 → ${norm}`);
      }
    }
  }
}

async function testGithubDB() {
  console.log('\n=== Test githubDB CDN ===\n');
  const url = 'https://raw.githubusercontent.com/FiveTechSoft/githubdb/main/data/winbeach.json';
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) { fail(`githubDB → HTTP ${res.status}`); return; }
    const data = await res.json();
    const tables = Object.keys(data.tables || data);
    ok(`winbeach.json accesible (${tables.length} tablas)`);
    const required = ['prenotazioni', 'clienti', 'celle', 'movimenti_cassa', 'elementi', 'tariffe'];
    for (const t of required) {
      if (!tables.includes(t) && !(data.tables && data.tables[t])) warn(`tabla '${t}' no encontrada en schema`);
      else ok(`tabla '${t}'`);
    }
  } catch (e) {
    fail(`githubDB: ${e.message}`);
  }
}

function testJsSyntax() {
  console.log('\n=== Test sintaxis JS ===\n');
  const jsDir = join(DOCS, 'js');
  const files = [];
  function walk(dir) {
    for (const f of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, f.name);
      if (f.isDirectory()) walk(p);
      else if (f.name.endsWith('.js')) files.push(p);
    }
  }
  walk(jsDir);
  for (const f of files) {
    try {
      execSync(`node --check "${f}"`, { stdio: 'pipe' });
      ok(f.replace(DOCS + '\\', '').replace(DOCS + '/', ''));
    } catch {
      fail(`sintaxis inválida: ${f}`);
    }
  }
}

async function testLive() {
  const live = process.env.LIVE_BASE || 'https://falconisilvio.github.io/winbeach';
  console.log(`\n=== Test producción: ${live} ===\n`);
  const checks = ['/', '/js/dashboard-stats.js', '/js/winbeach-db.js', '/pages/clienti.html', '/pages/flussi-cassa.html'];
  for (const path of checks) {
    const res = await fetchStatus(`${live}${path}`);
    if (res.ok) ok(`${path}`);
    else fail(`${path} → HTTP ${res.status || res.error}`);
  }
}

async function main() {
  testJsSyntax();
  await testGithubDB();
  await testLocal();
  if (process.env.TEST_LIVE) await testLive();

  console.log(`\n=== Resumen ===`);
  console.log(`Errores: ${errors.length}`);
  console.log(`Avisos: ${warnings.length}`);
  if (errors.length) {
    errors.forEach((e) => console.log(`  - ${e}`));
    process.exit(1);
  }
  console.log('Todo OK');
}

main().catch((e) => { console.error(e); process.exit(1); });