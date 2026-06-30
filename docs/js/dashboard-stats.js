import { loadDashboardStats, onProfileChange } from './winbeach-db.js';

let paymentChart, channelChart;

async function refreshDashboard() {
  const res = await loadDashboardStats();
  if (!res.ok) return;
  const s = res.stats;

  const setNum = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val; };
  setNum('.arrivi .number', s.arriviOggi);
  setNum('.partenze .number', s.partenzeOggi);
  setNum('.cancellazioni .number', s.cancellazioni);
  setNum('.occupazione .number', `${s.occupazione}%`);
  setNum('.fatturato .number', Math.round(s.fatturato).toLocaleString('it-IT'));
  setNum('.presenze .number', s.presenze);

  if (paymentChart) {
    paymentChart.data.datasets[0].data = [s.pagamenti.saldato, s.pagamenti.parziale, s.pagamenti.da_saldare];
    paymentChart.update();
  }
  if (channelChart) {
    const labels = Object.keys(s.canali);
    channelChart.data.labels = labels;
    channelChart.data.datasets[0].data = labels.map((k) => s.canali[k]);
    channelChart.update();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    paymentChart = Chart.getChart('chartPayment');
    channelChart = Chart.getChart('chartChannel');
    refreshDashboard();
  }, 500);
  onProfileChange(refreshDashboard);
});