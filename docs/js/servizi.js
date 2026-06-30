import { createTableCrud } from './table-crud.js';

createTableCrud({
  table: 'servizi',
  fields: ['nome', 'prezzo', 'unita', 'icona', 'attivo'],
  columns: [{ key:'nome' }, { key:'prezzo', type:'euro' }, { key:'unita' }, { key:'icona' }],
  formFields: [
    { id:'f-nome', field:'nome', label:'Nome *' },
    { id:'f-prezzo', field:'prezzo', label:'Prezzo', type:'number' },
    { id:'f-unita', field:'unita', label:'Unità', default:"giorno" },
    { id:'f-icona', field:'icona', label:'Icona' },
    { id:'f-attivo', field:'attivo', label:'Attivo', type:'checkbox', default:true }
  ],
});
