import { loadOperationalData } from './winbeach-db.js';
import { $, formatEuro, updateDbBar, initModule } from './winbeach-module.js';
import { t } from './app-i18n.js';

const MODE = document.body.dataset.mode || 'ombrellone';

async function load() {
  const res = await loadOperationalData();
  updateDbBar();
  if (!res.ok) return;
  const { prenotazioni, celle, settori, tariffe } = res.data;
  const attive = prenotazioni.filter((p) => p.stato !== 'cancellata');
  const tbody = $('data-tbody');
  const noData = `<tr><td colspan="${MODE === 'ombrellone' ? 4 : MODE === 'settore' ? 3 : 2}">${t('common.noData')}</td></tr>`;

  if (MODE === 'ombrellone') {
    const byCella = {};
    attive.forEach((p) => { byCella[p.cella] = (byCella[p.cella] || 0) + 1; });
    const rows = celle.filter((c) => c.cella > 0).map((c) => [c.cella, c.settore || '—', byCella[c.cella] || 0, formatEuro((byCella[c.cella] || 0) * 30)]);
    $('stat-1').textContent = celle.filter((c) => c.attivo).length;
    $('stat-2').textContent = Object.keys(byCella).length;
    tbody.innerHTML = rows.map((r) => `<tr><td>${t('common.spot')} ${r[0]}</td><td>${r[1]}</td><td>${t('stat.bookingsShort', { n: r[2] })}</td><td>${r[3]}</td></tr>`).join('') || noData;
  } else if (MODE === 'settore') {
    const bySettore = {};
    attive.forEach((p) => {
      const c = celle.find((x) => x.cella === p.cella);
      const s = c?.settore || '?';
      if (!bySettore[s]) bySettore[s] = { count: 0, importo: 0 };
      bySettore[s].count++;
      bySettore[s].importo += Number(p.importo) || 0;
    });
    tbody.innerHTML = Object.entries(bySettore).map(([k, v]) => `<tr><td>${k}</td><td>${v.count}</td><td>${formatEuro(v.importo)}</td></tr>`).join('') || noData;
  } else {
    const buckets = { '1-3': 0, '4-7': 0, '8-14': 0, '15+': 0 };
    attive.forEach((p) => {
      const days = Math.ceil((new Date(p.data_fine) - new Date(p.data_inizio)) / 86400000) + 1;
      if (days <= 3) buckets['1-3']++;
      else if (days <= 7) buckets['4-7']++;
      else if (days <= 14) buckets['8-14']++;
      else buckets['15+']++;
    });
    tbody.innerHTML = Object.entries(buckets).map(([k, v]) => `<tr><td>${t('stat.daysBucket', { range: k })}</td><td>${v}</td></tr>`).join('');
  }
}

initModule(async () => { $('btn-reload')?.addEventListener('click', load); await load(); });