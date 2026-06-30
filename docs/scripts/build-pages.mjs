import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pagesDir = path.join(__dirname, '..', 'pages');

const head = (title) => `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link rel="stylesheet" href="../css/page.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
</head>
<body>`;

const header = (icon, color, title, btn = '') => `
  <div class="header">
    <h2><i class="fa-solid ${icon}" style="color:${color}"></i> ${title}</h2>
    ${btn ? `<div class="toolbar">${btn}</div>` : ''}
  </div>`;

const table = (headers, rows) => `
  <table>
    <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>`;

const stats = (items) => `
  <div class="stats-row">${items.map(([n, l]) => `
    <div class="stat-box"><div class="num">${n}</div><div class="lbl">${l}</div></div>`).join('')}
  </div>`;

const chartPh = (text) => `
  <div class="chart-placeholder"><i class="fa-solid fa-chart-line"></i><p>${text}</p></div>`;

const pages = {
  'arrivi-oggi': {
    title: 'Arrivi Oggi',
    icon: 'fa-plane-arrival', color: '#2ecc71',
    btn: '<button class="btn btn-success"><i class="fa-solid fa-file-export"></i> Esporta</button>',
    body: stats([['42', 'Arrivi previsti'], ['38', 'Check-in effettuati'], ['4', 'In attesa']]) +
      table(['Cliente', 'Postazione', 'Orario', 'Stato', 'Canale'],
        [['Mario Rossi', 'A12', '09:30', '<span class="badge badge-green">Presente</span>', 'Offline'],
         ['Laura Bianchi', 'B4', '10:15', '<span class="badge badge-blue">Confermato</span>', 'Widget'],
         ['Giuseppe Verdi', 'C8', '11:00', '<span class="badge badge-orange">In attesa</span>', 'Portale']])
  },
  'partenze-oggi': {
    title: 'Partenze Oggi', icon: 'fa-plane-departure', color: '#e74c3c',
    btn: '<button class="btn btn-secondary"><i class="fa-solid fa-print"></i> Stampa</button>',
    body: stats([['28', 'Partenze'], ['25', 'Completate'], ['3', 'Da saldare']]) +
      table(['Cliente', 'Postazione', 'Orario', 'Saldo', 'Stato'],
        [['Anna Neri', 'A5', '17:00', '0 €', '<span class="badge badge-green">Saldato</span>'],
         ['Paolo Blu', 'D2', '18:30', '25 €', '<span class="badge badge-orange">Parziale</span>']])
  },
  'arrivi-domani': {
    title: 'Arrivi Domani', icon: 'fa-calendar-plus', color: '#3498db',
    body: table(['Cliente', 'Postazione', 'Data', 'Notti', 'Stato'],
      [['Famiglia Conti', 'E10-E11', '01/07', '7', '<span class="badge badge-blue">Confermato</span>'],
       ['Hotel Riviera (12 pax)', 'Settore B', '01/07', '1', '<span class="badge badge-green">Gruppo</span>']])
  },
  'partenze-domani': {
    title: 'Partenze Domani', icon: 'fa-calendar-minus', color: '#9b59b6',
    body: table(['Cliente', 'Postazione', 'Data uscita', 'Importo', 'Note'],
      [['Marco Gialli', 'A3', '01/07', '280 €', 'Rinnovo possibile'],
       ['Sara Viola', 'F7', '01/07', '150 €', '—']])
  },
  'modifiche-ombrelloni': {
    title: 'Modifiche Ombrelloni', icon: 'fa-umbrella-beach', color: '#f39c12',
    btn: '<button class="btn btn-primary"><i class="fa-solid fa-plus"></i> Nuova modifica</button>',
    body: table(['Data', 'Postazione', 'Cliente', 'Modifica', 'Operatore'],
      [['30/06 14:22', 'B8 → C2', 'Laura Bianchi', 'Spostamento', 'admin'],
       ['30/06 11:05', 'A12', 'Mario Rossi', 'Upgrade settore', 'reception']])
  },
  'tutte-prenotazioni': {
    title: 'Tutte le Prenotazioni', icon: 'fa-list-check', color: '#0084ff',
    btn: '<button class="btn btn-primary"><i class="fa-solid fa-plus"></i> Nuova prenotazione</button>',
    body: `<div class="filters"><input type="search" placeholder="Cerca cliente..."><select><option>Tutti gli stati</option><option>Confermata</option><option>In attesa</option></select></div>` +
      table(['ID', 'Cliente', 'Dal', 'Al', 'Postazione', 'Importo', 'Stato'],
        [['#1042', 'Mario Rossi', '28/06', '05/07', 'A12', '420 €', '<span class="badge badge-green">Confermata</span>'],
         ['#1043', 'Laura Bianchi', '30/06', '07/07', 'B4', '350 €', '<span class="badge badge-blue">Parziale</span>'],
         ['#1044', 'Giuseppe Verdi', '01/07', '03/07', 'C8', '180 €', '<span class="badge badge-orange">In attesa</span>']])
  },
  'statistiche-ombrellone': {
    title: 'Statistiche per Ombrellone', icon: 'fa-chart-column', color: '#0084ff',
    body: stats([['78%', 'Occupazione media'], ['12', 'Giorni medi'], ['€ 34', 'Ricavo medio']]) + chartPh('Grafico occupazione per singola postazione')
  },
  'statistiche-settore': {
    title: 'Statistiche per Settore', icon: 'fa-layer-group', color: '#6c5ce7',
    body: table(['Settore', 'Postazioni', 'Occupazione', 'Fatturato'],
      [['A — Prima fila', '40', '92%', '18.400 €'],
       ['B — Centrale', '60', '75%', '22.100 €'],
       ['C — Piscina', '30', '68%', '9.800 €']]) + chartPh('Confronto fatturato per settore')
  },
  'statistiche-durata': {
    title: 'Statistiche per Durata', icon: 'fa-clock', color: '#00b894',
    body: stats([['3,2', 'Giorni medi'], ['45%', 'Prenotazioni 7+ giorni'], ['28%', 'Giornalieri']]) + chartPh('Distribuzione durata soggiorni')
  },
  'pagamenti-stripe': {
    title: 'Pagamenti Stripe', icon: 'fa-credit-card', color: '#6772e5',
    body: table(['Data', 'Cliente', 'Importo', 'Metodo', 'Stato'],
      [['30/06 09:12', 'Laura Bianchi', '175 €', 'Visa ****4242', '<span class="badge badge-green">Completato</span>'],
       ['29/06 16:45', 'Mario Rossi', '420 €', 'Mastercard ****8888', '<span class="badge badge-green">Completato</span>']])
  },
  'trasferimenti-stripe': {
    title: 'Trasferimenti Stripe', icon: 'fa-building-columns', color: '#2d3436',
    body: table(['Data', 'Importo', 'Conto', 'Stato'],
      [['28/06', '12.450 €', 'IT**1234', '<span class="badge badge-green">Trasferito</span>'],
       ['21/06', '11.890 €', 'IT**1234', '<span class="badge badge-green">Trasferito</span>']])
  },
  'log-sconti': {
    title: 'Log Sconti', icon: 'fa-percent', color: '#e17055',
    body: table(['Data', 'Operatore', 'Cliente', 'Sconto', 'Motivo'],
      [['30/06 10:30', 'reception', 'Mario Rossi', '10%', 'Cliente fedele'],
       ['29/06 15:00', 'admin', 'Hotel Riviera', '15%', 'Gruppo']])
  },
  'log-cancellazioni': {
    title: 'Log Cancellazioni', icon: 'fa-ban', color: '#d63031',
    body: table(['Data', 'Prenotazione', 'Cliente', 'Importo', 'Penale'],
      [['29/06', '#1038', 'Paolo Blu', '200 €', '50 €'],
       ['28/06', '#1035', 'Anna Neri', '150 €', '0 €']])
  },
  'flussi-cassa': {
    title: 'Flussi di Cassa', icon: 'fa-money-bill-wave', color: '#27ae60',
    btn: '<button class="btn btn-success"><i class="fa-solid fa-plus"></i> Nuovo movimento</button>',
    body: stats([['€ 2.340', 'Entrate oggi'], ['€ 180', 'Uscite oggi'], ['€ 48.200', 'Saldo cassa']]) +
      table(['Ora', 'Tipo', 'Descrizione', 'Importo', 'Operatore'],
        [['09:15', 'Entrata', 'Incasso Mario Rossi', '+420 €', 'cassa1'],
         ['11:30', 'Entrata', 'Incasso contanti', '+85 €', 'cassa1'],
         ['14:00', 'Uscita', 'Rimborso cancellazione', '-50 €', 'admin']])
  },
  'contatori-albergo': {
    title: 'Contatori Albergo', icon: 'fa-hotel', color: '#0984e3',
    body: table(['Albergo', 'Contatore', 'Utilizzato', 'Residuo'],
      [['Hotel Riviera', 'OMB-2026', '145', '55'],
       ['Grand Beach', 'OMB-2026', '89', '111']])
  },
  'contatori-voucher': {
    title: 'Contatori Voucher', icon: 'fa-ticket', color: '#fdcb6e',
    body: table(['Voucher', 'Emessi', 'Utilizzati', 'Scaduti'],
      [['SUMMER2026', '500', '312', '12'],
       ['WELCOME10', '200', '178', '5']])
  },
  'magazzino': {
    title: 'Magazzino', icon: 'fa-warehouse', color: '#636e72',
    btn: '<button class="btn btn-primary"><i class="fa-solid fa-box"></i> Movimenta stock</button>',
    body: table(['Articolo', 'Categoria', 'Giacenza', 'Min', 'Stato'],
      [['Ombrellone standard', 'Attrezzatura', '45', '20', '<span class="badge badge-green">OK</span>'],
       ['Sdraio', 'Attrezzatura', '12', '30', '<span class="badge badge-red">Sotto scorta</span>'],
       ['Teli mare', 'Consumabile', '180', '50', '<span class="badge badge-green">OK</span>']])
  },
  'elementi': {
    title: 'Tabella Elementi', icon: 'fa-shapes', color: '#00a8ff',
    btn: '<button class="btn btn-primary"><i class="fa-solid fa-plus"></i> Nuovo elemento</button>',
    body: table(['Codice', 'Elemento', 'Alquilabile', 'Icona', 'Colore'],
      [['OMB', 'Ombrellone', 'Sì', '☂', '#4a90c8'],
       ['HWA', 'Hawaiana', 'Sì', '🏖', '#48bbb0'],
       ['CAB', 'Cabina', 'Sì', '🏠', '#8b6914'],
       ['PAS', 'Pasarela', 'No', '═', '#8b6914']])
  },
  'settori': {
    title: 'Tabella Settori', icon: 'fa-map', color: '#6c5ce7',
    btn: '<button class="btn btn-primary"><i class="fa-solid fa-plus"></i> Nuovo settore</button>',
    body: table(['Settore', 'Nome', 'Postazioni', 'Tassa', 'Descrizione'],
      [['A', 'Prima fila', '40', 'Premium', 'Vista mare diretta'],
       ['B', 'Centrale', '60', 'Standard', 'Zona principale'],
       ['C', 'Piscina', '30', 'Economy', 'Vicino piscina']])
  },
  'listini': {
    title: 'Tabella Listini', icon: 'fa-tags', color: '#e67e22',
    btn: '<button class="btn btn-warning"><i class="fa-solid fa-plus"></i> Nuovo listino</button>',
    body: table(['Listino', 'Validità', 'Settori', 'Stato'],
      [['Estivo 2026', '01/06 — 15/09', 'A, B, C', '<span class="badge badge-green">Attivo</span>'],
       ['Weekend', 'Sab-Dom', 'A, B', '<span class="badge badge-blue">Attivo</span>'],
       ['Bassa stagione', '01/10 — 31/05', 'B, C', '<span class="badge badge-gray">Bozza</span>']])
  },
  'tariffe': {
    title: 'Tabella Tariffe', icon: 'fa-euro-sign', color: '#00b894',
    body: table(['Tassa', 'Giornaliero', 'Settimanale', 'Quindicinale', 'Mensile'],
      [['A', '35 €', '210 €', '380 €', '650 €'],
       ['B', '28 €', '170 €', '300 €', '520 €'],
       ['C', '22 €', '130 €', '240 €', '400 €']])
  },
  'capitaneria': {
    title: 'Tariffario Capitaneria', icon: 'fa-anchor', color: '#2d3436',
    body: `<p class="subtitle">Tariffe e parametri richiesti dalla capitaneria di porto.</p>` +
      table(['Voce', 'Importo', 'Unità', 'Note'],
        [['Tassa di soggiorno', '2,50 €', '/persona/notte', 'Obbligatoria'],
         ['Concessione demaniale', '12%', 'su incasso', 'Annuale']])
  },
  'esercizi': {
    title: 'Esercizi', icon: 'fa-store', color: '#fd79a8',
    btn: '<button class="btn btn-primary"><i class="fa-solid fa-plus"></i> Nuovo esercizio</button>',
    body: table(['Esercizio', 'Tipo', 'Responsabile', 'Stato'],
      [['Bar Centrale', 'Bar', 'Marco R.', '<span class="badge badge-green">Attivo</span>'],
       ['Chiosco Nord', 'Ristoro', 'Anna L.', '<span class="badge badge-green">Attivo</span>'],
       ['Noleggio', 'Servizi', 'Paolo B.', '<span class="badge badge-green">Attivo</span>']])
  },
  'azienda': {
    title: 'Dati Azienda', icon: 'fa-building', color: '#636e72',
    btn: '<button class="btn btn-primary"><i class="fa-solid fa-floppy-disk"></i> Salva</button>',
    body: `<div class="form-grid">
      <div class="form-group"><label>Ragione sociale</label><input value="Stabilimento Balneare S.r.l."></div>
      <div class="form-group"><label>P. IVA</label><input value="IT12345678901"></div>
      <div class="form-group"><label>Indirizzo</label><input value="Lungomare Europa, 1"></div>
      <div class="form-group"><label>Email</label><input value="info@winbeach.it"></div>
      <div class="form-group"><label>Telefono</label><input value="+39 080 1234567"></div>
      <div class="form-group"><label>Stagione</label><input value="01/06 — 15/09"></div>
    </div>`
  },
  'utenti': {
    title: 'Gestione Utenti', icon: 'fa-user-gear', color: '#8e44ad',
    btn: '<button class="btn btn-primary"><i class="fa-solid fa-user-plus"></i> Nuovo utente</button>',
    body: table(['Utente', 'Ruolo', 'Email', 'Ultimo accesso', 'Stato'],
      [['admin', 'Amministratore', 'admin@winbeach.it', '30/06 08:00', '<span class="badge badge-green">Attivo</span>'],
       ['reception', 'Operatore', 'cassa@winbeach.it', '30/06 09:15', '<span class="badge badge-green">Attivo</span>'],
       ['cassa1', 'Cassa', 'cassa1@winbeach.it', '29/06 18:00', '<span class="badge badge-gray">Inattivo</span>']])
  },
  'booking': {
    title: 'Booking', icon: 'fa-calendar-days', color: '#0084ff',
    btn: '<button class="btn btn-primary"><i class="fa-solid fa-plus"></i> Nuova prenotazione</button>',
    body: `<p class="subtitle">Calendario prenotazioni e disponibilità postazioni.</p>` +
      stats([['156', 'Prenotazioni attive'], ['44', 'Disponibili oggi'], ['12', 'In scadenza']]) +
      chartPh('Vista calendario settimanale prenotazioni')
  },
  'planner': {
    title: 'Planner', icon: 'fa-list', color: '#6c5ce7',
    body: `<p class="subtitle">Pianificazione attività e assegnazione risorse.</p>` +
      table(['Ora', 'Attività', 'Responsabile', 'Priorità'],
        [['08:00', 'Apertura spiaggia', 'Team A', '<span class="badge badge-red">Alta</span>'],
         ['10:00', 'Consegna ombrelloni gruppo', 'Marco', '<span class="badge badge-orange">Media</span>'],
         ['16:00', 'Controllo postazioni', 'Anna', '<span class="badge badge-blue">Normale</span>']])
  },
  'cassa': {
    title: 'Cassa', icon: 'fa-cash-register', color: '#27ae60',
    body: stats([['€ 2.340', 'Incasso oggi'], ['€ 48.200', 'Totale stagione'], ['18', 'Transazioni']]) +
      table(['Ora', 'Cliente', 'Importo', 'Metodo'],
        [['09:15', 'Mario Rossi', '420 €', 'Contanti'],
         ['10:42', 'Laura Bianchi', '175 €', 'Carta']])
  },
  'qr-scan': {
    title: 'QR Scan', icon: 'fa-qrcode', color: '#2d3436',
    body: `<div class="qr-zone"><i class="fa-solid fa-qrcode"></i><h3>Scansiona il QR del cliente</h3><p>Inquadra il codice per verificare prenotazione e accesso.</p><button class="btn btn-primary"><i class="fa-solid fa-camera"></i> Attiva fotocamera</button></div>`
  },
  'guida': {
    title: 'Guida', icon: 'fa-circle-question', color: '#0984e3',
    body: `<p class="subtitle">Manuale rapido WinBeach Web.</p>
    <ul class="guide-list">
      <li><i class="fa-solid fa-house"></i> Dashboard — panoramica arrivi, partenze e statistiche</li>
      <li><i class="fa-solid fa-calendar-days"></i> Booking — gestione prenotazioni</li>
      <li><i class="fa-solid fa-gear"></i> Impostazioni → Struttura — configurazione planimetria playa</li>
      <li><i class="fa-solid fa-users"></i> Clienti — anagrafica clienti</li>
      <li><i class="fa-solid fa-cash-register"></i> Cassa — movimenti e incassi</li>
    </ul>`
  },
  'cambia': {
    title: 'Cambia Stabilimento', icon: 'fa-right-left', color: '#e17055',
    body: `<p class="subtitle">Seleziona lo stabilimento balneare attivo.</p>
    <div class="grid-cards">
      <div class="card-item"><i class="fa-solid fa-umbrella-beach" style="color:#0084ff"></i><h3>Lido Europa</h3><div class="value">Attivo</div></div>
      <div class="card-item"><i class="fa-solid fa-umbrella-beach" style="color:#ccc"></i><h3>Lido Sud</h3><div class="value">—</div></div>
      <div class="card-item"><i class="fa-solid fa-umbrella-beach" style="color:#ccc"></i><h3>Spiaggia Nord</h3><div class="value">—</div></div>
    </div>`
  },
  'spiaggia': {
    title: 'Spiaggia', icon: 'fa-umbrella-beach', color: '#00a8ff',
    body: stats([['200', 'Postazioni'], ['100', 'Occupate oggi'], ['50%', 'Occupazione']]) +
      chartPh('Mappa occupazione in tempo reale')
  }
};

for (const [id, p] of Object.entries(pages)) {
  const html = head(p.title) + header(p.icon, p.color, p.title, p.btn || '') + (p.body || '') + '\n</body>\n</html>\n';
  fs.writeFileSync(path.join(pagesDir, `${id}.html`), html);
}

console.log(`Generati ${Object.keys(pages).length} moduli in pages/`);