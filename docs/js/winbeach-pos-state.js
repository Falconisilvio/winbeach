/**
 * WinBeach — POS State module
 * Gestisce lo stato del punto vendita (tavoli, carrelli) su GitHubDB con fallback localStorage.
 * Sincronizzazione batch per evitare troppe chiamate API.
 */
import { GithubDB } from './githubdb/client.js';

const POS_STATE_KEY = 'winbeach_pos_state_cache';
const SYNC_INTERVAL = 30000;
const LEGACY_KEYS = [
  'tavoloSelezionato', 'tavoloSelezionatoId', 'pos_azione_richiesta',
  'winbeach_archivio_ristorante'
];

let dbClient = null;
let dbConfig = null;
let posStateCache = null;
let syncTimer = null;
let pendingChanges = false;

function getDbConfig() {
  if (dbConfig) return dbConfig;
  try {
    const profiles = JSON.parse(localStorage.getItem('winbeach_profiles') || '[]');
    const activeId = localStorage.getItem('winbeach_active_profile');
    const profile = profiles.find(p => p.id === activeId) || profiles[0];
    if (profile) {
      dbConfig = {
        owner: profile.owner,
        repo: profile.repo,
        branch: profile.branch,
        database: profile.database
      };
    }
  } catch {}
  return dbConfig;
}

function getToken() {
  try {
    const tokens = JSON.parse(localStorage.getItem('winbeach_profile_tokens') || '{}');
    const activeId = localStorage.getItem('winbeach_active_profile');
    return tokens[activeId] || null;
  } catch {
    return null;
  }
}

function createClient() {
  if (dbClient) return dbClient;
  const cfg = getDbConfig();
  if (!cfg) return null;
  dbClient = new GithubDB({
    owner: cfg.owner,
    repo: cfg.repo,
    branch: cfg.branch,
    token: getToken()
  });
  return dbClient;
}

function loadCache() {
  if (posStateCache) return posStateCache;
  try {
    posStateCache = JSON.parse(localStorage.getItem(POS_STATE_KEY) || '{}');
  } catch {
    posStateCache = {};
  }
  return posStateCache;
}

function saveCache(data) {
  posStateCache = data;
  localStorage.setItem(POS_STATE_KEY, JSON.stringify(data));
}

function migrateLegacyPosState() {
  const cache = loadCache();
  if (cache.migrated) return;
  
  for (const key of LEGACY_KEYS) {
    const value = localStorage.getItem(key);
    if (value) cache[key] = value;
  }
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('carrello_tavolo_') || 
        key.startsWith('coperti_tavolo_') || 
        key.startsWith('ora_apertura_tavolo_') ||
        key.startsWith('tavoli_uniti_a_'))) {
      cache[key] = localStorage.getItem(key);
    }
  }
  
  cache.migrated = true;
  saveCache(cache);
}

migrateLegacyPosState();

function getAllPosKeys() {
  const cache = loadCache();
  return Object.entries(cache).filter(([k]) => k !== 'migrated');
}

export function getPosState(key) {
  const cache = loadCache();
  return cache[key] !== undefined ? cache[key] : localStorage.getItem(key);
}

export function setPosState(key, value) {
  const cache = loadCache();
  if (value === null || value === undefined) {
    delete cache[key];
    localStorage.removeItem(key);
  } else {
    cache[key] = value;
    localStorage.setItem(key, String(value));
  }
  saveCache(cache);
  pendingChanges = true;
}

export function getTavoloSelezionato() {
  return getPosState('tavoloSelezionato') || 'Tavolo 1';
}

export function setTavoloSelezionato(nome) {
  setPosState('tavoloSelezionato', nome);
}

export function getTavoloSelezionatoId() {
  return getPosState('tavoloSelezionatoId');
}

export function setTavoloSelezionatoId(id) {
  setPosState('tavoloSelezionatoId', id);
}

export function getAzioneRichiesta() {
  return getPosState('pos_azione_richiesta');
}

export function setAzioneRichiesta(azione) {
  setPosState('pos_azione_richiesta', azione);
}

export function getCarrello(tavoloId) {
  const key = `carrello_tavolo_${tavoloId}`;
  const value = getPosState(key);
  try {
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

export function setCarrello(tavoloId, carrello) {
  const key = `carrello_tavolo_${tavoloId}`;
  setPosState(key, JSON.stringify(carrello));
}

export function getCoperti(tavoloId) {
  const key = `coperti_tavolo_${tavoloId}`;
  return parseInt(getPosState(key) || '1', 10);
}

export function setCoperti(tavoloId, numCoperti) {
  const key = `coperti_tavolo_${tavoloId}`;
  setPosState(key, String(numCoperti));
}

export function getOraApertura(tavoloId) {
  const key = `ora_apertura_tavolo_${tavoloId}`;
  return getPosState(key);
}

export function setOraApertura(tavoloId, ora) {
  const key = `ora_apertura_tavolo_${tavoloId}`;
  setPosState(key, ora);
}

export function clearTavoloState(tavoloId) {
  localStorage.removeItem(`carrello_tavolo_${tavoloId}`);
  localStorage.removeItem(`coperti_tavolo_${tavoloId}`);
  localStorage.removeItem(`ora_apertura_tavolo_${tavoloId}`);
  localStorage.removeItem(`tavoli_uniti_a_${tavoloId}`);
  
  const cache = loadCache();
  delete cache[`carrello_tavolo_${tavoloId}`];
  delete cache[`coperti_tavolo_${tavoloId}`];
  delete cache[`ora_apertura_tavolo_${tavoloId}`];
  delete cache[`tavoli_uniti_a_${tavoloId}`];
  saveCache(cache);
  pendingChanges = true;
}

export function clearAllPosState() {
  for (const key of LEGACY_KEYS) {
    localStorage.removeItem(key);
  }
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('carrello_tavolo_') || 
        key.startsWith('coperti_tavolo_') || 
        key.startsWith('ora_apertura_tavolo_') ||
        key.startsWith('tavoli_uniti_a_'))) {
      localStorage.removeItem(key);
    }
  }
  saveCache({ migrated: true });
  pendingChanges = true;
}

async function syncToDb() {
  if (!pendingChanges) return;
  
  const client = createClient();
  const cfg = getDbConfig();
  if (!client || !cfg) return;
  
  try {
    await client.refresh(cfg.database);
    const table = await client.table(cfg.database, 'pos_state');
    const existingRows = table.objects();
    
    const deleteSql = 'DELETE FROM pos_state';
    const values = getAllPosKeys().map(([key, value], i) => {
      const tavoloId = key.includes('_tavolo_') ? parseInt(key.split('_tavolo_')[1]) || 0 : 0;
      return `(${i + 1}, ${tavoloId}, '${key.replace(/'/g, "''")}', '${String(value).replace(/'/g, "''")}')`;
    });
    
    let sql = deleteSql;
    if (values.length) {
      sql += `; INSERT INTO pos_state (id, tavolo_id, chiave, valore) VALUES ${values.join(', ')}`;
    }
    
    await client.query(cfg.database, sql);
    await client.refresh(cfg.database);
    pendingChanges = false;
  } catch (err) {
    console.error('POS state sync failed:', err);
  }
}

export function startPosSync() {
  if (syncTimer) return;
  syncTimer = setInterval(syncToDb, SYNC_INTERVAL);
}

export function stopPosSync() {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
  }
}

export async function loadPosStateFromDb() {
  const client = createClient();
  const cfg = getDbConfig();
  if (!client || !cfg) return;
  
  try {
    await client.refresh(cfg.database);
    const table = await client.table(cfg.database, 'pos_state');
    const rows = table.objects();
    
    const cache = loadCache();
    for (const row of rows) {
      cache[row.chiave] = row.valore;
      localStorage.setItem(row.chiave, row.valore);
    }
    saveCache(cache);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('winbeach-pos-sync'));
    }
  } catch (err) {
    console.error('POS state load failed:', err);
  }
}

export function onPosSync(callback) {
  const handler = () => callback();
  window.addEventListener('winbeach-pos-sync', handler);
  return () => window.removeEventListener('winbeach-pos-sync', handler);
}

export async function syncPosStateNow() {
  await syncToDb();
}
