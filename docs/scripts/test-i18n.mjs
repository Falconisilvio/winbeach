import { APP_I18N, APP_LANGS } from '../js/i18n/app.js';

const required = [
  'app.title', 'nav.spiaggia', 'menu.dashboard', 'dash.arrivi',
  'btn.reload', 'btn.exportPdf', 'auth.login',
];

let ok = true;
for (const { code } of APP_LANGS) {
  const pack = APP_I18N[code];
  for (const key of required) {
    if (!pack?.[key]) {
      console.error(`FAIL ${code}: missing ${key}`);
      ok = false;
    }
  }
  if (ok) console.log(`OK ${code}: ${Object.keys(pack).length} keys`);
}
if (!ok) process.exit(1);
console.log('All app i18n validated.');