import { createTableCrud } from './table-crud.js';

createTableCrud({
  table: 'log_modifiche',
  fields: ['data', 'prenotazione_id', 'cella_da', 'cella_a', 'operatore', 'motivo'],
  newTitle: 'Nuovo',
  editTitle: 'Modifica',
  columns: [{ key:'data' }, { key:'cella_da' }, { key:'cella_a' }, { key:'operatore' }, { key:'motivo' }],
  formFields: [
    { id:'f-data', field:'data', label:'Data' },
    { id:'f-pren', field:'prenotazione_id', label:'Prenotazione ID', type:'number' },
    { id:'f-da', field:'cella_da', label:'Post. da', type:'number' },
    { id:'f-a', field:'cella_a', label:'Post. a', type:'number' },
    { id:'f-op', field:'operatore', label:'Operatore' },
    { id:'f-motivo', field:'motivo', label:'Motivo' }
  ],
});
