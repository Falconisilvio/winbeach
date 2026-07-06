/**
 * Autenticación WinBeach — solo usuarios identificados pueden escribir.
 * Valida contra tabla utenti en githubDB (password_hash SHA-256).
 * Login multi-stabilimento: cerca l'utente in tutti i profili disponibili.
 */
import { t } from './app-i18n.js';

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

function saveSession(user, profileId, profileName) {
  const session = {
    id: user.id,
    username: user.username,
    ruolo: user.ruolo,
    email: user.email || '',
    attivo: user.attivo !== false,
    loginAt: Date.now(),
    profileId: profileId || null,
    profileName: profileName || '',
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
 * Carica la tabella utenti da un profilo specifico senza modify il profilo attivo.
 */
async function loadTableFromProfile(profile, tableName) {
  const { GithubDB } = await import('./githubdb/client.js');
  const tokens = (() => {
    try { return JSON.parse(localStorage.getItem('winbeach_profile_tokens') || '{}'); } catch { return {}; }
  })();
  const db = new GithubDB({
    owner: profile.owner,
    repo: profile.repo,
    branch: profile.branch,
    token: tokens[profile.id] || null,
  });
  await db.refresh(profile.database);
  return (await db.table(profile.database, tableName)).objects();
}

/**
 * Login multi-stabilimento: cerca l'utente in tutti i profili disponibili.
 * Se trovato, imposta automaticamente il profilo attivo.
 * @returns {Promise<{ok:boolean, session?:object, profileName?:string, error?:string, errorKey?:string}>}
 */
export async function login(username, password) {
  const user = String(username || '').trim();
  const pass = String(password || '');
  if (!user || !pass) return { ok: false, errorKey: 'auth.loginMissing', error: t('auth.loginMissing') };

  const { getProfiles, setActiveProfile } = await import('./winbeach-db.js');
  const profiles = getProfiles();
  if (!profiles.length) return { ok: false, errorKey: 'auth.usersLoadFailed', error: t('auth.usersLoadFailed') };

  const hash = await hashPassword(user, pass);

  for (const profile of profiles) {
    try {
      const rows = await loadTableFromProfile(profile, 'utenti');
      const found = rows.find(
        (u) => String(u.username).toLowerCase() === user.toLowerCase() && u.attivo !== false
      );

      if (!found) continue;
      if (!found.password_hash) return { ok: false, errorKey: 'auth.noCredentials', error: t('auth.noCredentials') };
      if (found.password_hash !== hash) return { ok: false, errorKey: 'auth.invalidCredentials', error: t('auth.invalidCredentials') };

      // Utente trovato e autenticato in questo profilo
      setActiveProfile(profile.id);
      const session = saveSession(found, profile.id, profile.name);
      return { ok: true, session, profileName: profile.name };
    } catch {
      // Profilo non accessibile, prova il prossimo
      continue;
    }
  }

  return { ok: false, errorKey: 'auth.invalidCredentials', error: t('auth.invalidCredentials') };
}

/** Mensaje si no puede escribir; null si OK */
export function assertCanWrite() {
  if (!isAuthenticated()) {
    return t('auth.signInToEdit');
  }
  const s = getSession();
  if (!WRITE_ROLES.has(s.ruolo)) {
    return t('auth.roleReadonly').replace('{role}', s.ruolo);
  }
  return null;
}

export function assertAdmin() {
  if (!isAdmin()) return t('auth.adminOnly');
  return null;
}

function loginHrefForBanner() {
  return /\/pages\//.test(window.location.pathname) ? '../login.html' : 'login.html';
}

function updateReadOnlyBanner() {
  const banner = document.getElementById('read-only-banner');
  if (!banner) return;
  const href = loginHrefForBanner();
  banner.innerHTML = `<i class="fa-solid fa-lock"></i> ${t('auth.readonlyShort')} — <a href="${href}">${t('banner.readonlyLink')}</a> ${t('banner.readonlySuffix')}`;
}

function ensureReadOnlyBanner() {
  if (document.getElementById('read-only-banner')) {
    updateReadOnlyBanner();
    return;
  }
  const b = document.createElement('div');
  b.id = 'read-only-banner';
  b.className = 'read-only-banner';
  document.body.prepend(b);
  updateReadOnlyBanner();
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
  if (banner) {
    banner.hidden = write;
    if (!write) updateReadOnlyBanner();
  }

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

function onLangRefreshAuth() {
  updateReadOnlyBanner();
  applyReadOnlyMode();
}

window.addEventListener('winbeach-lang-change', onLangRefreshAuth);
window.addEventListener('message', (e) => {
  if (e.data?.type === 'winbeach-lang-change') onLangRefreshAuth();
});