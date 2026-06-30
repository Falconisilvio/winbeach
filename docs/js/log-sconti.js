import { createTableCrud } from './table-crud.js';

createTableCrud({
  table: 'log_sconti',
  fields: ['data', 'operatore', 'cliente_id', 'prenotazione_id', 'sconto_pct', 'importo', 'motivo'],
  columns: [{ key:'data' }, { key:'operatore' }, { key:'sconto_pct' }, { key:'importo', type:'euro' }, { key:'motivo' }],
  formFields: [
    { id:'f-data', field:'data', label:'Data' },
    { id:'f-operatore', field:'operatore', label:'Operatore' },
    { id:'f-cliente', field:'cliente_id', label:'Cliente ID', type:'number' },
    { id:'f-pren', field:'prenotazione_id', label:'Prenotazione ID', type:'number' },
    { id:'f-sconto', field:'sconto_pct', label:'Sconto %', type:'number' },
    { id:'f-importo', field:'importo', label:'Importo', type:'number' },
    { id:'f-motivo', field:'motivo', label:'Motivo' }
  ],
});
