export const fr = {
  meta: {
    lang: 'fr',
    title: 'Guide — WinBeach Web',
    header: '<i class="fa-solid fa-circle-question" style="color:#0984e3"></i> Guide WinBeach Web',
    subtitle: 'Manuel opérationnel complet — Beach Manager sur GitHub Pages sur GitHub Pages.',
  },
  html: `
    <nav class="guide-toc" aria-label="Table des matières">
      <h3><i class="fa-solid fa-list"></i> Table des matières</h3>
      <ol>
        <li><a href="#intro">Introduction</a></li>
        <li><a href="#accesso">Accès et sécurité</a></li>
        <li><a href="#navigazione">Navigation</a></li>
        <li><a href="#multi-bd">Multi-établissement et base de données</a></li>
        <li><a href="#dashboard">Tableau de bord</a></li>
        <li><a href="#spiaggia">Plage</a></li>
        <li><a href="#booking">Booking et réservations</a></li>
        <li><a href="#planner">Planner</a></li>
        <li><a href="#listini">Grilles tarifaires et tarifs</a></li>
        <li><a href="#cassa">Caisse et flux</a></li>
        <li><a href="#clienti">Clients</a></li>
        <li><a href="#qr">QR Scan</a></li>
        <li><a href="#statistiche">Statistiques</a></li>
        <li><a href="#log">Journal et audit</a></li>
        <li><a href="#contatori">Compteurs</a></li>
        <li><a href="#magazzino">Stock</a></li>
        <li><a href="#impostazioni">Paramètres</a></li>
        <li><a href="#cambia">Changer d'établissement</a></li>
        <li><a href="#utenti">Utilisateurs et rôles</a></li>
        <li><a href="#stripe">Paiements Stripe</a></li>
        <li><a href="#mobile">Utilisation sur mobile et tablette</a></li>
        <li><a href="#faq">FAQ et dépannage</a></li>
        <li><a href="#tecnico">Annexe technique</a></li>
      </ol>
    </nav>

    <section class="guide-section" id="intro">
      <h3><i class="fa-solid fa-umbrella-beach"></i> 1. Introduction</h3>
      <p><strong>WinBeach Web</strong> est la version navigateur du logiciel de gestion balnéaire WinBeach. Il permet de gérer les emplacements, les réservations, les clients, les encaissements et la configuration de l'établissement sans installer de logiciel desktop.</p>
      <p>URL publique : <code>https://falconisilvio.github.io/winbeach/</code></p>
      <h4>Fonctionnalités principales</h4>
      <ul>
        <li>Tableau de bord opérationnel avec KPI en temps réel (arrivées, départs, occupation, chiffre d'affaires)</li>
        <li>CRUD complet sur 24+ tables via <strong>base de données cloud</strong></li>
        <li>Planimétrie interactive de la plage (éditeur Structure)</li>
        <li>Multi-établissement : plusieurs plages avec bases de données séparées</li>
        <li>Authentification des utilisateurs avec rôles (lecture seule / écriture / admin)</li>
        <li>Interface responsive pour smartphone, tablette et desktop</li>
      </ul>
      <div class="info-box">
        <strong>Mode par défaut</strong>
        <p style="margin:6px 0 0">À l'ouverture, l'application est en <span class="guide-badge read">lecture seule</span>. Vous pouvez consulter toutes les données ; pour créer, modifier ou supprimer des enregistrements, vous devez vous <strong>connecter</strong> et configurer le <strong>token GitHub</strong>.</p>
      </div>
    </section>

    <section class="guide-section" id="accesso">
      <h3><i class="fa-solid fa-right-to-bracket"></i> 2. Accès et sécurité</h3>
      <h4>Connexion utilisateur</h4>
      <ol>
        <li>Cliquez sur <strong>Connexion</strong> dans la barre supérieure (ou accédez à <code>login.html</code>)</li>
        <li>Saisissez le nom d'utilisateur et le mot de passe</li>
        <li>Après la connexion, votre nom et votre rôle s'affichent dans la barre supérieure</li>
      </ol>
      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead><tr><th>Utilisateur démo</th><th>Mot de passe</th><th>Rôle</th><th>Permissions</th></tr></thead>
          <tbody>
            <tr><td><code>admin</code></td><td><code>admin</code></td><td>Administrateur</td><td><span class="guide-badge admin">Admin</span> Écriture + utilisateurs + profils BD</td></tr>
            <tr><td><code>reception</code></td><td><code>reception</code></td><td>Opérateur</td><td><span class="guide-badge write">Écriture</span> Opérations quotidiennes</td></tr>
          </tbody>
        </table>
      </div>
      <h4>Token GitHub (écritures sur la base de données)</h4>
      <p>Les modifications sont envoyées au dépôt de données via GitHub Actions. Un <strong>Personal Access Token</strong> avec la permission <code>repo</code> sur le fork de la base de données est requis.</p>
      <ol>
        <li>Connectez-vous en tant qu'<strong>admin</strong></li>
        <li>Accédez à <strong>Changer d'établissement</strong> → modifier le profil → champ Token</li>
        <li>Collez le token (format <code>ghp_…</code>) et enregistrez</li>
      </ol>
      <div class="guide-warn">
        <strong>Important :</strong> le token reste stocké localement dans le navigateur (localStorage). Ne partagez pas le PC avec un token actif. La session utilisateur dure 8 heures ; le token persiste jusqu'à sa suppression manuelle.
      </div>
      <h4>Double protection des écritures</h4>
      <ul>
        <li><strong>Niveau 1 — Utilisateur :</strong> session valide + rôle Opérateur ou Administrateur</li>
        <li><strong>Niveau 2 — Base de données :</strong> token GitHub avec accès en écriture au dépôt de données</li>
      </ul>
    </section>

    <section class="guide-section" id="navigazione">
      <h3><i class="fa-solid fa-compass"></i> 3. Navigation</h3>
      <h4>Barre latérale (icônes)</h4>
      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead><tr><th>Icône</th><th>Module</th><th>Description</th></tr></thead>
          <tbody>
            <tr><td>☂ Plage</td><td>spiaggia</td><td>Carte d'occupation des emplacements aujourd'hui</td></tr>
            <tr><td>📅 Booking</td><td>booking</td><td>Gestion des réservations avec tarifs</td></tr>
            <tr><td>📋 Planner</td><td>planner</td><td>Vue calendrier / planning</td></tr>
            <tr><td>📃 Grilles tarifaires</td><td>listini</td><td>Grilles de prix saisonnières</td></tr>
            <tr><td>💰 Caisse</td><td>cassa</td><td>Mouvements de caisse quotidiens</td></tr>
            <tr><td>📊 Statistiques</td><td>dashboard</td><td>Retour au tableau de bord KPI</td></tr>
            <tr><td>👤 Clients</td><td>clienti</td><td>Fichier clients</td></tr>
            <tr><td>QR</td><td>qr-scan</td><td>Recherche de réservation via QR/texte</td></tr>
            <tr><td>⚙ Paramètres</td><td>—</td><td>Ouvre le sous-menu de configuration</td></tr>
            <tr><td>⇄ Changer</td><td>cambia</td><td>Profils multi-établissement</td></tr>
            <tr><td>? Guide</td><td>guida</td><td>Ce manuel</td></tr>
          </tbody>
        </table>
      </div>
      <h4>Menu textuel (gauche)</h4>
      <p>Regroupe les modules opérationnels : <em>Arrivées et départs</em>, <em>Statistiques de l'établissement</em>, <em>Journal et flux</em>, <em>Compteurs</em>, <em>Stock</em> et le sous-menu <em>Paramètres</em>.</p>
      <h4>Sélecteur d'établissement (barre supérieure)</h4>
      <p>Liste déroulante avec tous les profils configurés. Changer d'établissement recharge les données depuis la base de données correspondante.</p>
      <h4>Barre d'état connexion</h4>
      <p>Dans chaque module s'affiche <code>nom établissement · état</code> : <em>idle</em>, <em>loading</em>, <em>ok</em>, <em>error</em>. Indique si la lecture/écriture vers la base de données a réussi.</p>
    </section>

    <section class="guide-section" id="multi-bd">
      <h3><i class="fa-solid fa-database"></i> 4. Multi-établissement et base de données</h3>
      <p>Chaque établissement correspond à un fichier JSON dans le dépôt de données, par ex. <code>data/winbeach.json</code>, <code>data/winbeach-lido-sud.json</code>.</p>
      <h4>Configuration du profil</h4>
      <ul>
        <li><strong>Nom de l'établissement</strong> — libellé visible dans l'application</li>
        <li><strong>Owner / Repo</strong> — ex. <code>owner/nom-repo</code></li>
        <li><strong>Branche (branch)</strong> — généralement <code>main</code></li>
        <li><strong>Fichier BD</strong> — nom sans <code>.json</code></li>
        <li><strong>Token</strong> — un par profil, enregistré dans le navigateur</li>
      </ul>
      <h4>Profils démo</h4>
      <p>Dans <strong>Changer d'établissement</strong> → <strong>Profils démo</strong>, trois établissements avec des données de test distinctes sont créés automatiquement.</p>
      <h4>Lecture vs écriture</h4>
      <ul>
        <li><strong>Lecture :</strong> publique via le CDN GitHub (<code>raw.githubusercontent.com</code>), sans token</li>
        <li><strong>Écriture :</strong> SQL envoyé via <code>repository_dispatch</code> ; GitHub Actions applique la modification en 10–30 secondes</li>
      </ul>
    </section>

    <section class="guide-section" id="dashboard">
      <h3><i class="fa-solid fa-house"></i> 5. Tableau de bord</h3>
      <p>Vue d'ensemble quotidienne de l'établissement actif. Les chiffres se mettent à jour automatiquement depuis la base de données (<code>dashboard-stats.js</code>).</p>
      <h4>Cartes KPI</h4>
      <ul>
        <li><strong>Arrivées / Départs</strong> — réservations dont le début/fin correspond à aujourd'hui</li>
        <li><strong>Annulations</strong> — réservations avec l'état <code>cancellata</code></li>
        <li><strong>Occupation</strong> — % d'emplacements occupés aujourd'hui</li>
        <li><strong>Chiffre d'affaires</strong> — somme des montants des réservations actives</li>
        <li><strong>Présences</strong> — clients sur la plage aujourd'hui</li>
        <li><strong>Remises</strong> — lien vers le journal des remises</li>
        <li><strong>Panier moyen</strong> — statistiques de durée</li>
      </ul>
      <h4>Graphiques</h4>
      <ul>
        <li>Camembert <em>État des paiements</em> (soldé / partiel / à solder)</li>
        <li>Camembert <em>Canal de réservation</em> (offline / widget / portail)</li>
        <li>Courbes <em>Présences</em> et <em>Arrivées/Départs</em> (données démo historiques)</li>
      </ul>
      <p>Les liens <em>Détail →</em> ouvrent le module associé dans le panneau central.</p>
    </section>

    <section class="guide-section" id="spiaggia">
      <h3><i class="fa-solid fa-umbrella-beach"></i> 6. Plage</h3>
      <p>Vue cartographique des emplacements avec l'état d'occupation pour la date du jour. Les couleurs et la légende proviennent des réservations actives et de la table <code>celle</code>.</p>
      <ul>
        <li>Vert / occupé — emplacement avec réservation valide aujourd'hui</li>
        <li>Libre — disponible pour une nouvelle réservation</li>
        <li>Statistiques en haut : emplacements totaux, occupés, % d'occupation</li>
      </ul>
    </section>

    <section class="guide-section" id="booking">
      <h3><i class="fa-solid fa-calendar-days"></i> 7. Booking et réservations</h3>
      <h4>Booking (barre latérale)</h4>
      <p>Module principal CRUD des réservations avec calcul automatique des tarifs.</p>
      <ul>
        <li><strong>Nouvelle</strong> — nécessite au moins un client dans le fichier</li>
        <li>Champs : client, emplacement (cella), dates, état, montant, payé, canal, paiement</li>
        <li>Le prix est calculé à partir du secteur de l'emplacement + tarifs + dates (modifiable manuellement)</li>
        <li>États : <code>confermata</code>, <code>in_attesa</code>, <code>cancellata</code></li>
        <li>Paiement : <code>saldato</code>, <code>parziale</code>, <code>da_saldare</code></li>
      </ul>
      <h4>Arrivées et départs (menu gauche)</h4>
      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead><tr><th>Page</th><th>Contenu</th><th>Actions</th></tr></thead>
          <tbody>
            <tr><td>Arrivées aujourd'hui</td><td>Réservations avec <code>data_inizio = aujourd'hui</code></td><td>Check-in rapide</td></tr>
            <tr><td>Départs aujourd'hui</td><td><code>data_fine = aujourd'hui</code></td><td>Check-out</td></tr>
            <tr><td>Arrivées demain</td><td>Arrivées prévues demain</td><td>Lecture seule</td></tr>
            <tr><td>Départs demain</td><td>Départs prévus demain</td><td>Lecture seule</td></tr>
            <tr><td>Modifications de parasols</td><td>Journal des déplacements d'emplacement</td><td>CRUD sur <code>log_modifiche</code></td></tr>
            <tr><td>Toutes les réservations</td><td>Liste complète filtrable</td><td>Mêmes fonctions que Booking</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="guide-section" id="planner">
      <h3><i class="fa-solid fa-list"></i> 8. Planner</h3>
      <p>Vue de planification des activités et des engagements (<code>attivita</code>). Utile pour organiser les tâches quotidiennes du personnel (ouverture, nettoyage, préparation des arrivées).</p>
    </section>

    <section class="guide-section" id="listini">
      <h3><i class="fa-solid fa-tags"></i> 9. Grilles tarifaires et tarifs</h3>
      <h4>Grilles tarifaires</h4>
      <p>Définissent les périodes et les secteurs couverts (ex. « Été 2026 », secteurs A/B/C).</p>
      <h4>Tarifs</h4>
      <p>Prix par tranche (<code>tassa</code> = secteur) : journalier, hebdomadaire, quinzaine, mensuel. Liés à <code>listino_id</code>.</p>
      <div class="guide-tip">
        Configurez d'abord les <strong>Secteurs</strong> et les <strong>Tarifs</strong>, puis la <strong>Structure</strong> (attribution du secteur à chaque emplacement) pour un calcul correct des prix dans Booking.
      </div>
    </section>

    <section class="guide-section" id="cassa">
      <h3><i class="fa-solid fa-cash-register"></i> 10. Caisse et flux</h3>
      <h4>Caisse</h4>
      <ul>
        <li>Enregistre les entrées/sorties dans <code>movimenti_cassa</code></li>
        <li>Statistiques : entrées/sorties aujourd'hui, solde</li>
        <li>Champs : type, montant, description, mode (espèces/carte/virement), opérateur</li>
      </ul>
      <h4>Flux de caisse (menu)</h4>
      <p>Même logique que Caisse, vue dédiée dans le groupe « Journal et flux » pour l'analyse des mouvements agrégés.</p>
    </section>

    <section class="guide-section" id="clienti">
      <h3><i class="fa-solid fa-users"></i> 11. Clients</h3>
      <p>Fichier dans la table <code>clienti</code> : nom, prénom, e-mail, téléphone, notes.</p>
      <ul>
        <li>Recherche textuelle en temps réel</li>
        <li>Le nom est obligatoire pour enregistrer</li>
        <li>Chaque réservation requiert un <code>cliente_id</code> valide</li>
      </ul>
    </section>

    <section class="guide-section" id="qr">
      <h3><i class="fa-solid fa-qrcode"></i> 12. QR Scan</h3>
      <p>Recherche une réservation en saisissant le code QR, l'ID de réservation ou le nom du client. Affiche le détail et l'état du check-in. Idéal pour un accès rapide à la plage.</p>
    </section>

    <section class="guide-section" id="statistiche">
      <h3><i class="fa-solid fa-chart-pie"></i> 13. Statistiques</h3>
      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead><tr><th>Module</th><th>Analyse</th></tr></thead>
          <tbody>
            <tr><td>Statistiques par parasol</td><td>Utilisation et revenus par numéro d'emplacement</td></tr>
            <tr><td>Statistiques par secteur</td><td>Comparaison des tranches A / B / C</td></tr>
            <tr><td>Statistiques par durée</td><td>Distribution des séjours (journalier, hebdomadaire, …)</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="guide-section" id="log">
      <h3><i class="fa-solid fa-file-lines"></i> 14. Journal et audit</h3>
      <ul>
        <li><strong>Journal des remises</strong> — remises appliquées : opérateur, client, %, montant, motif</li>
        <li><strong>Journal des annulations</strong> — réservations annulées avec éventuelle pénalité</li>
        <li><strong>Flux de caisse</strong> — mouvements financiers (voir section Caisse)</li>
      </ul>
      <p>Tous les journaux sont persistés dans la base de données et consultables en lecture seule par tout utilisateur.</p>
    </section>

    <section class="guide-section" id="contatori">
      <h3><i class="fa-solid fa-calculator"></i> 15. Compteurs</h3>
      <h4>Compteurs Hôtel</h4>
      <p>Gestion des conventions hôtelières : code convention, total des emplacements attribués, utilisés.</p>
      <h4>Compteurs Voucher</h4>
      <p>Campagnes voucher (code, émis, utilisés, expiration) — table <code>voucher</code>.</p>
    </section>

    <section class="guide-section" id="magazzino">
      <h3><i class="fa-solid fa-warehouse"></i> 16. Stock</h3>
      <p>Stocks d'articles (<code>articoli</code>) et mouvements (<code>movimenti_magazzino</code>) : parasols, transats, serviettes, etc. Contrôle des stocks minimums et historique des entrées/sorties.</p>
    </section>

    <section class="guide-section" id="impostazioni">
      <h3><i class="fa-solid fa-gear"></i> 17. Paramètres</h3>
      <p>Accessibles via l'icône ⚙ dans la barre latérale. Configuration structurelle de l'établissement :</p>
      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead><tr><th>Module</th><th>Table</th><th>Fonction</th></tr></thead>
          <tbody>
            <tr><td>Éléments</td><td><code>elementi</code></td><td>Types d'objets : parasol, cabine, hawaïenne, passerelle…</td></tr>
            <tr><td>Services</td><td><code>servizi</code></td><td>Services supplémentaires (transat, parking…)</td></tr>
            <tr><td>Secteurs</td><td><code>settori</code></td><td>Tranches de prix / zones (A, B, C…)</td></tr>
            <tr><td>Structure</td><td><code>celle</code>, <code>config</code></td><td>Éditeur de planimétrie en grille de la plage</td></tr>
            <tr><td>Grilles tarifaires</td><td><code>listini</code></td><td>Catalogues de prix saisonniers</td></tr>
            <tr><td>Tarifs</td><td><code>tariffe</code></td><td>Prix par secteur et durée</td></tr>
            <tr><td>Capitainerie</td><td><code>capitaneria</code></td><td>Postes du tarif déménial / taxes</td></tr>
            <tr><td>Exploitations</td><td><code>esercizi</code></td><td>Bar, snack, location sur l'établissement</td></tr>
            <tr><td>Entreprise</td><td><code>azienda</code></td><td>Raison sociale, n° TVA, contacts</td></tr>
            <tr><td>Utilisateurs</td><td><code>utenti</code></td><td>Comptes d'accès à l'application (admin uniquement)</td></tr>
          </tbody>
        </table>
      </div>
      <h4>Éditeur Structure (détail)</h4>
      <ol>
        <li>Définissez les lignes/colonnes et la colonne passerelle</li>
        <li>Sélectionnez l'outil : élément, tassa (secteur), numérotation</li>
        <li>Cliquez sur les cellules pour attribuer le type et le secteur</li>
        <li><strong>Charger depuis BD</strong> — lit <code>celle</code> depuis la base de données</li>
        <li><strong>Enregistrer en BD</strong> — sauvegarde la planimétrie (nécessite connexion + token)</li>
      </ol>
      <p>Éléments spéciaux : <em>Mer</em> (premières rangées), <em>Passerelle</em> (colonne centrale), non numérotés.</p>
    </section>

    <section class="guide-section" id="cambia">
      <h3><i class="fa-solid fa-right-left"></i> 18. Changer d'établissement</h3>
      <p>Gestion des profils locaux (enregistrés dans le <code>localStorage</code> du navigateur).</p>
      <ul>
        <li><strong>Nouveau</strong> — ajoute un établissement avec sa propre BD</li>
        <li><strong>Activer</strong> — change le contexte de données dans toute l'application</li>
        <li><strong>Test de connexion</strong> — vérifie la lecture de la base de données</li>
        <li><strong>Profils démo</strong> — crée 3 établissements préchargés</li>
      </ul>
      <p>Modification des profils et des tokens : <span class="guide-badge admin">Administrateur</span> uniquement.</p>
    </section>

    <section class="guide-section" id="utenti">
      <h3><i class="fa-solid fa-user-gear"></i> 19. Utilisateurs et rôles</h3>
      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead><tr><th>Rôle</th><th>Lecture</th><th>Écriture opérationnelle</th><th>Admin</th></tr></thead>
          <tbody>
            <tr><td>Administrateur</td><td>✓</td><td>✓</td><td>✓ utilisateurs, profils, token</td></tr>
            <tr><td>Opérateur</td><td>✓</td><td>✓</td><td>—</td></tr>
            <tr><td>Lecteur / autres</td><td>✓</td><td>—</td><td>—</td></tr>
            <tr><td>Non authentifié</td><td>✓</td><td>—</td><td>—</td></tr>
          </tbody>
        </table>
      </div>
      <p>Les mots de passe sont stockés sous forme de hash SHA-256 dans le champ <code>password_hash</code>. La gestion des utilisateurs (CRUD) est réservée aux administrateurs.</p>
    </section>

    <section class="guide-section" id="stripe">
      <h3><i class="fa-solid fa-credit-card"></i> 20. Paiements Stripe</h3>
      <p>Modules consultatifs pour l'intégration des paiements en ligne :</p>
      <ul>
        <li><strong>Paiements Stripe</strong> — transactions par carte liées aux réservations (<code>pagamenti_stripe</code>)</li>
        <li><strong>Virements Stripe</strong> — versements vers le compte bancaire (<code>trasferimenti_stripe</code>)</li>
      </ul>
      <div class="guide-tip">
        Les paiements Stripe réels nécessitent un backend serveur. Dans cette version web, les modules enregistrent et affichent des données démo/historiques dans la base de données.
      </div>
    </section>

    <section class="guide-section" id="mobile">
      <h3><i class="fa-solid fa-mobile-screen"></i> 21. Utilisation sur mobile et tablette</h3>
      <ul>
        <li><strong>≤1024px :</strong> menu hamburger ☰, barre latérale inférieure avec icônes défilables</li>
        <li><strong>≤768px :</strong> tableau de bord sur une seule colonne, modales plein écran (bottom sheet)</li>
        <li>Tableaux : défilement horizontal automatique</li>
        <li>Boutons et champs : minimum 44px pour le tactile</li>
        <li>Structure : grille de plage défilable, cellules redimensionnées</li>
      </ul>
      <p>Il est recommandé d'ajouter le site à l'écran d'accueil sur iOS/Android pour une expérience proche d'une application.</p>
    </section>

    <section class="guide-section" id="faq">
      <h3><i class="fa-solid fa-life-ring"></i> 22. FAQ et dépannage</h3>
      <h4>« Illegal invocation » ou erreur connexion données</h4>
      <p>Erreur corrigée côté client : rechargez avec Ctrl+Shift+R. Si le problème persiste, videz le cache du navigateur.</p>
      <h4>Impossible d'enregistrer / boutons masqués</h4>
      <ol>
        <li>Avez-vous effectué la <strong>connexion</strong> ?</li>
        <li>Votre rôle est-il Opérateur ou Administrateur ?</li>
        <li>Le <strong>token GitHub</strong> est-il configuré dans le profil actif ?</li>
      </ol>
      <h4>Enregistrement lent</h4>
      <p>Normal : La synchronisation utilise GitHub Actions (~10–30 s). Attendez le message de confirmation dans la barre d'état.</p>
      <h4>Données non mises à jour après modification</h4>
      <p>Le CDN GitHub peut prendre 1–2 minutes. Utilisez <strong>Recharger</strong> dans le module ou changez de profil puis revenez.</p>
      <h4>Tableau de bord avec des chiffres à zéro</h4>
      <p>Vérifiez que le profil pointe vers le bon fichier BD et que des réservations/clients seed existent.</p>
      <h4>Le multi-établissement ne change pas les données</h4>
      <p>Utilisez le sélecteur dans la barre supérieure ; les modules ouverts se rechargent automatiquement.</p>
    </section>

    <section class="guide-section" id="tecnico">
      <h3><i class="fa-solid fa-code"></i> 23. Annexe technique</h3>
      <h4>Stack</h4>
      <ul>
        <li>Frontend statique : HTML, CSS, JavaScript ES modules</li>
        <li>Hébergement : GitHub Pages (branche <code>gh-pages</code>, dossier <code>docs</code>)</li>
        <li>Base de données : <a href="https://github.com/owner/nom-repo">Dépôt de données</a> — JSON + SQL via Actions</li>
        <li>Dépôt application : <code>Falconisilvio/winbeach</code></li>
        <li>Dépôt données : <code>owner/nom-repo</code></li>
      </ul>
      <h4>Tables de données (winbeach)</h4>
      <p><code>config</code>, <code>celle</code>, <code>clienti</code>, <code>prenotazioni</code>, <code>elementi</code>, <code>settori</code>, <code>listini</code>, <code>tariffe</code>, <code>servizi</code>, <code>movimenti_cassa</code>, <code>log_sconti</code>, <code>log_cancellazioni</code>, <code>log_modifiche</code>, <code>contatori_albergo</code>, <code>voucher</code>, <code>articoli</code>, <code>movimenti_magazzino</code>, <code>utenti</code>, <code>azienda</code>, <code>capitaneria</code>, <code>esercizi</code>, <code>pagamenti_stripe</code>, <code>trasferimenti_stripe</code>, <code>attivita</code></p>
      <h4>Fichiers clés</h4>
      <ul>
        <li><code>js/winbeach-db.js</code> — connexion base de données, multi-profils</li>
        <li><code>js/winbeach-auth.js</code> — connexion et permissions</li>
        <li><code>js/winbeach-module.js</code> — utilitaires des modules et lecture seule</li>
        <li><code>js/table-crud.js</code> — factory CRUD générique</li>
        <li><code>js/dashboard-stats.js</code> — KPI du tableau de bord</li>
        <li><code>database/seed-demo.mjs</code> — générateur de données de test</li>
      </ul>
      <h4>Version de la documentation</h4>
      <p>Manuel mis à jour pour WinBeach Web avec authentification, multi-BD et 34 modules opérationnels. Juin 2026.</p>
    </section>
  `,
};