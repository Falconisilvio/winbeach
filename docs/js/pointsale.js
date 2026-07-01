let dbRistorante = { sale: [], tavoli: [], categorie: [], prodotti: [] };
let carrello = [];
let categoriaAttiva = "";

function wbT(key) { return (window.__wbT && window.__wbT(key)) || key; }

// Inizializzazione della cassa ad ogni visualizzazione della pagina
window.addEventListener('pageshow', function () {
  const tbl = localStorage.getItem('tavoloSelezionato') || wbT('pos.counter');
  
  // Trova l'intestazione del tavolo e aggiunge il pulsante rapido fucsia accanto ad esso
  const lblTavolo = document.getElementById('lbl-tavolo');
  if (lblTavolo) {
    lblTavolo.innerText = tbl;
    
    // Controlla se il pulsante rapido esiste già per evitare duplicati
    if (!document.getElementById('btn-cambio-rapido-fucsia')) {
      const btnRapido = document.createElement('button');
      btnRapido.id = 'btn-cambio-rapido-fucsia';
      btnRapido.type = 'button';
      btnRapido.innerHTML = '<i class="fa-solid fa-shuffle"></i> Cambia Tavolo';
      btnRapido.style = "background: #e91e63; color: white; border: none; padding: 4px 10px; border-radius: 20px; cursor: pointer; font-weight: bold; font-size: 0.8rem; margin-left: 10px; vertical-align: middle;";
      btnRapido.onclick = function(e) {
        e.preventDefault();
        apriDialogCambioTavoloRapido();
      };
      lblTavolo.parentNode.insertBefore(btnRapido, lblTavolo.nextSibling);
    }
  }
  
  // Crea dinamicamente la dialog se non è presente nell'HTML
  if (!document.getElementById('dialog-cambio-tavolo-rapido')) {
    const rigaDialog = document.createElement('dialog');
    rigaDialog.id = 'dialog-cambio-tavolo-rapido';
    rigaDialog.style = "border: none; border-radius: 8px; padding: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); min-width: 300px; font-family: sans-serif;";
    rigaDialog.innerHTML = `
      <h3 style="margin-top:0; color:#333;"><i class="fa-solid fa-utensils"></i> Seleziona Tavolo</h3>
      <select id="select-cambio-tavolo-rapido" style="width:100%; padding:8px; font-size:1rem; margin-bottom:15px; border-radius:4px; border:1px solid #ccc;"></select>
      <div style="display:flex; justify-content:flex-end; gap:10px;">
        <button type="button" id="btn-chiudi-diag-rapida" style="padding:6px 12px; background:#757575; color:white; border:none; border-radius:4px; cursor:pointer;">Annulla</button>
        <button type="button" id="btn-conferma-diag-rapida" style="padding:6px 12px; background:#2e7d32; color:white; border:none; border-radius:4px; cursor:pointer;">Carica</button>
      </div>
    `;
    document.body.appendChild(rigaDialog);
    
    document.getElementById('btn-chiudi-diag-rapida').onclick = () => rigaDialog.close();
    document.getElementById('btn-conferma-diag-rapida').onclick = () => confermaCambioTavoloRapido();
  }
  
  // Legge l'archivio reale configurato dal LocalStorage
  const datiSalvati = localStorage.getItem('winbeach_archivio_ristorante');
  if (datiSalvati) {
    dbRistorante = JSON.parse(datiSalvati);
  }
  
  // Carica l'eventuale carrello salvato per il tavolo corrente
  const tavoloId = localStorage.getItem('tavoloSelezionatoId');
  if (tavoloId) {
    const carrelloSalvato = localStorage.getItem(`carrello_tavolo_${tavoloId}`);
    carrello = carrelloSalvato ? JSON.parse(carrelloSalvato) : [];
  } else {
    carrello = [];
  }
  
  costruisciMenuCassa();
  aggiornaXBrowse();

  // Controllo speciale: se arriviamo da "Chiudi Tavolo", attiva la modalità di pagamento diretto
  const azioneRichiesta = localStorage.getItem('pos_azione_richiesta');
  if (azioneRichiesta === 'pagamento') {
    console.log("Modalità pagamento diretto attivata.");
    alert("Pronto per il saldo del " + tbl + ". Scegli il metodo di pagamento ed esegui la chiusura.");
  }
});

function costruisciMenuCassa() {
  const barraCat = document.getElementById('barra-categorie-dinamica');
  if (!barraCat) return;
  barraCat.innerHTML = '';

  if (!dbRistorante.categorie || dbRistorante.categorie.length === 0) {
    barraCat.innerHTML = '<span style="color:gray; padding:10px; font-style:italic;">Nessuna categoria creata</span>';
    document.getElementById('grid-prodotti').innerHTML = '';
    return;
  }

  dbRistorante.categorie.forEach((c, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cat-btn';
    
    // Gestione immagine categoria (se salvata in Base64 dal file di configurazione)
    if (c.immagine && c.immagine.trim() !== "") {
      btn.innerHTML = `<img src="${c.immagine}" style="width:20px; height:20px; object-fit:cover; border-radius:3px; margin-right:6px; vertical-align:middle;"> <span>${c.nome}</span>`;
    } else {
      btn.innerText = c.nome;
    }
    
    if (index === 0 && !categoriaAttiva) {
      categoriaAttiva = c.nome;
    }
    
    if (categoriaAttiva === c.nome) {
      btn.classList.add('active');
    }

    btn.onclick = function() {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      categoriaAttiva = c.nome;
      caricaArticoliDellaCategoria(c.nome);
    };

    barraCat.appendChild(btn);
  });

  if (categoriaAttiva) {
    caricaArticoliDellaCategoria(categoriaAttiva);
  }
}

function caricaArticoliDellaCategoria(catNome) {
  const grid = document.getElementById('grid-prodotti');
  if (!grid) return;
  grid.innerHTML = '';

  const prodottiFiltrati = dbRistorante.prodotti ? dbRistorante.prodotti.filter(p => p.categoriaId === catNome) : [];

  if (prodottiFiltrati.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; padding: 20px; color: gray; font-style: italic;">Nessun prodotto in questa categoria.</p>';
    return;
  }

  prodottiFiltrati.forEach(p => {
    const card = document.createElement('div');
    card.className = 'articolo-card';
    
    // Gestione immagine prodotto (se presente in Base64, altrimenti non aggiunge tag img per preservare il layout pulito)
    let bloccoImmagine = '';
    if (p.immagine && p.immagine.trim() !== "") {
      bloccoImmagine = `<img src="${p.immagine}" style="width:100%; height:60px; object-fit:cover; border-radius:4px; margin-bottom:6px;">`;
    }
    
    card.innerHTML = `
      ${bloccoImmagine}
      <div class="name">${p.nome}</div>
      <div class="price">${Number(p.prezzo).toFixed(2)} €</div>
    `;
    card.onclick = function() {
      aggiungiProdotto(p.nome, p.prezzo);
    };
    grid.appendChild(card);
  });
}

function aggiungiProdotto(nome, prezzo) {
  const item = carrello.find((i) => i.nome === nome);
  if (item) item.qta++;
  else carrello.push({ nome, qta: 1, prezzo });
  
  // Salva il carrello nello storage temporaneo del tavolo specifico
  const tavoloId = localStorage.getItem('tavoloSelezionatoId');
  if (tavoloId) {
    localStorage.setItem(`carrello_tavolo_${tavoloId}`, JSON.stringify(carrello));
  }
  aggiornaXBrowse();
}

function rimuoviProdotto(idx) {
  carrello.splice(idx, 1);
  const tavoloId = localStorage.getItem('tavoloSelezionatoId');
  if (tavoloId) {
    localStorage.setItem(`carrello_tavolo_${tavoloId}`, JSON.stringify(carrello));
  }
  aggiornaXBrowse();
}

function aggiornaXBrowse() {
  const tbody = document.getElementById('xbrowse-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  let totaleConto = 0;

  carrello.forEach((item, idx) => {
    const rigaTot = item.qta * item.prezzo;
    totaleConto += rigaTot;
    tbody.innerHTML += `
      <tr>
        <td><strong>${item.nome}</strong></td>
        <td style="text-align:center;">${item.qta}</td>
        <td style="text-align:right;">${rigaTot.toFixed(2)} €</td>
        <td style="text-align:center;"><button type="button" class="btn-del" onclick="rimuoviProdotto(${idx})"><i class="fa-regular fa-trash-can"></i></button></td>
      </tr>`;
  });
  
  const txtTotale = document.getElementById('txt-totale');
  if (txtTotale) {
    txtTotale.innerText = totaleConto.toFixed(2) + ' €';
  }
}

// FUNZIONI DI CAMBIO TAVOLO RAPIDO SENZA USCIRE DALLA CASSA
function apriDialogCambioTavoloRapido() {
  const select = document.getElementById('select-cambio-tavolo-rapido');
  if (!select) return;
  select.innerHTML = '';
  
  const datiSalvati = localStorage.getItem('winbeach_archivio_ristorante');
  if (!datiSalvati) return alert("Nessun tavolo configurato.");
  
  const db = JSON.parse(datiSalvati);
  if (!db.tavoli || db.tavoli.length === 0) return alert("Nessun tavolo trovato.");
  
  db.tavoli.sort((a, b) => Number(a.numero) - Number(b.numero));

  db.tavoli.forEach(t => {
    const orarioApertura = localStorage.getItem(`ora_apertura_tavolo_${t.id}`);
    const isOccupato = t.stato === 'occupato' || orarioApertura !== null;
    const stato = isOccupato ? `(Occupato - ${orarioApertura || 'In corso'})` : '(Libero)';
    
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

  // Salva il carrello corrente prima di cambiare tavolo
  const vecchioTavoloId = localStorage.getItem('tavoloSelezionatoId');
  if (vecchioTavoloId) {
    localStorage.setItem(`carrello_tavolo_${vecchioTavoloId}`, JSON.stringify(carrello));
  }

  // Se il tavolo di destinazione era libero, forziamo l'apertura e lo stato occupato
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
  
  // Riesegue l'aggiornamento dello stato della pagina corrente simulando il rientro
  window.dispatchEvent(new Event('pageshow'));
}

function inviaComanda() {
  if (carrello.length === 0) return alert(wbT('pos.empty'));
  
  const azioneRichiesta = localStorage.getItem('pos_azione_richiesta');
  if (azioneRichiesta === 'pagamento') {
    completaPagamentoESvotaTavolo();
  } else {
    alert(wbT('pos.sent'));
    carrello = [];
    aggiornaXBrowse();
  }
}

function completaPagamentoESvotaTavolo() {
  const tavoloId = localStorage.getItem('tavoloSelezionatoId');
  if (tavoloId) {
    localStorage.removeItem(`ora_apertura_tavolo_${tavoloId}`);
    const datiSalvati = localStorage.getItem('winbeach_archivio_ristorante');
    if (datiSalvati) {
      let db = JSON.parse(datiSalvati);
      db.tavoli = db.tavoli.map(t => String(t.id) === String(tavoloId) ? { ...t, stato: 'libero' } : t);
      localStorage.setItem('winbeach_archivio_ristorante', JSON.stringify(db));
    }
  }
  
  alert("Pagamento registrato con successo! Il tavolo è stato liberato.");
  carrello = [];
  localStorage.removeItem('tavoloSelezionato');
  localStorage.removeItem('tavoloSelezionatoId');
  localStorage.removeItem('pos_azione_richiesta');
  
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ comando: 'cambiaPagina', target: 'ristorante' }, '*');
  } else {
    window.location.href = 'tavolinew.html';
  }
}

window.addEventListener('winbeach-lang-change', () => import('../js/page-i18n.js').then((m) => m.applyPageI18n()));
