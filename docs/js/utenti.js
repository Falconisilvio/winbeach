import { createTableCrud } from './table-crud.js';
import { getAllLivelli, getPermessiByLivello, savePermesso, deletePermesso } from './winbeach-permessi.js';

let currentUserId = null;
let currentLivelloId = null;
let permessiList = [];
let utentiCache = [];

const PROCEDURE_LIST = ['clienti'];

createTableCrud({
  table: 'utenti',
  requireAdmin: true,
  fields: ['username', 'email', 'ruolo', 'livello', 'ultimo_accesso', 'attivo'],
  columns: [
    { key:'username' },
    { key:'ruolo' },
    { key:'livello', render: (r) => `<span data-livello="${r.livello}">—</span>` },
    { key:'email' },
    { key:'attivo', type:'bool' }
  ],
  formFields: [
    { id:'f-username', field:'username', label:'Username *' },
    { id:'f-email', field:'email', label:'Email' },
    { id:'f-ruolo', field:'ruolo', label:'Ruolo', default:"Operatore" },
    { id:'f-livello', field:'livello', label:'Livello', type:'select', default:1 },
    { id:'f-attivo', field:'attivo', label:'Attivo', type:'checkbox', default:true }
  ],
  onCreated: initLivelliSelect,
  onLoad: (data) => {
    utentiCache = data;
    addPermessiButtons();
    resolveLivelliNames();
  },
});

async function initLivelliSelect() {
  const livelli = await getAllLivelli();
  const select = document.getElementById('f-livello');
  if (!select) return;
  select.innerHTML = livelli.map(l => `<option value="${l.id}">${l.nome}</option>`).join('');
}

async function resolveLivelliNames() {
  const livelli = await getAllLivelli();
  document.querySelectorAll('[data-livello]').forEach(span => {
    const id = Number(span.dataset.livello);
    const l = livelli.find(x => x.id === id);
    span.textContent = l ? l.nome : '—';
  });
}

function addPermessiButtons() {
  const tbody = document.getElementById('data-tbody');
  if (!tbody) return;
  
  tbody.querySelectorAll('tr').forEach((row, idx) => {
    const cells = row.querySelectorAll('td');
    const lastCell = cells[cells.length - 1];
    if (!lastCell) return;
    
    if (lastCell.querySelector('.btn-permessi')) return;
    
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-secondary btn-sm btn-permessi';
    btn.innerHTML = '<i class="fa-solid fa-key"></i>';
    btn.title = 'Gestisci Permessi';
    btn.style.marginLeft = '4px';
    btn.addEventListener('click', () => openPermessiModal(utentiCache[idx]));
    lastCell.appendChild(btn);
  });
}

async function openPermessiModal(utente) {
  if (!utente) return;
  
  currentUserId = utente.id;
  currentLivelloId = utente.livello ?? 1;
  permessiList = await getPermessiByLivello(currentLivelloId);
  
  renderPermessiModal(utente);
}

function renderPermessiModal(utente) {
  let modal = document.getElementById('permessi-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'permessi-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal" style="max-width:500px">
        <div class="modal-header">
          <h3>Gestisci Permessi</h3>
          <button type="button" class="modal-close" id="permessi-close">&times;</button>
        </div>
        <div class="modal-body">
          <p id="permessi-info"></p>
          <div id="permessi-list"></div>
          <div style="margin-top:12px">
            <strong>Aggiungi permesso:</strong>
            <select id="permessi-proc" style="margin:0 8px"></select>
            <select id="permessi-tipo" style="margin:0 8px">
              <option value="lettura">L - Lettura</option>
              <option value="scrittura">W - Scrittura</option>
            </select>
            <button type="button" class="btn btn-primary btn-sm" id="permessi-add">+</button>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="permessi-cancel">Chiudi</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    document.getElementById('permessi-close').onclick = closePermessiModal;
    document.getElementById('permessi-cancel').onclick = closePermessiModal;
    document.getElementById('permessi-add').onclick = addPermesso;
    modal.addEventListener('click', (e) => { if (e.target === modal) closePermessiModal(); });
  }
  
  document.getElementById('permessi-info').textContent = `Utente: ${utente.username} — Livello: ${currentLivelloId}`;
  
  const usedProcs = permessiList.map(p => p.procedura);
  const available = PROCEDURE_LIST.filter(p => !usedProcs.includes(p));
  
  const procSelect = document.getElementById('permessi-proc');
  procSelect.innerHTML = available.map(p => `<option value="${p}">${p}</option>`).join('');
  if (!available.length) procSelect.innerHTML = '<option value="">Nessuna procedura disponibile</option>';
  
  const listDiv = document.getElementById('permessi-list');
  if (!permessiList.length) {
    listDiv.innerHTML = '<p style="color:gray">Nessun permesso configurato</p>';
  } else {
    listDiv.innerHTML = permessiList.map(p => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee">
        <span><strong>${p.procedura}</strong> — ${p.permesso === 'scrittura' ? 'W (Scrittura)' : 'L (Lettura)'}</span>
        <button type="button" class="btn btn-danger btn-sm" data-delete-perm="${p.procedura}"><i class="fa-solid fa-trash"></i></button>
      </div>
    `).join('');
    
    listDiv.querySelectorAll('[data-delete-perm]').forEach(btn => {
      btn.onclick = () => removePermesso(btn.dataset.deletePerm);
    });
  }
  
  modal.classList.add('open');
}

function closePermessiModal() {
  document.getElementById('permessi-modal')?.classList.remove('open');
}

async function addPermesso() {
  const proc = document.getElementById('permessi-proc').value;
  const permesso = document.getElementById('permessi-tipo').value;
  if (!proc) return;
  
  await savePermesso(currentLivelloId, proc, permesso);
  permessiList = await getPermessiByLivello(currentLivelloId);
  renderPermessiModal({ id: currentUserId, username: document.getElementById('permessi-info').textContent.split('—')[0].replace('Utente: ', '').trim() });
}

async function removePermesso(procedura) {
  await deletePermesso(currentLivelloId, procedura);
  permessiList = await getPermessiByLivello(currentLivelloId);
  renderPermessiModal({ id: currentUserId, username: document.getElementById('permessi-info').textContent.split('—')[0].replace('Utente: ', '').trim() });
}
