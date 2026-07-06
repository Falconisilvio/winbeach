/**
 * Tema claro/oscuro — persistencia, toggle, sync iframes.
 */
import { getTheme as getSettingsTheme, setTheme as setSettingsTheme, syncSettingsFromDb } from './winbeach-settings.js';

export const THEME_KEY = 'winbeach_theme';

let cachedTheme = null;

export function getTheme() {
  if (cachedTheme) return cachedTheme;
  const t = document.documentElement.getAttribute('data-theme');
  const settingsTheme = getSettingsTheme();
  cachedTheme = settingsTheme || (t === 'dark' ? 'dark' : 'light');
  return cachedTheme;
}

syncSettingsFromDb().then(() => {
  const newTheme = getSettingsTheme();
  if (newTheme && newTheme !== cachedTheme) {
    cachedTheme = newTheme;
    document.documentElement.setAttribute('data-theme', newTheme);
  }
}).catch(() => {});

function updateMetaThemeColor() {
  const dark = getTheme() === 'dark';
  const color = dark ? '#1a2332' : '#0084ff';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
}

function broadcastTheme(theme) {
  const msg = { type: 'winbeach-theme-change', theme };
  window.dispatchEvent(new CustomEvent('winbeach-theme-change', { detail: { theme } }));
  try {
    window.parent?.postMessage(msg, '*');
  } catch { /* ignore */ }
  document.querySelectorAll('iframe').forEach((f) => {
    try { f.contentWindow?.postMessage(msg, '*'); } catch { /* ignore */ }
  });
}

export async function setTheme(theme, { broadcast = true } = {}) {
  const next = theme === 'dark' ? 'dark' : 'light';
  cachedTheme = next;
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);
  updateMetaThemeColor();
  updateToggleUi();
  if (broadcast) broadcastTheme(next);
  
  try {
    await setSettingsTheme(next);
  } catch { /* ignore */ }
}

export function toggleTheme() {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

export function onThemeChange(cb) {
  const handler = (e) => cb(e.detail?.theme ?? getTheme());
  window.addEventListener('winbeach-theme-change', handler);
  return () => window.removeEventListener('winbeach-theme-change', handler);
}

function updateToggleUi() {
  const dark = getTheme() === 'dark';
  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = dark ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    }
    btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    const label = btn.dataset.themeLabel;
    if (label) btn.setAttribute('aria-label', label);
  });
}

export function initThemeUi() {
  updateMetaThemeColor();
  updateToggleUi();

  document.getElementById('btn-theme-toggle')?.addEventListener('click', toggleTheme);

  window.addEventListener('message', (e) => {
    if (e.data?.type === 'winbeach-theme-change') {
      setTheme(e.data.theme, { broadcast: false });
    }
  });

  window.addEventListener('storage', (e) => {
    if (e.key === THEME_KEY) setTheme(e.newValue, { broadcast: false });
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_KEY)) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
}

/** Colores Chart.js según tema activo */
export function chartThemeOptions() {
  const dark = getTheme() === 'dark';
  const text = dark ? '#94a3b8' : '#666666';
  const grid = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  return {
    plugins: {
      legend: {
        labels: { color: text },
      },
    },
    scales: {
      x: {
        ticks: { color: text },
        grid: { color: grid },
      },
      y: {
        ticks: { color: text },
        grid: { color: grid },
      },
    },
  };
}

export function applyChartTheme(chart) {
  if (!chart?.options) return;
  const t = chartThemeOptions();
  if (chart.options.plugins?.legend?.labels) {
    Object.assign(chart.options.plugins.legend.labels, t.plugins.legend.labels);
  }
  ['x', 'y'].forEach((axis) => {
    if (chart.options.scales?.[axis]) {
      if (chart.options.scales[axis].ticks) {
        chart.options.scales[axis].ticks.color = t.scales[axis].ticks.color;
      }
      if (chart.options.scales[axis].grid) {
        chart.options.scales[axis].grid.color = t.scales[axis].grid.color;
      }
    }
  });
  chart.update();
}