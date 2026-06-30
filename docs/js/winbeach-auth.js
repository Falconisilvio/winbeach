/**
 * Autenticación WinBeach — solo usuarios identificados pueden escribir.
 * Valida contra tabla utenti en githubDB (password_hash SHA-256).
 */
const SESSION_KEY = 'winbeach_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const WRITE_ROLES = new Set(['Amministratore', 'Operatore', 'Administratore', 'Operador']);

/** @returns {Promise<string>} */
export async function hashPassword(username, password) {
  const data = new TextEncoder().encode(`winbeach:${username}:${password}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** @returns {{id:number,username:string,ruolo:string,email:string,loginAt:number}|null} */
export function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s?.username || !s?.loginAt) return null;
    if (Date.now() - s.loginAt > SESSION_TTL_MS) {
      logout();
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getSession());
}

export function canWrite() {
  const s = getSession();
  return s && WRITE_ROLES.has(s.ruolo) && s.attivo !== false;
}

export function isAdmin() {
  const s = getSession();
  return s && (s.ruolo === 'Amministratore' || s.ruolo === 'Administratore');
}

function saveSession(user) {
  const session = {
    id: user.id,
    username: user.username,
    ruolo: user.ruolo,
    email: user.email || '',
    attivo: user.attivo !== false,
    loginAt: Date.now(),
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  broadcastAuthChange();
  return session;
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  broadcastAuthChange();
}

function broadcastAuthChange() {
  window.dispatchEvent(new CustomEvent('winbeach-auth-change'));
  try {
    const msg = { type: 'winbeach-auth-change' };
    window.parent?.postMessage(msg, '*');
    document.querySelectorAll('iframe').forEach((f) => f.contentWindow?.postMessage(msg, '*'));
  } catch { /* ignore */ }
}

export function onAuthChange(callback) {
  const handler = () => callback(getSession());
  window.addEventListener('winbeach-auth-change', handler);
  window.addEventListener('message', (e) => {
    if (e.data?.type === 'winbeach-auth-change') callback(getSession());
  });
  window.addEventListener('storage', (e) => {
    if (e.key === SESSION_KEY) callback(getSession());
  });
  return () => window.removeEventListener('winbeach-auth-change', handler);
}

/**
 * @returns {Promise<{ok:boolean, session?:object, error?:string}>}
 */
export async function login(username, password) {
  const user = String(username || '').trim();
  const pass = String(password || '');
  if (!user || !pass) return { ok: false, error: 'Inserisci utente e password.' };

  const { loadTable } = await import('./winbeach-db.js');
  const res = await loadTable('utenti');
  if (!res.ok) return { ok: false, error: res.error || 'Impossibile caricare utenti.' };

  const hash = await hashPassword(user, pass);
  const found = res.data.find(
    (u) => String(u.username).toLowerCase() === user.toLowerCase() && u.attivo !== false
  );

  if (!found) return { ok: false, error: 'Utente o password non validi.' };
  if (!found.password_hash) return { ok: false, error: 'Utente senza credenziali configurate.' };
  if (found.password_hash !== hash) return { ok: false, error: 'Utente o password non validi.' };

  const session = saveSession(found);
  return { ok: true, session };
}

/** Mensaje si no puede escribir; null si OK */
export function assertCanWrite() {
  if (!isAuthenticated()) {
    return 'Accedi per modificare i dati (menu utente in alto).';
  }
  const s = getSession();
  if (!WRITE_ROLES.has(s.ruolo)) {
    return `Il ruolo "${s.ruolo}" ha accesso in sola lettura.`;
  }
  return null;
}

export function assertAdmin() {
  if (!isAdmin()) return 'Solo gli amministratori possono eseguire questa operazione.';
  return null;
}

function ensureReadOnlyBanner() {
  if (document.getElementById('read-only-banner')) return;
  const b = document.createElement('div');
  b.id = 'read-only-banner';
  b.className = 'read-only-banner';
  const loginHref = /\/pages\//.test(window.location.pathname) ? '../login.html' : 'login.html';
  b.innerHTML = `<i class="fa-solid fa-lock"></i> Sola lettura — <a href="${loginHref}">Accedi</a> per modificare`;
  document.body.prepend(b);
}

/** Oculta controles de escritura si el usuario no está autorizado */
export function applyReadOnlyMode() {
  const write = canWrite();
  const admin = isAdmin();
  document.body.classList.toggle('read-only', !write);
  document.body.classList.toggle('auth-guest', !isAuthenticated());

  if (!write && !document.getElementById('read-only-banner') && !document.getElementById('user-auth')) {
    ensureReadOnlyBanner();
  }
  const banner = document.getElementById('read-only-banner');
  if (banner) banner.hidden = write;

  document.querySelectorAll('[data-requires-write]').forEach((el) => {
    el.hidden = !write;
  });
  document.querySelectorAll('[data-requires-admin]').forEach((el) => {
    el.hidden = !admin;
  });
  document.querySelectorAll('.actions-cell').forEach((el) => {
    el.style.display = write ? '' : 'none';
  });
}

export function userLabel() {
  const s = getSession();
  if (!s) return null;
  return `${s.username} (${s.ruolo})`;
}