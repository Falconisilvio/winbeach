/**
 * Traducciones de módulos (páginas iframe) según slug URL.
 */
import { getAppLang, t } from './app-i18n.js';

const SLUG_ALIASES = {
  'struttura.html': 'struttura',
};

export function getPageSlug() {
  const file = window.location.pathname.split('/').pop() || '';
  if (SLUG_ALIASES[file]) return SLUG_ALIASES[file];
  return file.replace(/\.html$/, '');
}

function setH2Title(title) {
  const h2 = document.querySelector('.header h2');
  if (!h2 || !title) return;
  const icon = h2.querySelector('i');
  h2.textContent = '';
  if (icon) h2.appendChild(icon.cloneNode(true));
  h2.appendChild(document.createTextNode(` ${title}`));
}

export function applyPageI18n() {
  const slug = getPageSlug();
  const titleKey = `page.${slug}.title`;
  const subKey = `page.${slug}.subtitle`;
  const docKey = `page.${slug}.docTitle`;

  const title = t(titleKey);
  if (title !== titleKey) {
    setH2Title(title);
    const doc = t(docKey);
    if (doc !== docKey) document.title = doc;
  }

  const sub = t(subKey);
  const subEl = document.querySelector('.subtitle') || document.getElementById('page-subtitle');
  if (subEl && sub !== subKey) subEl.textContent = sub;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    const val = t(key);
    if (val === key) return;
    if (el.dataset.i18nHtml === '1') el.innerHTML = val;
    else el.textContent = val;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const val = t(el.dataset.i18nPlaceholder);
    if (val !== el.dataset.i18nPlaceholder) el.placeholder = val;
  });
}

let listenersBound = false;

export function initPageI18n() {
  document.documentElement.lang = getAppLang();
  applyPageI18n();
  if (listenersBound) return;
  listenersBound = true;
  window.addEventListener('winbeach-lang-change', applyPageI18n);
  window.addEventListener('message', (e) => {
    if (e.data?.type === 'winbeach-lang-change') applyPageI18n();
  });
}