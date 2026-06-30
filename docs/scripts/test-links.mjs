#!/usr/bin/env node
/**
 * Verifica enlaces internos, assets referenciados y rutas de navegación (sin 404).
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS = join(__dirname, '..');
const LIVE = process.env.TEST_LIVE ? 'https://falconisilvio.github.io/winbeach' : null;
const LOCAL = process.env.TEST_BASE || 'http://127.0.0.1:3456';

const NAV_PAGES = [
  'dashboard', 'spiaggia', 'booking', 'planner', 'listini', 'cassa', 'clienti', 'qr-scan',
  'cambia', 'guida', 'arrivi-oggi', 'partenze-oggi', 'arrivi-domani', 'partenze-domani',
  'modifiche-ombrelloni', 'tutte-prenotazioni', 'statistiche-ombrellone', 'statistiche-settore',
  'statistiche-durata', 'pagamenti-stripe', 'trasferimenti-stripe', 'log-sconti', 'log-cancellazioni',
  'flussi-cassa', 'contatori-albergo', 'contatori-voucher', 'magazzino', 'elementi', 'servizi',
  'settori', 'struttura', 'tariffe', 'capitaneria', 'esercizi', 'azienda', 'utenti',
  'tavoli', 'pointsale', 'ristorante',
];

function resolvePath(page) {
  if (page === 'struttura') return 'struttura.html';
  if (page === 'dashboard') return 'index.html';
  return `pages/${page}.html`;
}

function collectHtmlFiles() {
  const files = ['index.html', 'login.html', 'widget.html', 'struttura.html'];
  for (const f of readdirSync(join(DOCS, 'pages'))) {
    if (f.endsWith('.html')) files.push(`pages/${f}`);
  }
  return files;
}

function extractRefs(html, baseFile) {
  const refs = [];
  const hrefRe = /href=["']([^"'#]+)["']/gi;
  const srcRe = /src=["']([^"']+)["']/gi;
  let m;
  while ((m = hrefRe.exec(html))) refs.push({ type: 'href', ref: m[1] });
  while ((m = srcRe.exec(html))) refs.push({ type: 'src', ref: m[1] });
  return refs.map(({ type, ref }) => {
    if (ref.startsWith('http') || ref.startsWith('data:') || ref.startsWith('mailto:')) return null;
    const baseDir = baseFile.includes('/') ? join(DOCS, baseFile.split('/')[0]) : DOCS;
    const rel = ref.replace(/^\.\//, '').replace(/^\.\.\//, '');
    const local = baseFile.startsWith('pages/')
      ? join(DOCS, ref.startsWith('../') ? ref.slice(3) : join('pages', ref))
      : join(DOCS, ref);
    return { type, ref, local: resolve(local) };
  }).filter(Boolean);
}

async function fetchOk(base, path) {
  const url = `${base}/${path.replace(/\\/g, '/')}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  const errors = [];
  const bases = LIVE ? [LOCAL, LIVE] : [LOCAL];

  console.log('=== Rutas de navegación ===');
  for (const page of NAV_PAGES) {
    const path = resolvePath(page);
    if (!existsSync(join(DOCS, path))) {
      errors.push(`Ruta navegación inexistente: ${page} → ${path}`);
      console.log(`  ✗ ${page}`);
    } else {
      console.log(`  ✓ ${page} → ${path}`);
    }
  }

  console.log('\n=== Referencias locales en HTML ===');
  for (const file of collectHtmlFiles()) {
    const html = readFileSync(join(DOCS, file), 'utf8');
    for (const { ref, local } of extractRefs(html, file)) {
      if (!existsSync(local)) {
        errors.push(`${file}: ${ref} → no existe (${local})`);
      }
    }
  }
  if (!errors.length) console.log(`  ✓ ${collectHtmlFiles().length} archivos HTML sin enlaces rotos locales`);

  for (const base of bases) {
    const label = base === LIVE ? 'producción' : 'local';
    console.log(`\n=== HTTP ${label}: ${base} ===`);
    const toCheck = [
      'index.html', 'login.html', 'widget.html', 'struttura.html', 'manifest.webmanifest', 'sw.js',
      'css/dashboard.css', 'css/page.css', 'css/theme.css', 'js/lang-init.js', 'js/i18n/app.js',
      'js/i18n/pages.js', 'js/guida/es.js', ...NAV_PAGES.map(resolvePath),
    ];
    for (const p of toCheck) {
      const ok = await fetchOk(base, p);
      if (!ok) {
        errors.push(`${label} 404: ${p}`);
        console.log(`  ✗ ${p}`);
      } else {
        console.log(`  ✓ ${p}`);
      }
    }
  }

  console.log('\n=== Resumen ===');
  if (errors.length) {
    errors.forEach((e) => console.log(`  ✗ ${e}`));
    process.exit(1);
  }
  console.log('✅ Sin enlaces rotos ni 404 en rutas críticas');
}

main().catch((e) => { console.error(e); process.exit(1); });