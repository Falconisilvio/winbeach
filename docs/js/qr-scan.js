import { loadPrenotazioniFromDb } from './winbeach-db.js';
import { $, clienteLabel, formatDate, formatEuro, updateDbBar, initModule } from './winbeach-module.js';

let prenotazioni = [];

async function search(code) {
  const q = code.trim().toLowerCase();
  if (!q) return;
  const found = prenotazioni.find((p) =>
    String(p.id) === q ||
    String(p.cella) === q ||
    clienteLabel(p.cliente).toLowerCase().includes(q)
  );
  const result = $('qr-result');
  if (!found) {
    result.innerHTML = '<p class="empty-state">Nessuna prenotazione trovata.</p>';
    return;
  }
  result.innerHTML = `
    <div class="info-box">
      <strong>#${found.id} — ${clienteLabel(found.cliente)}</strong><br>
      Post. ${found.cella || '—'} · ${formatDate(found.data_inizio)} → ${formatDate(found.data_fine)}<br>
      Importo: ${formatEuro(found.importo)} · ${found.stato_pagamento || '—'}
    </div>`;
}

async function load() {
  const res = await loadPrenotazioniFromDb();
  updateDbBar();
  if (res.ok) prenotazioni = res.data;
}

initModule(async () => {
  $('qr-input')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') search(e.target.value); });
  $('btn-search')?.addEventListener('click', () => search($('qr-input').value));
  $('btn-camera')?.addEventListener('click', () => alert('Fotocamera: inserisci manualmente ID postazione o prenotazione.'));
  await load();
  const q = new URLSearchParams(window.location.search).get('q');
  if (q && $('qr-input')) {
    $('qr-input').value = q;
    search(q);
  }
});