import { createTableCrud } from './table-crud.js';
import { saveTableRow, loadTable } from './winbeach-db.js';
import { $, escapeHtml, initModule, updateDbBar } from './winbeach-module.js';

let editingId = null;
let elementi = [];

function getToken() {
  try {
    const tokens = JSON.parse(localStorage.getItem('winbeach_profile_tokens') || '{}');
    const activeId = localStorage.getItem('winbeach_active_profile');
    return tokens[activeId] || '';
  } catch {
    return '';
  }
}

function getDbConfig() {
  try {
    const profiles = JSON.parse(localStorage.getItem('winbeach_profiles') || '[]');
    const activeId = localStorage.getItem('winbeach_active_profile');
    const profile = profiles.find(p => p.id === activeId) || profiles[0];
    return profile || {};
  } catch {
    return {};
  }
}

async function uploadImage(file) {
  const token = getToken();
  if (!token) {
    alert('Token mancante. Effettua il login.');
    return null;
  }
  
  const config = getDbConfig();
  const reader = new FileReader();
  
  return new Promise((resolve) => {
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1];
      const fileName = `elemento_${Date.now()}_${file.name}`;
      
      try {
        const response = await fetch(`https://api.github.com/repos/${config.owner || 'falconisilvio'}/${config.repo || 'winbeach'}/contents/assets/elementi/${fileName}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `Upload elemento image: ${fileName}`,
            content: base64,
            branch: config.branch || 'main'
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          const url = `https://raw.githubusercontent.com/${config.owner || 'falconisilvio'}/${config.repo || 'winbeach'}/${config.branch || 'main'}/assets/elementi/${fileName}`;
          resolve(url);
        } else {
          const err = await response.json();
          console.error('Upload failed:', err);
          alert('Errore upload: ' + (err.message || response.statusText));
          resolve(null);
        }
      } catch (err) {
        console.error('Upload error:', err);
        alert('Errore durante upload');
        resolve(null);
      }
    };
    reader.readAsDataURL(file);
  });
}

function initImageUploaders() {
  ['f-immagine-1', 'f-immagine-2', 'f-immagine-3'].forEach(fieldId => {
    const fileInput = document.getElementById(`${fieldId}-file`);
    const preview = document.getElementById(`${fieldId}-preview`);
    const textInput = document.getElementById(fieldId);
    
    if (!fileInput) return;
    
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      fileInput.disabled = true;
      fileInput.parentElement.querySelector('label').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
      
      const url = await uploadImage(file);
      if (url) {
        textInput.value = url;
        if (preview) preview.innerHTML = `<img src="${url}" style="max-height:60px;border-radius:4px">`;
      }
      
      fileInput.disabled = false;
      fileInput.parentElement.querySelector('label').innerHTML = '<i class="fa-solid fa-upload"></i>';
      fileInput.value = '';
    });
    
    if (textInput) {
      textInput.addEventListener('input', () => {
        if (preview) {
          preview.innerHTML = textInput.value ? `<img src="${textInput.value}" style="max-height:60px;border-radius:4px">` : '';
        }
      });
    }
  });
}

createTableCrud({
  table: 'elementi',
  fields: ['codice', 'nome', 'tipo', 'colore', 'immagine_1', 'immagine_2', 'immagine_3', 'attivo'],
  columns: [
    { key:'codice' },
    { key:'nome' },
    { key:'tipo', render: (r) => r.tipo === 'attivo' ? '<span class="badge badge-green">Attivo</span>' : '<span class="badge badge-gray">Passivo</span>' },
    { key:'colore', render: (r) => r.colore ? `<span style="display:inline-block;width:16px;height:16px;background:${r.colore};border-radius:50%;vertical-align:middle"></span> ${escapeHtml(r.colore)}` : '—' },
    { key:'immagine_1', render: (r) => r.immagine_1 ? `<img src="${r.immagine_1}" style="height:30px">` : '—' }
  ],
  formFields: [
    { id:'f-codice', field:'codice', label:'Codice' },
    { id:'f-nome', field:'nome', label:'Nome *' },
    { id:'f-tipo', field:'tipo', label:'Tipo', type:'select', default:'attivo' },
    { id:'f-colore', field:'colore', label:'Colore', type:'color' },
    { id:'f-immagine-1', field:'immagine_1', label:'Immagine 1' },
    { id:'f-immagine-2', field:'immagine_2', label:'Immagine 2' },
    { id:'f-immagine-3', field:'immagine_3', label:'Immagine 3' },
    { id:'f-attivo', field:'attivo', label:'Attivo', type:'checkbox', default:true }
  ],
  onCreated: () => {
    initTipoSelect();
    initImageUploaders();
  },
  onAfterRender: toggleImageFields,
  onLoad: (data) => { elementi = data; },
});

function initTipoSelect() {
  const select = document.getElementById('f-tipo');
  if (!select) return;
  select.innerHTML = `
    <option value="attivo">Attivo (Alquilabile)</option>
    <option value="passivo">Passivo (Statico)</option>
  `;
  select.addEventListener('change', toggleImageFields);
}

function toggleImageFields() {
  const tipo = document.getElementById('f-tipo')?.value || 'attivo';
  const img2Group = document.getElementById('img2-group');
  const img3Group = document.getElementById('img3-group');
  
  if (img2Group) img2Group.style.display = tipo === 'attivo' ? 'block' : 'none';
  if (img3Group) img3Group.style.display = tipo === 'attivo' ? 'block' : 'none';
  
  if (tipo === 'passivo') {
    const img2El = document.getElementById('f-immagine-2');
    const img3El = document.getElementById('f-immagine-3');
    if (img2El) img2El.value = '';
    if (img3El) img3El.value = '';
    const preview2 = document.getElementById('f-immagine-2-preview');
    const preview3 = document.getElementById('f-immagine-3-preview');
    if (preview2) preview2.innerHTML = '';
    if (preview3) preview3.innerHTML = '';
  }
}
