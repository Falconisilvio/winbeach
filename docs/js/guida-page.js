import { GUIDE_I18N, GUIDE_LANGS } from './guida/index.js';
import { getLang as getAppLang, setLang as setAppLang, getGuideLang, setGuideLang } from './winbeach-settings.js';

const STORAGE_KEY = 'winbeach-guide-lang';
const APP_LANG_KEY = 'winbeach-app-lang';

function getLangFromUrl() {
  const p = new URLSearchParams(window.location.search).get('lang');
  return p && GUIDE_I18N[p] ? p : null;
}

function getLang() {
  return getLangFromUrl()
    || getGuideLang()
    || localStorage.getItem(APP_LANG_KEY)
    || localStorage.getItem(STORAGE_KEY)
    || 'it';
}

async function setLang(lang) {
  if (!GUIDE_I18N[lang]) return;
  localStorage.setItem(STORAGE_KEY, lang);
  localStorage.setItem(APP_LANG_KEY, lang);
  await setGuideLang(lang);
  await setAppLang(lang);
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

  window.addEventListener('message', (e) => {
    if (e.data?.type === 'winbeach-lang-change' && GUIDE_I18N[e.data.lang]) {
      setLang(e.data.lang);
    }
  });
  window.addEventListener('storage', (e) => {
    if (e.key === APP_LANG_KEY && GUIDE_I18N[e.newValue]) setLang(e.newValue);
  });
});