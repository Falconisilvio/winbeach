#!/usr/bin/env node
/**
 * Suite completa: unit tests + HTTP local + sintaxis.
 */
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS = join(__dirname, '..');
const PORT = process.env.TEST_PORT || '3456';
const BASE = `http://127.0.0.1:${PORT}`;

const unitTests = [
  'test-export.mjs',
  'test-booking-overlap.mjs',
  'test-chart-history.mjs',
  'test-guida-i18n.mjs',
  'test-i18n.mjs',
  'test-auth.mjs',
  'test-theme.mjs',
];

function runNode(script, env = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn('node', [join(__dirname, script)], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, ...env },
    });
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${script} exit ${code}`))));
  });
}

function startServer() {
  return new Promise((resolve, reject) => {
    const p = spawn('npx', ['--yes', 'serve', DOCS, '-l', PORT], {
      stdio: 'pipe',
      shell: true,
    });
    let started = false;
    const done = () => {
      if (!started) { started = true; resolve(p); }
    };
    p.stdout?.on('data', (d) => { if (String(d).includes('Accepting')) done(); });
    p.stderr?.on('data', () => {});
    setTimeout(done, 4000);
    p.on('error', reject);
  });
}

async function testAssets() {
  console.log('\n=== Assets críticos ===\n');
  const required = [
    'widget.html', 'manifest.webmanifest', 'sw.js', 'icons/icon.svg',
    'js/widget.js', 'js/winbeach-export.js', 'js/winbeach-pwa.js',
    'js/app-i18n.js', 'js/i18n/app.js', 'js/winbeach-toast.js', 'js/winbeach-pdf.js',
    'js/theme-init.js', 'js/lang-init.js', 'js/page-i18n.js', 'js/winbeach-theme.js', 'css/theme.css', 'css/dark-mode.css',
    'css/widget.css',
  ];
  for (const f of required) {
    if (!existsSync(join(DOCS, f))) throw new Error(`Missing ${f}`);
    console.log(`  ✓ ${f}`);
  }
}

async function main() {
  console.log('=== WinBeach test suite ===');
  await testAssets();

  for (const t of unitTests) {
    console.log(`\n--- ${t} ---`);
    await runNode(t);
  }

  console.log('\n--- Avvio server locale ---');
  const server = await startServer();
  try {
    await runNode('test-links.mjs', { TEST_BASE: BASE });
    await runNode('test-web.mjs', { TEST_BASE: BASE });
  } finally {
    server.kill();
  }

  if (process.env.TEST_LIVE) {
    console.log('\n--- test-multi-db (live) ---');
    await runNode('test-multi-db.mjs');
  }

  console.log('\n✅ All tests passed');
}

main().catch((e) => {
  console.error('\n❌', e.message || e);
  process.exit(1);
});