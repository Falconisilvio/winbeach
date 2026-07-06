import { login, getSession } from './winbeach-auth.js';
import { t, onLangChange, applyI18n, bootLangUi } from './app-i18n.js';

const params = new URLSearchParams(window.location.search);
const redirect = params.get('redirect') || 'index.html';

if (getSession()) {
  window.location.replace(redirect);
}

const form = document.getElementById('login-form');
const errorEl = document.getElementById('login-error');
const btn = document.getElementById('btn-submit');
let lastErrorKey = null;

function applyLoginI18n() {
  applyI18n(document);
  const title = t('login.docTitle');
  if (title !== 'login.docTitle') document.title = title;
  resetSubmitLabel();
  if (errorEl?.classList.contains('show') && lastErrorKey) {
    errorEl.textContent = t(lastErrorKey);
  }
}

function resetSubmitLabel() {
  if (btn && !btn.disabled) btn.textContent = t('login.submit');
}

bootLangUi();
applyLoginI18n();
onLangChange(applyLoginI18n);

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.classList.remove('show');
  lastErrorKey = null;
  btn.disabled = true;
  btn.textContent = t('common.loggingIn');

  const res = await login(
    document.getElementById('username').value,
    document.getElementById('password').value
  );

  btn.disabled = false;
  resetSubmitLabel();

  if (res.ok) {
    if (res.profileName) {
      errorEl.textContent = `${t('login.loginOk')} ${res.profileName}`;
      errorEl.className = 'login-error show';
      errorEl.style.background = '#f0fff4';
      errorEl.style.color = '#276749';
    }
    setTimeout(() => { window.location.replace(redirect); }, res.profileName ? 800 : 0);
    return;
  }

  lastErrorKey = res.errorKey || null;
  errorEl.textContent = lastErrorKey ? t(lastErrorKey) : (res.error || t('common.accessDenied'));
  errorEl.classList.add('show');
});