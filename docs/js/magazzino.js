import { createTableCrud } from './table-crud.js';

createTableCrud({
  table: 'articoli',
  fields: ['nome', 'categoria', 'giacenza', 'scorta_min'],
  columns: [{ key:'nome' }, { key:'categoria' }, { key:'giacenza' }, { key:'scorta_min' }],
  formFields: [
    { id:'f-nome', field:'nome', label:'Nome *' },
    { id:'f-categoria', field:'categoria', label:'Categoria' },
    { id:'f-giacenza', field:'giacenza', label:'Giacenza', type:'number', default:0 },
    { id:'f-scorta', field:'scorta_min', label:'Scorta min', type:'number', default:0 }
  ],
});
