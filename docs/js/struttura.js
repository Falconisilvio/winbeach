/**
 * Configuración de playa — Procedimiento 1
 * Por cada cuadrado: tipo de elemento, activo/alquilable, tasa (settore) y número (cella).
 */
import {
  getDbConfig,
  saveDbConfig,
  getToken,
  saveToken,
  getDbStatus,
  getActiveProfile,
  profileDisplayName,
  loadStrutturaFromDb,
  saveStrutturaToDb,
  onProfileChange,
} from './winbeach-db.js';
import { applyReadOnlyMode, onAuthChange } from './winbeach-auth.js';

const ELEMENTOS = [
  { id: 'Ombrellone', label: 'Sombrilla', attivo: true, icon: '☂' },
  { id: 'Hawaiana', label: 'Hawaiana', attivo: true, icon: '🏖' },
  { id: 'Cabina', label: 'Cabaña', attivo: true, icon: '🏠' },
  { id: 'Tenda', label: 'Tienda de campaña', attivo: true, icon: '⛺' },
  { id: 'Palma', label: 'Palma', attivo: false, icon: '🌴' },
  { id: 'Pasarela', label: 'Pasarela', attivo: false, icon: '═' },
  { id: 'Bidone', label: 'Papelera', attivo: false, icon: '🗑' },
  { id: 'Papelera', label: 'Contenedor', attivo: false, icon: '♻' },
  { id: 'Adorno', label: 'Adorno', attivo: false, icon: '✦' },
  { id: 'Arbusto', label: 'Arbusto', attivo: false, icon: '🌿' },
  { id: 'Planta', label: 'Planta', attivo: false, icon: '🌱' },
  { id: 'Mare', label: 'Mar', attivo: false, icon: '🌊' },
];

const TASAS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const SWATCH_CLASS = {
  Ombrellone: 'pattern-ombrellone',
  Hawaiana: '',
  Cabina: '',
  Tenda: '',
  Palma: '',
  Pasarela: '',
  Bidone: '',
  Papelera: '',
  Adorno: '',
  Arbusto: '',
  Planta: '',
  Mare: '',
};

const SWATCH_COLOR = {
  Hawaiana: '#48bbb0',
  Cabina: '#8b6914',
  Tenda: '#e8a838',
  Palma: '#6b9e6b',
  Pasarela: '#8b6914',
  Bidone: '#9ca3af',
  Papelera: '#718096',
  Adorno: '#d4a574',
  Arbusto: '#8fbc8f',
  Planta: '#90c695',
  Mare: '#4a9fd4',
};

const state = {
  rows: 14,
  cols: 22,
  cells: {},
  mode: 'elemento',
  selectedElement: 'Ombrellone',
  selectedRate: 'A',
  prossimo: 1,
  walkwayCol: 11,
};

function cellKey(x, y) {
  return `${x},${y}`;
}

function getCell(x, y) {
  const key = cellKey(x, y);
  if (!state.cells[key]) {
    state.cells[key] = {
      x,
      y,
      elemento: null,
      desc: '',
      settore: null,
      attivo: false,
      cella: 0,
    };
  }
  return state.cells[key];
}

function isElementAttivo(elementId) {
  const el = ELEMENTOS.find((e) => e.id === elementId);
  return el ? el.attivo : false;
}

function formatAttivo(attivo) {
  return attivo ? '.T.' : '.F.';
}

function formatSettore(settore, attivo) {
  return attivo && settore ? settore : '.F.';
}

async function init() {
  buildLegends();
  buildGrid();
  bindEvents();
  initDbPanel();
  await tryLoadFromDatabase();
  refreshExport();
  updateStats();
}

function initDbPanel() {
  const cfg = getDbConfig();
  const profile = getActiveProfile();
  document.getElementById('db-owner').value = cfg.owner;
  document.getElementById('db-repo').value = cfg.repo;
  document.getElementById('db-branch').value = cfg.branch;
  const dbField = document.getElementById('db-database');
  if (dbField) dbField.value = cfg.database;
  document.getElementById('db-token').value = getToken();
  const nameEl = document.getElementById('db-profile-name');
  if (nameEl) nameEl.textContent = profile ? profileDisplayName(profile) : '—';
  updateDbStatusUI();
}

function updateDbStatusUI() {
  const el = document.getElementById('db-status');
  if (!el) return;
  const { state, message } = getDbStatus();
  el.className = `db-status ${state}`;
  el.textContent = message || (typeof window.__wbT === 'function' ? window.__wbT('db.noConnection') : 'Sin conexión');
}

function applyStrutturaData(data) {
  state.rows = data.rows;
  state.cols = data.cols;
  state.walkwayCol = data.walkwayCol;
  state.prossimo = data.prossimo;
  state.cells = {};

  document.getElementById('grid-rows').value = state.rows;
  document.getElementById('grid-cols').value = state.cols;
  document.getElementById('prossimo').value = state.prossimo;

  data.cells.forEach((c) => {
    const cell = getCell(c.x, c.y);
    cell.cella = c.cella;
    cell.elemento = c.elemento;
    cell.desc = c.desc;
    cell.attivo = c.attivo;
    cell.settore = c.settore;
  });

  buildGrid();
}

function getStrutturaSnapshot() {
  const cells = [];
  for (let y = 1; y <= state.rows; y++) {
    for (let x = 1; x <= state.cols; x++) {
      const data = getCell(x, y);
      if (!data.elemento) continue;
      cells.push({ ...data });
    }
  }
  return {
    rows: state.rows,
    cols: state.cols,
    walkwayCol: state.walkwayCol,
    prossimo: state.prossimo,
    cells,
  };
}

async function tryLoadFromDatabase() {
  const result = await loadStrutturaFromDb();
  updateDbStatusUI();

  if (result.ok && result.data) {
    applyStrutturaData(result.data);
    return;
  }

  if (result.ok && result.empty) {
    loadDemoLayout();
    return;
  }

  if (!result.ok) {
    loadDemoLayout();
  }
}

function buildLegends() {
  const elementList = document.getElementById('element-legend');
  elementList.innerHTML = '';

  ELEMENTOS.forEach((el, i) => {
    const li = document.createElement('li');
    li.dataset.element = el.id;
    if (i === 0) li.classList.add('selected');

    const swatch = document.createElement('span');
    swatch.className = 'legend-swatch';
    if (SWATCH_CLASS[el.id]) swatch.classList.add(SWATCH_CLASS[el.id]);
    else swatch.style.background = SWATCH_COLOR[el.id] || '#ccc';

    const label = document.createElement('span');
    label.textContent = `${el.icon} ${el.label}`;
    if (el.attivo) {
      const badge = document.createElement('small');
      badge.textContent = ' (alquilable)';
      badge.style.color = '#2f855a';
      label.appendChild(badge);
    }

    li.appendChild(swatch);
    li.appendChild(label);
    li.addEventListener('click', () => {
      state.selectedElement = el.id;
      document.querySelectorAll('#element-legend li').forEach((n) => n.classList.remove('selected'));
      li.classList.add('selected');
      if (state.mode !== 'elemento') setMode('elemento');
    });
    elementList.appendChild(li);
  });

  const rateList = document.getElementById('rate-legend');
  rateList.innerHTML = '';

  TASAS.forEach((rate, i) => {
    const li = document.createElement('li');
    li.dataset.rate = rate;
    if (i === 0) li.classList.add('selected');

    const swatch = document.createElement('span');
    swatch.className = 'legend-swatch';
    swatch.style.background = `hsl(${40 + i * 25}, 70%, 55%)`;
    swatch.textContent = rate;
    swatch.style.color = '#fff';
    swatch.style.fontWeight = 'bold';
    swatch.style.fontSize = '0.75rem';
    swatch.style.display = 'flex';
    swatch.style.alignItems = 'center';
    swatch.style.justifyContent = 'center';

    const label = document.createElement('span');
    label.textContent = `Tasa ${rate}`;

    li.appendChild(swatch);
    li.appendChild(label);
    li.addEventListener('click', () => {
      state.selectedRate = rate;
      document.querySelectorAll('#rate-legend li').forEach((n) => n.classList.remove('selected'));
      li.classList.add('selected');
      if (state.mode !== 'tarifa') setMode('tarifa');
    });
    rateList.appendChild(li);
  });
}

function buildGrid() {
  const grid = document.getElementById('beach-grid');
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(${state.cols}, 36px)`;

  for (let y = 1; y <= state.rows; y++) {
    for (let x = 1; x <= state.cols; x++) {
      const cell = document.createElement('div');
      cell.className = 'cell empty';
      cell.dataset.x = x;
      cell.dataset.y = y;
      cell.setAttribute('role', 'gridcell');
      cell.addEventListener('click', () => handleCellClick(x, y));
      grid.appendChild(cell);
    }
  }

  renderAllCells();
}

function renderCell(x, y) {
  const grid = document.getElementById('beach-grid');
  const idx = (y - 1) * state.cols + (x - 1);
  const dom = grid.children[idx];
  if (!dom) return;

  const data = getCell(x, y);

  dom.className = 'cell';
  dom.removeAttribute('data-element');
  dom.innerHTML = '';

  if (!data.elemento) {
    dom.classList.add('empty');
    return;
  }

  dom.dataset.element = data.elemento;

  if (data.attivo) {
    dom.classList.add('attivo');
    if (data.cella > 0) {
      dom.classList.add('has-number');
      const num = document.createElement('span');
      num.className = 'cell-number';
      num.textContent = data.cella;
      dom.appendChild(num);
    }
  } else {
    dom.classList.add('inactive-element');
    const el = ELEMENTOS.find((e) => e.id === data.elemento);
    if (el) dom.textContent = el.icon;
  }

  if (data.attivo && data.settore) {
    const badge = document.createElement('span');
    badge.className = 'rate-badge';
    badge.textContent = data.settore;
    dom.appendChild(badge);
  }
}

function renderAllCells() {
  for (let y = 1; y <= state.rows; y++) {
    for (let x = 1; x <= state.cols; x++) {
      renderCell(x, y);
    }
  }
}

function handleCellClick(x, y) {
  const data = getCell(x, y);

  switch (state.mode) {
    case 'elemento': {
      const el = state.selectedElement;
      data.elemento = el;
      data.attivo = isElementAttivo(el);
      if (!data.attivo) {
        data.settore = null;
        data.cella = 0;
      } else if (!data.settore) {
        data.settore = state.selectedRate;
      }
      break;
    }
    case 'tarifa':
      if (data.attivo) {
        data.settore = state.selectedRate;
      }
      break;
    case 'numeracion':
      if (data.attivo) {
        data.cella = state.prossimo;
        state.prossimo += 1;
        document.getElementById('prossimo').value = state.prossimo;
      }
      break;
    case 'borrar':
      state.cells[cellKey(x, y)] = {
        x,
        y,
        elemento: null,
        desc: '',
        settore: null,
        attivo: false,
        cella: 0,
      };
      break;
    default:
      break;
  }

  renderCell(x, y);
  refreshExport();
  updateStats();
}

function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll('.tool-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  const hints = {
    elemento: 'Modo: Sección elementos — clic en una celda para asignar el elemento seleccionado.',
    tarifa: 'Modo: Sección tarifas — clic en celdas activas para asignar la tasa (A, B, C...).',
    numeracion: 'Modo: Numeración — clic en celdas activas para asignar el número secuencial.',
    borrar: 'Modo: Borrar — clic en una celda para vaciarla.',
  };
  document.getElementById('mode-hint').textContent = hints[mode] || '';
}

function autoNumber() {
  let num = state.prossimo;
  for (let y = 1; y <= state.rows; y++) {
    for (let x = 1; x <= state.cols; x++) {
      const data = getCell(x, y);
      if (data.attivo && data.elemento) {
        data.cella = num;
        num += 1;
      }
    }
  }
  state.prossimo = num;
  document.getElementById('prossimo').value = state.prossimo;
  renderAllCells();
  refreshExport();
  updateStats();
}

function generateExportRows() {
  const rows = [];
  for (let y = 1; y <= state.rows; y++) {
    for (let x = 1; x <= state.cols; x++) {
      const data = getCell(x, y);
      if (!data.elemento) continue;

      rows.push({
        CELLA: data.attivo && data.cella > 0 ? data.cella : 0,
        X: x,
        Y: y,
        ELEMENTO: data.elemento,
        DESC: data.desc || '',
        SETTORE: formatSettore(data.settore, data.attivo),
        ATTIVO: formatAttivo(data.attivo),
      });
    }
  }
  return rows;
}

function refreshExport() {
  const rows = generateExportRows();
  const tbody = document.querySelector('#export-table tbody');
  tbody.innerHTML = '';

  rows.forEach((row) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.CELLA}</td>
      <td>${row.X}</td>
      <td>${row.Y}</td>
      <td>${row.ELEMENTO}</td>
      <td>${row.DESC}</td>
      <td>${row.SETTORE}</td>
      <td>${row.ATTIVO}</td>
    `;
    tbody.appendChild(tr);
  });
}

function exportToText() {
  const rows = generateExportRows();
  const header = 'CELDA\tX\tY\tELEMENTO\tDESC\tSETTORE\tATTIVO';
  const lines = rows.map(
    (r) =>
      `${r.CELLA}\t${r.X}\t${r.Y}\t${r.ELEMENTO}\t${r.DESC}\t${r.SETTORE}\t${r.ATTIVO}`
  );
  return [header, ...lines].join('\n');
}

function downloadFile() {
  const text = exportToText();
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `estructura_playa_${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function copyToClipboard() {
  navigator.clipboard.writeText(exportToText()).then(() => {
    const btn = document.getElementById('btn-copy');
    const orig = btn.textContent;
    btn.textContent = '¡Copiado!';
    setTimeout(() => { btn.textContent = orig; }, 1500);
  });
}

function updateStats() {
  const stats = document.getElementById('stats');
  let activos = 0;
  let numerados = 0;
  const porElemento = {};
  const porTasa = {};

  for (let y = 1; y <= state.rows; y++) {
    for (let x = 1; x <= state.cols; x++) {
      const data = getCell(x, y);
      if (!data.elemento) continue;
      porElemento[data.elemento] = (porElemento[data.elemento] || 0) + 1;
      if (data.attivo) {
        activos += 1;
        if (data.cella > 0) numerados += 1;
        if (data.settore) {
          porTasa[data.settore] = (porTasa[data.settore] || 0) + 1;
        }
      }
    }
  }

  let html = `<strong>Activos (alquilables):</strong> ${activos}<br>`;
  html += `<strong>Numerados:</strong> ${numerados}<br>`;
  html += '<strong>Por elemento:</strong><br>';
  Object.entries(porElemento).forEach(([k, v]) => {
    html += `&nbsp;${k}: ${v}<br>`;
  });
  if (Object.keys(porTasa).length) {
    html += '<strong>Por tasa:</strong><br>';
    Object.entries(porTasa).forEach(([k, v]) => {
      html += `&nbsp;${k}: ${v}<br>`;
    });
  }
  stats.innerHTML = html;
}

function loadDemoLayout() {
  state.cells = {};
  state.prossimo = 1;

  for (let x = 1; x <= state.cols; x++) {
    setElement(x, 1, 'Mare', false);
  }

  const walkway = state.walkwayCol;
  for (let y = 1; y <= state.rows; y++) {
    setElement(walkway, y, 'Pasarela', false);
  }

  for (let y = 2; y <= state.rows; y++) {
    for (let x = 1; x < walkway; x++) {
      if (x === walkway - 1 && y <= 4) {
        setElement(x, y, 'Palma', false);
      } else {
        setElement(x, y, 'Ombrellone', true, 'A');
      }
    }
    for (let x = walkway + 1; x <= state.cols; x++) {
      setElement(x, y, 'Ombrellone', true, 'A');
    }
  }

  setElement(state.cols, 3, 'Adorno', false);

  autoNumber();
}

function setElement(x, y, elemento, attivo, settore = null) {
  const data = getCell(x, y);
  data.elemento = elemento;
  data.attivo = attivo;
  data.settore = attivo ? (settore || 'A') : null;
  data.cella = 0;
}

function loadFromText(text) {
  const lines = text.trim().split('\n');
  const start = lines[0].includes('CELDA') ? 1 : 0;
  state.cells = {};

  for (let i = start; i < lines.length; i++) {
    const parts = lines[i].split('\t');
    if (parts.length < 7) continue;

    const [cella, x, y, elemento, desc, settore, attivo] = parts;
    const data = getCell(parseInt(x, 10), parseInt(y, 10));
    data.cella = parseInt(cella, 10) || 0;
    data.elemento = elemento;
    data.desc = desc;
    data.attivo = attivo === '.T.';
    data.settore = settore === '.F.' ? null : settore;
  }

  let maxCella = 0;
  Object.values(state.cells).forEach((c) => {
    if (c.cella > maxCella) maxCella = c.cella;
  });
  state.prossimo = maxCella + 1;
  document.getElementById('prossimo').value = state.prossimo;

  renderAllCells();
  refreshExport();
  updateStats();
}

function bindEvents() {
  document.querySelectorAll('.tool-btn').forEach((btn) => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode));
  });

  document.getElementById('btn-plus').addEventListener('click', () => {
    state.prossimo += 1;
    document.getElementById('prossimo').value = state.prossimo;
  });

  document.getElementById('prossimo').addEventListener('change', (e) => {
    state.prossimo = Math.max(1, parseInt(e.target.value, 10) || 1);
    e.target.value = state.prossimo;
  });

  document.getElementById('btn-minus').addEventListener('click', () => {
    state.prossimo = Math.max(1, state.prossimo - 1);
    document.getElementById('prossimo').value = state.prossimo;
  });

  document.getElementById('btn-reset-num').addEventListener('click', () => {
    state.prossimo = 1;
    document.getElementById('prossimo').value = 1;
    for (let y = 1; y <= state.rows; y++) {
      for (let x = 1; x <= state.cols; x++) {
        const data = getCell(x, y);
        data.cella = 0;
      }
    }
    renderAllCells();
    refreshExport();
    updateStats();
  });

  document.getElementById('btn-auto-number').addEventListener('click', autoNumber);

  document.getElementById('btn-count').addEventListener('click', updateStats);

  document.getElementById('btn-save').addEventListener('click', downloadFile);

  document.getElementById('btn-download').addEventListener('click', downloadFile);

  document.getElementById('btn-copy').addEventListener('click', copyToClipboard);

  document.getElementById('btn-load').addEventListener('click', () => {
    document.getElementById('file-input').click();
  });

  document.getElementById('file-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => loadFromText(ev.target.result);
    reader.readAsText(file);
    e.target.value = '';
  });

  document.getElementById('btn-apply-size').addEventListener('click', () => {
    state.rows = Math.min(50, Math.max(4, parseInt(document.getElementById('grid-rows').value, 10) || 14));
    state.cols = Math.min(60, Math.max(8, parseInt(document.getElementById('grid-cols').value, 10) || 22));
    state.walkwayCol = Math.floor(state.cols / 2);
    document.getElementById('grid-rows').value = state.rows;
    document.getElementById('grid-cols').value = state.cols;
    buildGrid();
    refreshExport();
    updateStats();
  });

  onProfileChange(async () => {
    initDbPanel();
    await tryLoadFromDatabase();
    refreshExport();
    updateStats();
  });

  const linkGestisci = document.getElementById('link-gestisci-bd');
  if (linkGestisci) {
    linkGestisci.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.parent?.caricaProceduraEsterna) {
        window.parent.caricaProceduraEsterna('cambia');
      } else {
        window.location.href = 'pages/cambia.html';
      }
    });
  }

  document.getElementById('btn-db-save-config').addEventListener('click', () => {
    saveDbConfig({
      owner: document.getElementById('db-owner').value.trim(),
      repo: document.getElementById('db-repo').value.trim(),
      branch: document.getElementById('db-branch').value.trim(),
      database: document.getElementById('db-database')?.value.trim(),
    });
    saveToken(document.getElementById('db-token').value.trim());
    updateDbStatusUI();
    const el = document.getElementById('db-status');
    el.className = 'db-status ok';
    el.textContent = 'Configuración guardada en el navegador.';
  });

  document.getElementById('btn-db-load').addEventListener('click', async () => {
    saveToken(document.getElementById('db-token').value.trim());
    const result = await loadStrutturaFromDb();
    updateDbStatusUI();
    if (result.ok && result.data) {
      applyStrutturaData(result.data);
      refreshExport();
      updateStats();
    } else if (result.ok && result.empty) {
      loadDemoLayout();
      refreshExport();
      updateStats();
    }
  });

  document.getElementById('btn-db-save').addEventListener('click', async () => {
    saveToken(document.getElementById('db-token').value.trim());
    const btn = document.getElementById('btn-db-save');
    btn.disabled = true;
    btn.textContent = 'Guardando…';
    const result = await saveStrutturaToDb(getStrutturaSnapshot());
    updateDbStatusUI();
    btn.disabled = false;
    btn.textContent = 'Guardar en BD';
    if (!result.ok && result.error) {
      alert(result.error);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  init();
  onAuthChange(applyReadOnlyMode);
  applyReadOnlyMode();
});