let dbRistorante = { sale: [], tavoli: [], categorie: [], prodotti: [] };
let carrello = [];
let categoriaAttiva = "";

function wbT(key) { return (window.__wbT && window.__wbT(key)) || key; }

// Inizializzazione della cassa ad ogni visualizzazione della pagina
window.addEventListener('pageshow', function () {
  const tbl = localStorage.getItem('tavoloSelezionato') || wbT('pos.counter');
  document.getElementById('lbl-tavolo').innerText = tbl;
  
  // Legge l'archivio reale configurato dal LocalStorage
  const datiSalvati = localStorage.getItem('winbeach_archivio_ristorante');
  if (datiSalvati) {
    dbRistorante = JSON.parse(datiSalvati);
  }
  
  costruisciMenuCassa();

  // Controllo speciale: se arriviamo da "Chiudi Tavolo", attiva la modalità di pagamento diretto
  const azioneRichiesta = localStorage.getItem('pos_azione_richiesta');
  if (azioneRichiesta === 'pagamento') {
    console.log("Modalità pagamento diretto attivata.");
    // Esempio: qui puoi inserire un alert o far comparire una schermata di riepilogo conti
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
  aggiornaXBrowse();
}

function rimuoviProdotto(idx) {
  carrello.splice(idx, 1);
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

// Funzione legata alla stampa comanda / pagamento definitivo
function inviaComanda() {
  if (carrello.length === 0) return alert(wbT('pos.empty'));
  
  // Se la richiesta attiva era un pagamento, chiudiamo il tavolo e rimettiamolo a verde (libero)
  const azioneRichiesta = localStorage.getItem('pos_azione_richiesta');
  if (azioneRichiesta === 'pagamento') {
    completaPagamentoESvotaTavolo();
  } else {
    alert(wbT('pos.sent'));
    carrello = [];
    aggiornaXBrowse();
  }
}

// Funzione interna per liberare il tavolo dal DB locale
function completaPagamentoESvotaTavolo() {
  const tavoloId = localStorage.getItem('tavoloSelezionatoId');
  
  if (tavoloId) {
    // Cancella l'orario associato al tavolo
    localStorage.removeItem(`ora_apertura_tavolo_${tavoloId}`);
    
    // Cambia lo stato del tavolo in 'libero' nel database locale
    const datiSalvati = localStorage.getItem('winbeach_archivio_ristorante');
    if (datiSalvati) {
      let db = JSON.parse(datiSalvati);
      db.tavoli = db.tavoli.map(t => String(t.id) === String(tavoloId) ? { ...t, stato: 'libero' } : t);
      localStorage.setItem('winbeach_archivio_ristorante', JSON.stringify(db));
    }
  }
  
  alert("Pagamento registrato con successo! Il tavolo è stato liberato.");
  
  // Resetta le variabili di stato
  carrello = [];
  localStorage.removeItem('tavoloSelezionato');
  localStorage.removeItem('tavoloSelezionatoId');
  localStorage.removeItem('pos_azione_richiesta');
  
  // Reindirizza l'iframe alla mappa dei tavoli aggiornata
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ comando: 'cambiaPagina', target: 'ristorante' }, '*');
  } else {
    window.location.href = 'tavolinew.html';
  }
}

window.addEventListener('winbeach-lang-change', () => import('../js/page-i18n.js').then((m) => m.applyPageI18n()));
