#!/usr/bin/env node
/**
 * Verifica que todas las páginas HTML cargan theme-init.js
 */
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS = join(__dirname, '..');

function collectHtml(dir, base = '') {
  const out = [];
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${f.name}` : f.name;
    if (f.isDirectory() && f.name !== 'pages') continue;
    if (f.isDirectory()) {
      out.push(...collectHtml(join(dir, f.name), rel));
    } else if (f.name.endsWith('.html')) {
      out.push(rel);
    }
  }
  return out;
}

const pagesDir = join(DOCS, 'pages');
const pages = readdirSync(pagesDir).map((f) => `pages/${f}`).filter((p) => p.endsWith('.html'));
const root = ['index.html', 'login.html', 'widget.html', 'struttura.html'];
const all = [...root, ...pages];

const missing = [];
for (const file of all) {
  const html = readFileSync(join(DOCS, file), 'utf8');
  if (!html.includes('theme-init.js')) missing.push(file);
  const usesPage = html.includes('page.css') || html.includes('dashboard.css')
    || html.includes('widget.css') || html.includes('struttura.css');
  if (usesPage && !html.match(/theme\.css|page\.css|dashboard\.css|widget\.css|struttura\.css/)) {
    missing.push(`${file} (sin CSS tema)`);
  }
}

if (missing.length) {
  console.error('Páginas sin theme-init.js:');
  missing.forEach((m) => console.error(`  ✗ ${m}`));
  process.exit(1);
}

console.log(`✅ ${all.length} páginas HTML con theme-init.js`);