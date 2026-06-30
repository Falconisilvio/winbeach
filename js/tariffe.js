import { createTableCrud } from './table-crud.js';

createTableCrud({
  table: 'tariffe',
  fields: ['tassa', 'giornaliero', 'settimanale', 'quindicinale', 'mensile', 'listino_id'],
  newTitle: 'Nuovo',
  editTitle: 'Modifica',
  columns: [{ key:'tassa' }, { key:'giornaliero', type:'euro' }, { key:'settimanale', type:'euro' }, { key:'quindicinale', type:'euro' }, { key:'mensile', type:'euro' }],
  formFields: [
    { id:'f-tassa', field:'tassa', label:'Tassa *' },
    { id:'f-giornaliero', field:'giornaliero', label:'Giornaliero €', type:'number' },
    { id:'f-settimanale', field:'settimanale', label:'Settimanale €', type:'number' },
    { id:'f-quindicinale', field:'quindicinale', label:'Quindicinale €', type:'number' },
    { id:'f-mensile', field:'mensile', label:'Mensile €', type:'number' },
    { id:'f-listino', field:'listino_id', label:'Listino ID', type:'number', default:1 }
  ],
});
