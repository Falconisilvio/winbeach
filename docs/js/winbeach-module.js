/**
 * Utilidades compartidas para módulos WinBeach
 */
import { getDbStatus, getActiveProfile, getToken, onProfileChange } from './winbeach-db.js';
import { assertCanWrite, canWrite, applyReadOnlyMode, onAuthChange, userLabel, isAuthenticated } from './winbeach-auth.js';

export function $(id) {
  return document.getElementById(id);
}

export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function formatDate(iso) {
  if (!iso) return '—';
  const d = String(iso).slice(0, 10).split('-');
  if (d.length !== 3) return iso;
  return `${d[2]}/${d[1]}/${d[0]}`;
}

export function formatEuro(n) {
  const v = Number(n) || 0;
  return v.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function tomorrowIso() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function nowIso() {
  return new Date().toISOString();
}

export function updateDbBar() {
  const el = $('db-status');
  if (!el) return;
  const { state, message } = getDbStatus();
  const profile = getActiveProfile();
  const prefix = profile ? `${profile.name} · ` : '';
  el.className = `db-status ${state}`;
  el.textContent = message ? prefix + message : prefix + 'Pronto';
}

export function requireToken() {
  if (!getToken()) {
    alert('Configura il token GitHub in Cambia stabilimento o Struttura prima di salvare.');
    return false;
  }
  return true;
}

/** Usuario identificado + permiso de escritura + token GitHub */
export function requireWrite() {
  const authErr = assertCanWrite();
  if (authErr) {
    alert(authErr + '\n\nVai su Login per autenticarti.');
    return false;
  }
  if (!getToken()) {
    alert('Configura il token GitHub in Cambia stabilimento prima di salvare.');
    return false;
  }
  return true;
}

export function badge(text, type = 'green') {
  return `<span class="badge badge-${type}">${escapeHtml(text)}</span>`;
}

/** Navigazione verso un modulo (da iframe verso dashboard parent). */
export function navigateApp(page, opts = {}) {
  const msg = { type: 'winbeach-navigate', page, q: opts.q || '', cella: opts.cella || null };
  if (window.parent !== window) {
    window.parent.postMessage(msg, '*');
  } else {
    const q = opts.q ? `?q=${encodeURIComponent(opts.q)}` : '';
    window.location.href = `../index.html#${page}${q}`;
  }
}

export function bindModal(overlayId, closeIds, onSubmit) {
  const overlay = $(overlayId);
  closeIds.forEach((id) => $(id)?.addEventListener('click', () => overlay?.classList.remove('open')));
  overlay?.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });
  if (onSubmit) {
    const form = overlay?.querySelector('form');
    form?.addEventListener('submit', onSubmit);
  }
}

function refreshModule(loadFn) {
  applyReadOnlyMode();
  loadFn();
}

export function initModule(loadFn) {
  const boot = async () => {
    try {
      const { applyI18n } = await import('./app-i18n.js');
      applyI18n(document);
      const { initPageI18n } = await import('./page-i18n.js');
      initPageI18n();
    } catch { /* dashboard only */ }
    if (!window.__wbToastInit) {
      try {
        const { initToastBridge } = await import('./winbeach-toast.js');
        initToastBridge();
        window.__wbToastInit = true;
      } catch { /* ignore */ }
    }
    refreshModule(loadFn);
  };
  onProfileChange(boot);
  onAuthChange(boot);
  window.addEventListener('message', (e) => {
    if (e.data?.type === 'winbeach-profile-change' || e.data?.type === 'winbeach-auth-change') {
      boot();
    }
    if (e.data?.type === 'winbeach-lang-change') {
      import('./app-i18n.js').then((m) => m.applyI18n(document)).catch(() => {});
      import('./page-i18n.js').then((m) => m.applyPageI18n()).catch(() => {});
    }
    if (e.data?.type === 'winbeach-theme-change') {
      import('./winbeach-theme.js').then((m) => m.setTheme(e.data.theme, { broadcast: false })).catch(() => {});
    }
  });
  window.addEventListener('winbeach-lang-change', () => {
    import('./app-i18n.js').then((m) => {
      m.applyI18n(document);
      m.applyPageLabels(document);
    }).catch(() => {});
  });
  window.addEventListener('storage', (e) => {
    if (e.key === 'winbeach_active_profile' || e.key === 'winbeach_profiles' || e.key === 'winbeach_session' || e.key === 'winbeach-app-lang') {
      boot();
    }
    if (e.key === 'winbeach_theme') {
      import('./winbeach-theme.js').then((m) => m.setTheme(e.newValue, { broadcast: false })).catch(() => {});
    }
  });
  document.addEventListener('DOMContentLoaded', boot);
}

export { canWrite, applyReadOnlyMode, userLabel, isAuthenticated };

export function clienteLabel(c) {
  if (!c) return '—';
  return [c.nome, c.cognome].filter(Boolean).join(' ').trim() || `#${c.id}`;
}

export function pagamentoBadge(stato) {
  const map = {
    saldato: ['green', 'Saldato'],
    parziale: ['orange', 'Parziale'],
    da_saldare: ['red', 'Da saldare'],
  };
  const [t, l] = map[stato] || ['gray', stato || '—'];
  return badge(l, t);
}

export function statoPrenBadge(stato) {
  const map = {
    confermata: ['green', 'Confermata'],
    in_attesa: ['orange', 'In attesa'],
    cancellata: ['red', 'Cancellata'],
  };
  const [t, l] = map[stato] || ['gray', stato || '—'];
  return badge(l, t);
}