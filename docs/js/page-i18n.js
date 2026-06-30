/**
 * Traducciones de módulos (páginas iframe) según slug URL.
 */
import { getAppLang, t } from './app-i18n.js';

const SLUG_ALIASES = {
  'struttura.html': 'struttura',
};

const AUTO_TH = {
  Azioni: 'col.actions',
  Codice: 'col.code',
  Nome: 'col.name',
  Elemento: 'col.element',
  Alquilabile: 'col.rentable',
  Icona: 'col.icon',
  Colore: 'col.color',
  Utente: 'col.user',
  Ruolo: 'col.role',
  Email: 'col.email',
  Telefono: 'col.phone',
  Stato: 'col.status',
  'Cognome e Nome': 'col.fullName',
  Cliente: 'col.customer',
  ID: 'col.id',
  Dal: 'col.from',
  Al: 'col.to',
  Postazione: 'col.spot',
  Importo: 'col.amount',
  Pagamento: 'col.payment',
  Canale: 'col.channel',
  Data: 'col.date',
  Note: 'col.notes',
  'Stato / Note': 'col.notesStatus',
  'Ora arrivo': 'col.arrivalTime',
  Articolo: 'col.article',
  'Q.tà': 'col.qty',
  Totale: 'col.total',
  Indirizzo: 'col.address',
};

const AUTO_LABEL = {
  Cognome: 'label.cognome',
  'Cognome *': 'label.cognomeReq',
  Nome: 'label.nome',
  'Nome *': 'label.nomeReq',
  Email: 'col.email',
  Telefono: 'col.phone',
  Note: 'col.notes',
  Indirizzo: 'col.address',
};

const AUTO_BTN = {
  'btn-reload': 'btn.reload',
  'btn-save': 'common.save',
  'btn-cancel': 'common.cancel',
  'btn-export': 'btn.exportCsv',
  'btn-pdf': 'btn.exportPdf',
};

const AUTO_STAT = {
  'Clienti totali': 'stat.totalCustomers',
  'Prenotazioni attive': 'stat.activeBookings',
  'Attive oggi': 'stat.activeToday',
  'In scadenza oggi': 'stat.expiringToday',
  'Check-in effettuati': 'stat.checkedIn',
  'Check-out effettuati': 'stat.checkedOut',
};

const AUTO_FILTER_OPT = {
  'Tutti gli stati': 'filter.allStatus',
  Confermata: 'filter.confirmed',
  'In attesa': 'filter.pending',
  Cancellata: 'filter.cancelled',
};

const AUTO_PAGE = {
  '.tavoli-page .header-sala h1': 'tavoli.title',
  '.tavoli-page .header-sala p': 'tavoli.subtitle',
  '.pointsale-page .cassa-header h2': 'pos.title',
  '.pointsale-page .comanda-title': 'pos.orderLines',
  '.pointsale-page .tot-row span:first-child': 'pos.total',
  '.pointsale-page .btn-invia': 'pos.print',
};

const AUTO_ZONE = [
  ['.tavoli-page .zona-titolo', ['Sala Interna', 'tavoli.zoneInterna'], ['Terrazza Vista Mare', 'tavoli.zoneTerrazza'], ['Giardino', 'tavoli.zoneGiardino'], ['Gazebo Beach', 'tavoli.zoneGazebo']],
];

export function getPageSlug() {
  const file = window.location.pathname.split('/').pop() || '';
  if (SLUG_ALIASES[file]) return SLUG_ALIASES[file];
  return file.replace(/\.html$/, '');
}

function setH2Title(title) {
  const h2 = document.querySelector('.header h2');
  if (!h2 || !title) return;
  const icon = h2.querySelector('i');
  h2.textContent = '';
  if (icon) h2.appendChild(icon.cloneNode(true));
  h2.appendChild(document.createTextNode(` ${title}`));
}

function applyAutoLabels() {
  document.querySelectorAll('th').forEach((th) => {
    const key = th.dataset.i18n || AUTO_TH[th.textContent.trim()];
    if (!key) return;
    const val = t(key);
    if (val !== key) th.textContent = val;
  });

  document.querySelectorAll('label').forEach((lb) => {
    if (lb.dataset.i18n) return;
    const text = lb.childNodes[0]?.textContent?.trim();
    const key = AUTO_LABEL[text];
    if (!key) return;
    const val = t(key);
    if (val !== key && lb.childNodes[0]) lb.childNodes[0].textContent = val;
  });

  Object.entries(AUTO_BTN).forEach(([id, key]) => {
    const btn = document.getElementById(id);
    if (!btn || btn.dataset.i18n) return;
    const icon = btn.querySelector('i');
    const val = t(key);
    if (val === key) return;
    if (icon) {
      btn.textContent = '';
      btn.appendChild(icon.cloneNode(true));
      btn.appendChild(document.createTextNode(` ${val}`));
    } else {
      btn.textContent = val;
    }
  });

  const nuovo = document.getElementById('btn-nuovo');
  if (nuovo && !nuovo.dataset.i18n) {
    const slug = getPageSlug();
    const key = slug === 'booking' ? 'booking.newBtn' : slug === 'clienti' ? 'clienti.newBtn' : 'btn.new';
    const val = t(key);
    const icon = nuovo.querySelector('i');
    if (val !== key) {
      if (icon) {
        nuovo.textContent = '';
        nuovo.appendChild(icon.cloneNode(true));
        nuovo.appendChild(document.createTextNode(` ${val}`));
      } else {
        nuovo.textContent = val;
      }
    }
  }

  document.querySelectorAll('.stat-box .lbl').forEach((el) => {
    const key = el.dataset.i18n || AUTO_STAT[el.textContent.trim()];
    if (!key) return;
    const val = t(key);
    if (val !== key) el.textContent = val;
  });

  document.querySelectorAll('#filter-stato option').forEach((opt) => {
    const key = AUTO_FILTER_OPT[opt.textContent.trim()];
    if (!key) return;
    const val = t(key);
    if (val !== key) opt.textContent = val;
  });

  const search = document.getElementById('search-input');
  if (search && !search.dataset.i18nPlaceholder) {
    const slug = getPageSlug();
    if (slug === 'booking') search.placeholder = t('filter.searchBooking');
  }

  Object.entries(AUTO_PAGE).forEach(([sel, key]) => {
    const el = document.querySelector(sel);
    if (!el || el.dataset.i18n) return;
    const val = t(key);
    if (val === key) return;
    const icon = el.querySelector('i');
    if (icon) {
      el.textContent = '';
      el.appendChild(icon.cloneNode(true));
      el.appendChild(document.createTextNode(` ${val}`));
    } else {
      el.textContent = val;
    }
  });

  AUTO_ZONE.forEach(([sel, ...pairs]) => {
    document.querySelectorAll(sel).forEach((el) => {
      if (el.dataset.i18n) return;
      const text = el.textContent.replace(/\s+/g, ' ').trim();
      for (const [it, key] of pairs) {
        if (text.includes(it)) {
          const val = t(key);
          if (val !== key) {
            const icon = el.querySelector('i');
            el.textContent = '';
            if (icon) el.appendChild(icon.cloneNode(true));
            el.appendChild(document.createTextNode(` ${val}`));
          }
          break;
        }
      }
    });
  });

  document.querySelectorAll('.cat-btn').forEach((btn, i) => {
    const keys = ['pos.catRistorante', 'pos.catBevande', 'pos.catBar'];
    const key = keys[i];
    if (!key) return;
    const val = t(key);
    if (val !== key) btn.textContent = val;
  });
}

export function applyPageI18n() {
  const slug = getPageSlug();
  const titleKey = `page.${slug}.title`;
  const subKey = `page.${slug}.subtitle`;
  const docKey = `page.${slug}.docTitle`;

  const title = t(titleKey);
  if (title !== titleKey) {
    setH2Title(title);
    const doc = t(docKey);
    if (doc !== docKey) document.title = doc;
  }

  const sub = t(subKey);
  const subEl = document.querySelector('.subtitle') || document.getElementById('page-subtitle');
  if (subEl && sub !== subKey) subEl.textContent = sub;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    const val = t(key);
    if (val === key) return;
    if (el.dataset.i18nHtml === '1') el.innerHTML = val;
    else el.textContent = val;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const val = t(el.dataset.i18nPlaceholder);
    if (val !== el.dataset.i18nPlaceholder) el.placeholder = val;
  });

  applyAutoLabels();
}

let listenersBound = false;

export function initPageI18n() {
  document.documentElement.lang = getAppLang();
  applyPageI18n();
  if (listenersBound) return;
  listenersBound = true;
  window.addEventListener('winbeach-lang-change', applyPageI18n);
  window.addEventListener('message', (e) => {
    if (e.data?.type === 'winbeach-lang-change') applyPageI18n();
  });
}