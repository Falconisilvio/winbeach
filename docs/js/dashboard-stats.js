import { loadDashboardStats, onProfileChange } from './winbeach-db.js';

let paymentChart, channelChart, presenceChart, arrivalChart;

function refreshLineCharts(history) {
  if (!history) return;
  const maxY = Math.max(10, ...history.presenze, ...history.arrivi, ...history.partenze);

  if (presenceChart) {
    presenceChart.data.labels = history.labels;
    presenceChart.data.datasets[0].data = history.presenze;
    presenceChart.options.scales.y.max = Math.ceil(maxY * 1.15);
    presenceChart.update();
  }
  if (arrivalChart) {
    arrivalChart.data.labels = history.labels;
    arrivalChart.data.datasets[0].data = history.arrivi;
    arrivalChart.data.datasets[1].data = history.partenze;
    arrivalChart.options.scales.y.max = Math.ceil(maxY * 1.15);
    arrivalChart.update();
  }

  const range = history.rangeLabel || '';
  document.querySelectorAll('.date-button').forEach((btn) => {
    btn.innerHTML = `${range} <i class="fa-regular fa-calendar"></i>`;
  });
}

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

  refreshLineCharts(s.history);
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    paymentChart = Chart.getChart('chartPayment');
    channelChart = Chart.getChart('chartChannel');
    presenceChart = Chart.getChart('chartLine1');
    arrivalChart = Chart.getChart('chartLine2');
    refreshDashboard();
  }, 500);
  onProfileChange(refreshDashboard);
});