import { createTableCrud } from './table-crud.js';

createTableCrud({
  table: 'attivita',
  fields: ['data', 'titolo', 'stato', 'assegnato', 'note'],
  columns: [{ key:'data' }, { key:'titolo' }, { key:'stato' }, { key:'assegnato' }],
  formFields: [
    { id:'f-data', field:'data', label:'Data' },
    { id:'f-titolo', field:'titolo', label:'Titolo *' },
    { id:'f-stato', field:'stato', label:'Stato', default:"da_fare" },
    { id:'f-assegnato', field:'assegnato', label:'Assegnato' },
    { id:'f-note', field:'note', label:'Note' }
  ],
});
