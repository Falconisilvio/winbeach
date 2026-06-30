#!/usr/bin/env node
/**
 * Verifica responsive: viewport meta, overflow horizontal, menú móvil, módulos.
 */
import { chromium } from 'playwright';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.TEST_BASE || 'https://falconisilvio.github.io/winbeach';

const VIEWPORTS = [
  { name: 'iPhone 14', width: 390, height: 844 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'iPad landscape', width: 1024, height: 768 },
  { name: 'Desktop', width: 1440, height: 900 },
];

const PAGES = [
  { path: '/', checks: ['menuToggle', 'dashboard'] },
  { path: '/pages/clienti.html', checks: ['tableScroll', 'header'] },
  { path: '/pages/booking.html', checks: ['tableScroll', 'modal'] },
  { path: '/pages/cambia.html', checks: ['header'] },
  { path: '/struttura.html', checks: ['beachGrid'] },
];

const errors = [];
const warnings = [];

function fail(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }

function checkViewportMeta() {
  const pagesDir = join(__dirname, '../pages');
  const files = ['index.html', 'struttura.html', ...readdirSync(pagesDir).filter((f) => f.endsWith('.html'))];
  for (const f of files) {
    const p = f === 'index.html' || f === 'struttura.html' ? join(__dirname, '..', f) : join(pagesDir, f);
    const html = readFileSync(p, 'utf8');
    if (!html.includes('viewport') || !html.includes('width=device-width')) {
      fail(`${f}: falta meta viewport`);
    }
  }
}

async function checkOverflow(page, label) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return {
      scrollW: doc.scrollWidth,
      clientW: doc.clientWidth,
      bodyScrollW: document.body.scrollWidth,
    };
  });
  const maxW = Math.max(overflow.scrollW, overflow.bodyScrollW);
  const tolerance = 8;
  if (maxW > overflow.clientW + tolerance) {
    fail(`${label}: overflow horizontal ${maxW}px > ${overflow.clientW}px`);
    return false;
  }
  return true;
}

async function run() {
  console.log(`=== Test responsive — ${BASE} ===\n`);

  checkViewportMeta();
  console.log('✓ Meta viewport en todas las páginas HTML');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  for (const vp of VIEWPORTS) {
    console.log(`\n--- ${vp.name} (${vp.width}×${vp.height}) ---`);
    const page = await context.newPage();
    await page.setViewportSize({ width: vp.width, height: vp.height });

    for (const { path, checks } of PAGES) {
      const url = `${BASE}${path}`;
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      const label = `${vp.name} ${path}`;

      if (!(await checkOverflow(page, label))) continue;
      console.log(`  ✓ ${path} sin overflow`);

      if (path === '/' && checks.includes('menuToggle')) {
        const toggle = page.locator('#btn-menu-toggle');
        const visible = await toggle.isVisible();
        const display = await toggle.evaluate((el) => getComputedStyle(el).display);
        if (vp.width <= 1024) {
          if (!visible || display === 'none') fail(`${label}: menú hamburguesa no visible en ≤1024px`);
          else {
            await toggle.click();
            const menuOpen = await page.locator('#app-layout').evaluate((el) => el.classList.contains('menu-open'));
            if (!menuOpen) fail(`${label}: click menú no abre leftmenu`);
            else console.log('  ✓ menú hamburguesa abre leftmenu');
            await page.locator('#menu-overlay').click({ force: true });
            const closed = await page.locator('#app-layout').evaluate((el) => !el.classList.contains('menu-open'));
            if (!closed) fail(`${label}: menú no se cierra`);
            else console.log('  ✓ menú se cierra con overlay');
          }
        } else if (visible && display !== 'none') {
          warn(`${label}: menú hamburguesa visible en desktop (puede ser OK)`);
        }
      }

      if (checks.includes('tableScroll') && vp.width <= 768) {
        const hasScroll = await page.locator('.table-scroll').count();
        if (hasScroll) console.log('  ✓ tabla con scroll horizontal');
      }

      if (checks.includes('beachGrid')) {
        const grid = await page.locator('.beach-grid, .beach-container').count();
        if (!grid) fail(`${label}: cuadrícula playa no encontrada`);
        else console.log('  ✓ editor playa renderiza');
      }

      if (path === '/' && checks.includes('dashboard')) {
        const cards = await page.locator('.dashboard .card').count();
        if (cards < 5) fail(`${label}: dashboard con pocas cards (${cards})`);
        else console.log(`  ✓ dashboard ${cards} cards`);
      }
    }
    await page.close();
  }

  await browser.close();

  console.log('\n=== Resumen ===');
  if (warnings.length) warnings.forEach((w) => console.log(`  ⚠ ${w}`));
  if (errors.length) {
    errors.forEach((e) => console.log(`  ✗ ${e}`));
    process.exit(1);
  }
  console.log('✅ Responsive OK en todos los viewports probados');
}

run().catch((e) => { console.error('❌', e); process.exit(1); });