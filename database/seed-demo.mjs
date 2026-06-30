#!/usr/bin/env node
/**
 * Genera datos de prueba para varias BDs WinBeach en githubDB.
 * Uso: node seed-demo.mjs [--all]
 */
import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TODAY = '2026-06-30';
const TOMORROW = '2026-07-01';
const YESTERDAY = '2026-06-29';
const GITHUBDB = join(__dirname, '../../githubdb/data');

function isoOffset(days) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function generateCelle(rows, cols, walkway) {
  const out = [];
  let id = 1;
  let cella = 1;
  for (let y = 1; y <= rows; y++) {
    for (let x = 1; x <= cols; x++) {
      if (x === walkway) {
        out.push([id++, 0, x, y, 'Pasarela', '', null, false]);
        continue;
      }
      if (y <= 2) {
        out.push([id++, 0, x, y, 'Mare', '', null, false]);
        continue;
      }
      const settore = y <= Math.ceil(rows * 0.35) ? 'A' : y <= Math.ceil(rows * 0.65) ? 'B' : 'C';
      const tipo = (x + y) % 7 === 0 ? 'Cabina' : (x + y) % 5 === 0 ? 'Hawaiana' : 'Ombrellone';
      out.push([id++, cella++, x, y, tipo, `${tipo} ${cella - 1}`, settore, true]);
    }
  }
  return out;
}

function makeClienti(prefix, count) {
  const nomi = ['Marco', 'Giulia', 'Luca', 'Sofia', 'Andrea', 'Elena', 'Paolo', 'Francesca', 'Davide', 'Chiara'];
  const cognomi = ['Rossi', 'Bianchi', 'Verdi', 'Russo', 'Ferrari', 'Colombo', 'Ricci', 'Marino', 'Greco', 'Bruno'];
  return Array.from({ length: count }, (_, i) => {
    const n = nomi[i % nomi.length];
    const c = cognomi[(i + 3) % cognomi.length];
    return [i + 1, n, c, `${prefix}.${n.toLowerCase()}@email.it`, `+39 333 ${1000000 + i}`, i === 0 ? 'Cliente VIP' : ''];
  });
}

function makePrenotazioni(clienti, cellaMax, count, seed = 0) {
  const canali = ['offline', 'widget', 'portale'];
  const statiPag = ['saldato', 'parziale', 'da_saldare'];
  const rows = [];
  for (let i = 0; i < count; i++) {
    const id = i + 1;
    const clienteId = (i % clienti.length) + 1;
    const cella = ((i * 7 + seed) % cellaMax) + 1;
    const offsetIn = (i % 5) - 2 + (seed % 3);
    const dur = 2 + (i % 6);
    const inizio = offsetIn <= 0 ? TODAY : isoOffset(offsetIn);
    const fine = offsetIn <= 0 ? isoOffset(dur) : isoOffset(offsetIn + dur);
    const stato = i % 11 === 0 ? 'cancellata' : i % 7 === 0 ? 'in_attesa' : 'confermata';
    const importo = 35 + (i % 8) * 28;
    const pagato = stato === 'cancellata' ? 0 : statiPag[i % 3] === 'saldato' ? importo : statiPag[i % 3] === 'parziale' ? Math.round(importo * 0.4) : 0;
    rows.push([
      id, clienteId, cella, inizio, fine, stato, '',
      importo, pagato, canali[i % 3], statiPag[i % 3],
      inizio === TODAY ? '09:00' : '', inizio <= TODAY && fine >= TODAY, fine === TODAY,
    ]);
  }
  return rows;
}

const DATABASES = [
  {
    file: 'winbeach.json',
    azienda: 'Stabilimento Balneare S.r.l.',
    grid: { rows: 14, cols: 22, walkway: 11 },
    clienti: 20,
    prenotazioni: 35,
    seed: 0,
    hotel: 'Hotel Riviera',
  },
  {
    file: 'winbeach-lido-sud.json',
    azienda: 'Lido Sud di Puglia S.r.l.',
    grid: { rows: 10, cols: 16, walkway: 8 },
    clienti: 8,
    prenotazioni: 12,
    seed: 11,
    hotel: 'Hotel Baia Sud',
  },
  {
    file: 'winbeach-lido-europa.json',
    azienda: 'Lido Europa Beach Club',
    grid: { rows: 12, cols: 20, walkway: 10 },
    clienti: 14,
    prenotazioni: 22,
    seed: 23,
    hotel: 'Grand Hotel Europa',
  },
];

function seedDb(db, cfg) {
  const { rows, cols, walkway } = cfg.grid;
  const celle = generateCelle(rows, cols, walkway);
  const postazioni = celle.filter((c) => c[7] && c[1] > 0).length;
  const clienti = makeClienti(cfg.file.replace('.json', '').replace('winbeach-', ''), cfg.clienti);
  const prenotazioni = makePrenotazioni(clienti, postazioni, cfg.prenotazioni, cfg.seed);

  db.tables.config.rows = [[1, rows, cols, walkway, postazioni + 1, '2026-06-01', '2026-09-15', new Date().toISOString()]];
  db.tables.celle.rows = celle;
  db.tables.clienti.rows = clienti;
  db.tables.prenotazioni.rows = prenotazioni;
  db.tables.azienda.rows = [[1, cfg.azienda, 'IT12345678901', 'Lungomare Europa, 1', 'info@winbeach.it', '+39 080 1234567', '01/06 — 15/09']];

  const entrate = prenotazioni.filter((p) => p[5] !== 'cancellata').slice(0, 5);
  db.tables.movimenti_cassa.rows = entrate.map((p, i) => [
    i + 1, `${TODAY}T${9 + i}:00:00`, 'entrata', `Prenotazione #${p[0]}`, p[8] || p[7], 'contanti', p[0], 'reception', '',
  ]);

  db.tables.log_sconti.rows = [[1, `${TODAY}T10:00:00`, 'reception', 1, 1, 10, 24, 'Demo']];
  db.tables.log_cancellazioni.rows = prenotazioni
    .filter((p) => p[5] === 'cancellata')
    .map((p, i) => [i + 1, `${YESTERDAY}T09:00:00`, p[0], p[1], p[7], 20, 'Demo', 'reception']);
  db.tables.contatori_albergo.rows = [[1, cfg.hotel, 'OMB-2026', 100, Math.min(cfg.prenotazioni, 30)]];

  const attive = prenotazioni.filter((p) => p[5] !== 'cancellata');
  return {
    name: cfg.file,
    clienti: clienti.length,
    prenotazioni: prenotazioni.length,
    postazioni,
    arriviOggi: attive.filter((p) => p[3] === TODAY).length,
    partenzeOggi: attive.filter((p) => p[4] === TODAY).length,
    fatturato: attive.reduce((s, p) => s + p[7], 0),
  };
}

const baseSchema = JSON.parse(readFileSync(join(__dirname, 'winbeach.json'), 'utf8'));

const outArg = process.argv.indexOf('--out');
if (outArg >= 0) {
  const db = structuredClone(baseSchema);
  const stats = seedDb(db, DATABASES[0]);
  writeFileSync(process.argv[outArg + 1], JSON.stringify(db, null, 2) + '\n');
  console.log('Seed:', process.argv[outArg + 1], stats);
  process.exit(0);
}

const toGenerate = process.argv.includes('--all') ? DATABASES : DATABASES;
console.log('=== Generando BDs de prueba ===\n');
for (const cfg of toGenerate) {
  const db = structuredClone(baseSchema);
  const stats = seedDb(db, cfg);
  const localPath = join(__dirname, cfg.file);
  const remotePath = join(GITHUBDB, cfg.file);
  writeFileSync(localPath, JSON.stringify(db, null, 2) + '\n');
  if (existsSync(GITHUBDB)) writeFileSync(remotePath, JSON.stringify(db, null, 2) + '\n');
  console.log(`${cfg.file}: ${stats.clienti} clienti, ${stats.prenotazioni} prenotazioni, arrivi oggi ${stats.arriviOggi}, €${stats.fatturato}`);
}