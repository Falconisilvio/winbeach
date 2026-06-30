import { APP_I18N, APP_LANGS } from './i18n/app.js';

const STORAGE_KEY = 'winbeach-app-lang';
const langListeners = new Set();

export function getAppLang() {
  return localStorage.getItem(STORAGE_KEY) || 'it';
}

export function t(key) {
  const lang = getAppLang();
  return APP_I18N[lang]?.[key] ?? APP_I18N.it[key] ?? key;
}

function broadcastLang(code) {
  const msg = { type: 'winbeach-lang-change', lang: code };
  document.querySelectorAll('iframe').forEach((f) => {
    try { f.contentWindow?.postMessage(msg, '*'); } catch { /* ignore */ }
  });
  window.dispatchEvent(new CustomEvent('winbeach-lang-change', { detail: { lang: code } }));
}

export async function applyAllI18n(root = document) {
  applyI18n(root);
  try {
    const { applyPageI18n } = await import('./page-i18n.js');
    applyPageI18n();
  } catch { /* ignore */ }
}

export function setAppLang(code) {
  if (!APP_I18N[code]) return;
  localStorage.setItem(STORAGE_KEY, code);
  document.documentElement.lang = code;
  applyAllI18n(document);
  broadcastLang(code);
  langListeners.forEach((fn) => { try { fn(code); } catch { /* ignore */ } });
}

export function onLangChange(fn) {
  langListeners.add(fn);
  return () => langListeners.delete(fn);
}

export async function applyPageLabels() {
  try {
    const { applyPageI18n } = await import('./page-i18n.js');
    applyPageI18n();
  } catch { /* ignore */ }
}

export function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    const val = t(key);
    if (val === key && !APP_I18N.it[key]) return;
    if (el.dataset.i18nHtml === '1') el.innerHTML = val;
    else el.textContent = val;
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.setAttribute('title', t(el.dataset.i18nTitle));
  });
}

if (typeof window !== 'undefined') {
  window.__wbT = t;
  window.__wbSetLang = setAppLang;
  window.__wbOnLangChange = onLangChange;
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
  const loginSel = document.getElementById('login-lang');
  if (loginSel && !loginSel.options.length) {
    APP_LANGS.forEach(({ code, label }) => {
      const o = document.createElement('option');
      o.value = code;
      o.textContent = label;
      loginSel.appendChild(o);
    });
    loginSel.value = getAppLang();
    loginSel.addEventListener('change', () => setAppLang(loginSel.value));
  }
  document.documentElement.lang = getAppLang();
  applyAllI18n(document);
});

window.addEventListener('message', (e) => {
  if (e.data?.type === 'winbeach-lang-change') {
    localStorage.setItem(STORAGE_KEY, e.data.lang);
    document.documentElement.lang = e.data.lang;
    applyAllI18n(document);
  }
});

window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY && e.newValue) {
    document.documentElement.lang = e.newValue;
    applyAllI18n(document);
  }
});

export { broadcastLang };