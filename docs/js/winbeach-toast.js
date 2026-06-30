const TOAST_KEY = 'winbeach-toast-root';

function ensureContainer() {
  let root = document.getElementById(TOAST_KEY);
  if (!root) {
    root = document.createElement('div');
    root.id = TOAST_KEY;
    root.className = 'wb-toast-root';
    root.setAttribute('aria-live', 'polite');
    document.body.appendChild(root);
  }
  return root;
}

/**
 * @param {'success'|'error'|'info'|'warn'} type
 * @param {string} message
 * @param {number} [ms]
 */
export function showToast(type, message, ms = 4000) {
  if (!message) return;
  const root = ensureContainer();
  const el = document.createElement('div');
  el.className = `wb-toast wb-toast-${type}`;
  el.innerHTML = `<span>${escapeHtml(message)}</span><button type="button" class="wb-toast-close" aria-label="Chiudi">&times;</button>`;
  const close = () => {
    el.classList.add('wb-toast-out');
    setTimeout(() => el.remove(), 200);
  };
  el.querySelector('.wb-toast-close')?.addEventListener('click', close);
  root.appendChild(el);
  setTimeout(close, ms);
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function initToastBridge() {
  window.addEventListener('winbeach-db-status', (e) => {
    const { state, message } = e.detail || {};
    if (!message) return;
    const m = message.toLowerCase();
    if (state === 'ok' && /salvat|guardad|eliminat|creato|aggiornat/i.test(m)) {
      showToast('success', message, 3500);
    } else if (state === 'error') {
      showToast('error', message, 6000);
    }
  });

  window.addEventListener('message', (e) => {
    if (e.data?.type === 'winbeach-toast') {
      showToast(e.data.toastType || 'info', e.data.message);
    }
  });
}

/** Invia toast al parent (iframe → dashboard). */
export function notifyParent(type, message) {
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'winbeach-toast', toastType: type, message }, '*');
  } else {
    showToast(type, message);
  }
}