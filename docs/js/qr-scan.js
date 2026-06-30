import { loadPrenotazioniFromDb } from './winbeach-db.js';
import { t } from './app-i18n.js';
import { $, clienteLabel, formatDate, formatEuro, updateDbBar, initModule, navigateApp } from './winbeach-module.js';

let prenotazioni = [];
let scanner = null;
let lastQuery = '';

async function search(code) {
  const q = code.trim().toLowerCase();
  lastQuery = q;
  if (!q) return;
  const found = prenotazioni.find((p) =>
    String(p.id) === q ||
    String(p.cella) === q ||
    clienteLabel(p.cliente).toLowerCase().includes(q)
  );
  const result = $('qr-result');
  if (!found) {
    result.innerHTML = `<p class="empty-state">${t('qr.notFound')}</p>`;
    return;
  }
  result.innerHTML = `
    <div class="info-box">
      <strong>#${found.id} — ${clienteLabel(found.cliente)}</strong><br>
      ${t('common.spot')} ${found.cella || '—'} · ${formatDate(found.data_inizio)} → ${formatDate(found.data_fine)}<br>
      ${t('col.amount')}: ${formatEuro(found.importo)} · ${found.stato_pagamento || '—'}
      <div style="margin-top:12px">
        <button type="button" class="btn btn-primary btn-sm" id="btn-open-booking">${t('qr.openBooking')}</button>
      </div>
    </div>`;
  $('btn-open-booking')?.addEventListener('click', () => {
    navigateApp('booking', { q: String(found.id) });
  });
}

async function stopCamera() {
  const wrap = $('qr-reader-wrap');
  if (scanner) {
    try {
      await scanner.stop();
      scanner.clear();
    } catch { /* già fermato */ }
    scanner = null;
  }
  if (wrap) wrap.hidden = true;
  $('btn-stop-camera').style.display = 'none';
  $('btn-camera').style.display = '';
}

async function startCamera() {
  if (!window.Html5Qrcode) {
    alert(t('qr.noScanner'));
    return;
  }
  const wrap = $('qr-reader-wrap');
  wrap.hidden = false;
  $('btn-camera').style.display = 'none';
  $('btn-stop-camera').style.display = '';

  scanner = new Html5Qrcode('qr-reader');
  try {
    await scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decoded) => {
        $('qr-input').value = decoded;
        stopCamera();
        search(decoded);
      },
      () => {}
    );
  } catch (err) {
    await stopCamera();
    alert(`${t('qr.cameraError')} ${err.message || err}`);
  }
}

async function load() {
  const res = await loadPrenotazioniFromDb();
  updateDbBar();
  if (res.ok) prenotazioni = res.data;
}

function bindQrEvents() {
  if (window.__qrBound) return;
  window.__qrBound = true;
  $('qr-input')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') search(e.target.value); });
  $('btn-search')?.addEventListener('click', () => search($('qr-input').value));
  $('btn-camera')?.addEventListener('click', startCamera);
  $('btn-stop-camera')?.addEventListener('click', stopCamera);
  window.addEventListener('beforeunload', stopCamera);
}

initModule(async () => {
  bindQrEvents();
  await load();
  const q = new URLSearchParams(window.location.search).get('q');
  if (q && $('qr-input')) {
    $('qr-input').value = q;
    await search(q);
  } else if (lastQuery) {
    await search(lastQuery);
  }
});