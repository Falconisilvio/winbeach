/**
 * WinBeach — capa de persistencia con githubDB
 * Lecturas: CDN (sin token). Escrituras: repository_dispatch (requiere token).
 */
import { GithubDB } from './githubdb/client.js';

const CONFIG_KEY = 'winbeach_db_config';
const TOKEN_KEY = 'winbeach_github_token';

const DEFAULT_CONFIG = {
  owner: 'FiveTechSoft',
  repo: 'githubdb',
  branch: 'main',
  database: 'winbeach',
};

let lastStatus = { state: 'idle', message: '' };

export function getDbConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : { ...DEFAULT_CONFIG };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveDbConfig(config) {
  const merged = { ...DEFAULT_CONFIG, ...config };
  localStorage.setItem(CONFIG_KEY, JSON.stringify({
    owner: merged.owner,
    repo: merged.repo,
    branch: merged.branch,
    database: merged.database,
  }));
  return merged;
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY) || '';
}

export function saveToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

export function getDbStatus() {
  return { ...lastStatus };
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

/**
 * Carga estructura de playa desde githubDB (lectura rápida vía CDN).
 * @returns {Promise<{ok:boolean, data?:object, error?:string, empty?:boolean}>}
 */
export async function loadStrutturaFromDb() {
  const cfg = getDbConfig();
  setStatus('loading', `Cargando ${cfg.owner}/${cfg.repo}…`);

  try {
    const db = createClient();
    await db.refresh(cfg.database);

    const configTable = await db.table(cfg.database, 'config');
    const celleTable = await db.table(cfg.database, 'celle');
    const configRows = configTable.objects();
    const celleRows = celleTable.objects();

    if (!configRows.length && !celleRows.length) {
      setStatus('empty', 'Base de datos vacía — se usa diseño demo.');
      return { ok: true, empty: true };
    }

    const config = configRows[0] || {};
    setStatus('ok', `Cargado: ${celleRows.length} celdas`);
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

/**
 * Guarda estructura en githubDB vía GitHub Actions (~10–30 s).
 * @param {{rows:number, cols:number, walkwayCol:number, prossimo:number, cells:object[]}} struttura
 */
export async function saveStrutturaToDb(struttura) {
  const token = getToken();
  if (!token) {
    const msg = 'Se requiere un token de GitHub para guardar.';
    setStatus('error', msg);
    return { ok: false, error: msg };
  }

  const cfg = getDbConfig();
  setStatus('saving', 'Guardando… (10–30 s vía GitHub Actions)');

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

  const sql = sqlParts.join('; ');

  try {
    const db = createClient();
    const result = await db.query(cfg.database, sql);

    if (!result.ok) {
      const msg = result.error || 'Error en la consulta SQL';
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

/**
 * Lectura rápida de clienti (para futuros módulos).
 */
export async function loadClienti() {
  const cfg = getDbConfig();
  const db = createClient();
  const table = await db.table(cfg.database, 'clienti');
  return table.objects();
}