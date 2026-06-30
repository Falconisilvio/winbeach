import { createTableCrud } from './table-crud.js';

createTableCrud({
  table: 'pagamenti_stripe',
  fields: ['data', 'cliente_id', 'prenotazione_id', 'importo', 'metodo', 'stripe_id', 'stato'],
  newTitle: 'Nuovo',
  editTitle: 'Modifica',
  columns: [{ key:'data' }, { key:'importo', type:'euro' }, { key:'metodo' }, { key:'stato' }],
  formFields: [
    { id:'f-data', field:'data', label:'Data' },
    { id:'f-importo', field:'importo', label:'Importo', type:'number' },
    { id:'f-metodo', field:'metodo', label:'Metodo' },
    { id:'f-stripe', field:'stripe_id', label:'Stripe ID' },
    { id:'f-stato', field:'stato', label:'Stato', default:"completato" }
  ],
});
