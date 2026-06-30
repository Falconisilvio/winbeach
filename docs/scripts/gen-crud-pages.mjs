import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pagesDir = path.join(__dirname, '..', 'pages');
const jsDir = path.join(__dirname, '..', 'js');

function crudPage(p) {
  const th = p.cols.map((c) => `<th>${c.label}</th>`).join('');
  const form = p.form.map((f) => {
    const grid = f.full ? ' style="grid-column:1/-1"' : '';
    if (f.type === 'checkbox') {
      return `<div class="form-group"${grid}><label><input type="checkbox" id="${f.id}"> ${f.label}</label></div>`;
    }
    const inputType = f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text';
    return `<div class="form-group"${grid}><label for="${f.id}">${f.label}</label><input type="${inputType}" id="${f.id}"${f.step ? ` step="${f.step}"` : ''}></div>`;
  }).join('\n            ');

  const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <script src="../js/theme-init.js"></script>
  <script src="../js/lang-init.js"></script>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>${p.title}</title>
  <link rel="stylesheet" href="../css/page.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
</head>
<body>
  <div class="header">
    <h2><i class="fa-solid ${p.icon}" style="color:${p.color}"></i> ${p.title}</h2>
    <div class="toolbar">
      <button type="button" class="btn btn-secondary" id="btn-reload"><i class="fa-solid fa-rotate"></i> <span data-i18n="btn.reload">Ricarica</span></button>
      <button type="button" class="btn btn-primary" id="btn-nuovo"><i class="fa-solid fa-plus"></i> <span data-i18n="btn.new">Nuovo</span></button>
    </div>
  </div>
  <div class="db-bar"><span><i class="fa-solid fa-database"></i> <span data-i18n="common.db">Base dati</span></span><div id="db-status" class="db-status idle">…</div></div>
  <div class="filters"><input type="search" id="search-input" data-i18n-placeholder="common.search" placeholder="Cerca…"></div>
  <div class="table-scroll"><table><thead><tr>${th}<th>Azioni</th></tr></thead><tbody id="data-tbody"></tbody></table></div>
  <div id="empty-state" class="empty-state" style="display:none"><p data-i18n="common.noRecords">Nessun record.</p></div>
  <div class="modal-overlay" id="data-modal">
    <div class="modal">
      <div class="modal-header"><h3 id="modal-title">Nuovo</h3><button type="button" class="modal-close" id="modal-close" data-i18n-aria="common.close" aria-label="Chiudi">&times;</button></div>
      <form id="data-form"><div class="modal-body"><div class="form-grid">${form}</div></div>
        <div class="modal-footer"><button type="button" class="btn btn-secondary" id="btn-cancel" data-i18n="common.cancel">Annulla</button><button type="submit" class="btn btn-primary" id="btn-save" data-i18n="common.save">Salva</button></div>
      </form>
    </div>
  </div>
  <script type="module" src="../js/${p.id}.js"></script>
</body></html>`;

  const colDefs = p.cols.map((c) => `{ key:'${c.key}'${c.type ? `, type:'${c.type}'` : ''} }`).join(', ');
  const fieldNames = p.fields.map((f) => `'${f}'`).join(', ');
  const formDefs = p.form.map((f) => {
    let s = `{ id:'${f.id}', field:'${f.field}', label:'${f.label.replace(/'/g, "\\'")}'`;
    if (f.type) s += `, type:'${f.type}'`;
    if (f.default !== undefined) s += `, default:${JSON.stringify(f.default)}`;
    return s + ' }';
  }).join(',\n    ');

  const js = `import { createTableCrud } from './table-crud.js';

createTableCrud({
  table: '${p.table}',
  fields: [${fieldNames}],
  newTitle: 'Nuovo',
  editTitle: 'Modifica',
  columns: [${colDefs}],
  formFields: [
    ${formDefs}
  ],
});
`;

  fs.writeFileSync(path.join(pagesDir, `${p.id}.html`), html);
  fs.writeFileSync(path.join(jsDir, `${p.id}.js`), js);
}

const pages = [
  { id: 'settori', title: 'Tabella Settori', icon: 'fa-map', color: '#6c5ce7', table: 'settori',
    cols: [{ key: 'codice', label: 'Codice' }, { key: 'nome', label: 'Nome' }, { key: 'postazioni', label: 'Postazioni' }, { key: 'tassa', label: 'Tassa' }, { key: 'descrizione', label: 'Descrizione' }],
    fields: ['codice', 'nome', 'postazioni', 'tassa', 'descrizione', 'attivo'],
    form: [{ id: 'f-codice', field: 'codice', label: 'Codice *' }, { id: 'f-nome', field: 'nome', label: 'Nome *' }, { id: 'f-postazioni', field: 'postazioni', label: 'Postazioni', type: 'number', default: 0 }, { id: 'f-tassa', field: 'tassa', label: 'Tassa' }, { id: 'f-descrizione', field: 'descrizione', label: 'Descrizione', full: true }, { id: 'f-attivo', field: 'attivo', label: 'Attivo', type: 'checkbox', default: true }] },
  { id: 'elementi', title: 'Tabella Elementi', icon: 'fa-shapes', color: '#00a8ff', table: 'elementi',
    cols: [{ key: 'codice', label: 'Codice' }, { key: 'nome', label: 'Elemento' }, { key: 'alquilabile', label: 'Alquilabile', type: 'bool' }, { key: 'icona', label: 'Icona' }, { key: 'colore', label: 'Colore' }],
    fields: ['codice', 'nome', 'alquilabile', 'icona', 'colore', 'attivo'],
    form: [{ id: 'f-codice', field: 'codice', label: 'Codice' }, { id: 'f-nome', field: 'nome', label: 'Nome *' }, { id: 'f-alquilabile', field: 'alquilabile', label: 'Alquilabile', type: 'checkbox', default: true }, { id: 'f-icona', field: 'icona', label: 'Icona' }, { id: 'f-colore', field: 'colore', label: 'Colore' }, { id: 'f-attivo', field: 'attivo', label: 'Attivo', type: 'checkbox', default: true }] },
  { id: 'listini', title: 'Tabella Listini', icon: 'fa-tags', color: '#e67e22', table: 'listini',
    cols: [{ key: 'nome', label: 'Listino' }, { key: 'validita', label: 'Validità' }, { key: 'settori', label: 'Settori' }, { key: 'stato', label: 'Stato' }],
    fields: ['nome', 'validita', 'settori', 'stato'],
    form: [{ id: 'f-nome', field: 'nome', label: 'Nome *' }, { id: 'f-validita', field: 'validita', label: 'Validità' }, { id: 'f-settori', field: 'settori', label: 'Settori' }, { id: 'f-stato', field: 'stato', label: 'Stato', default: 'attivo' }] },
  { id: 'tariffe', title: 'Tabella Tariffe', icon: 'fa-euro-sign', color: '#00b894', table: 'tariffe',
    cols: [{ key: 'tassa', label: 'Tassa' }, { key: 'giornaliero', label: 'Giornaliero', type: 'euro' }, { key: 'settimanale', label: 'Settimanale', type: 'euro' }, { key: 'quindicinale', label: 'Quindicinale', type: 'euro' }, { key: 'mensile', label: 'Mensile', type: 'euro' }],
    fields: ['tassa', 'giornaliero', 'settimanale', 'quindicinale', 'mensile', 'listino_id'],
    form: [{ id: 'f-tassa', field: 'tassa', label: 'Tassa *' }, { id: 'f-giornaliero', field: 'giornaliero', label: 'Giornaliero €', type: 'number', step: '0.01' }, { id: 'f-settimanale', field: 'settimanale', label: 'Settimanale €', type: 'number', step: '0.01' }, { id: 'f-quindicinale', field: 'quindicinale', label: 'Quindicinale €', type: 'number', step: '0.01' }, { id: 'f-mensile', field: 'mensile', label: 'Mensile €', type: 'number', step: '0.01' }, { id: 'f-listino', field: 'listino_id', label: 'Listino ID', type: 'number', default: 1 }] },
  { id: 'servizi', title: 'Servizi', icon: 'fa-concierge-bell', color: '#0984e3', table: 'servizi',
    cols: [{ key: 'nome', label: 'Servizio' }, { key: 'prezzo', label: 'Prezzo', type: 'euro' }, { key: 'unita', label: 'Unità' }, { key: 'icona', label: 'Icona' }],
    fields: ['nome', 'prezzo', 'unita', 'icona', 'attivo'],
    form: [{ id: 'f-nome', field: 'nome', label: 'Nome *' }, { id: 'f-prezzo', field: 'prezzo', label: 'Prezzo', type: 'number', step: '0.01' }, { id: 'f-unita', field: 'unita', label: 'Unità', default: 'giorno' }, { id: 'f-icona', field: 'icona', label: 'Icona' }, { id: 'f-attivo', field: 'attivo', label: 'Attivo', type: 'checkbox', default: true }] },
  { id: 'utenti', title: 'Gestione Utenti', icon: 'fa-user-gear', color: '#8e44ad', table: 'utenti',
    cols: [{ key: 'username', label: 'Utente' }, { key: 'ruolo', label: 'Ruolo' }, { key: 'email', label: 'Email' }, { key: 'attivo', label: 'Stato', type: 'bool' }],
    fields: ['username', 'email', 'ruolo', 'ultimo_accesso', 'attivo'],
    form: [{ id: 'f-username', field: 'username', label: 'Username *' }, { id: 'f-email', field: 'email', label: 'Email' }, { id: 'f-ruolo', field: 'ruolo', label: 'Ruolo', default: 'Operatore' }, { id: 'f-attivo', field: 'attivo', label: 'Attivo', type: 'checkbox', default: true }] },
  { id: 'capitaneria', title: 'Tariffario Capitaneria', icon: 'fa-anchor', color: '#2d3436', table: 'capitaneria',
    cols: [{ key: 'voce', label: 'Voce' }, { key: 'importo', label: 'Importo', type: 'euro' }, { key: 'unita', label: 'Unità' }, { key: 'note', label: 'Note' }],
    fields: ['voce', 'importo', 'unita', 'note'],
    form: [{ id: 'f-voce', field: 'voce', label: 'Voce *' }, { id: 'f-importo', field: 'importo', label: 'Importo', type: 'number', step: '0.01' }, { id: 'f-unita', field: 'unita', label: 'Unità' }, { id: 'f-note', field: 'note', label: 'Note', full: true }] },
  { id: 'esercizi', title: 'Esercizi', icon: 'fa-store', color: '#fd79a8', table: 'esercizi',
    cols: [{ key: 'nome', label: 'Esercizio' }, { key: 'tipo', label: 'Tipo' }, { key: 'responsabile', label: 'Responsabile' }, { key: 'attivo', label: 'Stato', type: 'bool' }],
    fields: ['nome', 'tipo', 'responsabile', 'attivo'],
    form: [{ id: 'f-nome', field: 'nome', label: 'Nome *' }, { id: 'f-tipo', field: 'tipo', label: 'Tipo' }, { id: 'f-responsabile', field: 'responsabile', label: 'Responsabile' }, { id: 'f-attivo', field: 'attivo', label: 'Attivo', type: 'checkbox', default: true }] },
  { id: 'contatori-albergo', title: 'Contatori Albergo', icon: 'fa-hotel', color: '#0984e3', table: 'contatori_albergo',
    cols: [{ key: 'albergo', label: 'Albergo' }, { key: 'codice', label: 'Contatore' }, { key: 'totale', label: 'Totale' }, { key: 'utilizzato', label: 'Utilizzato' }],
    fields: ['albergo', 'codice', 'totale', 'utilizzato'],
    form: [{ id: 'f-albergo', field: 'albergo', label: 'Albergo *' }, { id: 'f-codice', field: 'codice', label: 'Codice' }, { id: 'f-totale', field: 'totale', label: 'Totale', type: 'number', default: 0 }, { id: 'f-utilizzato', field: 'utilizzato', label: 'Utilizzato', type: 'number', default: 0 }] },
  { id: 'contatori-voucher', title: 'Contatori Voucher', icon: 'fa-ticket', color: '#fdcb6e', table: 'voucher',
    cols: [{ key: 'codice', label: 'Voucher' }, { key: 'emessi', label: 'Emessi' }, { key: 'utilizzati', label: 'Utilizzati' }, { key: 'scadenza', label: 'Scadenza' }],
    fields: ['codice', 'emessi', 'utilizzati', 'scadenza'],
    form: [{ id: 'f-codice', field: 'codice', label: 'Codice *' }, { id: 'f-emessi', field: 'emessi', label: 'Emessi', type: 'number', default: 0 }, { id: 'f-utilizzati', field: 'utilizzati', label: 'Utilizzati', type: 'number', default: 0 }, { id: 'f-scadenza', field: 'scadenza', label: 'Scadenza' }] },
  { id: 'magazzino', title: 'Magazzino', icon: 'fa-warehouse', color: '#636e72', table: 'articoli',
    cols: [{ key: 'nome', label: 'Articolo' }, { key: 'categoria', label: 'Categoria' }, { key: 'giacenza', label: 'Giacenza' }, { key: 'scorta_min', label: 'Min' }],
    fields: ['nome', 'categoria', 'giacenza', 'scorta_min'],
    form: [{ id: 'f-nome', field: 'nome', label: 'Nome *' }, { id: 'f-categoria', field: 'categoria', label: 'Categoria' }, { id: 'f-giacenza', field: 'giacenza', label: 'Giacenza', type: 'number', default: 0 }, { id: 'f-scorta', field: 'scorta_min', label: 'Scorta min', type: 'number', default: 0 }] },
  { id: 'log-sconti', title: 'Log Sconti', icon: 'fa-percent', color: '#e17055', table: 'log_sconti',
    cols: [{ key: 'data', label: 'Data' }, { key: 'operatore', label: 'Operatore' }, { key: 'sconto_pct', label: 'Sconto %' }, { key: 'importo', label: 'Importo', type: 'euro' }, { key: 'motivo', label: 'Motivo' }],
    fields: ['data', 'operatore', 'cliente_id', 'prenotazione_id', 'sconto_pct', 'importo', 'motivo'],
    form: [{ id: 'f-data', field: 'data', label: 'Data' }, { id: 'f-operatore', field: 'operatore', label: 'Operatore' }, { id: 'f-cliente', field: 'cliente_id', label: 'Cliente ID', type: 'number' }, { id: 'f-pren', field: 'prenotazione_id', label: 'Prenotazione ID', type: 'number' }, { id: 'f-sconto', field: 'sconto_pct', label: 'Sconto %', type: 'number' }, { id: 'f-importo', field: 'importo', label: 'Importo', type: 'number', step: '0.01' }, { id: 'f-motivo', field: 'motivo', label: 'Motivo', full: true }] },
  { id: 'log-cancellazioni', title: 'Log Cancellazioni', icon: 'fa-ban', color: '#d63031', table: 'log_cancellazioni',
    cols: [{ key: 'data', label: 'Data' }, { key: 'prenotazione_id', label: 'Prenot.' }, { key: 'importo', label: 'Importo', type: 'euro' }, { key: 'penale', label: 'Penale', type: 'euro' }, { key: 'motivo', label: 'Motivo' }],
    fields: ['data', 'prenotazione_id', 'cliente_id', 'importo', 'penale', 'motivo', 'operatore'],
    form: [{ id: 'f-data', field: 'data', label: 'Data' }, { id: 'f-pren', field: 'prenotazione_id', label: 'Prenotazione ID', type: 'number' }, { id: 'f-cliente', field: 'cliente_id', label: 'Cliente ID', type: 'number' }, { id: 'f-importo', field: 'importo', label: 'Importo', type: 'number', step: '0.01' }, { id: 'f-penale', field: 'penale', label: 'Penale', type: 'number', step: '0.01' }, { id: 'f-motivo', field: 'motivo', label: 'Motivo' }, { id: 'f-op', field: 'operatore', label: 'Operatore' }] },
  { id: 'modifiche-ombrelloni', title: 'Modifiche Ombrelloni', icon: 'fa-umbrella-beach', color: '#f39c12', table: 'log_modifiche',
    cols: [{ key: 'data', label: 'Data' }, { key: 'cella_da', label: 'Da' }, { key: 'cella_a', label: 'A' }, { key: 'operatore', label: 'Operatore' }, { key: 'motivo', label: 'Motivo' }],
    fields: ['data', 'prenotazione_id', 'cella_da', 'cella_a', 'operatore', 'motivo'],
    form: [{ id: 'f-data', field: 'data', label: 'Data' }, { id: 'f-pren', field: 'prenotazione_id', label: 'Prenotazione ID', type: 'number' }, { id: 'f-da', field: 'cella_da', label: 'Post. da', type: 'number' }, { id: 'f-a', field: 'cella_a', label: 'Post. a', type: 'number' }, { id: 'f-op', field: 'operatore', label: 'Operatore' }, { id: 'f-motivo', field: 'motivo', label: 'Motivo', full: true }] },
  { id: 'pagamenti-stripe', title: 'Pagamenti Stripe', icon: 'fa-credit-card', color: '#6772e5', table: 'pagamenti_stripe',
    cols: [{ key: 'data', label: 'Data' }, { key: 'importo', label: 'Importo', type: 'euro' }, { key: 'metodo', label: 'Metodo' }, { key: 'stato', label: 'Stato' }],
    fields: ['data', 'cliente_id', 'prenotazione_id', 'importo', 'metodo', 'stripe_id', 'stato'],
    form: [{ id: 'f-data', field: 'data', label: 'Data' }, { id: 'f-importo', field: 'importo', label: 'Importo', type: 'number', step: '0.01' }, { id: 'f-metodo', field: 'metodo', label: 'Metodo' }, { id: 'f-stripe', field: 'stripe_id', label: 'Stripe ID' }, { id: 'f-stato', field: 'stato', label: 'Stato', default: 'completato' }] },
  { id: 'trasferimenti-stripe', title: 'Trasferimenti Stripe', icon: 'fa-building-columns', color: '#2d3436', table: 'trasferimenti_stripe',
    cols: [{ key: 'data', label: 'Data' }, { key: 'importo', label: 'Importo', type: 'euro' }, { key: 'conto', label: 'Conto' }, { key: 'stato', label: 'Stato' }],
    fields: ['data', 'importo', 'conto', 'stripe_payout_id', 'stato'],
    form: [{ id: 'f-data', field: 'data', label: 'Data' }, { id: 'f-importo', field: 'importo', label: 'Importo', type: 'number', step: '0.01' }, { id: 'f-conto', field: 'conto', label: 'Conto' }, { id: 'f-payout', field: 'stripe_payout_id', label: 'Payout ID' }, { id: 'f-stato', field: 'stato', label: 'Stato', default: 'trasferito' }] },
  { id: 'planner', title: 'Planner', icon: 'fa-list', color: '#6c5ce7', table: 'attivita',
    cols: [{ key: 'data', label: 'Data' }, { key: 'titolo', label: 'Attività' }, { key: 'stato', label: 'Stato' }, { key: 'assegnato', label: 'Assegnato' }],
    fields: ['data', 'titolo', 'stato', 'assegnato', 'note'],
    form: [{ id: 'f-data', field: 'data', label: 'Data' }, { id: 'f-titolo', field: 'titolo', label: 'Titolo *' }, { id: 'f-stato', field: 'stato', label: 'Stato', default: 'da_fare' }, { id: 'f-assegnato', field: 'assegnato', label: 'Assegnato' }, { id: 'f-note', field: 'note', label: 'Note', full: true }] },
];

for (const p of pages) crudPage(p);
console.log(`Generati ${pages.length} moduli CRUD`);