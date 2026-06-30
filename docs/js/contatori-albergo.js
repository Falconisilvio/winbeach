import { createTableCrud } from './table-crud.js';

createTableCrud({
  table: 'contatori_albergo',
  fields: ['albergo', 'codice', 'totale', 'utilizzato'],
  columns: [{ key:'albergo' }, { key:'codice' }, { key:'totale' }, { key:'utilizzato' }],
  formFields: [
    { id:'f-albergo', field:'albergo', label:'Albergo *' },
    { id:'f-codice', field:'codice', label:'Codice' },
    { id:'f-totale', field:'totale', label:'Totale', type:'number', default:0 },
    { id:'f-utilizzato', field:'utilizzato', label:'Utilizzato', type:'number', default:0 }
  ],
});
