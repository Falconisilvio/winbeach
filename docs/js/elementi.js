import { createTableCrud } from './table-crud.js';

createTableCrud({
  table: 'elementi',
  fields: ['codice', 'nome', 'alquilabile', 'icona', 'colore', 'attivo'],
  columns: [{ key:'codice' }, { key:'nome' }, { key:'alquilabile', type:'bool' }, { key:'icona' }, { key:'colore' }],
  formFields: [
    { id:'f-codice', field:'codice', label:'Codice' },
    { id:'f-nome', field:'nome', label:'Nome *' },
    { id:'f-alquilabile', field:'alquilabile', label:'Alquilabile', type:'checkbox', default:true },
    { id:'f-icona', field:'icona', label:'Icona' },
    { id:'f-colore', field:'colore', label:'Colore' },
    { id:'f-attivo', field:'attivo', label:'Attivo', type:'checkbox', default:true }
  ],
});
