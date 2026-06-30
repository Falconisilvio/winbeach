import {
  loadPrenotazioniFromDb,
  loadClientiFromDb,
  loadTable,
  onProfileChange,
} from './winbeach-db.js';

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function clienteLabel(c) {
  if (!c) return '—';
  return [c.nome, c.cognome].filter(Boolean).join(' ').trim() || `#${c.id}`;
}

let cache = null;
let debounceTimer = null;

async function ensureData() {
  if (cache) return cache;
  const [prenRes, cliRes, voucherRes, hotelRes] = await Promise.all([
    loadPrenotazioniFromDb(),
    loadClientiFromDb(),
    loadTable('voucher'),
    loadTable('contatori_albergo'),
  ]);
  cache = {
    prenotazioni: prenRes.ok ? prenRes.data : [],
    clienti: cliRes.ok ? cliRes.data : [],
    voucher: voucherRes.ok ? voucherRes.data : [],
    hotel: hotelRes.ok ? hotelRes.data : [],
  };
  return cache;
}

function invalidateCache() {
  cache = null;
}

function matches(q, ...parts) {
  const hay = parts.filter(Boolean).join(' ').toLowerCase();
  return hay.includes(q);
}

function buildResults(q) {
  const data = cache;
  if (!data) return [];
  const results = [];
  const limit = 12;

  for (const c of data.clienti) {
    if (results.length >= limit) break;
    if (matches(q, c.nome, c.cognome, c.email, c.telefono, String(c.id))) {
      results.push({
        type: 'cliente',
        page: 'clienti',
        label: clienteLabel(c),
        meta: [c.email, c.telefono].filter(Boolean).join(' · ') || `ID ${c.id}`,
        q: clienteLabel(c),
      });
    }
  }

  for (const p of data.prenotazioni) {
    if (results.length >= limit) break;
    if (p.stato === 'cancellata') continue;
    const name = clienteLabel(p.cliente);
    if (matches(q, name, String(p.id), String(p.cella), p.note)) {
      results.push({
        type: 'prenotazione',
        page: 'booking',
        label: `#${p.id} — ${name}`,
        meta: `Post. ${p.cella || '—'} · ${String(p.data_inizio).slice(0, 10)}`,
        q: String(p.id),
      });
    }
  }

  for (const v of data.voucher) {
    if (results.length >= limit) break;
    if (matches(q, v.codice, String(v.id))) {
      results.push({
        type: 'voucher',
        page: 'contatori-voucher',
        label: v.codice,
        meta: `Emessi ${v.emessi} · utilizzati ${v.utilizzati}`,
        q: v.codice,
      });
    }
  }

  for (const h of data.hotel) {
    if (results.length >= limit) break;
    if (matches(q, h.albergo, h.codice, String(h.id))) {
      results.push({
        type: 'hotel',
        page: 'contatori-albergo',
        label: h.albergo,
        meta: `Codice ${h.codice} · ${h.utilizzato}/${h.totale}`,
        q: h.albergo || h.codice,
      });
    }
  }

  if (/^\d+$/.test(q)) {
    const n = Number(q);
    const hasPost = results.some((r) => r.type === 'prenotazione' && r.q === q);
    if (!hasPost && data.prenotazioni.some((p) => p.cella === n && p.stato !== 'cancellata')) {
      results.unshift({
        type: 'postazione',
        page: 'spiaggia',
        label: `Postazione ${n}`,
        meta: 'Vista mappa spiaggia',
        q: null,
      });
    }
  }

  return results.slice(0, limit);
}

const TYPE_ICON = {
  cliente: 'fa-user',
  prenotazione: 'fa-calendar-days',
  voucher: 'fa-ticket',
  hotel: 'fa-hotel',
  postazione: 'fa-umbrella-beach',
};

const TYPE_LABEL = {
  cliente: 'Cliente',
  prenotazione: 'Prenotazione',
  voucher: 'Voucher',
  hotel: 'Hotel',
  postazione: 'Postazione',
};

function renderDropdown(listEl, items, q) {
  if (!items.length) {
    listEl.innerHTML = `<div class="search-dropdown-empty">Nessun risultato per «${escapeHtml(q)}»</div>`;
    listEl.hidden = false;
    return;
  }
  listEl.innerHTML = items.map((item) => `
    <button type="button" class="search-result" data-page="${escapeHtml(item.page)}" data-q="${escapeHtml(item.q || '')}">
      <span class="search-result-icon"><i class="fa-solid ${TYPE_ICON[item.type]}"></i></span>
      <span class="search-result-body">
        <span class="search-result-label">${escapeHtml(item.label)}</span>
        <span class="search-result-meta">${escapeHtml(TYPE_LABEL[item.type])} · ${escapeHtml(item.meta)}</span>
      </span>
    </button>
  `).join('');
  listEl.hidden = false;

  listEl.querySelectorAll('.search-result').forEach((btn) => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      const query = btn.dataset.q || '';
      hideDropdown(listEl);
      input.value = '';
      if (typeof window.caricaProceduraEsterna === 'function') {
        window.caricaProceduraEsterna(page, query ? { q: query } : {});
      }
    });
  });
}

function hideDropdown(listEl) {
  listEl.hidden = true;
  listEl.innerHTML = '';
}

let input;
let listEl;
let wrap;

async function runSearch() {
  const q = input.value.trim().toLowerCase();
  if (q.length < 2) {
    hideDropdown(listEl);
    return;
  }
  listEl.innerHTML = '<div class="search-dropdown-loading">Ricerca…</div>';
  listEl.hidden = false;
  await ensureData();
  renderDropdown(listEl, buildResults(q), q);
}

document.addEventListener('DOMContentLoaded', () => {
  input = document.getElementById('global-search-input');
  listEl = document.getElementById('global-search-results');
  wrap = document.getElementById('global-search');
  if (!input || !listEl) return;

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runSearch, 280);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideDropdown(listEl);
    if (e.key === 'Enter') {
      const first = listEl.querySelector('.search-result');
      if (first && !listEl.hidden) {
        e.preventDefault();
        first.click();
      }
    }
  });

  document.addEventListener('click', (e) => {
    if (wrap && !wrap.contains(e.target)) hideDropdown(listEl);
  });

  onProfileChange(invalidateCache);
});