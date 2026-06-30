import { createTableCrud } from './table-crud.js';

createTableCrud({
  table: 'esercizi',
  fields: ['nome', 'tipo', 'responsabile', 'attivo'],
  columns: [{ key:'nome' }, { key:'tipo' }, { key:'responsabile' }, { key:'attivo', type:'bool' }],
  formFields: [
    { id:'f-nome', field:'nome', label:'Nome *' },
    { id:'f-tipo', field:'tipo', label:'Tipo' },
    { id:'f-responsabile', field:'responsabile', label:'Responsabile' },
    { id:'f-attivo', field:'attivo', label:'Attivo', type:'checkbox', default:true }
  ],
});
