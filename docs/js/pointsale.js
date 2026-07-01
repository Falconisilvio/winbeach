let dbRistorante = { sale: [], tavoli: [], categorie: [], prodotti: [] };
let carrello = [];
let categoriaAttiva = "";
let copertiCorrenti = 1;

function wbT(key) { return (window.__wbT && window.__wbT(key)) || key; }

window.addEventListener('pageshow', function () {
  let tbl = localStorage.getItem('tavoloSelezionato') || wbT('pos.counter');
  const tavoloId = localStorage.getItem('tavoloSelezionatoId');
  
  if (tavoloId) {
    const uniti = JSON.parse(localStorage.getItem(`tavoli_uniti_a_${tavoloId}`) || "[]");
    if (uniti.length > 0) {
      tbl += ` (+ T. ${uniti.join(', ')})`;
    }
    const carrelloSalvato = localStorage.getItem(`carrello_tavolo_${tavoloId}`);
    carrello = carrelloSalvato ? JSON.parse(carrelloSalvato) : [];
    copertiCorrenti = parseInt(localStorage.getItem(`coperti_tavolo_${tavoloId}`) || "1", 10);
  } else {
    carrello = [];
    copertiCorrenti = 1;
  }

  mostraInterfacciaCoperti();
  document.getElementById('lbl-tavolo').innerText = tbl;
  
  const datiSalvati = localStorage.getItem('winbeach_archivio_ristorante');
  if (datiSalvati) {
    dbRistorante = JSON.parse(datiSalvati);
  }
  
  costruisciMenuCassa();
  aggiornaXBrowse();
});

/* SCORRIMENTO ORIZZONTALE CATEGORIE */
function scorriCategorie(valore) {
  const container = document.getElementById('barra-categorie-dinamica');
  if (container) container.scrollLeft += valore;
}

/* SCORRIMENTO VERTICALE PRODOTTI (A RIGHE) */
function scorriProdotti(valore) {
  const container = document.getElementById('grid-prodotti');
  if (container) container.scrollTop += valore;
}

/* COSTRUZIONE BOTTONI CATEGORIE */
function costruisciMenuCassa() {
  const barraCat = document.getElementById('barra-categorie-dinamica');
  if (!barraCat) return;
  barraCat.innerHTML = '';

  if (!dbRistorante.categorie || dbRistorante.categorie.length === 0) {
    barraCat.innerHTML = '<span style="color:gray; padding:10px; font-style:italic;">Nessuna categoria</span>';
    return;
  }

  dbRistorante.categorie.forEach((c, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cat-btn';
    
    // Gestione Immagine Categoria (Se presente nel database)
    if (c.immagine && c.immagine.trim() !== "") {
      btn.innerHTML = `<img src="${c.immagine}" alt=""> <span>${c.nome}</span>`;
    } else {
      btn.innerHTML = `<i class="fa-solid fa-folder"></i> <span>${c.nome}</span>`;
    }
    
    if (index === 0 && !categoriaAttiva) categoriaAttiva = c.nome;
    if (categoriaAttiva === c.nome) btn.classList.add('active');

    btn.onclick = function() {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      categoriaAttiva = c.nome;
      caricaArticoliDellaCategoria(c.nome);
    };
    barraCat.appendChild(btn);
  });

  if (categoriaAttiva) caricaArticoliDellaCategoria(categoriaAttiva);
}

/* CARICAMENTO ARTICOLI IN GRIGLIA A 4 RIGHE */
function caricaArticoliDellaCategoria(catNome) {
  const grid = document.getElementById('grid-prodotti');
  if (!grid) return;
  grid.innerHTML = '';

  const prodottiFiltrati = dbRistorante.prodotti ? dbRistorante.prodotti.filter(p => p.categoriaId === catNome) : [];

  if (prodottiFiltrati.length === 0) {
    grid.innerHTML = '<p style="padding:20px; color:gray;">Nessun prodotto.</p>';
    return;
  }

  prodottiFiltrati.forEach(p => {
    const card = document.createElement('div');
    card.className = 'articolo-card';
    
    // CONTROLLO IMMAGINE PRODOTTO: Se c'è la mostra, altrimenti inserisce l'icona posate di fallback
    let bloccoImmagine = `<div class="no-img-placeholder"><i class="fa-solid fa-utensils"></i></div>`;
    if (p.immagine && p.immagine.trim() !== "") {
      bloccoImmagine = `<img src="${p.immagine}" onerror="this.onerror=null; this.parentElement.querySelector('.no-img-placeholder').style.display='flex'; this.style.display='none';">`;
    }

    card.innerHTML = `
      ${bloccoImmagine}
      <div class="name">${p.nome}</div>
      <div class="price">${Number(p.prezzo).toFixed(2)} €</div>
    `;
    
    card.onclick = function() { aggiungiProdotto(p.nome, p.prezzo); };
    grid.appendChild(card);
  });
}

/* CAMBIO TAVOLO RAPIDO DIALOG */
function apriDialogCambioTavoloRapido() {
  const select = document.getElementById('select-cambio-tavolo-rapido');
  if (!select) return;
  select.innerHTML = '';
  
  const datiSalvati = localStorage.getItem('winbeach_archivio_ristorante');
  if (!datiSalvati) return alert("Nessun tavolo caricato.");
  
  const db = JSON.parse(datiSalvati);
  db.tavoli.sort((a, b) => Number(a.numero) - Number(b.numero));

  db.tavoli.forEach(t => {
    const orarioApertura = localStorage.getItem(`ora_apertura_tavolo_${t.id}`);
    const isOccupato = t.stato === 'occupato' || orarioApertura !== null;
    const stato = isOccupato ? `(Occupato - ${orarioApertura})` : '(Libero)';
    
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.setAttribute('data-numero', t.numero);
    opt.innerText = `Tavolo ${t.numero} ${stato}`;
    if (String(t.id) === String(localStorage.getItem('tavoloSelezionatoId'))) opt.selected = true;
    select.appendChild(opt);
  });
  document.getElementById('dialog-cambio-tavolo-rapido').showModal();
}

function confermaCambioTavoloRapido() {
  const select = document.getElementById('select-cambio-tavolo-rapido');
  const idSelezionato = select.value;
  if (!idSelezionato) return;
  
  const opt = select.options[select.selectedIndex];
  const numeroTavolo = opt.getAttribute('data-numero');

  const vecchioTavoloId = localStorage.getItem('tavoloSelezionatoId');
  if (vecchioTavoloId) {
    localStorage.setItem(`carrello_tavolo_${vecchioTavoloId}`, JSON.stringify(carrello));
  }

  const datiSalvati = localStorage.getItem('winbeach_archivio_ristorante');
  if (datiSalvati) {
    let db = JSON.parse(datiSalvati);
    let target = db.tavoli.find(t => String(t.id) === String(idSelezionato));
    if (target && target.stato !== 'occupato') {
      localStorage.setItem(`ora_apertura_tavolo_${idSelezionato}`, new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }));
      localStorage.setItem(`coperti_tavolo_${idSelezionato}`, "1");
      target.stato = 'occupato';
      localStorage.setItem('winbeach_archivio_ristorante', JSON.stringify(db));
    }
  }

  localStorage.setItem('tavoloSelezionato', `Tavolo ${numeroTavolo}`);
  localStorage.setItem('tavoloSelezionatoId', idSelezionato);
  localStorage.setItem('pos_azione_richiesta', 'ordinazione');

  document.getElementById('dialog-cambio-tavolo-rapido').close();
  window.dispatchEvent(new Event('pageshow'));
}

/* FUNZIONI DI SERVIZIO STANDARD */
function mostraInterfacciaCoperti() {
  let box = document.getElementById('box-coperti-cassa');
  if (!box) return;
  const tavoloId = localStorage.getItem('tavoloSelezionatoId');
  if (!tavoloId) { box.innerHTML = ''; return; }
  box.innerHTML = `
    <strong>Coperti:</strong>
    <button type="button" onclick="cambiaCoperti(-1)">-</button>
    <span id="txt-coperti-valore" style="font-weight:bold;margin:0 5px;">${copertiCorrenti}</span>
    <button type="button" onclick="cambiaCoperti(1)">+</button>
  `;
}
function cambiaCoperti(val) {
  const tavoloId = localStorage.getItem('tavoloSelezionatoId');
  if (!tavoloId) return;
  copertiCorrenti += val;
  if (copertiCorrenti < 1) copertiCorrenti = 1;
  document.getElementById('txt-coperti-valore').innerText = copertiCorrenti;
  localStorage.setItem(`coperti_tavolo_${tavoloId}`, copertiCorrenti.toString());
  aggiornaXBrowse();
}
function aggiungiProdotto(nome, prezzo) {
  const item = carrello.find((i) => i.nome === nome);
  if (item) item.qta++; else carrello.push({ nome, qta: 1, prezzo });
  const tavoloId = localStorage.getItem('tavoloSelezionatoId');
  if (tavoloId) localStorage.setItem(`carrello_tavolo_${tavoloId}`, JSON.stringify(carrello));
  aggiornaXBrowse();
}
function rimuoviProdotto(idx) {
  carrello.splice(idx, 1);
  const tavoloId = localStorage.getItem('tavoloSelezionatoId');
  if (tavoloId) localStorage.setItem(`carrello_tavolo_${tavoloId}`, JSON.stringify(carrello));
  aggiornaXBrowse();
}
function aggiornaXBrowse() {
  const tbody = document.getElementById('xbrowse-body');
  if (!tbody) return; tbody.innerHTML = ''; let tot = 0;
  carrello.forEach((item, idx) => {
    const rigaTot = item.qta * item.prezzo; tot += rigaTot;
    tbody.innerHTML += `<tr><td><strong>${item.nome}</strong></td><td style="text-align:center;">${item.qta}</td><td style="text-align:right;">${rigaTot.toFixed(2)} €</td><td style="text-align:center;"><button type="button" class="btn-del" onclick="rimuoviProdotto(${idx})"><i class="fa-regular fa-trash-can"></i></button></td></tr>`;
  });
  const lblTot = document.getElementById('txt-totale');
  if (lblTot) lblTot.innerText = tot.toFixed(2) + ' €';
}
