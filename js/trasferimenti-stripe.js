import { createTableCrud } from './table-crud.js';

createTableCrud({
  table: 'trasferimenti_stripe',
  fields: ['data', 'importo', 'conto', 'stripe_payout_id', 'stato'],
  newTitle: 'Nuovo',
  editTitle: 'Modifica',
  columns: [{ key:'data' }, { key:'importo', type:'euro' }, { key:'conto' }, { key:'stato' }],
  formFields: [
    { id:'f-data', field:'data', label:'Data' },
    { id:'f-importo', field:'importo', label:'Importo', type:'number' },
    { id:'f-conto', field:'conto', label:'Conto' },
    { id:'f-payout', field:'stripe_payout_id', label:'Payout ID' },
    { id:'f-stato', field:'stato', label:'Stato', default:"trasferito" }
  ],
});
