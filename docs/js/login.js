import { login, getSession } from './winbeach-auth.js';

const params = new URLSearchParams(window.location.search);
const redirect = params.get('redirect') || 'index.html';

if (getSession()) {
  window.location.replace(redirect);
}

const form = document.getElementById('login-form');
const errorEl = document.getElementById('login-error');
const btn = document.getElementById('btn-submit');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.classList.remove('show');
  btn.disabled = true;
  btn.textContent = 'Accesso…';

  const res = await login(
    document.getElementById('username').value,
    document.getElementById('password').value
  );

  btn.disabled = false;
  btn.textContent = 'Entra';

  if (res.ok) {
    window.location.replace(redirect);
    return;
  }

  errorEl.textContent = res.error || 'Accesso negato.';
  errorEl.classList.add('show');
});