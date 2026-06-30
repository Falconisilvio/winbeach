import { createTableCrud } from './table-crud.js';

createTableCrud({
  table: 'voucher',
  fields: ['codice', 'emessi', 'utilizzati', 'scadenza'],
  columns: [{ key:'codice' }, { key:'emessi' }, { key:'utilizzati' }, { key:'scadenza' }],
  formFields: [
    { id:'f-codice', field:'codice', label:'Codice *' },
    { id:'f-emessi', field:'emessi', label:'Emessi', type:'number', default:0 },
    { id:'f-utilizzati', field:'utilizzati', label:'Utilizzati', type:'number', default:0 },
    { id:'f-scadenza', field:'scadenza', label:'Scadenza' }
  ],
});
