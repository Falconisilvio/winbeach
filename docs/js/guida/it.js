export const it = {
  meta: {
    lang: 'it',
    title: 'Guida — WinBeach Web',
    header: '<i class="fa-solid fa-circle-question" style="color:#0984e3"></i> Guida WinBeach Web',
    subtitle: 'Manuale operativo completo — Beach Manager su GitHub Pages .',
  },
  html: `
    <nav class="guide-toc" aria-label="Indice">
      <h3><i class="fa-solid fa-list"></i> Indice</h3>
      <ol>
        <li><a href="#intro">Introduzione</a></li>
        <li><a href="#accesso">Accesso e sicurezza</a></li>
        <li><a href="#navigazione">Navigazione</a></li>
        <li><a href="#multi-bd">Multi-stabilimento e base dati</a></li>
        <li><a href="#dashboard">Dashboard</a></li>
        <li><a href="#spiaggia">Spiaggia</a></li>
        <li><a href="#booking">Booking e prenotazioni</a></li>
        <li><a href="#planner">Planner</a></li>
        <li><a href="#listini">Listini e tariffe</a></li>
        <li><a href="#cassa">Cassa e flussi</a></li>
        <li><a href="#clienti">Clienti</a></li>
        <li><a href="#qr">QR Scan</a></li>
        <li><a href="#statistiche">Statistiche</a></li>
        <li><a href="#log">Log e audit</a></li>
        <li><a href="#contatori">Contatori</a></li>
        <li><a href="#magazzino">Magazzino</a></li>
        <li><a href="#impostazioni">Impostazioni</a></li>
        <li><a href="#cambia">Cambia stabilimento</a></li>
        <li><a href="#utenti">Utenti e ruoli</a></li>
        <li><a href="#stripe">Pagamenti Stripe</a></li>
        <li><a href="#mobile">Uso su mobile e tablet</a></li>
        <li><a href="#faq">FAQ e risoluzione problemi</a></li>
        <li><a href="#tecnico">Appendice tecnica</a></li>
      </ol>
    </nav>

    <!-- 1. INTRODUZIONE -->
    <section class="guide-section" id="intro">
      <h3><i class="fa-solid fa-umbrella-beach"></i> 1. Introduzione</h3>
      <p><strong>WinBeach Web</strong> è la versione browser del gestionale balneare WinBeach. Permette di gestire postazioni, prenotazioni, clienti, incassi e configurazione dello stabilimento senza installare software desktop.</p>
      <p>URL pubblico: <code>https://falconisilvio.github.io/winbeach/</code></p>
      <h4>Funzionalità principali</h4>
      <ul>
        <li>Dashboard operativa con KPI in tempo reale (arrivi, partenze, occupazione, fatturato)</li>
        <li>CRUD completo su 24+ tabelle tramite <strong>base dati cloud</strong></li>
        <li>Planimetria spiaggia interattiva (editor Struttura)</li>
        <li>Multi-stabilimento: più lidi con basi dati separate</li>
        <li>Autenticazione utenti con ruoli (sola lettura / scrittura / admin)</li>
        <li>Layout responsive per smartphone, tablet e desktop</li>
      </ul>
      <div class="info-box">
        <strong>Modalità predefinita</strong>
        <p style="margin:6px 0 0">All'apertura l'app è in <span class="guide-badge read">sola lettura</span>. Puoi consultare tutti i dati; per creare, modificare o eliminare record devi <strong>accedere</strong> e configurare il <strong>token GitHub</strong>.</p>
      </div>
    </section>

    <!-- 2. ACCESSO -->
    <section class="guide-section" id="accesso">
      <h3><i class="fa-solid fa-right-to-bracket"></i> 2. Accesso e sicurezza</h3>
      <h4>Login utente</h4>
      <ol>
        <li>Clicca <strong>Accedi</strong> nella barra superiore (o vai a <code>login.html</code>)</li>
        <li>Inserisci username e password</li>
        <li>Dopo il login compare il tuo nome e ruolo nella topbar</li>
      </ol>
      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead><tr><th>Utente demo</th><th>Password</th><th>Ruolo</th><th>Permessi</th></tr></thead>
          <tbody>
            <tr><td><code>admin</code></td><td><code>admin</code></td><td>Amministratore</td><td><span class="guide-badge admin">Admin</span> Scrittura + utenti + profili BD</td></tr>
            <tr><td><code>reception</code></td><td><code>reception</code></td><td>Operatore</td><td><span class="guide-badge write">Scrittura</span> Operazioni giornaliere</td></tr>
          </tbody>
        </table>
      </div>
      <h4>Token GitHub (scritture su base dati)</h4>
      <p>Le modifiche vengono inviate al repository dati tramite GitHub Actions. Serve un <strong>Personal Access Token</strong> con permesso <code>repo</code> sul fork della base dati.</p>
      <ol>
        <li>Accedi come <strong>admin</strong></li>
        <li>Vai su <strong>Cambia stabilimento</strong> → modifica profilo → campo Token</li>
        <li>Incolla il token (formato <code>ghp_…</code>) e salva</li>
      </ol>
      <div class="guide-warn">
        <strong>Importante:</strong> il token resta nel browser locale (localStorage). Non condividere il PC con token attivo. La sessione utente dura 8 ore; il token persiste finché non lo rimuovi.
      </div>
      <h4>Doppia protezione sulle scritture</h4>
      <ul>
        <li><strong>Livello 1 — Utente:</strong> sessione valida + ruolo Operatore o Amministratore</li>
        <li><strong>Livello 2 — Base dati:</strong> token GitHub con accesso in scrittura al repo dati</li>
      </ul>
    </section>

    <!-- 3. NAVIGAZIONE -->
    <section class="guide-section" id="navigazione">
      <h3><i class="fa-solid fa-compass"></i> 3. Navigazione</h3>
      <h4>Barra laterale (icone)</h4>
      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead><tr><th>Icona</th><th>Modulo</th><th>Descrizione</th></tr></thead>
          <tbody>
            <tr><td>☂ Spiaggia</td><td>spiaggia</td><td>Mappa occupazione postazioni oggi</td></tr>
            <tr><td>📅 Booking</td><td>booking</td><td>Gestione prenotazioni con tariffe</td></tr>
            <tr><td>📋 Planner</td><td>planner</td><td>Vista calendario / planning</td></tr>
            <tr><td>📃 Listini</td><td>listini</td><td>Listini prezzi stagionali</td></tr>
            <tr><td>💰 Cassa</td><td>cassa</td><td>Movimenti di cassa giornalieri</td></tr>
            <tr><td>📊 Statistiche</td><td>dashboard</td><td>Torna alla dashboard KPI</td></tr>
            <tr><td>👤 Clienti</td><td>clienti</td><td>Anagrafica clienti</td></tr>
            <tr><td>QR</td><td>qr-scan</td><td>Ricerca prenotazione via QR/testo</td></tr>
            <tr><td>⚙ Impostazioni</td><td>—</td><td>Apre sottomenu configurazione</td></tr>
            <tr><td>⇄ Cambia</td><td>cambia</td><td>Profili multi-stabilimento</td></tr>
            <tr><td>? Guida</td><td>guida</td><td>Questo manuale</td></tr>
          </tbody>
        </table>
      </div>
      <h4>Menu testuale (sinistra)</h4>
      <p>Raggruppa i moduli operativi: <em>Arrivi e partenze</em>, <em>Statistiche stabilimento</em>, <em>Log e flussi</em>, <em>Contatori</em>, <em>Magazzino</em> e il sottomenu <em>Impostazioni</em>.</p>
      <h4>Selettore stabilimento (topbar)</h4>
      <p>Dropdown con tutti i profili configurati. Cambiando stabilimento si ricaricano i dati dalla rispettiva base dati.</p>
      <h4>Barra di stato connessione</h4>
      <p>In ogni modulo compare <code>nome stabilimento · stato</code>: <em>idle</em>, <em>loading</em>, <em>ok</em>, <em>error</em>. Indica se la lettura/scrittura verso la base dati è riuscita.</p>
    </section>

    <!-- 4. MULTI-BD -->
    <section class="guide-section" id="multi-bd">
      <h3><i class="fa-solid fa-database"></i> 4. Multi-stabilimento e base dati</h3>
      <p>Ogni stabilimento corrisponde a un file JSON nel repository dati, es. <code>data/winbeach.json</code>, <code>data/winbeach-lido-sud.json</code>.</p>
      <h4>Configurazione profilo</h4>
      <ul>
        <li><strong>Nome stabilimento</strong> — etichetta visibile nell'app</li>
        <li><strong>Owner / Repo</strong> — es. <code>owner/nome-repo</code></li>
        <li><strong>Rama (branch)</strong> — di solito <code>main</code></li>
        <li><strong>File BD</strong> — nome senza <code>.json</code></li>
        <li><strong>Token</strong> — uno per profilo, salvato nel browser</li>
      </ul>
      <h4>Profili demo</h4>
      <p>In <strong>Cambia stabilimento</strong> → <strong>Profili demo</strong> vengono creati automaticamente tre stabilimenti con dati di prova distinti.</p>
      <h4>Lettura vs scrittura</h4>
      <ul>
        <li><strong>Lettura:</strong> pubblica via CDN GitHub (<code>raw.githubusercontent.com</code>), senza token</li>
        <li><strong>Scrittura:</strong> SQL inviato via <code>repository_dispatch</code>; GitHub Actions applica la modifica in 10–30 secondi</li>
      </ul>
    </section>

    <!-- 5. DASHBOARD -->
    <section class="guide-section" id="dashboard">
      <h3><i class="fa-solid fa-house"></i> 5. Dashboard</h3>
      <p>Panoramica giornaliera dello stabilimento attivo. I numeri si aggiornano automaticamente dalla base dati (<code>dashboard-stats.js</code>).</p>
      <h4>Card KPI</h4>
      <ul>
        <li><strong>Arrivi / Partenze</strong> — prenotazioni con inizio/fine uguale a oggi</li>
        <li><strong>Cancellazioni</strong> — prenotazioni con stato <code>cancellata</code></li>
        <li><strong>Occupazione</strong> — % postazioni occupate oggi</li>
        <li><strong>Fatturato</strong> — somma importi prenotazioni attive</li>
        <li><strong>Presenze</strong> — clienti in spiaggia oggi</li>
        <li><strong>Sconti</strong> — link al log sconti</li>
        <li><strong>Carrello medio</strong> — statistiche durata</li>
      </ul>
      <h4>Grafici</h4>
      <ul>
        <li>Torta <em>Stato pagamenti</em> (saldato / parziale / da saldare)</li>
        <li>Torta <em>Canale prenotazioni</em> (offline / widget / portale)</li>
        <li>Linee <em>Presenze</em> e <em>Arrivi/Partenze</em> (dati demo grafici storici)</li>
      </ul>
      <p>I link <em>Dettaglio →</em> aprono il modulo correlato nel pannello centrale.</p>
    </section>

    <!-- 6. SPIAGGIA -->
    <section class="guide-section" id="spiaggia">
      <h3><i class="fa-solid fa-umbrella-beach"></i> 6. Spiaggia</h3>
      <p>Vista mappa delle postazioni con stato di occupazione per la data odierna. Colori e legenda derivano da prenotazioni attive e tabella <code>celle</code>.</p>
      <ul>
        <li>Verde / occupato — postazione con prenotazione valida oggi</li>
        <li>Libero — disponibile per nuova prenotazione</li>
        <li>Statistiche in alto: postazioni totali, occupate, % occupazione</li>
      </ul>
    </section>

    <!-- 7. BOOKING -->
    <section class="guide-section" id="booking">
      <h3><i class="fa-solid fa-calendar-days"></i> 7. Booking e prenotazioni</h3>
      <h4>Booking (sidebar)</h4>
      <p>Modulo principale CRUD prenotazioni con calcolo automatico tariffe.</p>
      <ul>
        <li><strong>Nuova</strong> — richiede almeno un cliente in anagrafica</li>
        <li>Campi: cliente, postazione (cella), date, stato, importo, pagato, canale, pagamento</li>
        <li>Il prezzo si calcola da settore postazione + tariffe + date (modificabile manualmente)</li>
        <li>Stati: <code>confermata</code>, <code>in_attesa</code>, <code>cancellata</code></li>
        <li>Pagamento: <code>saldato</code>, <code>parziale</code>, <code>da_saldare</code></li>
      </ul>
      <h4>Arrivi e partenze (menu sinistro)</h4>
      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead><tr><th>Pagina</th><th>Contenuto</th><th>Azioni</th></tr></thead>
          <tbody>
            <tr><td>Arrivi oggi</td><td>Prenotazioni con <code>data_inizio = oggi</code></td><td>Check-in rapido</td></tr>
            <tr><td>Partenze oggi</td><td><code>data_fine = oggi</code></td><td>Check-out</td></tr>
            <tr><td>Arrivi domani</td><td>Arrivi previsti domani</td><td>Sola lettura</td></tr>
            <tr><td>Partenze domani</td><td>Partenze previste domani</td><td>Sola lettura</td></tr>
            <tr><td>Modifiche ombrelloni</td><td>Log spostamenti postazione</td><td>CRUD su <code>log_modifiche</code></td></tr>
            <tr><td>Tutte le prenotazioni</td><td>Elenco completo filtrabile</td><td>Stesse funzioni di Booking</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 8. PLANNER -->
    <section class="guide-section" id="planner">
      <h3><i class="fa-solid fa-list"></i> 8. Planner</h3>
      <p>Vista pianificazione attività e impegni (<code>attivita</code>). Utile per organizzare task giornalieri dello staff (apertura, pulizie, preparazione arrivi).</p>
    </section>

    <!-- 9. LISTINI -->
    <section class="guide-section" id="listini">
      <h3><i class="fa-solid fa-tags"></i> 9. Listini e tariffe</h3>
      <h4>Listini</h4>
      <p>Definiscono periodi e settori coperti (es. «Estivo 2026», settori A/B/C).</p>
      <h4>Tariffe</h4>
      <p>Prezzi per fascia (<code>tassa</code> = settore): giornaliero, settimanale, quindicinale, mensile. Collegati a <code>listino_id</code>.</p>
      <div class="guide-tip">
        Configura prima <strong>Settori</strong> e <strong>Tariffe</strong>, poi <strong>Struttura</strong> (assegnazione settore a ogni postazione) per un calcolo prezzi corretto in Booking.
      </div>
    </section>

    <!-- 10. CASSA -->
    <section class="guide-section" id="cassa">
      <h3><i class="fa-solid fa-cash-register"></i> 10. Cassa e flussi</h3>
      <h4>Cassa</h4>
      <ul>
        <li>Registra entrate/uscite in <code>movimenti_cassa</code></li>
        <li>Statistiche: entrate/uscite oggi, saldo</li>
        <li>Campi: tipo, importo, descrizione, metodo (contanti/carta/bonifico), operatore</li>
      </ul>
      <h4>Flussi di cassa (menu)</h4>
      <p>Stessa logica di Cassa, vista dedicata nel gruppo «Log e flussi» per analisi movimenti aggregati.</p>
    </section>

    <!-- 11. CLIENTI -->
    <section class="guide-section" id="clienti">
      <h3><i class="fa-solid fa-users"></i> 11. Clienti</h3>
      <p>Anagrafica in tabella <code>clienti</code>: nome, cognome, email, telefono, note.</p>
      <ul>
        <li>Ricerca testuale in tempo reale</li>
        <li>Obbligatorio almeno il nome per salvare</li>
        <li>Ogni prenotazione richiede un <code>cliente_id</code> valido</li>
      </ul>
    </section>

    <!-- 12. QR -->
    <section class="guide-section" id="qr">
      <h3><i class="fa-solid fa-qrcode"></i> 12. QR Scan</h3>
      <p>Cerca una prenotazione inserendo codice QR, ID prenotazione o nome cliente. Mostra dettaglio e stato check-in. Ideale per ingresso rapido in spiaggia.</p>
    </section>

    <!-- 13. STATISTICHE -->
    <section class="guide-section" id="statistiche">
      <h3><i class="fa-solid fa-chart-pie"></i> 13. Statistiche</h3>
      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead><tr><th>Modulo</th><th>Analisi</th></tr></thead>
          <tbody>
            <tr><td>Statistiche per ombrellone</td><td>Utilizzo e ricavi per numero postazione</td></tr>
            <tr><td>Statistiche per settore</td><td>Confronto fasce A / B / C</td></tr>
            <tr><td>Statistiche per durata</td><td>Distribuzione soggiorni (giornaliero, settimanale, …)</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 14. LOG -->
    <section class="guide-section" id="log">
      <h3><i class="fa-solid fa-file-lines"></i> 14. Log e audit</h3>
      <ul>
        <li><strong>Log sconti</strong> — sconti applicati: operatore, cliente, %, importo, motivo</li>
        <li><strong>Log cancellazioni</strong> — prenotazioni annullate con eventuale penale</li>
        <li><strong>Flussi di cassa</strong> — movimenti economici (vedi sezione Cassa)</li>
      </ul>
      <p>Tutti i log sono persistiti nella base dati e consultabili in sola lettura da qualsiasi utente.</p>
    </section>

    <!-- 15. CONTATORI -->
    <section class="guide-section" id="contatori">
      <h3><i class="fa-solid fa-calculator"></i> 15. Contatori</h3>
      <h4>Contatori Albergo</h4>
      <p>Gestione convenzioni alberghiere: codice convenzione, totale postazioni assegnate, utilizzate.</p>
      <h4>Contatori Voucher</h4>
      <p>Campagne voucher (codice, emessi, utilizzati, scadenza) — tabella <code>voucher</code>.</p>
    </section>

    <!-- 16. MAGAZZINO -->
    <section class="guide-section" id="magazzino">
      <h3><i class="fa-solid fa-warehouse"></i> 16. Magazzino</h3>
      <p>Giacenze articoli (<code>articoli</code>) e movimenti (<code>movimenti_magazzino</code>): ombrelloni, sdraio, teli, ecc. Controlla scorte minime e storico entrate/uscite.</p>
    </section>

    <!-- 17. IMPOSTAZIONI -->
    <section class="guide-section" id="impostazioni">
      <h3><i class="fa-solid fa-gear"></i> 17. Impostazioni</h3>
      <p>Accessibili dall'icona ⚙ nella sidebar. Configurazione strutturale dello stabilimento:</p>
      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead><tr><th>Modulo</th><th>Tabella</th><th>Funzione</th></tr></thead>
          <tbody>
            <tr><td>Elementi</td><td><code>elementi</code></td><td>Tipi oggetto: ombrellone, cabina, hawaiana, pasarella…</td></tr>
            <tr><td>Servizi</td><td><code>servizi</code></td><td>Servizi extra (lettino, parcheggio…)</td></tr>
            <tr><td>Settori</td><td><code>settori</code></td><td>Fasce prezzo / zona (A, B, C…)</td></tr>
            <tr><td>Struttura</td><td><code>celle</code>, <code>config</code></td><td>Editor planimetria griglia spiaggia</td></tr>
            <tr><td>Listini</td><td><code>listini</code></td><td>Cataloghi prezzi stagionali</td></tr>
            <tr><td>Tariffe</td><td><code>tariffe</code></td><td>Prezzi per settore e durata</td></tr>
            <tr><td>Capitaneria</td><td><code>capitaneria</code></td><td>Voci tariffario demaniale / tasse</td></tr>
            <tr><td>Esercizi</td><td><code>esercizi</code></td><td>Bar, chiosco, noleggio sullo stabilimento</td></tr>
            <tr><td>Azienda</td><td><code>azienda</code></td><td>Ragione sociale, P.IVA, contatti</td></tr>
            <tr><td>Utenti</td><td><code>utenti</code></td><td>Account accesso app (solo admin)</td></tr>
          </tbody>
        </table>
      </div>
      <h4>Editor Struttura (dettaglio)</h4>
      <ol>
        <li>Imposta righe/colonne e colonna passerella</li>
        <li>Seleziona strumento: elemento, tassa (settore), numerazione</li>
        <li>Clicca sulle celle per assegnare tipo e settore</li>
        <li><strong>Carica da BD</strong> — legge <code>celle</code> dalla base dati</li>
        <li><strong>Salva su BD</strong> — salva planimetria (richiede login + token)</li>
      </ol>
      <p>Elementi speciali: <em>Mare</em> (prime file), <em>Pasarela</em> (colonna centrale), non numerati.</p>
    </section>

    <!-- 18. CAMBIA -->
    <section class="guide-section" id="cambia">
      <h3><i class="fa-solid fa-right-left"></i> 18. Cambia stabilimento</h3>
      <p>Gestione profili locali (salvati in <code>localStorage</code> del browser).</p>
      <ul>
        <li><strong>Nuovo</strong> — aggiunge stabilimento con propria BD</li>
        <li><strong>Attiva</strong> — cambia contesto dati in tutta l'app</li>
        <li><strong>Test connessione</strong> — verifica lettura della base dati</li>
        <li><strong>Profili demo</strong> — crea 3 stabilimenti precaricati</li>
      </ul>
      <p>Modifica profili e token: solo <span class="guide-badge admin">Amministratore</span>.</p>
    </section>

    <!-- 19. UTENTI -->
    <section class="guide-section" id="utenti">
      <h3><i class="fa-solid fa-user-gear"></i> 19. Utenti e ruoli</h3>
      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead><tr><th>Ruolo</th><th>Lettura</th><th>Scrittura operativa</th><th>Admin</th></tr></thead>
          <tbody>
            <tr><td>Amministratore</td><td>✓</td><td>✓</td><td>✓ utenti, profili, token</td></tr>
            <tr><td>Operatore</td><td>✓</td><td>✓</td><td>—</td></tr>
            <tr><td>Lettore / altri</td><td>✓</td><td>—</td><td>—</td></tr>
            <tr><td>Non autenticato</td><td>✓</td><td>—</td><td>—</td></tr>
          </tbody>
        </table>
      </div>
      <p>Le password sono memorizzate come hash SHA-256 nel campo <code>password_hash</code>. La gestione utenti (CRUD) è riservata agli amministratori.</p>
    </section>

    <!-- 20. STRIPE -->
    <section class="guide-section" id="stripe">
      <h3><i class="fa-solid fa-credit-card"></i> 20. Pagamenti Stripe</h3>
      <p>Moduli consultivi per integrazione pagamenti online:</p>
      <ul>
        <li><strong>Pagamenti Stripe</strong> — transazioni card collegate a prenotazioni (<code>pagamenti_stripe</code>)</li>
        <li><strong>Trasferimenti Stripe</strong> — payout verso conto bancario (<code>trasferimenti_stripe</code>)</li>
      </ul>
      <div class="guide-tip">
        I pagamenti reali Stripe richiedono un backend server. In questa versione web i moduli registrano e visualizzano dati demo/storico nella base dati.
      </div>
    </section>

    <!-- 21. MOBILE -->
    <section class="guide-section" id="mobile">
      <h3><i class="fa-solid fa-mobile-screen"></i> 21. Uso su mobile e tablet</h3>
      <ul>
        <li><strong>≤1024px:</strong> menu hamburger ☰, sidebar inferiore con icone scrollabili</li>
        <li><strong>≤768px:</strong> dashboard a colonna singola, modali a tutto schermo (bottom sheet)</li>
        <li>Tabelle: scroll orizzontale automatico</li>
        <li>Pulsanti e input: minimo 44px per touch</li>
        <li>Struttura: griglia spiaggia scrollabile, celle ridimensionate</li>
      </ul>
      <p>Consigliato aggiungere il sito alla schermata Home su iOS/Android per un'esperienza simile all'app.</p>
    </section>

    <!-- 22. FAQ -->
    <section class="guide-section" id="faq">
      <h3><i class="fa-solid fa-life-ring"></i> 22. FAQ e risoluzione problemi</h3>
      <h4>«Illegal invocation» o errore connessione dati</h4>
      <p>Errore risolto nel client: ricarica con Ctrl+Shift+R. Se persiste, svuota cache browser.</p>
      <h4>Non posso salvare / bottoni nascosti</h4>
      <ol>
        <li>Hai fatto <strong>Accedi</strong>?</li>
        <li>Il tuo ruolo è Operatore o Amministratore?</li>
        <li>È configurato il <strong>token GitHub</strong> nel profilo attivo?</li>
      </ol>
      <h4>Salvataggio lento</h4>
      <p>Normale: La sincronizzazione usa GitHub Actions (~10–30 s). Attendi il messaggio di conferma nella barra stato.</p>
      <h4>Dati non aggiornati dopo modifica</h4>
      <p>Il CDN GitHub può impiegare 1–2 minuti. Usa <strong>Ricarica</strong> nel modulo o cambia profilo e torna.</p>
      <h4>Dashboard con numeri a zero</h4>
      <p>Verifica che il profilo punti al file BD corretto e che esistano prenotazioni/clienti seed.</p>
      <h4>Multi-stabilimento non cambia dati</h4>
      <p>Usa il selettore in topbar; i moduli aperti si ricaricano automaticamente.</p>
    </section>

    <!-- 23. TECNICO -->
    <section class="guide-section" id="tecnico">
      <h3><i class="fa-solid fa-code"></i> 23. Appendice tecnica</h3>
      <h4>Stack</h4>
      <ul>
        <li>Frontend statico: HTML, CSS, JavaScript ES modules</li>
        <li>Hosting: GitHub Pages (branch <code>gh-pages</code>, cartella <code>docs</code>)</li>
        <li>Database: <a href="https://github.com/owner/nome-repo">Repository dati</a> — JSON + SQL via Actions</li>
        <li>Repo app: <code>Falconisilvio/winbeach</code></li>
        <li>Repo dati: <code>owner/nome-repo</code></li>
      </ul>
      <h4>Tabelle dati (winbeach)</h4>
      <p><code>config</code>, <code>celle</code>, <code>clienti</code>, <code>prenotazioni</code>, <code>elementi</code>, <code>settori</code>, <code>listini</code>, <code>tariffe</code>, <code>servizi</code>, <code>movimenti_cassa</code>, <code>log_sconti</code>, <code>log_cancellazioni</code>, <code>log_modifiche</code>, <code>contatori_albergo</code>, <code>voucher</code>, <code>articoli</code>, <code>movimenti_magazzino</code>, <code>utenti</code>, <code>azienda</code>, <code>capitaneria</code>, <code>esercizi</code>, <code>pagamenti_stripe</code>, <code>trasferimenti_stripe</code>, <code>attivita</code></p>
      <h4>File chiave</h4>
      <ul>
        <li><code>js/winbeach-db.js</code> — connessione dati, multi-profilo</li>
        <li><code>js/winbeach-auth.js</code> — login e permessi</li>
        <li><code>js/winbeach-module.js</code> — utilità moduli e read-only</li>
        <li><code>js/table-crud.js</code> — factory CRUD generico</li>
        <li><code>js/dashboard-stats.js</code> — KPI dashboard</li>
        <li><code>database/seed-demo.mjs</code> — generatore dati di prova</li>
      </ul>
      <h4>Versione documentazione</h4>
      <p>Manuale aggiornato a WinBeach Web con autenticazione, multi-BD e 34 moduli operativi. Giugno 2026.</p>
    </section>
  `,
};