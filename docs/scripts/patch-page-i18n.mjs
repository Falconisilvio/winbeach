/**
 * Añade data-i18n a patrones HTML repetidos en pages/*.html
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const pagesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'pages');
const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith('.html'));

let changed = 0;

for (const file of files) {
  const fp = path.join(pagesDir, file);
  let html = fs.readFileSync(fp, 'utf8');
  const orig = html;

  html = html.replace(
    /<p>Nessun record\.<\/p>/g,
    '<p data-i18n="common.noRecords">Nessun record.</p>',
  );

  html = html.replace(
    /<i class="fa-solid fa-rotate"><\/i> Ricarica<\/button>/g,
    '<i class="fa-solid fa-rotate"></i> <span data-i18n="btn.reload">Ricarica</span></button>',
  );

  html = html.replace(
    /<span><i class="fa-solid fa-database"><\/i> Base dati<\/span>/g,
    '<span><i class="fa-solid fa-database"></i> <span data-i18n="common.db">Base dati</span></span>',
  );

  html = html.replace(
    /<button type="button" class="modal-close" id="modal-close">&times;<\/button>/g,
    '<button type="button" class="modal-close" id="modal-close" data-i18n-aria="common.close" aria-label="Chiudi">&times;</button>',
  );

  html = html.replace(
    /<button type="button" class="btn btn-secondary" id="btn-cancel">Annulla<\/button>/g,
    '<button type="button" class="btn btn-secondary" id="btn-cancel" data-i18n="common.cancel">Annulla</button>',
  );

  html = html.replace(
    /<button type="submit" class="btn btn-primary" id="btn-save">Salva<\/button>/g,
    '<button type="submit" class="btn btn-primary" id="btn-save" data-i18n="common.save">Salva</button>',
  );

  html = html.replace(
    /<input type="search" id="search-input" placeholder="Cerca…">/g,
    '<input type="search" id="search-input" data-i18n-placeholder="common.search" placeholder="Cerca…">',
  );

  if (html !== orig) {
    fs.writeFileSync(fp, html);
    changed++;
    console.log('patched', file);
  }
}

console.log(`Done: ${changed} files updated`);