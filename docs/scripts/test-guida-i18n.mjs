import { GUIDE_I18N, GUIDE_LANGS } from '../js/guida/index.js';

const REQUIRED_IDS = [
  'intro', 'accesso', 'navigazione', 'multi-bd', 'dashboard', 'spiaggia',
  'booking', 'planner', 'listini', 'cassa', 'clienti', 'qr', 'statistiche',
  'log', 'contatori', 'magazzino', 'impostazioni', 'cambia', 'utenti',
  'stripe', 'mobile', 'faq', 'tecnico',
];

let ok = true;

for (const { code } of GUIDE_LANGS) {
  const pack = GUIDE_I18N[code];
  if (!pack?.meta?.title || !pack?.html) {
    console.error(`FAIL ${code}: missing meta or html`);
    ok = false;
    continue;
  }
  for (const id of REQUIRED_IDS) {
    if (!pack.html.includes(`id="${id}"`)) {
      console.error(`FAIL ${code}: missing section #${id}`);
      ok = false;
    }
  }
  if (!pack.html.includes('guide-toc')) {
    console.error(`FAIL ${code}: missing TOC`);
    ok = false;
  }
  console.log(`OK ${code}: ${pack.html.length} chars, ${REQUIRED_IDS.length} sections`);
}

if (!ok) process.exit(1);
console.log('All guide languages validated.');