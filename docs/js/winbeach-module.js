/**
 * Utilidades compartidas para módulos WinBeach
 */
import { getDbStatus, getActiveProfile, getToken, onProfileChange } from './winbeach-db.js';

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

export function badge(text, type = 'green') {
  return `<span class="badge badge-${type}">${escapeHtml(text)}</span>`;
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

export function initModule(loadFn) {
  onProfileChange(loadFn);
  document.addEventListener('DOMContentLoaded', loadFn);
}

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