import { createTableCrud } from './table-crud.js';

createTableCrud({
  table: 'capitaneria',
  fields: ['voce', 'importo', 'unita', 'note'],
  columns: [{ key:'voce' }, { key:'importo', type:'euro' }, { key:'unita' }, { key:'note' }],
  formFields: [
    { id:'f-voce', field:'voce', label:'Voce *' },
    { id:'f-importo', field:'importo', label:'Importo', type:'number' },
    { id:'f-unita', field:'unita', label:'Unità' },
    { id:'f-note', field:'note', label:'Note' }
  ],
});
