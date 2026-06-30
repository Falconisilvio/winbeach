import { APP_I18N, APP_LANGS } from './i18n/app.js';

const STORAGE_KEY = 'winbeach-app-lang';

export function getAppLang() {
  return localStorage.getItem(STORAGE_KEY) || 'it';
}

export function setAppLang(code) {
  if (!APP_I18N[code]) return;
  localStorage.setItem(STORAGE_KEY, code);
  document.documentElement.lang = code;
  applyI18n(document);
  broadcastLang(code);
}

export function t(key) {
  const lang = getAppLang();
  return APP_I18N[lang]?.[key] ?? APP_I18N.it[key] ?? key;
}

export async function applyPageLabels(root = document) {
  try {
    const { applyPageI18n } = await import('./page-i18n.js');
    applyPageI18n();
  } catch { /* ignore */ }
}

export function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    const val = t(key);
    if (el.dataset.i18nHtml === '1') el.innerHTML = val;
    else el.textContent = val;
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  });
}

function broadcastLang(code) {
  const msg = { type: 'winbeach-lang-change', lang: code };
  document.querySelectorAll('iframe').forEach((f) => f.contentWindow?.postMessage(msg, '*'));
  window.dispatchEvent(new CustomEvent('winbeach-lang-change', { detail: { lang: code } }));
}

import { initToastBridge } from './winbeach-toast.js';
initToastBridge();

document.addEventListener('DOMContentLoaded', () => {
  const sel = document.getElementById('app-lang');
  if (sel) {
    APP_LANGS.forEach(({ code, label }) => {
      const o = document.createElement('option');
      o.value = code;
      o.textContent = label;
      sel.appendChild(o);
    });
    sel.value = getAppLang();
    sel.addEventListener('change', () => setAppLang(sel.value));
  }
  document.documentElement.lang = getAppLang();
  applyI18n(document);
  applyPageLabels();
});

export 

window.addEventListener('message', (e) => {
  if (e.data?.type === 'winbeach-lang-change') {
    localStorage.setItem(STORAGE_KEY, e.data.lang);
    applyI18n(document);
  }
});