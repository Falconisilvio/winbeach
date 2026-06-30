/**
 * Factory CRUD genérico para tablas githubDB
 */
import { loadTable, saveTableRow, deleteTableRow } from './winbeach-db.js';
import {
  $, escapeHtml, updateDbBar, requireWrite, bindModal, initModule, badge,
} from './winbeach-module.js';

async function t(key) {
  const { t: tr } = await import('./app-i18n.js');
  return tr(key);
}

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
        if (c.type === 'bool') {
          const yes = config.yesLabel || 'Sì';
          const no = config.noLabel || 'No';
          return `<td>${r[c.key] ? badge(yes, 'green') : badge(no, 'gray')}</td>`;
        }
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
      $(config.modalTitleId || 'modal-title').textContent = config.editTitle || '';
      config.formFields.forEach((f) => {
        const el = $(f.id);
        if (!el) return;
        const v = r?.[f.field];
        if (f.type === 'checkbox') el.checked = Boolean(v);
        else el.value = v ?? '';
      });
    } else {
      $(config.modalTitleId || 'modal-title').textContent = config.newTitle || '';
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
    const saving = await t('common.saving');
    const saveLbl = await t('common.save');
    if (btn) { btn.disabled = true; btn.textContent = saving; }
    await saveTableRow(config.table, row, config.fields, rows, 'common.saving');
    updateDbBar();
    if (btn) { btn.disabled = false; btn.textContent = saveLbl; }
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
    if (!confirm(await t('common.confirmDelete'))) return;
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
    const yesLabel = await t('common.yes');
    const noLabel = await t('common.no');
    config.yesLabel = yesLabel;
    config.noLabel = noLabel;
    if (!config.newTitle) config.newTitle = await t('btn.new');
    if (!config.editTitle) config.editTitle = await t('common.edit');
    const saveBtn = $('btn-save');
    if (saveBtn) saveBtn.textContent = await t('common.save');
    const cancelBtn = $('btn-cancel');
    if (cancelBtn) cancelBtn.textContent = await t('common.cancel');
    const emptyP = document.querySelector('#empty-state p');
    if (emptyP && !emptyP.dataset.i18n) emptyP.textContent = await t('common.noRecords');
    bind();
    await load();
    const q = new URLSearchParams(window.location.search).get('q');
    const searchEl = $(config.searchId || 'search-input');
    if (q && searchEl) { searchEl.value = q; render(); }
  });
}