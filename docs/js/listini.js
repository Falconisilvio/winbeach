import { createTableCrud } from './table-crud.js';

createTableCrud({
  table: 'listini',
  fields: ['nome', 'validita', 'settori', 'stato'],
  newTitle: 'Nuovo',
  editTitle: 'Modifica',
  columns: [{ key:'nome' }, { key:'validita' }, { key:'settori' }, { key:'stato' }],
  formFields: [
    { id:'f-nome', field:'nome', label:'Nome *' },
    { id:'f-validita', field:'validita', label:'Validità' },
    { id:'f-settori', field:'settori', label:'Settori' },
    { id:'f-stato', field:'stato', label:'Stato', default:"attivo" }
  ],
});
