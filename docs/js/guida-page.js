import { GUIDE_I18N, GUIDE_LANGS } from './guida/index.js';

const STORAGE_KEY = 'winbeach-guide-lang';

function getLangFromUrl() {
  const p = new URLSearchParams(window.location.search).get('lang');
  return p && GUIDE_I18N[p] ? p : null;
}

function getLang() {
  return getLangFromUrl() || localStorage.getItem(STORAGE_KEY) || 'it';
}

function setLang(lang) {
  if (!GUIDE_I18N[lang]) return;
  localStorage.setItem(STORAGE_KEY, lang);
  render(lang);
  document.querySelectorAll('.guide-lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
    btn.setAttribute('aria-pressed', btn.dataset.lang === lang ? 'true' : 'false');
  });
}

function render(lang) {
  const pack = GUIDE_I18N[lang];
  if (!pack) return;
  document.documentElement.lang = pack.meta.lang;
  document.title = pack.meta.title;
  const header = document.getElementById('guide-header');
  const subtitle = document.getElementById('guide-subtitle');
  const content = document.getElementById('guide-content');
  if (header) header.innerHTML = pack.meta.header;
  if (subtitle) subtitle.textContent = pack.meta.subtitle;
  if (content) content.innerHTML = pack.html;
}

document.addEventListener('DOMContentLoaded', () => {
  const bar = document.getElementById('guide-lang-bar');
  if (bar) {
    GUIDE_LANGS.forEach(({ code, label }) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'guide-lang-btn';
      btn.dataset.lang = code;
      btn.textContent = label;
      btn.setAttribute('aria-pressed', 'false');
      btn.addEventListener('click', () => setLang(code));
      bar.appendChild(btn);
    });
  }
  const initial = getLang();
  setLang(initial);
});