import { APP_I18N, APP_LANGS } from './i18n/app.js';

const STORAGE_KEY = 'winbeach-app-lang';
const langListeners = new Set();

export function getAppLang() {
  return localStorage.getItem(STORAGE_KEY) || 'it';
}

export function t(key, params) {
  const lang = getAppLang();
  let s = APP_I18N[lang]?.[key] ?? APP_I18N.it[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      s = s.replaceAll(`{${k}}`, String(v));
    }
  }
  return s;
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

function closeLangDropdown(dropdown, btn) {
  if (!dropdown) return;
  dropdown.classList.remove('open');
  dropdown.hidden = true;
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

function initLangSwitcher(btnId, dropdownId) {
  const btn = document.getElementById(btnId);
  const dropdown = document.getElementById(dropdownId);
  if (!btn || !dropdown || btn.dataset.langInit === '1') return;
  btn.dataset.langInit = '1';

  const labelEl = btn.querySelector('.lang-btn-label');

  const syncUi = (code) => {
    const found = APP_LANGS.find((l) => l.code === code) || APP_LANGS[0];
    if (labelEl && found) labelEl.textContent = found.label;
    dropdown.querySelectorAll('.lang-option').forEach((opt) => {
      const active = opt.dataset.lang === code;
      opt.classList.toggle('active', active);
      opt.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  };

  dropdown.innerHTML = APP_LANGS.map(({ code, label }) => `
    <button type="button" class="lang-option" data-lang="${code}" role="option" aria-selected="false">${label}</button>
  `).join('');

  syncUi(getAppLang());

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const willOpen = !dropdown.classList.contains('open');
    document.querySelectorAll('.lang-dropdown.open').forEach((d) => {
      if (d !== dropdown) {
        const b = d.closest('.lang-switcher')?.querySelector('.lang-btn');
        closeLangDropdown(d, b);
      }
    });
    if (willOpen) {
      dropdown.classList.add('open');
      dropdown.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
    } else {
      closeLangDropdown(dropdown, btn);
    }
  });

  dropdown.querySelectorAll('.lang-option').forEach((opt) => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      setAppLang(opt.dataset.lang);
      syncUi(opt.dataset.lang);
      closeLangDropdown(dropdown, btn);
    });
  });

  onLangChange(syncUi);
}

document.addEventListener('click', () => {
  document.querySelectorAll('.lang-dropdown.open').forEach((dropdown) => {
    const switcher = dropdown.closest('.lang-switcher');
    const btn = switcher?.querySelector('.lang-btn');
    closeLangDropdown(dropdown, btn);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  initLangSwitcher('app-lang-btn', 'app-lang-dropdown');
  initLangSwitcher('login-lang-btn', 'login-lang-dropdown');
  document.documentElement.lang = getAppLang();
  applyAllI18n(document);
});

window.addEventListener('message', (e) => {
  if (e.data?.type === 'winbeach-lang-change') {
    localStorage.setItem(STORAGE_KEY, e.data.lang);
    document.documentElement.lang = e.data.lang;
    applyAllI18n(document);
    const label = APP_LANGS.find((l) => l.code === e.data.lang)?.label;
    if (label) {
      document.querySelectorAll('.lang-btn-label').forEach((el) => { el.textContent = label; });
    }
  }
});

window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY && e.newValue) {
    document.documentElement.lang = e.newValue;
    applyAllI18n(document);
    const label = APP_LANGS.find((l) => l.code === e.newValue)?.label;
    if (label) {
      document.querySelectorAll('.lang-btn-label').forEach((el) => { el.textContent = label; });
    }
  }
});

export { broadcastLang };