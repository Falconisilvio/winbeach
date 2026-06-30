import { createTableCrud } from './table-crud.js';

createTableCrud({
  table: 'settori',
  fields: ['codice', 'nome', 'postazioni', 'tassa', 'descrizione', 'attivo'],
  newTitle: 'Nuovo',
  editTitle: 'Modifica',
  columns: [{ key:'codice' }, { key:'nome' }, { key:'postazioni' }, { key:'tassa' }, { key:'descrizione' }],
  formFields: [
    { id:'f-codice', field:'codice', label:'Codice *' },
    { id:'f-nome', field:'nome', label:'Nome *' },
    { id:'f-postazioni', field:'postazioni', label:'Postazioni', type:'number', default:0 },
    { id:'f-tassa', field:'tassa', label:'Tassa' },
    { id:'f-descrizione', field:'descrizione', label:'Descrizione' },
    { id:'f-attivo', field:'attivo', label:'Attivo', type:'checkbox', default:true }
  ],
});
