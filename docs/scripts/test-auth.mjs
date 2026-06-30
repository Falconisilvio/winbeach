#!/usr/bin/env node
/**
 * Verifica opción 1: credenciales en BD, login page desplegada, roles y hashes.
 */
import { createHash } from 'crypto';

const LIVE = process.env.TEST_LIVE
  ? 'https://falconisilvio.github.io/winbeach'
  : null;
const CDN = 'https://raw.githubusercontent.com/FiveTechSoft/githubdb/main/data';

const DBS = ['winbeach', 'winbeach-lido-sud', 'winbeach-lido-europa'];

const EXPECTED = {
  admin: {
    password: 'admin',
    hash: '34750549a7ff3b67f9f198f6f9b47d576b695862f493bdab66d1fb2ca885e960',
    ruolo: 'Amministratore',
  },
  reception: {
    password: 'reception',
    hash: '139de5420069a8b3b8510a044edfbceb62b7a9fd84bdc3a57457eda42476b04c',
    ruolo: 'Operatore',
  },
};

const WRITE_ROLES = new Set(['Amministratore', 'Operatore', 'Administratore', 'Operador']);

function hashPassword(username, password) {
  return createHash('sha256')
    .update(`winbeach:${username}:${password}`)
    .digest('hex');
}

function rowsToUtenti(data) {
  const table = data.tables?.utenti;
  if (!table?.columns || !table?.rows) return [];
  const names = table.columns.map((c) => c.name);
  return table.rows.map((row) => Object.fromEntries(names.map((n, i) => [n, row[i]])));
}

async function testHashes() {
  console.log('\n=== Algoritmo password (SHA-256) ===');
  for (const [user, cfg] of Object.entries(EXPECTED)) {
    const h = hashPassword(user, cfg.password);
    if (h !== cfg.hash) throw new Error(`Hash ${user}: esperado ${cfg.hash}, obtuvo ${h}`);
    console.log(`  ✓ ${user}/${cfg.password} → hash OK`);
  }
}

async function testUtentiPerDb() {
  console.log('\n=== Usuarios en cada BD (CDN) ===');
  for (const db of DBS) {
    const res = await fetch(`${CDN}/${db}.json`, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`${db}.json HTTP ${res.status}`);
    const data = await res.json();
    const utenti = rowsToUtenti(data);

    for (const [name, cfg] of Object.entries(EXPECTED)) {
      const u = utenti.find((x) => String(x.username).toLowerCase() === name);
      if (!u) throw new Error(`${db}: falta usuario ${name}`);
      if (u.password_hash !== cfg.hash) throw new Error(`${db}: hash incorrecto para ${name}`);
      if (u.ruolo !== cfg.ruolo) throw new Error(`${db}: rol ${name} = ${u.ruolo}, esperado ${cfg.ruolo}`);
      if (u.attivo === false) throw new Error(`${db}: ${name} inactivo`);
    }
    console.log(`  ✓ ${db}: admin + reception activos`);
  }
}

function testRoleLogic() {
  console.log('\n=== Lógica de permisos (simulada) ===');
  const cases = [
    { ruolo: 'Amministratore', write: true, admin: true },
    { ruolo: 'Operatore', write: true, admin: false },
    { ruolo: 'Lettore', write: false, admin: false },
    { ruolo: null, write: false, admin: false },
  ];
  for (const c of cases) {
    const write = Boolean(c.ruolo && WRITE_ROLES.has(c.ruolo));
    const admin = c.ruolo === 'Amministratore' || c.ruolo === 'Administratore';
    if (write !== c.write || admin !== c.admin) {
      throw new Error(`Rol ${c.ruolo}: write=${write} admin=${admin}`);
    }
    const label = c.ruolo || 'sin sesión';
    console.log(`  ✓ ${label}: lettura${write ? ' + scrittura' : ''}${admin ? ' + admin' : ''}`);
  }
}

async function testLiveLoginPage() {
  if (!LIVE) {
    console.log('\n=== Login en producción (omitido, usa TEST_LIVE=1) ===');
    return;
  }
  console.log('\n=== Login en producción ===');
  const res = await fetch(`${LIVE}/login.html`, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`login.html HTTP ${res.status}`);
  const html = await res.text();
  if (!html.includes('login-form')) throw new Error('login.html sin formulario');
  if (!html.includes('js/login.js')) throw new Error('login.html sin login.js');
  const authJs = await fetch(`${LIVE}/js/winbeach-auth.js`).then((r) => {
    if (!r.ok) throw new Error(`winbeach-auth.js HTTP ${r.status}`);
    return r.text();
  });
  if (!authJs.includes('assertCanWrite')) throw new Error('winbeach-auth.js incompleto');
  console.log('  ✓ login.html y winbeach-auth.js desplegados');
}

async function main() {
  console.log('Test autenticación WinBeach — opción 1 (login + sola lettura)');
  await testHashes();
  await testUtentiPerDb();
  await testRoleLogic();
  await testLiveLoginPage();
  console.log('\n✅ Autenticación verificada — lista para uso interno (opción 1)');
}

main().catch((e) => {
  console.error('❌', e.message);
  process.exit(1);
});