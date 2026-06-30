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

let lastStatus = { state: 'idle', message: '' };

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

export function setActiveProfile(id) {
  const exists = getProfiles().some((p) => p.id === id);
  if (!exists) return false;
  localStorage.setItem(ACTIVE_ID_KEY, id);
  window.dispatchEvent(new CustomEvent('winbeach-profile-change', { detail: { id } }));
  try {
    window.parent?.postMessage({ type: 'winbeach-profile-change', id }, '*');
  } catch { /* cross-origin */ }
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
  return { ...lastStatus };
}

export function onProfileChange(callback) {
  const handler = (e) => callback(e.detail);
  window.addEventListener('winbeach-profile-change', handler);
  return () => window.removeEventListener('winbeach-profile-change', handler);
}

function setStatus(state, message) {
  lastStatus = { state, message };
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
  setStatus('loading', `${profile?.name || 'BD'}: cargando…`);

  try {
    const db = createClient();
    await db.refresh(cfg.database);

    const configTable = await db.table(cfg.database, 'config');
    const celleTable = await db.table(cfg.database, 'celle');
    const configRows = configTable.objects();
    const celleRows = celleTable.objects();

    if (!configRows.length && !celleRows.length) {
      setStatus('empty', `${profile?.name}: vacía — diseño demo.`);
      return { ok: true, empty: true };
    }

    const config = configRows[0] || {};
    setStatus('ok', `${profile?.name}: ${celleRows.length} celdas`);
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
    setStatus('error', msg);
    return { ok: false, error: msg };
  }
}

export async function saveStrutturaToDb(struttura) {
  const token = getToken();
  if (!token) {
    const msg = 'Se requiere un token de GitHub para guardar.';
    setStatus('error', msg);
    return { ok: false, error: msg };
  }

  const cfg = getDbConfig();
  setStatus('saving', 'Guardando… (10–30 s)');

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
      setStatus('error', msg);
      return { ok: false, error: msg };
    }
    await db.refresh(cfg.database);
    setStatus('ok', `Guardado: ${cells.length} celdas`);
    return { ok: true, cells: cells.length };
  } catch (err) {
    const msg = err.message || String(err);
    setStatus('error', msg);
    return { ok: false, error: msg };
  }
}

async function queryDb(sql, statusMsg) {
  const token = getToken();
  if (!token) {
    const msg = 'Se requiere un token de GitHub para guardar.';
    setStatus('error', msg);
    return { ok: false, error: msg };
  }

  const cfg = getDbConfig();
  setStatus('saving', statusMsg || 'Guardando… (10–30 s)');

  try {
    const db = createClient();
    const result = await db.query(cfg.database, sql);
    if (!result.ok) {
      const msg = result.error || 'Error SQL';
      setStatus('error', msg);
      return { ok: false, error: msg };
    }
    await db.refresh(cfg.database);
    return { ok: true, result };
  } catch (err) {
    const msg = err.message || String(err);
    setStatus('error', msg);
    return { ok: false, error: msg };
  }
}

function nextId(rows) {
  if (!rows.length) return 1;
  return Math.max(...rows.map((r) => Number(r.id) || 0)) + 1;
}

export async function loadClientiFromDb() {
  const profile = getActiveProfile();
  setStatus('loading', `${profile?.name}: clienti…`);

  try {
    const cfg = getDbConfig();
    const db = createClient();
    await db.refresh(cfg.database);
    const rows = (await db.table(cfg.database, 'clienti')).objects();
    setStatus('ok', `${rows.length} clienti`);
    return { ok: true, data: rows };
  } catch (err) {
    const msg = err.message || String(err);
    setStatus('error', msg);
    return { ok: false, error: msg };
  }
}

export async function saveClienteToDb(cliente, existingRows = []) {
  const id = cliente.id || nextId(existingRows);
  const sql = cliente.id
    ? `UPDATE clienti SET nome = ${sqlEscape(cliente.nome)}, cognome = ${sqlEscape(cliente.cognome)}, email = ${sqlEscape(cliente.email)}, telefono = ${sqlEscape(cliente.telefono)}, note = ${sqlEscape(cliente.note || '')} WHERE id = ${id}`
    : `INSERT INTO clienti (id, nome, cognome, email, telefono, note) VALUES (${id}, ${sqlEscape(cliente.nome)}, ${sqlEscape(cliente.cognome)}, ${sqlEscape(cliente.email)}, ${sqlEscape(cliente.telefono)}, ${sqlEscape(cliente.note || '')})`;

  const res = await queryDb(sql, 'Guardando cliente…');
  if (res.ok) setStatus('ok', 'Cliente guardado');
  return res.ok ? { ok: true, id } : res;
}

export async function deleteClienteFromDb(id) {
  const res = await queryDb(`DELETE FROM clienti WHERE id = ${id}`, 'Eliminando…');
  if (res.ok) setStatus('ok', 'Cliente eliminado');
  return res;
}

export async function loadPrenotazioniFromDb() {
  const profile = getActiveProfile();
  setStatus('loading', `${profile?.name}: prenotazioni…`);

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

    setStatus('ok', `${data.length} prenotazioni`);
    return { ok: true, data, clienti, celle };
  } catch (err) {
    const msg = err.message || String(err);
    setStatus('error', msg);
    return { ok: false, error: msg };
  }
}

export async function savePrenotazioneToDb(prenotazione, existingRows = []) {
  const id = prenotazione.id || nextId(existingRows);
  const sql = prenotazione.id
    ? `UPDATE prenotazioni SET cliente_id = ${prenotazione.cliente_id}, cella = ${prenotazione.cella || 0}, data_inizio = ${sqlEscape(prenotazione.data_inizio)}, data_fine = ${sqlEscape(prenotazione.data_fine)}, stato = ${sqlEscape(prenotazione.stato)}, note = ${sqlEscape(prenotazione.note || '')} WHERE id = ${id}`
    : `INSERT INTO prenotazioni (id, cliente_id, cella, data_inizio, data_fine, stato, note) VALUES (${id}, ${prenotazione.cliente_id}, ${prenotazione.cella || 0}, ${sqlEscape(prenotazione.data_inizio)}, ${sqlEscape(prenotazione.data_fine)}, ${sqlEscape(prenotazione.stato)}, ${sqlEscape(prenotazione.note || '')})`;

  const res = await queryDb(sql, 'Guardando prenotazione…');
  if (res.ok) setStatus('ok', 'Prenotazione salvata');
  return res.ok ? { ok: true, id } : res;
}

export async function deletePrenotazioneFromDb(id) {
  const res = await queryDb(`DELETE FROM prenotazioni WHERE id = ${id}`, 'Eliminando…');
  if (res.ok) setStatus('ok', 'Prenotazione eliminata');
  return res;
}

/** Comprueba conectividad de lectura del perfil activo */
export async function testActiveProfile() {
  const cfg = getDbConfig();
  const profile = getActiveProfile();
  setStatus('loading', `Probando ${profile?.name}…`);

  try {
    const db = createClient();
    await db.refresh(cfg.database);
    setStatus('ok', `Conectado: ${cfg.owner}/${cfg.repo} → ${cfg.database}`);
    return { ok: true };
  } catch (err) {
    const msg = err.message || String(err);
    setStatus('error', msg);
    return { ok: false, error: msg };
  }
}