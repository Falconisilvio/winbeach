let dbRistorante = { sale: [], tavoli: [], categorie: [], prodotti: [] };
let carrello = [];
let categoriaAttiva = "";
let copertiCorrenti = 1;

function wbT(key) { return (window.__wbT && window.__wbT(key)) || key; }

// Inizializzazione della cassa ad ogni visualizzazione della pagina
window.addEventListener('pageshow', function () {
  let tbl = localStorage.getItem('tavoloSelezionato') || wbT('pos.counter');
  const tavoloId = localStorage.getItem('tavoloSelezionatoId');
  
  // SE I TAVOLI SONO UNITI, LI VISUALIZZA ACCANTO AL NOME PRINCIPALE
  if (tavoloId) {
    const uniti = JSON.parse(localStorage.getItem(`tavoli_uniti_a_${tavoloId}`) || "[]");
    if (uniti.length > 0) {
      tbl += ` (+ T. ${uniti.join(', ')})`;
    }
    
    // Recupera la comanda separata salvata per questo specifico tavolo
    const carrelloSalvato = localStorage.getItem(`carrello_tavolo_${tavoloId}`);
    carrello = carrelloSalvato ? JSON.parse(carrelloSalvato) : [];
    
    // Recupera i coperti salvati per questo tavolo
    copertiCorrenti = parseInt(localStorage.getItem(`coperti_tavolo_${tavoloId}`) || "1", 10);
  } else {
    carrello = [];
    copertiCorrenti = 1;
  }

  // Costruisce la barra dei coperti sopra o sotto il titolo del tavolo se l'elemento esiste
  mostraInterfacciaCoperti();

  document.getElementById('lbl-tavolo').innerText = tbl;
  
  const datiSalvati = localStorage.getItem('winbeach_archivio_ristorante');
  if (datiSalvati) {
    dbRistorante = JSON.parse(datiSalvati);
  }
  
  costruisciMenuCassa();
  aggiornaXBrowse();

  const azioneRichiesta = localStorage.getItem('pos_azione_richiesta');
  if (azioneRichiesta === 'pagamento') {
    console.log("Modalità pagamento diretto attivata.");
    alert("Pronto per il saldo del " + tbl + ". Scegli il metodo di pagamento ed esegui la chiusura.");
  }
});

function mostraInterfacciaCoperti() {
  let box = document.getElementById('box-coperti-cassa');
  if (!box) {
    // Se non esiste l'elemento nel tuo HTML, lo inseriamo dinamicamente sotto il titolo del tavolo
    const header = document.getElementById('lbl-tavolo').parentElement;
    box = document.createElement('div');
    box.id = 'box-coperti-cassa';
    box.style = 'margin: 5px 0; display: flex; align-items: center; gap: 10px; font-size: 0.95rem;';
    header.appendChild(box);
  }
  
  const tavoloId = localStorage.getItem('tavoloSelezionatoId');
  if (!tavoloId) {
    box.innerHTML = ''; // Nessun coperto per la vendita al banco diretta
    return;
  }

  box.innerHTML = `
    <strong>Coperti:</strong>
    <button type="button" onclick="cambiaCoperti(-1)" style="padding: 2px 8px; font-weight: bold; cursor:pointer;">-</button>
    <span id="txt-coperti-valore" style="font-weight: bold; color: #0288d1;">${copertiCorrenti}</span>
    <button type="button" onclick="cambiaCoperti(1)" style="padding: 2px 8px; font-weight: bold; cursor:pointer;">+</button>
  `;
}

function cambiaCoperti(val) {
  const tavoloId = localStorage.getItem('tavoloSelezionatoId');
  if (!tavoloId) return;

  copertiCorrenti += val;
  if (copertiCorrenti < 1) copertiCorrenti = 1;
  
  document.getElementById('txt-coperti-valore').innerText = copertiCorrenti;
  localStorage.setItem(`coperti_tavolo_${tavoloId}`, copertiCorrenti.toString());
  aggiornaXBrowse(); // Ricalcola se hai una riga costo coperti automatica, o semplicemente aggiorna
}

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
    btn.innerText = c.nome;
    
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
    card.innerHTML = `
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
  
  // SALVATAGGIO IN TEMPO REALE DELLA VERA COMANDA DEL TAVOLO
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
  document.getElementById('txt-totale').innerText = totaleConto.toFixed(2) + ' €';
}

function inviaComanda() {
  if (carrello.length === 0) return alert(wbT('pos.empty'));
  
  const azioneRichiesta = localStorage.getItem('pos_azione_richiesta');
  if (azioneRichiesta === 'pagamento') {
    completaPagamentoESvotaTavolo();
  } else {
    alert(wbT('pos.sent'));
    // Resta sul tavolo aperto senza ripulire la schermata globale, l'ordine è andato
  }
}

function completaPagamentoESvotaTavolo() {
  const tavoloId = localStorage.getItem('tavoloSelezionatoId');
  
  if (tavoloId) {
    // Elenco di tutti i tavoli coinvolti (quello principale + eventuali uniti)
    const uniti = JSON.parse(localStorage.getItem(`tavoli_uniti_a_${tavoloId}`) || "[]");
    
    // Ripulisce il tavolo principale
    localStorage.removeItem(`ora_apertura_tavolo_${tavoloId}`);
    localStorage.removeItem(`carrello_tavolo_${tavoloId}`);
    localStorage.removeItem(`coperti_tavolo_${tavoloId}`);
    localStorage.removeItem(`tavoli_uniti_a_${tavoloId}`);

    dbRistorante.tavoli = dbRistorante.tavoli.map(t => String(t.id) === String(tavoloId) ? { ...t, stato: 'libero' } : t);

    // Ripulisce e sblocca tutti i tavoli che erano stati uniti a questo
    uniti.forEach(numTavolo => {
      const tUnito = dbRistorante.tavoli.find(t => String(t.numero) === String(numTavolo));
      if (tUnito) {
        localStorage.removeItem(`ora_apertura_tavolo_${tUnito.id}`);
        localStorage.removeItem(`carrello_tavolo_${tUnito.id}`);
        localStorage.removeItem(`coperti_tavolo_${tUnito.id}`);
        tUnito.stato = 'libero';
      }
    });

    localStorage.setItem('winbeach_archivio_ristorante', JSON.stringify(dbRistorante));
  }
  
  alert("Pagamento registrato con successo! I tavoli selezionati sono stati liberati.");
  
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
