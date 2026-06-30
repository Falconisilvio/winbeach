#!/usr/bin/env node
/**
 * Genera datos de prueba para winbeach.json (githubDB).
 * Uso: node seed-demo.mjs [--out path]
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TODAY = '2026-06-30';
const TOMORROW = '2026-07-01';
const YESTERDAY = '2026-06-29';

function isoOffset(days) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function generateCelle() {
  const rows = [];
  let id = 1;
  let cella = 1;
  const ROWS = 14;
  const COLS = 22;
  const WALKWAY = 11;

  for (let y = 1; y <= ROWS; y++) {
    for (let x = 1; x <= COLS; x++) {
      if (x === WALKWAY) {
        rows.push([id++, 0, x, y, 'Pasarela', '', null, false]);
        continue;
      }
      if (y <= 2) {
        rows.push([id++, 0, x, y, 'Mare', '', null, false]);
        continue;
      }
      const settore = y <= 5 ? 'A' : y <= 9 ? 'B' : 'C';
      const tipo = (x + y) % 7 === 0 ? 'Cabina' : (x + y) % 5 === 0 ? 'Hawaiana' : 'Ombrellone';
      rows.push([id++, cella++, x, y, tipo, `${tipo} ${cella - 1}`, settore, true]);
    }
  }
  return rows;
}

const CLIENTI = [
  [1, 'Marco', 'Rossi', 'marco.rossi@email.it', '+39 333 1110001', ''],
  [2, 'Giulia', 'Bianchi', 'giulia.b@email.it', '+39 333 1110002', 'Cliente VIP'],
  [3, 'Luca', 'Verdi', 'luca.verdi@email.it', '+39 333 1110003', ''],
  [4, 'Sofia', 'Russo', 'sofia.r@email.it', '+39 333 1110004', ''],
  [5, 'Andrea', 'Ferrari', 'andrea.f@email.it', '+39 333 1110005', ''],
  [6, 'Elena', 'Colombo', 'elena.c@email.it', '+39 333 1110006', ''],
  [7, 'Paolo', 'Ricci', 'paolo.r@email.it', '+39 333 1110007', ''],
  [8, 'Francesca', 'Marino', 'francesca.m@email.it', '+39 333 1110008', ''],
  [9, 'Davide', 'Greco', 'davide.g@email.it', '+39 333 1110009', ''],
  [10, 'Chiara', 'Bruno', 'chiara.b@email.it', '+39 333 1110010', ''],
  [11, 'Matteo', 'Galli', 'matteo.g@email.it', '+39 333 1110011', ''],
  [12, 'Valentina', 'Conti', 'valentina.c@email.it', '+39 333 1110012', ''],
  [13, 'Simone', 'Mancini', 'simone.m@email.it', '+39 333 1110013', ''],
  [14, 'Alessia', 'Costa', 'alessia.c@email.it', '+39 333 1110014', ''],
  [15, 'Roberto', 'Fontana', 'roberto.f@email.it', '+39 333 1110015', 'Hotel Riviera'],
  [16, 'Laura', 'Barbieri', 'laura.b@email.it', '+39 333 1110016', ''],
  [17, 'Stefano', 'Lombardi', 'stefano.l@email.it', '+39 333 1110017', ''],
  [18, 'Martina', 'Moretti', 'martina.m@email.it', '+39 333 1110018', ''],
  [19, 'Giuseppe', 'Caruso', 'giuseppe.c@email.it', '+39 333 1110019', ''],
  [20, 'Anna', 'Ferrara', 'anna.f@email.it', '+39 333 1110020', ''],
];

/** id, cliente_id, cella, inizio, fine, stato, note, importo, pagato, canale, stato_pag, ora, check_in, check_out */
const PRENOTAZIONI = [
  [1, 1, 12, TODAY, isoOffset(7), 'confermata', '', 245, 245, 'offline', 'saldato', '09:30', true, false],
  [2, 2, 18, TODAY, isoOffset(14), 'confermata', 'VIP', 490, 200, 'widget', 'parziale', '10:15', true, false],
  [3, 3, 25, TODAY, isoOffset(3), 'confermata', '', 84, 0, 'portale', 'da_saldare', '11:00', false, false],
  [4, 4, 31, TODAY, TOMORROW, 'confermata', 'Giornaliero', 35, 35, 'offline', 'saldato', '08:45', true, false],
  [5, 5, 44, TODAY, isoOffset(5), 'in_attesa', '', 140, 0, 'widget', 'da_saldare', '', false, false],
  [6, 6, 52, isoOffset(-5), TODAY, 'confermata', '', 168, 168, 'offline', 'saldato', '09:00', true, false],
  [7, 7, 58, isoOffset(-3), TODAY, 'confermata', '', 112, 112, 'portale', 'saldato', '08:30', true, true],
  [8, 8, 63, isoOffset(-7), TODAY, 'confermata', '', 196, 100, 'offline', 'parziale', '10:00', true, false],
  [9, 9, 71, isoOffset(-2), isoOffset(5), 'confermata', '', 196, 196, 'widget', 'saldato', '09:15', true, false],
  [10, 10, 78, isoOffset(-1), isoOffset(6), 'confermata', '', 210, 210, 'offline', 'saldato', '08:00', true, false],
  [11, 11, 85, TOMORROW, isoOffset(8), 'confermata', '', 252, 0, 'portale', 'da_saldare', '', false, false],
  [12, 12, 92, TOMORROW, isoOffset(4), 'confermata', '', 112, 112, 'offline', 'saldato', '', false, false],
  [13, 13, 15, isoOffset(-10), isoOffset(-2), 'confermata', '', 224, 224, 'offline', 'saldato', '', true, true],
  [14, 14, 22, isoOffset(-4), YESTERDAY, 'confermata', '', 112, 112, 'widget', 'saldato', '', true, true],
  [15, 15, 38, isoOffset(-14), isoOffset(7), 'confermata', 'Hotel', 455, 455, 'offline', 'saldato', '09:30', true, false],
  [16, 16, 47, isoOffset(-6), isoOffset(1), 'confermata', '', 196, 50, 'portale', 'parziale', '10:30', true, false],
  [17, 17, 55, isoOffset(-8), isoOffset(-1), 'cancellata', 'Cliente malato', 0, 0, 'offline', 'da_saldare', '', false, false],
  [18, 18, 66, isoOffset(-12), isoOffset(-3), 'cancellata', 'Meteo', 0, 0, 'widget', 'da_saldare', '', false, false],
  [19, 19, 74, isoOffset(-1), isoOffset(2), 'confermata', '', 84, 84, 'offline', 'saldato', '11:30', true, false],
  [20, 20, 81, isoOffset(-3), isoOffset(4), 'confermata', '', 196, 196, 'portale', 'saldato', '09:45', true, false],
  [21, 1, 88, isoOffset(-20), isoOffset(-5), 'confermata', 'Stagionale', 650, 650, 'offline', 'saldato', '', true, true],
  [22, 3, 95, isoOffset(-2), TODAY, 'confermata', '', 56, 56, 'widget', 'saldato', '07:30', true, false],
  [23, 5, 102, TODAY, isoOffset(2), 'confermata', '', 56, 0, 'portale', 'da_saldare', '12:00', false, false],
  [24, 7, 108, isoOffset(-5), isoOffset(2), 'confermata', '', 196, 196, 'offline', 'saldato', '08:15', true, false],
  [25, 9, 115, isoOffset(-7), isoOffset(0), 'confermata', '', 238, 238, 'widget', 'saldato', '09:00', true, false],
  [26, 11, 5, TODAY, isoOffset(10), 'confermata', 'Cabina', 350, 175, 'offline', 'parziale', '10:45', true, false],
  [27, 13, 33, isoOffset(-1), TODAY, 'confermata', '', 28, 28, 'offline', 'saldato', '08:50', true, true],
  [28, 15, 41, TODAY, isoOffset(6), 'confermata', '', 210, 210, 'portale', 'saldato', '09:20', true, false],
  [29, 17, 49, isoOffset(-9), isoOffset(5), 'confermata', '', 392, 392, 'offline', 'saldato', '', true, false],
  [30, 19, 57, isoOffset(-4), isoOffset(3), 'confermata', '', 196, 100, 'widget', 'parziale', '10:10', true, false],
  [31, 2, 68, isoOffset(-15), TODAY, 'confermata', 'Lungo soggiorno', 420, 420, 'offline', 'saldato', '08:00', true, false],
  [32, 4, 76, TODAY, TODAY, 'confermata', 'Day use', 35, 35, 'offline', 'saldato', '07:00', true, false],
  [33, 6, 84, isoOffset(-2), TOMORROW, 'confermata', '', 56, 56, 'portale', 'saldato', '09:30', true, false],
  [34, 8, 91, isoOffset(-6), isoOffset(1), 'in_attesa', '', 196, 0, 'widget', 'da_saldare', '', false, false],
  [35, 10, 99, isoOffset(-3), isoOffset(7), 'confermata', '', 280, 280, 'offline', 'saldato', '08:40', true, false],
];

const MOVIMENTI_CASSA = [
  [1, `${TODAY}T09:30:00`, 'entrata', 'Prenotazione #1 — Marco Rossi', 245, 'contanti', 1, 'reception', ''],
  [2, `${TODAY}T10:15:00`, 'entrata', 'Acconto prenotazione #2', 200, 'carta', 2, 'reception', ''],
  [3, `${TODAY}T08:45:00`, 'entrata', 'Prenotazione #4 — giornaliero', 35, 'contanti', 4, 'reception', ''],
  [4, `${TODAY}T11:00:00`, 'uscita', 'Cambio iniziale cassa', 100, 'contanti', 0, 'reception', ''],
  [5, `${TODAY}T12:30:00`, 'entrata', 'Bar — consumazioni', 45.5, 'carta', 0, 'bar', ''],
  [6, `${TODAY}T14:00:00`, 'entrata', 'Prenotazione #32 — day use', 35, 'contanti', 32, 'reception', ''],
  [7, `${YESTERDAY}T18:00:00`, 'entrata', 'Incasso giornata precedente', 1280, 'contanti', 0, 'reception', ''],
  [8, `${TODAY}T16:00:00`, 'entrata', 'Prenotazione #28', 210, 'bonifico', 28, 'reception', ''],
  [9, `${TODAY}T09:00:00`, 'entrata', 'Prenotazione #6 — saldo', 168, 'carta', 6, 'reception', ''],
  [10, `${TODAY}T10:00:00`, 'entrata', 'Acconto prenotazione #8', 100, 'carta', 8, 'reception', ''],
];

const LOG_SCONTI = [
  [1, `${TODAY}T10:00:00`, 'reception', 2, 2, 10, 49, 'Cliente abituale'],
  [2, `${YESTERDAY}T15:30:00`, 'admin', 15, 15, 5, 22.75, 'Convenzione hotel'],
  [3, isoOffset(-3) + 'T11:00:00', 'reception', 8, 8, 15, 16.8, 'Promo settimana'],
];

const LOG_CANCELLAZIONI = [
  [1, isoOffset(-2) + 'T09:00:00', 17, 17, 168, 34, 'Cliente malato', 'reception'],
  [2, isoOffset(-5) + 'T14:00:00', 18, 18, 252, 50, 'Meteo avverso', 'admin'],
  [3, isoOffset(-8) + 'T10:30:00', 21, 1, 650, 0, 'Rimborso totale', 'admin'],
];

const LOG_MODIFICHE = [
  [1, `${TODAY}T08:00:00`, 6, 50, 52, 'reception', 'Upgrade settore B→A'],
  [2, isoOffset(-1) + 'T16:00:00', 10, 72, 78, 'reception', 'Spostamento per manutenzione'],
  [3, isoOffset(-4) + 'T11:00:00', 20, 70, 81, 'admin', 'Richiesta cliente'],
];

const MOVIMENTI_MAGAZZINO = [
  [1, 1, `${TODAY}T07:00:00`, 'uscita', 3, 'Setup mattutino'],
  [2, 2, `${TODAY}T07:00:00`, 'uscita', 6, 'Setup mattutino'],
  [3, 3, isoOffset(-1) + 'T18:00:00', 'uscita', 15, 'Vendita teli'],
  [4, 1, isoOffset(-7) + 'T09:00:00', 'entrata', 20, 'Rifornimento fornitore'],
];

const PAGAMENTI_STRIPE = [
  [1, `${TODAY}T10:15:00`, 2, 2, 200, 'card', 'pi_3NxDemo001', 'succeeded'],
  [2, isoOffset(-1) + 'T14:30:00', 10, 10, 210, 'card', 'pi_3NxDemo002', 'succeeded'],
  [3, isoOffset(-3) + 'T09:00:00', 16, 16, 50, 'card', 'pi_3NxDemo003', 'succeeded'],
  [4, `${TODAY}T11:30:00`, 3, 3, 84, 'card', 'pi_3NxDemo004', 'pending'],
];

const TRASFERIMENTI_STRIPE = [
  [1, isoOffset(-7) + 'T08:00:00', 2450, 'IT89X0501803200000012345678', 'po_1NxDemo001', 'paid'],
  [2, isoOffset(-1) + 'T08:00:00', 1890, 'IT89X0501803200000012345678', 'po_1NxDemo002', 'paid'],
];

const ATTIVITA = [
  [1, `${TODAY}T07:30:00`, 'Apertura stabilimento', 'completata', 'Marco R.', ''],
  [2, `${TODAY}T08:00:00`, 'Controllo postazioni settore A', 'in_corso', 'Anna L.', ''],
  [3, `${TODAY}T12:00:00`, 'Pulizia servizi comuni', 'pianificata', 'Paolo B.', ''],
  [4, TOMORROW + 'T07:00:00', 'Preparazione arrivi domani', 'pianificata', 'reception', `${PRENOTAZIONI.filter((p) => p[3] === TOMORROW).length} arrivi`],
];

function seed(db) {
  const celle = generateCelle();
  const postazioni = celle.filter((c) => c[7] && c[1] > 0).length;

  db.tables.config.rows = [[1, 14, 22, 11, postazioni + 1, '2026-06-01', '2026-09-15', new Date().toISOString()]];
  db.tables.celle.rows = celle;
  db.tables.clienti.rows = CLIENTI;
  db.tables.prenotazioni.rows = PRENOTAZIONI;
  db.tables.movimenti_cassa.rows = MOVIMENTI_CASSA;
  db.tables.log_sconti.rows = LOG_SCONTI;
  db.tables.log_cancellazioni.rows = LOG_CANCELLAZIONI;
  db.tables.log_modifiche.rows = LOG_MODIFICHE;
  db.tables.movimenti_magazzino.rows = MOVIMENTI_MAGAZZINO;
  db.tables.pagamenti_stripe.rows = PAGAMENTI_STRIPE;
  db.tables.trasferimenti_stripe.rows = TRASFERIMENTI_STRIPE;
  db.tables.attivita.rows = ATTIVITA;

  db.tables.contatori_albergo.rows = [
    [1, 'Hotel Riviera', 'OMB-2026', 200, 28],
    [2, 'Grand Beach', 'OMB-2026', 200, 15],
  ];
  db.tables.voucher.rows = [
    [1, 'SUMMER2026', 500, 87, '2026-09-15'],
    [2, 'WELCOME10', 200, 42, '2026-12-31'],
  ];

  return {
    clienti: CLIENTI.length,
    prenotazioni: PRENOTAZIONI.length,
    celle: celle.length,
    postazioni,
    arriviOggi: PRENOTAZIONI.filter((p) => p[5] !== 'cancellata' && p[3] === TODAY).length,
    partenzeOggi: PRENOTAZIONI.filter((p) => p[5] !== 'cancellata' && p[4] === TODAY).length,
    cancellazioni: PRENOTAZIONI.filter((p) => p[5] === 'cancellata').length,
    fatturato: PRENOTAZIONI.filter((p) => p[5] !== 'cancellata').reduce((s, p) => s + p[7], 0),
  };
}

const outArg = process.argv.indexOf('--out');
const outPath = outArg >= 0 ? process.argv[outArg + 1] : join(__dirname, 'winbeach.json');

const db = JSON.parse(readFileSync(join(__dirname, 'winbeach.json'), 'utf8'));
const stats = seed(db);
writeFileSync(outPath, JSON.stringify(db, null, 2) + '\n', 'utf8');

console.log('Seed generado:', outPath);
console.log('  clienti:', stats.clienti);
console.log('  prenotazioni:', stats.prenotazioni);
console.log('  celle:', stats.celle, `(${stats.postazioni} postazioni)`);
console.log('  arrivi oggi:', stats.arriviOggi);
console.log('  partenze oggi:', stats.partenzeOggi);
console.log('  cancellazioni:', stats.cancellazioni);
console.log('  fatturato:', stats.fatturato, '€');