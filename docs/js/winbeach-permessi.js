/**
 * WinBeach — Modulo Permessi
 * Controlla i livelli di accesso e i permessi per procedura.
 */
import { GithubDB } from './githubdb/client.js';

let cachedLivelli = null;
let cachedPermessi = null;
let dbClient = null;
let dbConfig = null;

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

async function loadLivelli() {
  if (cachedLivelli) return cachedLivelli;
  const client = createClient();
  const cfg = getDbConfig();
  if (!client || !cfg) return [];
  
  try {
    await client.refresh(cfg.database);
    const table = await client.table(cfg.database, 'livelli');
    cachedLivelli = table.objects();
    return cachedLivelli;
  } catch {
    return [];
  }
}

async function loadPermessi() {
  if (cachedPermessi) return cachedPermessi;
  const client = createClient();
  const cfg = getDbConfig();
  if (!client || !cfg) return [];
  
  try {
    await client.refresh(cfg.database);
    const table = await client.table(cfg.database, 'permessi');
    cachedPermessi = table.objects();
    return cachedPermessi;
  } catch {
    return [];
  }
}

export function getUserLevel() {
  try {
    const session = JSON.parse(sessionStorage.getItem('winbeach_session') || '{}');
    return session.livello ?? 0;
  } catch {
    return 0;
  }
}

export function getUserRole() {
  try {
    const session = JSON.parse(sessionStorage.getItem('winbeach_session') || '{}');
    return session.ruolo || '';
  } catch {
    return '';
  }
}

export function isAdmin() {
  return getUserRole() === 'Amministratore';
}

export async function loadUserPermissions() {
  const livelli = await loadLivelli();
  const permessi = await loadPermessi();
  const userLevel = getUserLevel();
  
  const userPermessi = {};
  for (const p of permessi) {
    if (p.livello_id === userLevel) {
      userPermessi[p.procedura] = p.permesso;
    }
  }
  
  return userPermessi;
}

export async function canAccess(procedura) {
  if (isAdmin()) return 'scrittura';
  
  const permessi = await loadUserPermissions();
  return permessi[procedura] || null;
}

export async function canRead(procedura) {
  const permesso = await canAccess(procedura);
  return permesso === 'lettura' || permesso === 'scrittura';
}

export async function canWrite(procedura) {
  const permesso = await canAccess(procedura);
  return permesso === 'scrittura';
}

export async function checkPermission(procedura, requireWrite = false) {
  if (isAdmin()) return { allowed: true, permesso: 'scrittura' };
  
  const permesso = await canAccess(procedura);
  
  if (!permesso) {
    return { allowed: false, permesso: null, message: 'Accesso negato a questa procedura' };
  }
  
  if (requireWrite && permesso !== 'scrittura') {
    return { allowed: false, permesso, message: 'Permesso di sola lettura' };
  }
  
  return { allowed: true, permesso };
}

export async function getAllLivelli() {
  return await loadLivelli();
}

export async function getLivelloNome(livelloId) {
  const livelli = await loadLivelli();
  const livello = livelli.find(l => l.id === livelloId);
  return livello ? livello.nome : 'Sconosciuto';
}

export async function getPermessiByLivello(livelloId) {
  const permessi = await loadPermessi();
  return permessi.filter(p => p.livello_id === livelloId);
}

export async function savePermesso(livelloId, procedura, permesso) {
  const client = createClient();
  const cfg = getDbConfig();
  if (!client || !cfg) return false;
  
  try {
    const permessi = await loadPermessi();
    const existing = permessi.find(p => p.livello_id === livelloId && p.procedura === procedura);
    
    let sql;
    if (existing) {
      sql = `UPDATE permessi SET permesso = '${permesso}' WHERE id = ${existing.id}`;
    } else {
      const nextId = permessi.length ? Math.max(...permessi.map(p => p.id)) + 1 : 1;
      sql = `INSERT INTO permessi (id, livello_id, procedura, permesso) VALUES (${nextId}, ${livelloId}, '${procedura}', '${permesso}')`;
    }
    
    await client.query(cfg.database, sql);
    cachedPermessi = null;
    return true;
  } catch {
    return false;
  }
}

export async function deletePermesso(livelloId, procedura) {
  const client = createClient();
  const cfg = getDbConfig();
  if (!client || !cfg) return false;
  
  try {
    const permessi = await loadPermessi();
    const existing = permessi.find(p => p.livello_id === livelloId && p.procedura === procedura);
    if (!existing) return false;
    
    await client.query(cfg.database, `DELETE FROM permessi WHERE id = ${existing.id}`);
    cachedPermessi = null;
    return true;
  } catch {
    return false;
  }
}

export function clearCache() {
  cachedLivelli = null;
  cachedPermessi = null;
}

export function onPermissionChange(callback) {
  const handler = () => callback();
  window.addEventListener('winbeach-permission-change', handler);
  return () => window.removeEventListener('winbeach-permission-change', handler);
}

export function broadcastPermissionChange() {
  window.dispatchEvent(new CustomEvent('winbeach-permission-change'));
}
