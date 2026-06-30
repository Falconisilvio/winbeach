import { createTableCrud } from './table-crud.js';

createTableCrud({
  table: 'log_cancellazioni',
  fields: ['data', 'prenotazione_id', 'cliente_id', 'importo', 'penale', 'motivo', 'operatore'],
  columns: [{ key:'data' }, { key:'prenotazione_id' }, { key:'importo', type:'euro' }, { key:'penale', type:'euro' }, { key:'motivo' }],
  formFields: [
    { id:'f-data', field:'data', label:'Data' },
    { id:'f-pren', field:'prenotazione_id', label:'Prenotazione ID', type:'number' },
    { id:'f-cliente', field:'cliente_id', label:'Cliente ID', type:'number' },
    { id:'f-importo', field:'importo', label:'Importo', type:'number' },
    { id:'f-penale', field:'penale', label:'Penale', type:'number' },
    { id:'f-motivo', field:'motivo', label:'Motivo' },
    { id:'f-op', field:'operatore', label:'Operatore' }
  ],
});
