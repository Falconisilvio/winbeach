/**
 * Traducciones de módulos (páginas iframe) según slug URL.
 */
import { APP_I18N } from './i18n/app.js';
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
  Tipo: 'col.type',
  Descrizione: 'col.description',
  Operatore: 'col.operator',
  Settore: 'col.sector',
  Prenotazioni: 'col.bookings',
  'Stima ricavo': 'col.revenueEst',
  Fatturato: 'col.revenue',
  Durata: 'col.duration',
  Orario: 'col.time',
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
  'Cliente *': 'label.clienteReq',
  Postazione: 'col.spot',
  'Data inizio *': 'label.startDateReq',
  'Data fine *': 'label.endDateReq',
  Stato: 'col.status',
  'Importo €': 'label.amount',
  'Pagato €': 'label.paid',
  Canale: 'col.channel',
  'Stato pagamento': 'label.paymentStatus',
  'Ora arrivo': 'col.arrivalTime',
  Descrizione: 'label.description',
  Metodo: 'label.method',
  'Prenotazione ID': 'label.bookingId',
  Operatore: 'label.operator',
  Data: 'label.date',
  Arrivo: 'label.arrival',
  Partenza: 'label.departure',
};

const SELECT_OPT_BY_ID = {
  'f-pagamento': {
    da_saldare: 'badge.da_saldare',
    parziale: 'badge.parziale',
    saldato: 'badge.saldato',
  },
  'f-canale': {
    offline: 'channel.offline',
    widget: 'channel.widget',
    portale: 'channel.portal',
  },
  'f-tipo': {
    entrata: 'cassa.income',
    uscita: 'cassa.expense',
  },
};

const AUTO_BTN = {
  'btn-reload': 'btn.reload',
  'btn-save': 'common.save',
  'btn-cancel': 'common.cancel',
  'btn-export': 'btn.exportCsv',
  'btn-pdf': 'btn.exportPdf',
  'btn-test': 'cambia.testConn',
  'btn-demo': 'cambia.demoProfiles',
};

const AUTO_STAT = {
  'Clienti totali': 'stat.totalCustomers',
  'Prenotazioni attive': 'stat.activeBookings',
  'Attive oggi': 'stat.activeToday',
  'In scadenza oggi': 'stat.expiringToday',
  'Check-in effettuati': 'stat.checkedIn',
  'Check-out effettuati': 'stat.checkedOut',
  'Arrivi previsti': 'stat.arrivalsExpected',
  'Partenze previste': 'stat.departuresExpected',
  Postazioni: 'stat.spots',
  Occupate: 'stat.occupied',
  Libere: 'stat.free',
  Occupazione: 'stat.occupancy',
  'Entrate oggi': 'cassa.incomeToday',
  'Uscite oggi': 'cassa.expenseToday',
  'Saldo cassa': 'cassa.balance',
  'Saldo Flussi di Cassa': 'cassa.flowBalance',
  'Postazioni attive': 'stat.activeSpots',
  'Con prenotazioni': 'stat.withBookings',
};

const FILTER_OPT_KEYS = ['filter.allStatus', 'filter.confirmed', 'filter.pending', 'filter.cancelled'];

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

const ZONE_KEYS = ['tavoli.zoneInterna', 'tavoli.zoneTerrazza', 'tavoli.zoneGiardino', 'tavoli.zoneGazebo'];
const CAT_BTN_KEYS = ['pos.catRistorante', 'pos.catBevande', 'pos.catBar'];

const EMPTY_STATE_KEYS = {
  booking: 'booking.empty',
  clienti: 'common.noRecords',
};

function buildReverseMap(...maps) {
  const keys = new Set();
  for (const map of maps) {
    for (const key of Object.values(map)) keys.add(key);
  }
  for (const map of Object.values(SELECT_OPT_BY_ID)) {
    for (const key of Object.values(map)) keys.add(key);
  }
  keys.add('label.notesPlaceholder');
  for (const key of ZONE_KEYS.concat(CAT_BTN_KEYS).concat(FILTER_OPT_KEYS).concat(Object.values(EMPTY_STATE_KEYS))) {
    keys.add(key);
  }
  const rev = {};
  for (const key of keys) {
    for (const lang of Object.keys(APP_I18N)) {
      const v = APP_I18N[lang][key];
      if (v) rev[v.trim()] = key;
    }
  }
  return rev;
}

const REVERSE = buildReverseMap(AUTO_TH, AUTO_LABEL, AUTO_BTN, AUTO_STAT, AUTO_FILTER_OPT, AUTO_PAGE);

function resolveKey(el, text, staticMap) {
  if (el?.dataset?.i18n) return el.dataset.i18n;
  const trimmed = (text ?? '').trim();
  const key = staticMap[trimmed] || REVERSE[trimmed];
  if (key && el) el.dataset.i18n = key;
  return key;
}

function setTextWithIcon(el, val) {
  const icon = el.querySelector('i');
  if (icon) {
    el.textContent = '';
    el.appendChild(icon.cloneNode(true));
    el.appendChild(document.createTextNode(` ${val}`));
  } else {
    el.textContent = val;
  }
}

function applyKeyToEl(el, key) {
  if (!el || !key) return;
  el.dataset.i18n = key;
  const val = t(key);
  if (val === key) return;
  if (el.tagName === 'OPTION') {
    el.textContent = val;
    return;
  }
  const icon = el.querySelector('i');
  if (icon && el.childNodes.length > 1) setTextWithIcon(el, val);
  else if (icon) setTextWithIcon(el, val);
  else el.textContent = val;
}

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
    const key = resolveKey(th, th.textContent, AUTO_TH);
    if (!key) return;
    const val = t(key);
    if (val !== key) th.textContent = val;
  });

  document.querySelectorAll('label').forEach((lb) => {
    const text = lb.childNodes[0]?.textContent?.trim();
    const key = resolveKey(lb, text, AUTO_LABEL);
    if (!key) return;
    const val = t(key);
    if (val !== key && lb.childNodes[0]) lb.childNodes[0].textContent = val;
  });

  Object.entries(AUTO_BTN).forEach(([id, defaultKey]) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    const key = btn.dataset.i18n || defaultKey;
    btn.dataset.i18n = key;
    const val = t(key);
    if (val === key) return;
    setTextWithIcon(btn, val);
  });

  const nuovo = document.getElementById('btn-nuovo');
  if (nuovo) {
    const slug = getPageSlug();
    const defaultKey = slug === 'booking' ? 'booking.newBtn'
      : slug === 'clienti' ? 'clienti.newBtn'
      : (slug === 'cassa' || slug === 'flussi-cassa') ? 'cassa.newMovement'
      : 'btn.new';
    const key = nuovo.dataset.i18n || defaultKey;
    nuovo.dataset.i18n = key;
    const val = t(key);
    if (val !== key) setTextWithIcon(nuovo, val);
  }

  const modalTitle = document.getElementById('modal-title');
  if (modalTitle?.dataset.i18n) applyKeyToEl(modalTitle, modalTitle.dataset.i18n);

  document.querySelectorAll('.filters > label').forEach((lb) => {
    const text = lb.childNodes[0]?.textContent?.trim();
    const key = resolveKey(lb, text, { Data: 'label.dateFilter' });
    if (!key) return;
    const val = t(key);
    if (val !== key && lb.childNodes[0]) lb.childNodes[0].textContent = `${val} `;
  });

  document.querySelectorAll('.stat-box .lbl').forEach((el) => {
    const key = resolveKey(el, el.textContent, AUTO_STAT);
    if (!key) return;
    const val = t(key);
    if (val !== key) el.textContent = val;
  });

  document.querySelectorAll('#filter-stato option').forEach((opt, i) => {
    const key = opt.dataset.i18n || FILTER_OPT_KEYS[i] || resolveKey(opt, opt.textContent, AUTO_FILTER_OPT);
    if (!key) return;
    opt.dataset.i18n = key;
    const val = t(key);
    if (val !== key) opt.textContent = val;
  });

  const search = document.getElementById('search-input');
  if (search) {
    const slug = getPageSlug();
    const phKey = search.dataset.i18nPlaceholder || (slug === 'booking' ? 'filter.searchBooking' : slug === 'clienti' ? 'common.search' : null);
    if (phKey) {
      search.dataset.i18nPlaceholder = phKey;
      search.placeholder = t(phKey);
    }
  }

  document.querySelectorAll('.db-bar > span').forEach((el) => {
    if (!el.querySelector('i')) return;
    const key = el.dataset.i18n || 'common.db';
    applyKeyToEl(el, key);
  });

  const slug = getPageSlug();
  const emptyKey = EMPTY_STATE_KEYS[slug];
  if (emptyKey) {
    const emptyP = document.querySelector('#empty-state p');
    if (emptyP) applyKeyToEl(emptyP, emptyKey);
  }

  Object.entries(AUTO_PAGE).forEach(([sel, defaultKey]) => {
    const el = document.querySelector(sel);
    if (!el) return;
    const key = el.dataset.i18n || defaultKey;
    applyKeyToEl(el, key);
  });

  document.querySelectorAll('.tavoli-page .zona-titolo').forEach((el, i) => {
    const key = el.dataset.i18n || ZONE_KEYS[i];
    if (!key) return;
    applyKeyToEl(el, key);
  });

  document.querySelectorAll('.cat-btn').forEach((btn, i) => {
    const key = btn.dataset.i18n || CAT_BTN_KEYS[i];
    if (!key) return;
    applyKeyToEl(btn, key);
  });

  Object.entries(SELECT_OPT_BY_ID).forEach(([selectId, valueMap]) => {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    sel.querySelectorAll('option').forEach((opt) => {
      const key = opt.dataset.i18n || valueMap[opt.value];
      if (!key) return;
      opt.dataset.i18n = key;
      const val = t(key);
      if (val !== key) opt.textContent = val;
    });
  });

  const noteField = document.getElementById('f-note');
  if (noteField) {
    const phKey = noteField.dataset.i18nPlaceholder || 'label.notesPlaceholder';
    noteField.dataset.i18nPlaceholder = phKey;
    noteField.placeholder = t(phKey);
  }
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
    else if (el.querySelector('i') && el.childNodes.length > 1) setTextWithIcon(el, val);
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