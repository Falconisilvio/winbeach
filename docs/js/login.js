import { login, getSession } from './winbeach-auth.js';
import { t, onLangChange, applyAllI18n } from './app-i18n.js';

const params = new URLSearchParams(window.location.search);
const redirect = params.get('redirect') || 'index.html';

if (getSession()) {
  window.location.replace(redirect);
}

const form = document.getElementById('login-form');
const errorEl = document.getElementById('login-error');
const btn = document.getElementById('btn-submit');

function resetSubmitLabel() {
  if (btn) btn.textContent = t('login.submit');
}

onLangChange(() => applyAllI18n(document));
resetSubmitLabel();

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.classList.remove('show');
  btn.disabled = true;
  btn.textContent = t('common.loggingIn');

  const res = await login(
    document.getElementById('username').value,
    document.getElementById('password').value
  );

  btn.disabled = false;
  resetSubmitLabel();

  if (res.ok) {
    window.location.replace(redirect);
    return;
  }

  errorEl.textContent = res.error || t('common.accessDenied');
  errorEl.classList.add('show');
});