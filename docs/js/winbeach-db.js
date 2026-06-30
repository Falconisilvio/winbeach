/**
 * WinBeach — persistencia githubDB con soporte multi-perfil
 * Cada perfil = un establecimiento con su propia BD (owner/repo/database).
 */
import { GithubDB } from './githubdb/client.js';

const LEGACY_CONFIG_KEY = 'winbeach_db_config';
const PROFILES_KEY = 'winbeach_profiles';
const ACTIVE_ID_KEY = 'winbeach_active_profile';
const TOKENS_KEY = 'winbeach_profile_tokens';
const LEGACY_TOKEN_KEY = 'winbeach_github_token';

const DEFAULT_CONNECTION = {
  owner: 'FiveTechSoft',
  repo: 'githubdb',
  branch: 'main',
  database: 'winbeach',
};

import { t } from './app-i18n.js';

let lastStatus = { state: 'idle', key: null, params: {}, raw: '' };

const DEMO_PROFILE_BY_DB = {
  winbeach: 'profile.demo.main',
  'winbeach-lido-sud': 'profile.demo.lidoSud',
  'winbeach-lido-europa': 'profile.demo.lidoEuropa',
};

const DEMO_PROFILE_BY_NAME = {
  'Stabilimento principale': 'profile.demo.main',
  'Lido Sud': 'profile.demo.lidoSud',
  'Lido Europa': 'profile.demo.lidoEuropa',
};

/** Nombre de perfil para UI (traduce perfiles demo; el resto queda como está). */
export function profileDisplayName(profile) {
  if (!profile) return '';
  const dbKey = DEMO_PROFILE_BY_DB[profile.database];
  if (dbKey) {
    const label = t(dbKey);
    if (label !== dbKey) return label;
  }
  const nameKey = DEMO_PROFILE_BY_NAME[profile.name?.trim()];
  if (nameKey) {
    const label = t(nameKey);
    if (label !== nameKey) return label;
  }
  return profile.name?.trim() || '';
}

function resolveProfileParam(value) {
  if (!value) return value;
  const active = getActiveProfile();
  if (active && value === active.name) return profileDisplayName(active);
  const key = DEMO_PROFILE_BY_NAME[value];
  if (key) {
    const label = t(key);
    if (label !== key) return label;
  }
  return value;
}

function resolveStatusParams(params = {}) {
  const out = { ...params };
  if (out.profile != null) out.profile = resolveProfileParam(out.profile);
  return out;
}

export function resolveDbStatusMessage(status = lastStatus) {
  if (status.raw) return status.raw;
  if (!status.key) return '';
  const params = resolveStatusParams(status.params);
  let s = t(status.key);
  for (const [k, v] of Object.entries(params)) {
    s = s.replaceAll(`{${k}}`, String(v));
  }
  return s;
}

function setStatus(state, key, params = {}) {
  lastStatus = { state, key, params, raw: '' };
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('winbeach-db-status', {
      detail: { state, key, params, message: resolveDbStatusMessage({ state, key, params, raw: '' }) },
    }));
  }
}

function setStatusRaw(state, raw) {
  lastStatus = { state, key: null, params: {}, raw: String(raw ?? '') };
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('winbeach-db-status', {
      detail: { state, raw, message: lastStatus.raw },
    }));
  }
}

function newId() {
  return crypto.randomUUID();
}

function loadTokens() {
  try {
    const raw = localStorage.getItem(TOKENS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveTokens(map) {
  localStorage.setItem(TOKENS_KEY, JSON.stringify(map));
}

function migrateLegacyConfig() {
  if (localStorage.getItem(PROFILES_KEY)) return;

  let connection = { ...DEFAULT_CONNECTION };
  try {
    const raw = localStorage.getItem(LEGACY_CONFIG_KEY);
    if (raw) connection = { ...DEFAULT_CONNECTION, ...JSON.parse(raw) };
  } catch { /* ignore */ }

  const profile = {
    id: newId(),
    name: 'Stabilimento principale',
    ...connection,
  };

  localStorage.setItem(PROFILES_KEY, JSON.stringify([profile]));
  localStorage.setItem(ACTIVE_ID_KEY, profile.id);

  const legacyToken = sessionStorage.getItem(LEGACY_TOKEN_KEY);
  if (legacyToken) {
    const tokens = loadTokens();
    tokens[profile.id] = legacyToken;
    saveTokens(tokens);
  }
}

migrateLegacyConfig();

/** @returns {Array<{id:string,name:string,owner:string,repo:string,branch:string,database:string}>} */
export function getProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProfiles(list) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(list));
}

export function getActiveProfileId() {
  return localStorage.getItem(ACTIVE_ID_KEY) || getProfiles()[0]?.id || null;
}

export function getActiveProfile() {
  const id = getActiveProfileId();
  return getProfiles().find((p) => p.id === id) || getProfiles()[0] || null;
}

function broadcastProfileChange(id) {
  window.dispatchEvent(new CustomEvent('winbeach-profile-change', { detail: { id } }));
  const msg = { type: 'winbeach-profile-change', id };
  try {
    window.parent?.postMessage(msg, '*');
  } catch { /* cross-origin */ }
  try {
    document.querySelectorAll('iframe').forEach((frame) => {
      frame.contentWindow?.postMessage(msg, '*');
    });
  } catch { /* cross-origin */ }
}

export function setActiveProfile(id) {
  const exists = getProfiles().some((p) => p.id === id);
  if (!exists) return false;
  localStorage.setItem(ACTIVE_ID_KEY, id);
  broadcastProfileChange(id);
  return true;
}

export function saveProfile(profile) {
  const list = getProfiles();
  const data = {
    id: profile.id || newId(),
    name: profile.name?.trim() || 'Nuovo stabilimento',
    owner: profile.owner?.trim() || DEFAULT_CONNECTION.owner,
    repo: profile.repo?.trim() || DEFAULT_CONNECTION.repo,
    branch: profile.branch?.trim() || DEFAULT_CONNECTION.branch,
    database: profile.database?.trim() || DEFAULT_CONNECTION.database,
  };

  const idx = list.findIndex((p) => p.id === data.id);
  if (idx >= 0) list[idx] = data;
  else list.push(data);

  saveProfiles(list);

  if (!getActiveProfileId() || list.length === 1) {
    setActiveProfile(data.id);
  }

  return data;
}

export function deleteProfile(id) {
  const list = getProfiles().filter((p) => p.id !== id);
  if (!list.length) return false;

  saveProfiles(list);

  const tokens = loadTokens();
  delete tokens[id];
  saveTokens(tokens);

  if (getActiveProfileId() === id) {
    setActiveProfile(list[0].id);
  }

  return true;
}

/** Conexión del perfil activo (API retrocompatible) */
export function getDbConfig() {
  const p = getActiveProfile();
  if (!p) return { ...DEFAULT_CONNECTION };
  return {
    owner: p.owner,
    repo: p.repo,
    branch: p.branch,
    database: p.database,
  };
}

/** Actualiza conexión del perfil activo */
export function saveDbConfig(config) {
  const active = getActiveProfile();
  if (!active) {
    return saveProfile({ name: 'Stabilimento principale', ...config });
  }
  return saveProfile({ ...active, ...config });
}

export function getToken(profileId = null) {
  const id = profileId || getActiveProfileId();
  const tokens = loadTokens();
  if (id && tokens[id]) return tokens[id];
  return sessionStorage.getItem(LEGACY_TOKEN_KEY) || '';
}

export function saveToken(token, profileId = null) {
  const id = profileId || getActiveProfileId();
  if (id) {
    const tokens = loadTokens();
    if (token) tokens[id] = token;
    else delete tokens[id];
    saveTokens(tokens);
  }
  if (token) sessionStorage.setItem(LEGACY_TOKEN_KEY, token);
  else sessionStorage.removeItem(LEGACY_TOKEN_KEY);
}

export function getDbStatus() {
  return { ...lastStatus, message: resolveDbStatusMessage(lastStatus) };
}

export function onProfileChange(callback) {
  const handler = (e) => callback(e.detail);
  window.addEventListener('winbeach-profile-change', handler);
  return () => window.removeEventListener('winbeach-profile-change', handler);
}

function createClient() {
  const cfg = getDbConfig();
  return new GithubDB({
    owner: cfg.owner,
    repo: cfg.repo,
    branch: cfg.branch,
    token: getToken() || null,
  });
}

function sqlEscape(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'number') return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}

export async function loadStrutturaFromDb() {
  const cfg = getDbConfig();
  const profile = getActiveProfile();
  setStatus('loading', 'db.loadingStructure', { profile: profile?.name || 'BD' });

  try {
    const db = createClient();
    await db.refresh(cfg.database);

    const configTable = await db.table(cfg.database, 'config');
    const celleTable = await db.table(cfg.database, 'celle');
    const configRows = configTable.objects();
    const celleRows = celleTable.objects();

    if (!configRows.length && !celleRows.length) {
      setStatus('empty', 'db.structureEmpty', { profile: profile?.name || 'BD' });
      return { ok: true, empty: true };
    }

    const config = configRows[0] || {};
    setStatus('ok', 'db.structureCells', { profile: profile?.name || 'BD', n: celleRows.length });
    return {
      ok: true,
      data: {
        rows: config.rows || 14,
        cols: config.cols || 22,
        walkwayCol: config.walkway_col || 11,
        prossimo: config.prossimo || 1,
        cells: celleRows.map((c) => ({
          x: c.x,
          y: c.y,
          cella: c.cella || 0,
          elemento: c.elemento,
          desc: c.desc || '',
          attivo: Boolean(c.attivo),
          settore: c.settore || null,
        })),
      },
    };
  } catch (err) {
    const msg = err.message || String(err);
    setStatusRaw('error', msg);
    return { ok: false, error: msg };
  }
}

export async function saveStrutturaToDb(struttura) {
  const { assertCanWrite } = await import('./winbeach-auth.js');
  const authErr = assertCanWrite();
  if (authErr) {
    setStatusRaw('error', authErr);
    return { ok: false, error: authErr };
  }
  const token = getToken();
  if (!token) {
    setStatus('error', 'err.tokenSave');
    return { ok: false, error: t('err.tokenSave') };
  }

  const cfg = getDbConfig();
  setStatus('saving', 'db.savingWait');

  const now = new Date().toISOString();
  const cells = struttura.cells.filter((c) => c.elemento);

  const insertValues = cells.map((c, i) => {
    const settore = c.attivo && c.settore ? sqlEscape(c.settore) : 'NULL';
    return `(${i + 1}, ${c.cella || 0}, ${c.x}, ${c.y}, ${sqlEscape(c.elemento)}, ${sqlEscape(c.desc || '')}, ${settore}, ${c.attivo ? 'TRUE' : 'FALSE'})`;
  });

  const sqlParts = [
    `UPDATE config SET rows = ${struttura.rows}, cols = ${struttura.cols}, walkway_col = ${struttura.walkwayCol}, prossimo = ${struttura.prossimo}, updated_at = ${sqlEscape(now)} WHERE id = 1`,
    'DELETE FROM celle',
  ];

  if (insertValues.length) {
    sqlParts.push(
      `INSERT INTO celle (id, cella, x, y, elemento, desc, settore, attivo) VALUES ${insertValues.join(', ')}`
    );
  }

  try {
    const db = createClient();
    const result = await db.query(cfg.database, sqlParts.join('; '));
    if (!result.ok) {
      const msg = result.error || 'Error SQL';
      setStatusRaw('error', msg);
      return { ok: false, error: msg };
    }
    await db.refresh(cfg.database);
    setStatus('ok', 'db.structureSaved', { n: cells.length });
    return { ok: true, cells: cells.length };
  } catch (err) {
    const msg = err.message || String(err);
    setStatusRaw('error', msg);
    return { ok: false, error: msg };
  }
}

async function queryDb(sql, statusKey = 'db.savingWait') {
  const { assertCanWrite } = await import('./winbeach-auth.js');
  const authErr = assertCanWrite();
  if (authErr) {
    setStatusRaw('error', authErr);
    return { ok: false, error: authErr };
  }
  const token = getToken();
  if (!token) {
    setStatus('error', 'err.tokenSave');
    return { ok: false, error: t('err.tokenSave') };
  }

  const cfg = getDbConfig();
  setStatus('saving', statusKey);

  try {
    const db = createClient();
    const result = await db.query(cfg.database, sql);
    if (!result.ok) {
      const msg = result.error || 'Error SQL';
      setStatusRaw('error', msg);
      return { ok: false, error: msg };
    }
    await db.refresh(cfg.database);
    return { ok: true, result };
  } catch (err) {
    const msg = err.message || String(err);
    setStatusRaw('error', msg);
    return { ok: false, error: msg };
  }
}

function nextId(rows) {
  if (!rows.length) return 1;
  return Math.max(...rows.map((r) => Number(r.id) || 0)) + 1;
}

export async function loadClientiFromDb() {
  const profile = getActiveProfile();
  setStatus('loading', 'db.loadingClients', { profile: profile?.name || 'BD' });

  try {
    const cfg = getDbConfig();
    const db = createClient();
    await db.refresh(cfg.database);
    const rows = (await db.table(cfg.database, 'clienti')).objects();
    setStatus('ok', 'db.clientsCount', { n: rows.length });
    return { ok: true, data: rows };
  } catch (err) {
    const msg = err.message || String(err);
    setStatusRaw('error', msg);
    return { ok: false, error: msg };
  }
}

export async function saveClienteToDb(cliente, existingRows = []) {
  const id = cliente.id || nextId(existingRows);
  const sql = cliente.id
    ? `UPDATE clienti SET nome = ${sqlEscape(cliente.nome)}, cognome = ${sqlEscape(cliente.cognome)}, email = ${sqlEscape(cliente.email)}, telefono = ${sqlEscape(cliente.telefono)}, note = ${sqlEscape(cliente.note || '')} WHERE id = ${id}`
    : `INSERT INTO clienti (id, nome, cognome, email, telefono, note) VALUES (${id}, ${sqlEscape(cliente.nome)}, ${sqlEscape(cliente.cognome)}, ${sqlEscape(cliente.email)}, ${sqlEscape(cliente.telefono)}, ${sqlEscape(cliente.note || '')})`;

  const res = await queryDb(sql, 'db.savingClient');
  if (res.ok) setStatus('ok', 'db.clientSaved');
  return res.ok ? { ok: true, id } : res;
}

export async function deleteClienteFromDb(id) {
  const res = await queryDb(`DELETE FROM clienti WHERE id = ${id}`, 'db.deleting');
  if (res.ok) setStatus('ok', 'db.clientDeleted');
  return res;
}

export async function loadPrenotazioniFromDb() {
  const profile = getActiveProfile();
  setStatus('loading', 'db.loadingBookings', { profile: profile?.name || 'BD' });

  try {
    const cfg = getDbConfig();
    const db = createClient();
    await db.refresh(cfg.database);
    const prenotazioni = (await db.table(cfg.database, 'prenotazioni')).objects();
    const clienti = (await db.table(cfg.database, 'clienti')).objects();
    const celle = (await db.table(cfg.database, 'celle')).objects();

    const clientiMap = Object.fromEntries(clienti.map((c) => [c.id, c]));
    const data = prenotazioni.map((p) => ({
      ...p,
      cliente: clientiMap[p.cliente_id] || null,
      cellaInfo: celle.find((c) => c.cella === p.cella) || null,
    }));

    setStatus('ok', 'db.bookingsCount', { n: data.length });
    return { ok: true, data, clienti, celle };
  } catch (err) {
    const msg = err.message || String(err);
    setStatusRaw('error', msg);
    return { ok: false, error: msg };
  }
}

const PRENOTAZIONE_FIELDS = [
  'cliente_id', 'cella', 'data_inizio', 'data_fine', 'stato', 'note',
  'importo', 'importo_pagato', 'canale', 'stato_pagamento', 'ora_arrivo', 'check_in', 'check_out',
];

function prenotazioneSql(p, id) {
  const sets = PRENOTAZIONE_FIELDS.map((f) => {
    const v = p[f];
    if (f === 'cliente_id' || f === 'cella') return `${f} = ${Number(v) || 0}`;
    if (f === 'importo' || f === 'importo_pagato') return `${f} = ${Number(v) || 0}`;
    if (f === 'check_in' || f === 'check_out') return `${f} = ${v ? 'TRUE' : 'FALSE'}`;
    return `${f} = ${sqlEscape(v ?? (f === 'stato' ? 'confermata' : f === 'canale' ? 'offline' : f === 'stato_pagamento' ? 'da_saldare' : ''))}`;
  });
  const cols = ['id', ...PRENOTAZIONE_FIELDS].join(', ');
  const vals = [id, ...PRENOTAZIONE_FIELDS.map((f) => {
    const v = p[f];
    if (f === 'cliente_id' || f === 'cella') return Number(v) || 0;
    if (f === 'importo' || f === 'importo_pagato') return Number(v) || 0;
    if (f === 'check_in' || f === 'check_out') return v ? 'TRUE' : 'FALSE';
    return sqlEscape(v ?? (f === 'stato' ? 'confermata' : f === 'canale' ? 'offline' : f === 'stato_pagamento' ? 'da_saldare' : ''));
  })].join(', ');
  return p.id
    ? `UPDATE prenotazioni SET ${sets.join(', ')} WHERE id = ${id}`
    : `INSERT INTO prenotazioni (${cols}) VALUES (${vals})`;
}

/** @returns {object|null} prenotazione in conflitto, se esiste */
export function findPrenotazioneOverlap({ id, cella, data_inizio, data_fine, stato }, existingRows) {
  if (!cella || stato === 'cancellata') return null;
  const start = String(data_inizio).slice(0, 10);
  const end = String(data_fine).slice(0, 10);
  return existingRows.find((p) => {
    if (p.id === id) return false;
    if (p.stato === 'cancellata') return false;
    if (Number(p.cella) !== Number(cella)) return false;
    const pStart = String(p.data_inizio).slice(0, 10);
    const pEnd = String(p.data_fine).slice(0, 10);
    return start <= pEnd && end >= pStart;
  }) || null;
}

export async function savePrenotazioneToDb(prenotazione, existingRows = []) {
  const id = prenotazione.id || nextId(existingRows);
  const res = await queryDb(prenotazioneSql(prenotazione, id), 'db.savingBooking');
  if (res.ok) setStatus('ok', 'db.bookingSaved');
  return res.ok ? { ok: true, id } : res;
}

export async function deletePrenotazioneFromDb(id) {
  const res = await queryDb(`DELETE FROM prenotazioni WHERE id = ${id}`, 'db.deleting');
  if (res.ok) setStatus('ok', 'db.bookingDeleted');
  return res;
}

/** Carga genérica de tabla */
export async function loadTable(tableName) {
  const profile = getActiveProfile();
  setStatus('loading', 'db.loadingTable', { profile: profile?.name || 'BD', table: tableName });
  try {
    const cfg = getDbConfig();
    const db = createClient();
    await db.refresh(cfg.database);
    const rows = (await db.table(cfg.database, tableName)).objects();
    setStatus('ok', 'db.rowsCount', { n: rows.length });
    return { ok: true, data: rows };
  } catch (err) {
    const msg = err.message || String(err);
    setStatusRaw('error', msg);
    return { ok: false, error: msg };
  }
}

/** Guarda fila genérica (INSERT o UPDATE) */
export async function saveTableRow(tableName, row, fields, existingRows = [], statusKey = 'common.saving') {
  const id = row.id || nextId(existingRows);
  const payload = { ...row, id };
  const sets = fields.map((f) => {
    const v = payload[f];
    if (typeof v === 'boolean') return `${f} = ${v ? 'TRUE' : 'FALSE'}`;
    if (typeof v === 'number') return `${f} = ${v}`;
    return `${f} = ${sqlEscape(v ?? '')}`;
  });
  const cols = ['id', ...fields].join(', ');
  const vals = [id, ...fields.map((f) => {
    const v = payload[f];
    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
    if (typeof v === 'number') return v;
    return sqlEscape(v ?? '');
  })].join(', ');
  const sql = row.id
    ? `UPDATE ${tableName} SET ${sets.join(', ')} WHERE id = ${id}`
    : `INSERT INTO ${tableName} (${cols}) VALUES (${vals})`;
  const res = await queryDb(sql, statusKey);
  return res.ok ? { ok: true, id } : res;
}

export async function deleteTableRow(tableName, id) {
  return queryDb(`DELETE FROM ${tableName} WHERE id = ${id}`, 'db.deleting');
}

/** Carga todo el dataset operativo */
export async function loadOperationalData() {
  const profile = getActiveProfile();
  setStatus('loading', 'db.loadingData', { profile: profile?.name || 'BD' });
  try {
    const cfg = getDbConfig();
    const db = createClient();
    await db.refresh(cfg.database);
    const tables = [
      'config', 'celle', 'clienti', 'prenotazioni', 'settori', 'tariffe',
      'movimenti_cassa', 'elementi', 'listini', 'servizi', 'articoli',
    ];
    const data = {};
    for (const t of tables) {
      try {
        data[t] = (await db.table(cfg.database, t)).objects();
      } catch {
        data[t] = [];
      }
    }
    const clientiMap = Object.fromEntries(data.clienti.map((c) => [c.id, c]));
    data.prenotazioniEnriched = data.prenotazioni.map((p) => ({
      ...p,
      cliente: clientiMap[p.cliente_id] || null,
    }));
    setStatus('ok', 'db.dataLoaded');
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
}

export async function loadDashboardStats() {
  const res = await loadOperationalData();
  if (!res.ok) return res;
  const { prenotazioni, prenotazioniEnriched, celle, movimenti_cassa, clienti } = res.data;
  const today = new Date().toISOString().slice(0, 10);
  const attive = prenotazioni.filter((p) => p.stato !== 'cancellata');
  const arriviOggi = attive.filter((p) => p.data_inizio === today);
  const partenzeOggi = attive.filter((p) => p.data_fine === today);
  const occupateOggi = attive.filter((p) => p.data_inizio <= today && p.data_fine >= today);
  const postazioni = celle.filter((c) => c.attivo && c.cella > 0).length;
  const fatturato = attive.reduce((s, p) => s + (Number(p.importo) || 0), 0);
  const incassato = movimenti_cassa.filter((m) => m.tipo === 'entrata').reduce((s, m) => s + (Number(m.importo) || 0), 0);
  const pagamenti = {
    saldato: attive.filter((p) => p.stato_pagamento === 'saldato').length,
    parziale: attive.filter((p) => p.stato_pagamento === 'parziale').length,
    da_saldare: attive.filter((p) => p.stato_pagamento === 'da_saldare').length,
  };
  const canali = {};
  attive.forEach((p) => { canali[p.canale || 'offline'] = (canali[p.canale || 'offline'] || 0) + 1; });
  const history = computeChartHistory(attive, 14);
  return {
    ok: true,
    stats: {
      arriviOggi: arriviOggi.length,
      partenzeOggi: partenzeOggi.length,
      cancellazioni: prenotazioni.filter((p) => p.stato === 'cancellata').length,
      occupazione: postazioni ? Math.round((occupateOggi.length / postazioni) * 100) : 0,
      fatturato,
      incassato,
      presenze: occupateOggi.length,
      clienti: clienti.length,
      pagamenti,
      canali,
      prenotazioni: prenotazioniEnriched,
      postazioni,
      occupateOggi: occupateOggi.length,
      history,
    },
  };
}

/** Serie giornaliere per grafici dashboard (ultimi N giorni). */
export function computeChartHistory(prenotazioni, days = 14) {
  const attive = prenotazioni.filter((p) => p.stato !== 'cancellata');
  const labels = [];
  const presenze = [];
  const arrivi = [];
  const partenze = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    labels.push(`${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`);
    presenze.push(attive.filter((p) => p.data_inizio <= iso && p.data_fine >= iso).length);
    arrivi.push(attive.filter((p) => p.data_inizio === iso).length);
    partenze.push(attive.filter((p) => p.data_fine === iso).length);
  }
  return { labels, presenze, arrivi, partenze, rangeLabel: `${labels[0]} – ${labels[labels.length - 1]}` };
}

export function calcImportoFromTariffe(tariffe, tassa, dataInizio, dataFine) {
  if (!tassa || !dataInizio || !dataFine) return 0;
  const t = tariffe.find((x) => x.tassa === tassa);
  if (!t) return 0;
  const days = Math.max(1, Math.ceil((new Date(dataFine) - new Date(dataInizio)) / 86400000) + 1);
  if (days >= 30) return t.mensile || t.giornaliero * days;
  if (days >= 15) return t.quindicinale || t.giornaliero * days;
  if (days >= 7) return t.settimanale || t.giornaliero * days;
  return (t.giornaliero || 0) * days;
}

/** Crea 3 stabilimenti demo (BD distinte) si no existen ya */
export function ensureDemoProfiles() {
  const demos = [
    { name: 'Stabilimento principale', database: 'winbeach' },
    { name: 'Lido Sud', database: 'winbeach-lido-sud' },
    { name: 'Lido Europa', database: 'winbeach-lido-europa' },
  ];
  const existing = getProfiles();
  const byDb = Object.fromEntries(existing.map((p) => [p.database, p]));
  let added = 0;

  for (const demo of demos) {
    if (byDb[demo.database]) continue;
    saveProfile({ ...DEFAULT_CONNECTION, ...demo });
    added++;
  }

  if (!getActiveProfileId() && getProfiles().length) {
    setActiveProfile(getProfiles()[0].id);
  }

  return added;
}

/** Comprueba conectividad de lectura del perfil activo */
export async function testActiveProfile() {
  const cfg = getDbConfig();
  const profile = getActiveProfile();
  setStatus('loading', 'db.testing', { profile: profile?.name || 'BD' });

  try {
    const db = createClient();
    await db.refresh(cfg.database);
    setStatus('ok', 'db.connected', { owner: cfg.owner, repo: cfg.repo, database: cfg.database });
    return { ok: true };
  } catch (err) {
    const msg = err.message || String(err);
    setStatusRaw('error', msg);
    return { ok: false, error: msg };
  }
}