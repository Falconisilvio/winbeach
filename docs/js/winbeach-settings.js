/**
 * WinBeach — Settings module
 * Gestisce le preferenze utente (lingua, tema) su GitHubDB con fallback localStorage.
 */
import { GithubDB } from './githubdb/client.js';

const SETTINGS_KEY = 'winbeach_settings_cache';
const LEGACY_LANG_KEY = 'winbeach-app-lang';
const LEGACY_THEME_KEY = 'winbeach_theme';
const LEGACY_GUIDE_LANG_KEY = 'winbeach-guide-lang';

let dbClient = null;
let dbConfig = null;
let settingsCache = null;

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
  if (settingsCache) return settingsCache;
  try {
    settingsCache = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  } catch {
    settingsCache = {};
  }
  return settingsCache;
}

function saveCache(data) {
  settingsCache = data;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
}

function migrateLegacySettings() {
  const cache = loadCache();
  if (!cache.migrated) {
    const lang = localStorage.getItem(LEGACY_LANG_KEY);
    const theme = localStorage.getItem(LEGACY_THEME_KEY);
    const guideLang = localStorage.getItem(LEGACY_GUIDE_LANG_KEY);
    
    if (lang) cache.lang = lang;
    if (theme) cache.theme = theme;
    if (guideLang) cache.guideLang = guideLang;
    
    cache.migrated = true;
    saveCache(cache);
  }
}

migrateLegacySettings();

async function loadSettingsFromDb() {
  const client = createClient();
  const cfg = getDbConfig();
  if (!client || !cfg) return null;
  
  try {
    await client.refresh(cfg.database);
    const table = await client.table(cfg.database, 'settings');
    const rows = table.objects();
    const settings = {};
    for (const row of rows) {
      settings[row.chiave] = row.valore;
    }
    return settings;
  } catch {
    return null;
  }
}

async function saveSettingToDb(key, value) {
  const client = createClient();
  const cfg = getDbConfig();
  if (!client || !cfg) return false;
  
  try {
    const table = await client.table(cfg.database, 'settings');
    const rows = table.objects();
    const existing = rows.find(r => r.chiave === key);
    
    let sql;
    if (existing) {
      sql = `UPDATE settings SET valore = '${String(value).replace(/'/g, "''")}' WHERE chiave = '${key}'`;
    } else {
      const nextId = rows.length ? Math.max(...rows.map(r => r.id)) + 1 : 1;
      sql = `INSERT INTO settings (id, chiave, valore) VALUES (${nextId}, '${key}', '${String(value).replace(/'/g, "''")}')`;
    }
    
    await client.query(cfg.database, sql);
    await client.refresh(cfg.database);
    return true;
  } catch {
    return false;
  }
}

export async function getSetting(key, defaultValue = null) {
  const cache = loadCache();
  if (cache[key] !== undefined) return cache[key];
  
  const dbSettings = await loadSettingsFromDb();
  if (dbSettings && dbSettings[key] !== undefined) {
    cache[key] = dbSettings[key];
    saveCache(cache);
    return dbSettings[key];
  }
  
  return defaultValue;
}

export async function setSetting(key, value) {
  const cache = loadCache();
  cache[key] = value;
  saveCache(cache);
  
  await saveSettingToDb(key, value);
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('winbeach-setting-change', {
      detail: { key, value }
    }));
  }
}

export function getLang() {
  const cache = loadCache();
  return cache.lang || localStorage.getItem(LEGACY_LANG_KEY) || 'it';
}

export async function setLang(lang) {
  await setSetting('lang', lang);
  localStorage.setItem(LEGACY_LANG_KEY, lang);
}

export function getTheme() {
  const cache = loadCache();
  return cache.theme || localStorage.getItem(LEGACY_THEME_KEY) || 'light';
}

export async function setTheme(theme) {
  await setSetting('theme', theme);
  localStorage.setItem(LEGACY_THEME_KEY, theme);
}

export function getGuideLang() {
  const cache = loadCache();
  return cache.guideLang || localStorage.getItem(LEGACY_GUIDE_LANG_KEY) || getLang();
}

export async function setGuideLang(lang) {
  await setSetting('guideLang', lang);
  localStorage.setItem(LEGACY_GUIDE_LANG_KEY, lang);
}

export function onSettingChange(callback) {
  const handler = (e) => callback(e.detail);
  window.addEventListener('winbeach-setting-change', handler);
  return () => window.removeEventListener('winbeach-setting-change', handler);
}

export async function syncSettingsFromDb() {
  const dbSettings = await loadSettingsFromDb();
  if (!dbSettings) return;
  
  const cache = loadCache();
  let changed = false;
  
  for (const [key, value] of Object.entries(dbSettings)) {
    if (cache[key] !== value) {
      cache[key] = value;
      changed = true;
      localStorage.setItem(
        key === 'lang' ? LEGACY_LANG_KEY :
        key === 'theme' ? LEGACY_THEME_KEY :
        key === 'guideLang' ? LEGACY_GUIDE_LANG_KEY : key,
        value
      );
    }
  }
  
  if (changed) {
    saveCache(cache);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('winbeach-settings-sync'));
    }
  }
}
