export const de = {
  meta: {
    lang: 'de',
    title: 'Anleitung — WinBeach Web',
    header: '<i class="fa-solid fa-circle-question" style="color:#0984e3"></i> WinBeach Web Anleitung',
    subtitle: 'Vollständiges Betriebshandbuch — Beach Manager auf GitHub Pages auf GitHub Pages.',
  },
  html: `
    <nav class="guide-toc" aria-label="Inhaltsverzeichnis">
      <h3><i class="fa-solid fa-list"></i> Inhaltsverzeichnis</h3>
      <ol>
        <li><a href="#intro">Einführung</a></li>
        <li><a href="#accesso">Zugang und Sicherheit</a></li>
        <li><a href="#navigazione">Navigation</a></li>
        <li><a href="#multi-bd">Multi-Betrieb und Datenspeicher</a></li>
        <li><a href="#dashboard">Dashboard</a></li>
        <li><a href="#spiaggia">Strand</a></li>
        <li><a href="#booking">Booking und Reservierungen</a></li>
        <li><a href="#planner">Planner</a></li>
        <li><a href="#listini">Preislisten und Tarife</a></li>
        <li><a href="#cassa">Kasse und Cashflows</a></li>
        <li><a href="#clienti">Kunden</a></li>
        <li><a href="#qr">QR-Scan</a></li>
        <li><a href="#statistiche">Statistiken</a></li>
        <li><a href="#log">Protokolle und Audit</a></li>
        <li><a href="#contatori">Zähler</a></li>
        <li><a href="#magazzino">Lager</a></li>
        <li><a href="#impostazioni">Einstellungen</a></li>
        <li><a href="#cambia">Betrieb wechseln</a></li>
        <li><a href="#utenti">Benutzer und Rollen</a></li>
        <li><a href="#stripe">Stripe-Zahlungen</a></li>
        <li><a href="#mobile">Nutzung auf Mobilgerät und Tablet</a></li>
        <li><a href="#faq">FAQ und Fehlerbehebung</a></li>
        <li><a href="#tecnico">Technischer Anhang</a></li>
      </ol>
    </nav>

    <section class="guide-section" id="intro">
      <h3><i class="fa-solid fa-umbrella-beach"></i> 1. Einführung</h3>
      <p><strong>WinBeach Web</strong> ist die Browser-Version der Strand-Management-Software WinBeach. Sie ermöglicht die Verwaltung von Liegeplätzen, Reservierungen, Kunden, Einnahmen und der Betriebskonfiguration ohne Installation einer Desktop-Software.</p>
      <p>Öffentliche URL: <code>https://falconisilvio.github.io/winbeach/</code></p>
      <h4>Hauptfunktionen</h4>
      <ul>
        <li>Operatives Dashboard mit Echtzeit-KPIs (Ankünfte, Abreisen, Auslastung, Umsatz)</li>
        <li>Vollständiges CRUD für 24+ Tabellen über <strong>Cloud-Datenbank</strong></li>
        <li>Interaktiver Strandplan (Editor Struktura)</li>
        <li>Multi-Betrieb: mehrere Strandbäder mit getrennten Datenbanken</li>
        <li>Benutzerauthentifizierung mit Rollen (nur Lesen / Schreiben / Admin)</li>
        <li>Responsives Layout für Smartphone, Tablet und Desktop</li>
      </ul>
      <div class="info-box">
        <strong>Standardmodus</strong>
        <p style="margin:6px 0 0">Beim Öffnen der App ist der Modus <span class="guide-badge read">nur Lesen</span> aktiv. Sie können alle Daten einsehen; zum Erstellen, Ändern oder Löschen von Datensätzen müssen Sie sich <strong>anmelden</strong> und den <strong>GitHub-Token</strong> konfigurieren.</p>
      </div>
    </section>

    <section class="guide-section" id="accesso">
      <h3><i class="fa-solid fa-right-to-bracket"></i> 2. Zugang und Sicherheit</h3>
      <h4>Benutzer-Login</h4>
      <ol>
        <li>Klicken Sie oben in der Leiste auf <strong>Accedi</strong> (oder öffnen Sie <code>login.html</code>)</li>
        <li>Geben Sie Benutzername und Passwort ein</li>
        <li>Nach dem Login erscheinen Ihr Name und Ihre Rolle in der Topbar</li>
      </ol>
      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead><tr><th>Demo-Benutzer</th><th>Passwort</th><th>Rolle</th><th>Berechtigungen</th></tr></thead>
          <tbody>
            <tr><td><code>admin</code></td><td><code>admin</code></td><td>Administrator</td><td><span class="guide-badge admin">Admin</span> Schreiben + Benutzer + DB-Profile</td></tr>
            <tr><td><code>reception</code></td><td><code>reception</code></td><td>Operator</td><td><span class="guide-badge write">Schreiben</span> Tägliche Operationen</td></tr>
          </tbody>
        </table>
      </div>
      <h4>GitHub-Token (Schreibvorgänge auf die Datenbank)</h4>
      <p>Änderungen werden über GitHub Actions an das Daten-Repository gesendet. Dafür ist ein <strong>Personal Access Token</strong> mit der Berechtigung <code>repo</code> für den Fork der Datenbank erforderlich.</p>
      <ol>
        <li>Melden Sie sich als <strong>admin</strong> an</li>
        <li>Gehen Sie zu <strong>Cambia stabilimento</strong> → Profil bearbeiten → Feld Token</li>
        <li>Fügen Sie den Token ein (Format <code>ghp_…</code>) und speichern Sie</li>
      </ol>
      <div class="guide-warn">
        <strong>Wichtig:</strong> Der Token verbleibt lokal im Browser (localStorage). Teilen Sie den PC nicht mit aktivem Token. Die Benutzersitzung dauert 8 Stunden; der Token bleibt gespeichert, bis Sie ihn entfernen.
      </div>
      <h4>Doppelter Schutz bei Schreibvorgängen</h4>
      <ul>
        <li><strong>Stufe 1 — Benutzer:</strong> gültige Sitzung + Rolle Operator oder Administrator</li>
        <li><strong>Stufe 2 — Datenbank:</strong> GitHub-Token mit Schreibzugriff auf das Daten-Repository</li>
      </ul>
    </section>

    <section class="guide-section" id="navigazione">
      <h3><i class="fa-solid fa-compass"></i> 3. Navigation</h3>
      <h4>Seitenleiste (Symbole)</h4>
      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead><tr><th>Symbol</th><th>Modul</th><th>Beschreibung</th></tr></thead>
          <tbody>
            <tr><td>☂ Spiaggia</td><td>spiaggia</td><td>Belegungskarte der Liegeplätze für heute</td></tr>
            <tr><td>📅 Booking</td><td>booking</td><td>Reservierungsverwaltung mit Tarifen</td></tr>
            <tr><td>📋 Planner</td><td>planner</td><td>Kalender- / Planungsansicht</td></tr>
            <tr><td>📃 Listini</td><td>listini</td><td>Saisonale Preislisten</td></tr>
            <tr><td>💰 Cassa</td><td>cassa</td><td>Tägliche Kassenbewegungen</td></tr>
            <tr><td>📊 Statistiche</td><td>dashboard</td><td>Zurück zum KPI-Dashboard</td></tr>
            <tr><td>👤 Clienti</td><td>clienti</td><td>Kundenstammdaten</td></tr>
            <tr><td>QR</td><td>qr-scan</td><td>Reservierungssuche per QR/Text</td></tr>
            <tr><td>⚙ Impostazioni</td><td>—</td><td>Öffnet das Konfigurations-Untermenü</td></tr>
            <tr><td>⇄ Cambia</td><td>cambia</td><td>Multi-Betriebs-Profile</td></tr>
            <tr><td>? Guida</td><td>guida</td><td>Dieses Handbuch</td></tr>
          </tbody>
        </table>
      </div>
      <h4>Textmenü (links)</h4>
      <p>Gruppiert die operativen Module: <em>Arrivi e partenze</em>, <em>Statistiche stabilimento</em>, <em>Log e flussi</em>, <em>Contatori</em>, <em>Magazzino</em> und das Untermenü <em>Impostazioni</em>.</p>
      <h4>Betriebsauswahl (Topbar)</h4>
      <p>Dropdown mit allen konfigurierten Profilen. Beim Wechsel des Betriebs werden die Daten aus der jeweiligen Datenbasis neu geladen.</p>
      <h4>Verbindungsstatusleiste</h4>
      <p>In jedem Modul erscheint <code>Betriebsname · Status</code>: <em>idle</em>, <em>loading</em>, <em>ok</em>, <em>error</em>. Zeigt an, ob Lese-/Schreibvorgänge zur Datenbank erfolgreich waren.</p>
    </section>

    <section class="guide-section" id="multi-bd">
      <h3><i class="fa-solid fa-database"></i> 4. Multi-Betrieb und Datenspeicher</h3>
      <p>Jeder Betrieb entspricht einer JSON-Datei im Daten-Repository, z. B. <code>data/winbeach.json</code>, <code>data/winbeach-lido-sud.json</code>.</p>
      <h4>Profilkonfiguration</h4>
      <ul>
        <li><strong>Betriebsname</strong> — in der App sichtbare Bezeichnung</li>
        <li><strong>Owner / Repo</strong> — z. B. <code>owner/repo-name</code></li>
        <li><strong>Branch</strong> — üblicherweise <code>main</code></li>
        <li><strong>DB-Datei</strong> — Name ohne <code>.json</code></li>
        <li><strong>Token</strong> — einer pro Profil, im Browser gespeichert</li>
      </ul>
      <h4>Demo-Profile</h4>
      <p>Unter <strong>Cambia stabilimento</strong> → <strong>Profili demo</strong> werden automatisch drei Betriebe mit unterschiedlichen Testdaten erstellt.</p>
      <h4>Lesen vs. Schreiben</h4>
      <ul>
        <li><strong>Lesen:</strong> öffentlich über GitHub-CDN (<code>raw.githubusercontent.com</code>), ohne Token</li>
        <li><strong>Schreiben:</strong> SQL wird per <code>repository_dispatch</code> gesendet; GitHub Actions wendet die Änderung in 10–30 Sekunden an</li>
      </ul>
    </section>

    <section class="guide-section" id="dashboard">
      <h3><i class="fa-solid fa-house"></i> 5. Dashboard</h3>
      <p>Tagesübersicht des aktiven Betriebs. Die Zahlen werden automatisch aus der Datenbank aktualisiert (<code>dashboard-stats.js</code>).</p>
      <h4>KPI-Karten</h4>
      <ul>
        <li><strong>Ankünfte / Abreisen</strong> — Reservierungen mit Beginn/Ende gleich heute</li>
        <li><strong>Stornierungen</strong> — Reservierungen mit Status <code>cancellata</code></li>
        <li><strong>Auslastung</strong> — % belegter Liegeplätze heute</li>
        <li><strong>Umsatz</strong> — Summe der Beträge aktiver Reservierungen</li>
        <li><strong>Anwesenheiten</strong> — Kunden heute am Strand</li>
        <li><strong>Rabatte</strong> — Link zum Rabatt-Protokoll</li>
        <li><strong>Durchschnittlicher Warenkorb</strong> — Statistiken zur Aufenthaltsdauer</li>
      </ul>
      <h4>Diagramme</h4>
      <ul>
        <li>Kreisdiagramm <em>Zahlungsstatus</em> (bezahlt / teilweise / offen)</li>
        <li>Kreisdiagramm <em>Reservierungskanal</em> (offline / Widget / Portal)</li>
        <li>Liniendiagramme <em>Anwesenheiten</em> und <em>Ankünfte/Abreisen</em> (Demo-Daten historischer Grafiken)</li>
      </ul>
      <p>Die Links <em>Dettaglio →</em> öffnen das zugehörige Modul im zentralen Bereich.</p>
    </section>

    <section class="guide-section" id="spiaggia">
      <h3><i class="fa-solid fa-umbrella-beach"></i> 6. Strand</h3>
      <p>Kartenansicht der Liegeplätze mit Belegungsstatus für das heutige Datum. Farben und Legende stammen aus aktiven Reservierungen und der Tabelle <code>celle</code>.</p>
      <ul>
        <li>Grün / belegt — Liegeplatz mit gültiger Reservierung heute</li>
        <li>Frei — verfügbar für neue Reservierung</li>
        <li>Statistik oben: Liegeplätze gesamt, belegt, Auslastung in %</li>
      </ul>
    </section>

    <section class="guide-section" id="booking">
      <h3><i class="fa-solid fa-calendar-days"></i> 7. Booking und Reservierungen</h3>
      <h4>Booking (Seitenleiste)</h4>
      <p>Hauptmodul für Reservierungs-CRUD mit automatischer Tarifberechnung.</p>
      <ul>
        <li><strong>Neu</strong> — erfordert mindestens einen Kunden in der Stammdatenverwaltung</li>
        <li>Felder: Kunde, Liegeplatz (cella), Daten, Status, Betrag, bezahlt, Kanal, Zahlung</li>
        <li>Der Preis wird aus Liegeplatz-Sektor + Tarifen + Daten berechnet (manuell änderbar)</li>
        <li>Status: <code>confermata</code>, <code>in_attesa</code>, <code>cancellata</code></li>
        <li>Zahlung: <code>saldato</code>, <code>parziale</code>, <code>da_saldare</code></li>
      </ul>
      <h4>Ankünfte und Abreisen (linkes Menü)</h4>
      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead><tr><th>Seite</th><th>Inhalt</th><th>Aktionen</th></tr></thead>
          <tbody>
            <tr><td>Ankünfte heute</td><td>Reservierungen mit <code>data_inizio = heute</code></td><td>Schneller Check-in</td></tr>
            <tr><td>Abreisen heute</td><td><code>data_fine = heute</code></td><td>Check-out</td></tr>
            <tr><td>Ankünfte morgen</td><td>Erwartete Ankünfte morgen</td><td>Nur Lesen</td></tr>
            <tr><td>Abreisen morgen</td><td>Erwartete Abreisen morgen</td><td>Nur Lesen</td></tr>
            <tr><td>Sonnenschirm-Änderungen</td><td>Protokoll der Liegeplatz-Umstellungen</td><td>CRUD auf <code>log_modifiche</code></td></tr>
            <tr><td>Alle Reservierungen</td><td>Vollständige filterbare Liste</td><td>Gleiche Funktionen wie Booking</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="guide-section" id="planner">
      <h3><i class="fa-solid fa-list"></i> 8. Planner</h3>
      <p>Planungsansicht für Aktivitäten und Termine (<code>attivita</code>). Nützlich zur Organisation täglicher Aufgaben des Personals (Öffnung, Reinigung, Vorbereitung von Ankünften).</p>
    </section>

    <section class="guide-section" id="listini">
      <h3><i class="fa-solid fa-tags"></i> 9. Preislisten und Tarife</h3>
      <h4>Preislisten</h4>
      <p>Definieren Zeiträume und abgedeckte Sektoren (z. B. «Sommer 2026», Sektoren A/B/C).</p>
      <h4>Tarife</h4>
      <p>Preise pro Zone (<code>tassa</code> = Sektor): täglich, wöchentlich, 14-tägig, monatlich. Verknüpft mit <code>listino_id</code>.</p>
      <div class="guide-tip">
        Konfigurieren Sie zuerst <strong>Settori</strong> und <strong>Tariffe</strong>, dann <strong>Struttura</strong> (Sektorzuweisung pro Liegeplatz) für eine korrekte Preisberechnung in Booking.
      </div>
    </section>

    <section class="guide-section" id="cassa">
      <h3><i class="fa-solid fa-cash-register"></i> 10. Kasse und Cashflows</h3>
      <h4>Kasse</h4>
      <ul>
        <li>Erfasst Einnahmen/Ausgaben in <code>movimenti_cassa</code></li>
        <li>Statistiken: Einnahmen/Ausgaben heute, Saldo</li>
        <li>Felder: Typ, Betrag, Beschreibung, Methode (Bar/Karte/Überweisung), Operator</li>
      </ul>
      <h4>Cashflows (Menü)</h4>
      <p>Gleiche Logik wie Kasse, dedizierte Ansicht in der Gruppe «Log e flussi» zur Analyse aggregierter Bewegungen.</p>
    </section>

    <section class="guide-section" id="clienti">
      <h3><i class="fa-solid fa-users"></i> 11. Kunden</h3>
      <p>Stammdaten in Tabelle <code>clienti</code>: Vorname, Nachname, E-Mail, Telefon, Notizen.</p>
      <ul>
        <li>Textsuche in Echtzeit</li>
        <li>Mindestens der Vorname ist zum Speichern erforderlich</li>
        <li>Jede Reservierung erfordert eine gültige <code>cliente_id</code></li>
      </ul>
    </section>

    <section class="guide-section" id="qr">
      <h3><i class="fa-solid fa-qrcode"></i> 12. QR-Scan</h3>
      <p>Sucht eine Reservierung anhand von QR-Code, Reservierungs-ID oder Kundenname. Zeigt Details und Check-in-Status. Ideal für schnellen Strandzugang.</p>
    </section>

    <section class="guide-section" id="statistiche">
      <h3><i class="fa-solid fa-chart-pie"></i> 13. Statistiken</h3>
      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead><tr><th>Modul</th><th>Analyse</th></tr></thead>
          <tbody>
            <tr><td>Statistiken pro Sonnenschirm</td><td>Nutzung und Einnahmen pro Liegeplatznummer</td></tr>
            <tr><td>Statistiken pro Sektor</td><td>Vergleich der Zonen A / B / C</td></tr>
            <tr><td>Statistiken nach Dauer</td><td>Verteilung der Aufenthalte (täglich, wöchentlich, …)</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="guide-section" id="log">
      <h3><i class="fa-solid fa-file-lines"></i> 14. Protokolle und Audit</h3>
      <ul>
        <li><strong>Rabatt-Protokoll</strong> — gewährte Rabatte: Operator, Kunde, %, Betrag, Grund</li>
        <li><strong>Stornierungs-Protokoll</strong> — stornierte Reservierungen mit ggf. Stornogebühr</li>
        <li><strong>Cashflows</strong> — finanzielle Bewegungen (siehe Abschnitt Kasse)</li>
      </ul>
      <p>Alle Protokolle werden in der Datenbank gespeichert und sind für jeden Benutzer im Lesemodus einsehbar.</p>
    </section>

    <section class="guide-section" id="contatori">
      <h3><i class="fa-solid fa-calculator"></i> 15. Zähler</h3>
      <h4>Hotel-Zähler</h4>
      <p>Verwaltung von Hotel-Kooperationen: Kooperationscode, zugewiesene Liegeplätze gesamt, genutzt.</p>
      <h4>Gutschein-Zähler</h4>
      <p>Gutschein-Kampagnen (Code, ausgestellt, eingelöst, Ablaufdatum) — Tabelle <code>voucher</code>.</p>
    </section>

    <section class="guide-section" id="magazzino">
      <h3><i class="fa-solid fa-warehouse"></i> 16. Lager</h3>
      <p>Artikelbestände (<code>articoli</code>) und Bewegungen (<code>movimenti_magazzino</code>): Sonnenschirme, Liegen, Handtücher usw. Kontrolle von Mindestbeständen und Historie von Ein-/Ausgängen.</p>
    </section>

    <section class="guide-section" id="impostazioni">
      <h3><i class="fa-solid fa-gear"></i> 17. Einstellungen</h3>
      <p>Erreichbar über das Symbol ⚙ in der Seitenleiste. Strukturelle Konfiguration des Betriebs:</p>
      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead><tr><th>Modul</th><th>Tabelle</th><th>Funktion</th></tr></thead>
          <tbody>
            <tr><td>Elementi</td><td><code>elementi</code></td><td>Objekttypen: Sonnenschirm, Kabine, Hawaiianisch, Steg…</td></tr>
            <tr><td>Servizi</td><td><code>servizi</code></td><td>Zusatzleistungen (Liege, Parkplatz…)</td></tr>
            <tr><td>Settori</td><td><code>settori</code></td><td>Preiszonen / Bereiche (A, B, C…)</td></tr>
            <tr><td>Struttura</td><td><code>celle</code>, <code>config</code></td><td>Editor für Strandplan-Raster</td></tr>
            <tr><td>Listini</td><td><code>listini</code></td><td>Saisonale Preiskataloge</td></tr>
            <tr><td>Tariffe</td><td><code>tariffe</code></td><td>Preise pro Sektor und Dauer</td></tr>
            <tr><td>Capitaneria</td><td><code>capitaneria</code></td><td>Positionen des öffentlichen Strandtarifs / Gebühren</td></tr>
            <tr><td>Esercizi</td><td><code>esercizi</code></td><td>Bar, Kiosk, Verleih im Betrieb</td></tr>
            <tr><td>Azienda</td><td><code>azienda</code></td><td>Firmenname, USt-IdNr., Kontakte</td></tr>
            <tr><td>Utenti</td><td><code>utenti</code></td><td>App-Zugangskonten (nur Admin)</td></tr>
          </tbody>
        </table>
      </div>
      <h4>Struktur-Editor (Detail)</h4>
      <ol>
        <li>Zeilen/Spalten und Steg-Spalte festlegen</li>
        <li>Werkzeug wählen: Element, Tassa (Sektor), Nummerierung</li>
        <li>Auf Zellen klicken, um Typ und Sektor zuzuweisen</li>
        <li><strong>Carica da BD</strong> — liest <code>celle</code> aus der Datenbank</li>
        <li><strong>In BD speichern</strong> — speichert den Plan (erfordert Login + Token)</li>
      </ol>
      <p>Spezielle Elemente: <em>Meer</em> (vorderste Reihen), <em>Steg</em> (mittlere Spalte), nicht nummeriert.</p>
    </section>

    <section class="guide-section" id="cambia">
      <h3><i class="fa-solid fa-right-left"></i> 18. Betrieb wechseln</h3>
      <p>Verwaltung lokaler Profile (gespeichert im <code>localStorage</code> des Browsers).</p>
      <ul>
        <li><strong>Neu</strong> — fügt einen Betrieb mit eigener DB hinzu</li>
        <li><strong>Aktivieren</strong> — wechselt den Datenkontext in der gesamten App</li>
        <li><strong>Verbindung testen</strong> — prüft den Lesezugriff auf die Datenbank</li>
        <li><strong>Demo-Profile</strong> — erstellt 3 vorinstallierte Betriebe</li>
      </ul>
      <p>Profile und Token bearbeiten: nur <span class="guide-badge admin">Administrator</span>.</p>
    </section>

    <section class="guide-section" id="utenti">
      <h3><i class="fa-solid fa-user-gear"></i> 19. Benutzer und Rollen</h3>
      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead><tr><th>Rolle</th><th>Lesen</th><th>Operatives Schreiben</th><th>Admin</th></tr></thead>
          <tbody>
            <tr><td>Administrator</td><td>✓</td><td>✓</td><td>✓ Benutzer, Profile, Token</td></tr>
            <tr><td>Operator</td><td>✓</td><td>✓</td><td>—</td></tr>
            <tr><td>Leser / andere</td><td>✓</td><td>—</td><td>—</td></tr>
            <tr><td>Nicht angemeldet</td><td>✓</td><td>—</td><td>—</td></tr>
          </tbody>
        </table>
      </div>
      <p>Passwörter werden als SHA-256-Hash im Feld <code>password_hash</code> gespeichert. Die Benutzerverwaltung (CRUD) ist Administratoren vorbehalten.</p>
    </section>

    <section class="guide-section" id="stripe">
      <h3><i class="fa-solid fa-credit-card"></i> 20. Stripe-Zahlungen</h3>
      <p>Informative Module für die Online-Zahlungsintegration:</p>
      <ul>
        <li><strong>Pagamenti Stripe</strong> — Kartentransaktionen verknüpft mit Reservierungen (<code>pagamenti_stripe</code>)</li>
        <li><strong>Trasferimenti Stripe</strong> — Auszahlungen auf das Bankkonto (<code>trasferimenti_stripe</code>)</li>
      </ul>
      <div class="guide-tip">
        Echte Stripe-Zahlungen erfordern ein Server-Backend. In dieser Web-Version erfassen und zeigen die Module Demo-/Historiendaten in der Datenbank an.
      </div>
    </section>

    <section class="guide-section" id="mobile">
      <h3><i class="fa-solid fa-mobile-screen"></i> 21. Nutzung auf Mobilgerät und Tablet</h3>
      <ul>
        <li><strong>≤1024px:</strong> Hamburger-Menü ☰, untere Seitenleiste mit scrollbaren Symbolen</li>
        <li><strong>≤768px:</strong> Dashboard in einer Spalte, Vollbild-Modals (Bottom Sheet)</li>
        <li>Tabellen: automatischer horizontaler Scroll</li>
        <li>Schaltflächen und Eingaben: mindestens 44px für Touch</li>
        <li>Struktura: scrollbarer Strandplan, verkleinerte Zellen</li>
      </ul>
      <p>Empfohlen: Website zum Startbildschirm auf iOS/Android hinzufügen für ein app-ähnliches Erlebnis.</p>
    </section>

    <section class="guide-section" id="faq">
      <h3><i class="fa-solid fa-life-ring"></i> 22. FAQ und Fehlerbehebung</h3>
      <h4>«Illegal invocation» oder Datenverbindungsfehler</h4>
      <p>Fehler im Client behoben: mit Strg+Umschalt+R neu laden. Falls er anhält, Browser-Cache leeren.</p>
      <h4>Kann nicht speichern / Schaltflächen ausgeblendet</h4>
      <ol>
        <li>Haben Sie sich über <strong>Accedi</strong> angemeldet?</li>
        <li>Ist Ihre Rolle Operator oder Administrator?</li>
        <li>Ist der <strong>GitHub-Token</strong> im aktiven Profil konfiguriert?</li>
      </ol>
      <h4>Langsames Speichern</h4>
      <p>Normal: Die Synchronisation nutzt GitHub Actions (~10–30 s). Warten Sie auf die Bestätigungsmeldung in der Statusleiste.</p>
      <h4>Daten nach Änderung nicht aktualisiert</h4>
      <p>Das GitHub-CDN kann 1–2 Minuten benötigen. Verwenden Sie <strong>Ricarica</strong> im Modul oder wechseln Sie das Profil und kehren zurück.</p>
      <h4>Dashboard mit Nullen</h4>
      <p>Prüfen Sie, ob das Profil auf die richtige DB-Datei verweist und ob Seed-Reservierungen/Kunden vorhanden sind.</p>
      <h4>Multi-Betrieb wechselt Daten nicht</h4>
      <p>Verwenden Sie die Auswahl in der Topbar; geöffnete Module werden automatisch neu geladen.</p>
    </section>

    <section class="guide-section" id="tecnico">
      <h3><i class="fa-solid fa-code"></i> 23. Technischer Anhang</h3>
      <h4>Stack</h4>
      <ul>
        <li>Statisches Frontend: HTML, CSS, JavaScript ES modules</li>
        <li>Hosting: GitHub Pages (Branch <code>gh-pages</code>, Ordner <code>docs</code>)</li>
        <li>Datenbank: <a href="https://github.com/owner/repo-name">Daten-Repository</a> — JSON + SQL via Actions</li>
        <li>App-Repository: <code>Falconisilvio/winbeach</code></li>
        <li>Daten-Repository: <code>owner/repo-name</code></li>
      </ul>
      <h4>Datentabellen (winbeach)</h4>
      <p><code>config</code>, <code>celle</code>, <code>clienti</code>, <code>prenotazioni</code>, <code>elementi</code>, <code>settori</code>, <code>listini</code>, <code>tariffe</code>, <code>servizi</code>, <code>movimenti_cassa</code>, <code>log_sconti</code>, <code>log_cancellazioni</code>, <code>log_modifiche</code>, <code>contatori_albergo</code>, <code>voucher</code>, <code>articoli</code>, <code>movimenti_magazzino</code>, <code>utenti</code>, <code>azienda</code>, <code>capitaneria</code>, <code>esercizi</code>, <code>pagamenti_stripe</code>, <code>trasferimenti_stripe</code>, <code>attivita</code></p>
      <h4>Wichtige Dateien</h4>
      <ul>
        <li><code>js/winbeach-db.js</code> — Datenbankverbindung, Multi-Profil</li>
        <li><code>js/winbeach-auth.js</code> — Login und Berechtigungen</li>
        <li><code>js/winbeach-module.js</code> — Modul-Hilfsfunktionen und Nur-Lesen</li>
        <li><code>js/table-crud.js</code> — generische CRUD-Factory</li>
        <li><code>js/dashboard-stats.js</code> — Dashboard-KPIs</li>
        <li><code>database/seed-demo.mjs</code> — Generator für Testdaten</li>
      </ul>
      <h4>Dokumentationsversion</h4>
      <p>Handbuch aktualisiert für WinBeach Web mit Authentifizierung, Multi-DB und 34 operativen Modulen. Juni 2026.</p>
    </section>
  `,
};