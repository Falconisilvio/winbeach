/**
 * Factory CRUD genérico para tablas githubDB
 */
import { loadTable, saveTableRow, deleteTableRow } from './winbeach-db.js';
import {
  $, escapeHtml, updateDbBar, requireWrite, bindModal, initModule, badge,
} from './winbeach-module.js';

export function createTableCrud(config) {
  let rows = [];
  let editingId = null;

  function render() {
    const tbody = $(config.tbodyId || 'data-tbody');
    const empty = $('empty-state');
    const q = ($(config.searchId || 'search-input')?.value || '').toLowerCase().trim();
    const filtered = q
      ? rows.filter((r) => config.columns.some((c) => String(r[c.key] ?? '').toLowerCase().includes(q)))
      : rows;

    if (!filtered.length) {
      if (tbody) tbody.innerHTML = '';
      if (empty) empty.style.display = 'block';
      if (config.statId) $(config.statId).textContent = rows.length;
      return;
    }
    if (empty) empty.style.display = 'none';

    tbody.innerHTML = filtered.map((r) => {
      const cells = config.columns.map((c) => {
        if (c.render) return `<td>${c.render(r)}</td>`;
        if (c.type === 'bool') return `<td>${r[c.key] ? badge('Sì', 'green') : badge('No', 'gray')}</td>`;
        if (c.type === 'euro') return `<td>${Number(r[c.key] || 0).toLocaleString('it-IT')} €</td>`;
        return `<td>${escapeHtml(r[c.key] ?? '—')}</td>`;
      }).join('');
      return `<tr>${cells}<td class="actions-cell">
        <button type="button" class="btn btn-secondary btn-sm" data-edit="${r.id}"><i class="fa-solid fa-pen"></i></button>
        <button type="button" class="btn btn-danger btn-sm" data-delete="${r.id}"><i class="fa-solid fa-trash"></i></button>
      </td></tr>`;
    }).join('');

    if (config.statId) $(config.statId).textContent = rows.length;

    tbody.querySelectorAll('[data-edit]').forEach((b) => b.addEventListener('click', () => openModal(Number(b.dataset.edit))));
    tbody.querySelectorAll('[data-delete]').forEach((b) => b.addEventListener('click', () => remove(Number(b.dataset.delete))));
  }

  function openModal(id = null) {
    editingId = id;
    const modal = $(config.modalId || 'data-modal');
    if (id) {
      const r = rows.find((x) => x.id === id);
      $(config.modalTitleId || 'modal-title').textContent = config.editTitle || 'Modifica';
      config.formFields.forEach((f) => {
        const el = $(f.id);
        if (!el) return;
        const v = r?.[f.field];
        if (f.type === 'checkbox') el.checked = Boolean(v);
        else el.value = v ?? '';
      });
    } else {
      $(config.modalTitleId || 'modal-title').textContent = config.newTitle || 'Nuovo';
      config.formFields.forEach((f) => {
        const el = $(f.id);
        if (!el) return;
        if (f.type === 'checkbox') el.checked = f.default ?? false;
        else el.value = f.default ?? '';
      });
    }
    modal?.classList.add('open');
  }

  function closeModal() {
    $(config.modalId || 'data-modal')?.classList.remove('open');
    editingId = null;
  }

  async function load() {
    if ($('btn-reload')) $('btn-reload').disabled = true;
    const res = await loadTable(config.table);
    updateDbBar();
    if ($('btn-reload')) $('btn-reload').disabled = false;
    if (res.ok) {
      rows = res.data;
      render();
      config.onLoad?.(rows);
    }
  }

  async function save(e) {
    e.preventDefault();
    if (config.requireAdmin) {
      const { assertAdmin } = await import('./winbeach-auth.js');
      const err = assertAdmin();
      if (err) { alert(err); return; }
    }
    if (!requireWrite()) return;
    const row = { id: editingId || undefined };
    config.formFields.forEach((f) => {
      const el = $(f.id);
      if (!el) return;
      if (f.type === 'checkbox') row[f.field] = el.checked;
      else if (f.type === 'number') row[f.field] = Number(el.value) || 0;
      else row[f.field] = el.value.trim();
    });
    const btn = $('btn-save');
    if (btn) { btn.disabled = true; btn.textContent = 'Salvataggio…'; }
    await saveTableRow(config.table, row, config.fields, rows, `Salvando ${config.table}…`);
    updateDbBar();
    if (btn) { btn.disabled = false; btn.textContent = 'Salva'; }
    closeModal();
    await load();
  }

  async function remove(id) {
    if (config.requireAdmin) {
      const { assertAdmin } = await import('./winbeach-auth.js');
      const err = assertAdmin();
      if (err) { alert(err); return; }
    }
    if (!requireWrite()) return;
    if (!confirm('Eliminare questo record?')) return;
    await deleteTableRow(config.table, id);
    updateDbBar();
    await load();
  }

  function bind() {
    $('btn-nuovo')?.addEventListener('click', () => openModal());
    $('btn-reload')?.addEventListener('click', load);
    $(config.searchId || 'search-input')?.addEventListener('input', render);
    bindModal(config.modalId || 'data-modal', ['modal-close', 'btn-cancel'], save);
  }

  initModule(async () => {
    bind();
    await load();
    const q = new URLSearchParams(window.location.search).get('q');
    const searchEl = $(config.searchId || 'search-input');
    if (q && searchEl) { searchEl.value = q; render(); }
  });
}