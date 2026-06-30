import { APP_I18N, APP_LANGS } from '../js/i18n/app.js';
import { GUIDE_I18N, GUIDE_LANGS } from '../js/guida/index.js';

const LANGS = ['it', 'en', 'es', 'fr', 'de'];
const required = [
  'app.title', 'nav.spiaggia', 'menu.dashboard', 'dash.arrivi',
  'btn.reload', 'btn.exportPdf', 'auth.login', 'page.booking.title',
  'common.db', 'menu.elementi', 'login.submit',
];

let ok = true;

if (APP_LANGS.length !== 5) {
  console.error(`FAIL APP_LANGS: expected 5, got ${APP_LANGS.length}`);
  ok = false;
}

const refKeys = Object.keys(APP_I18N.it);
for (const { code } of APP_LANGS) {
  const pack = APP_I18N[code];
  for (const key of required) {
    if (!pack?.[key]) {
      console.error(`FAIL ${code}: missing ${key}`);
      ok = false;
    }
  }
  const missing = refKeys.filter((k) => !pack[k]);
  if (missing.length) {
    console.error(`FAIL ${code}: ${missing.length} keys missing vs IT (e.g. ${missing.slice(0, 3).join(', ')})`);
    ok = false;
  }
  if (!ok) continue;
  console.log(`OK ${code}: ${Object.keys(pack).length} keys`);
}

for (const { code } of GUIDE_LANGS) {
  if (!GUIDE_I18N[code]?.meta?.title) {
    console.error(`FAIL guide ${code}`);
    ok = false;
  } else {
    console.log(`OK guide ${code}`);
  }
}

if (!ok) process.exit(1);
console.log('All app i18n validated (5 languages).');