import { createTableCrud } from './table-crud.js';

createTableCrud({
  table: 'utenti',
  fields: ['username', 'email', 'ruolo', 'ultimo_accesso', 'attivo'],
  newTitle: 'Nuovo',
  editTitle: 'Modifica',
  columns: [{ key:'username' }, { key:'ruolo' }, { key:'email' }, { key:'attivo', type:'bool' }],
  formFields: [
    { id:'f-username', field:'username', label:'Username *' },
    { id:'f-email', field:'email', label:'Email' },
    { id:'f-ruolo', field:'ruolo', label:'Ruolo', default:"Operatore" },
    { id:'f-attivo', field:'attivo', label:'Attivo', type:'checkbox', default:true }
  ],
});
