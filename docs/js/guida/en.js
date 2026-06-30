export const en = {
  meta: {
    lang: 'en',
    title: 'Guide — WinBeach Web',
    header: '<i class="fa-solid fa-circle-question" style="color:#0984e3"></i> WinBeach Web Guide',
    subtitle: 'Complete operational manual — Beach Manager on GitHub Pages on GitHub Pages.',
  },
  html: `
    <nav class="guide-toc" aria-label="Table of contents">
      <h3><i class="fa-solid fa-list"></i> Table of contents</h3>
      <ol>
        <li><a href="#intro">Introduction</a></li>
        <li><a href="#accesso">Access and security</a></li>
        <li><a href="#navigazione">Navigation</a></li>
        <li><a href="#multi-bd">Multi-facility and data storage</a></li>
        <li><a href="#dashboard">Dashboard</a></li>
        <li><a href="#spiaggia">Beach</a></li>
        <li><a href="#booking">Booking and reservations</a></li>
        <li><a href="#planner">Planner</a></li>
        <li><a href="#listini">Price lists and rates</a></li>
        <li><a href="#cassa">Cash register and flows</a></li>
        <li><a href="#clienti">Customers</a></li>
        <li><a href="#qr">QR Scan</a></li>
        <li><a href="#statistiche">Statistics</a></li>
        <li><a href="#log">Logs and audit</a></li>
        <li><a href="#contatori">Counters</a></li>
        <li><a href="#magazzino">Warehouse</a></li>
        <li><a href="#impostazioni">Settings</a></li>
        <li><a href="#cambia">Switch facility</a></li>
        <li><a href="#utenti">Users and roles</a></li>
        <li><a href="#stripe">Stripe payments</a></li>
        <li><a href="#mobile">Use on mobile and tablet</a></li>
        <li><a href="#faq">FAQ and troubleshooting</a></li>
        <li><a href="#tecnico">Technical appendix</a></li>
      </ol>
    </nav>

    <!-- 1. INTRODUCTION -->
    <section class="guide-section" id="intro">
      <h3><i class="fa-solid fa-umbrella-beach"></i> 1. Introduction</h3>
      <p><strong>WinBeach Web</strong> is the browser-based version of the WinBeach beach management system. It lets you manage spots, reservations, customers, revenue, and facility configuration without installing desktop software.</p>
      <p>Public URL: <code>https://falconisilvio.github.io/winbeach/</code></p>
      <h4>Main features</h4>
      <ul>
        <li>Operational dashboard with real-time KPIs (arrivals, departures, occupancy, revenue)</li>
        <li>Full CRUD on 24+ tables via <strong>cloud database</strong></li>
        <li>Interactive beach layout (Structure editor)</li>
        <li>Multi-facility: multiple beach establishments with separate databases</li>
        <li>User authentication with roles (read-only / write / admin)</li>
        <li>Responsive layout for smartphones, tablets, and desktop</li>
      </ul>
      <div class="info-box">
        <strong>Default mode</strong>
        <p style="margin:6px 0 0">On launch the app is in <span class="guide-badge read">read-only</span> mode. You can view all data; to create, edit, or delete records you must <strong>log in</strong> and configure the <strong>GitHub token</strong>.</p>
      </div>
    </section>

    <!-- 2. ACCESS -->
    <section class="guide-section" id="accesso">
      <h3><i class="fa-solid fa-right-to-bracket"></i> 2. Access and security</h3>
      <h4>User login</h4>
      <ol>
        <li>Click <strong>Log in</strong> in the top bar (or go to <code>login.html</code>)</li>
        <li>Enter username and password</li>
        <li>After login your name and role appear in the top bar</li>
      </ol>
      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead><tr><th>Demo user</th><th>Password</th><th>Role</th><th>Permissions</th></tr></thead>
          <tbody>
            <tr><td><code>admin</code></td><td><code>admin</code></td><td>Administrator</td><td><span class="guide-badge admin">Admin</span> Write + users + DB profiles</td></tr>
            <tr><td><code>reception</code></td><td><code>reception</code></td><td>Operator</td><td><span class="guide-badge write">Write</span> Daily operations</td></tr>
          </tbody>
        </table>
      </div>
      <h4>GitHub token (writes to the database)</h4>
      <p>Changes are sent to the data repository via GitHub Actions. A <strong>Personal Access Token</strong> with <code>repo</code> permission on the database fork is required.</p>
      <ol>
        <li>Log in as <strong>admin</strong></li>
        <li>Go to <strong>Switch facility</strong> → edit profile → Token field</li>
        <li>Paste the token (format <code>ghp_…</code>) and save</li>
      </ol>
      <div class="guide-warn">
        <strong>Important:</strong> the token remains in local browser storage (localStorage). Do not share the PC with an active token. The user session lasts 8 hours; the token persists until you remove it.
      </div>
      <h4>Dual protection on writes</h4>
      <ul>
        <li><strong>Level 1 — User:</strong> valid session + Operator or Administrator role</li>
        <li><strong>Level 2 — Database:</strong> GitHub token with write access to the data repo</li>
      </ul>
    </section>

    <!-- 3. NAVIGATION -->
    <section class="guide-section" id="navigazione">
      <h3><i class="fa-solid fa-compass"></i> 3. Navigation</h3>
      <h4>Side bar (icons)</h4>
      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead><tr><th>Icon</th><th>Module</th><th>Description</th></tr></thead>
          <tbody>
            <tr><td>☂ Beach</td><td>spiaggia</td><td>Spot occupancy map for today</td></tr>
            <tr><td>📅 Booking</td><td>booking</td><td>Reservation management with rates</td></tr>
            <tr><td>📋 Planner</td><td>planner</td><td>Calendar / planning view</td></tr>
            <tr><td>📃 Price lists</td><td>listini</td><td>Seasonal price lists</td></tr>
            <tr><td>💰 Cash register</td><td>cassa</td><td>Daily cash movements</td></tr>
            <tr><td>📊 Statistics</td><td>dashboard</td><td>Return to KPI dashboard</td></tr>
            <tr><td>👤 Customers</td><td>clienti</td><td>Customer directory</td></tr>
            <tr><td>QR</td><td>qr-scan</td><td>Find reservation via QR/text</td></tr>
            <tr><td>⚙ Settings</td><td>—</td><td>Opens configuration submenu</td></tr>
            <tr><td>⇄ Switch</td><td>cambia</td><td>Multi-facility profiles</td></tr>
            <tr><td>? Guide</td><td>guida</td><td>This manual</td></tr>
          </tbody>
        </table>
      </div>
      <h4>Text menu (left)</h4>
      <p>Groups operational modules: <em>Arrivals and departures</em>, <em>Facility statistics</em>, <em>Logs and flows</em>, <em>Counters</em>, <em>Warehouse</em>, and the <em>Settings</em> submenu.</p>
      <h4>Facility selector (top bar)</h4>
      <p>Dropdown with all configured profiles. Switching facility reloads data from the respective database.</p>
      <h4>Connection status bar</h4>
      <p>Every module shows <code>facility name · status</code>: <em>idle</em>, <em>loading</em>, <em>ok</em>, <em>error</em>. Indicates whether read/write to the database succeeded.</p>
    </section>

    <!-- 4. MULTI-BD -->
    <section class="guide-section" id="multi-bd">
      <h3><i class="fa-solid fa-database"></i> 4. Multi-facility and data storage</h3>
      <p>Each facility corresponds to a JSON file in the data repository, e.g. <code>data/winbeach.json</code>, <code>data/winbeach-lido-sud.json</code>.</p>
      <h4>Profile configuration</h4>
      <ul>
        <li><strong>Facility name</strong> — label shown in the app</li>
        <li><strong>Owner / Repo</strong> — e.g. <code>owner/repo-name</code></li>
        <li><strong>Branch</strong> — usually <code>main</code></li>
        <li><strong>DB file</strong> — name without <code>.json</code></li>
        <li><strong>Token</strong> — one per profile, stored in the browser</li>
      </ul>
      <h4>Demo profiles</h4>
      <p>In <strong>Switch facility</strong> → <strong>Demo profiles</strong>, three establishments with distinct sample data are created automatically.</p>
      <h4>Read vs write</h4>
      <ul>
        <li><strong>Read:</strong> public via GitHub CDN (<code>raw.githubusercontent.com</code>), no token required</li>
        <li><strong>Write:</strong> SQL sent via <code>repository_dispatch</code>; GitHub Actions applies the change in 10–30 seconds</li>
      </ul>
    </section>

    <!-- 5. DASHBOARD -->
    <section class="guide-section" id="dashboard">
      <h3><i class="fa-solid fa-house"></i> 5. Dashboard</h3>
      <p>Daily overview of the active facility. Figures update automatically from the database (<code>dashboard-stats.js</code>).</p>
      <h4>KPI cards</h4>
      <ul>
        <li><strong>Arrivals / Departures</strong> — reservations with start/end date equal to today</li>
        <li><strong>Cancellations</strong> — reservations with status <code>cancellata</code></li>
        <li><strong>Occupancy</strong> — % of spots occupied today</li>
        <li><strong>Revenue</strong> — sum of active reservation amounts</li>
        <li><strong>Attendance</strong> — customers on the beach today</li>
        <li><strong>Discounts</strong> — link to discount log</li>
        <li><strong>Average basket</strong> — duration statistics</li>
      </ul>
      <h4>Charts</h4>
      <ul>
        <li>Pie chart <em>Payment status</em> (paid / partial / unpaid)</li>
        <li>Pie chart <em>Booking channel</em> (offline / widget / portal)</li>
        <li>Line charts <em>Attendance</em> and <em>Arrivals/Departures</em> (historical demo chart data)</li>
      </ul>
      <p><em>Details →</em> links open the related module in the central panel.</p>
    </section>

    <!-- 6. BEACH -->
    <section class="guide-section" id="spiaggia">
      <h3><i class="fa-solid fa-umbrella-beach"></i> 6. Beach</h3>
      <p>Map view of spots with occupancy status for today's date. Colors and legend come from active reservations and the <code>celle</code> table.</p>
      <ul>
        <li>Green / occupied — spot with a valid reservation today</li>
        <li>Free — available for a new reservation</li>
        <li>Top statistics: total spots, occupied, % occupancy</li>
      </ul>
    </section>

    <!-- 7. BOOKING -->
    <section class="guide-section" id="booking">
      <h3><i class="fa-solid fa-calendar-days"></i> 7. Booking and reservations</h3>
      <h4>Booking (sidebar)</h4>
      <p>Main reservation CRUD module with automatic rate calculation.</p>
      <ul>
        <li><strong>New</strong> — requires at least one customer in the directory</li>
        <li>Fields: customer, spot (cella), dates, status, amount, paid, channel, payment</li>
        <li>Price is calculated from spot sector + rates + dates (can be edited manually)</li>
        <li>Statuses: <code>confermata</code>, <code>in_attesa</code>, <code>cancellata</code></li>
        <li>Payment: <code>saldato</code>, <code>parziale</code>, <code>da_saldare</code></li>
      </ul>
      <h4>Arrivals and departures (left menu)</h4>
      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead><tr><th>Page</th><th>Content</th><th>Actions</th></tr></thead>
          <tbody>
            <tr><td>Arrivals today</td><td>Reservations with <code>data_inizio = today</code></td><td>Quick check-in</td></tr>
            <tr><td>Departures today</td><td><code>data_fine = today</code></td><td>Check-out</td></tr>
            <tr><td>Arrivals tomorrow</td><td>Expected arrivals tomorrow</td><td>Read-only</td></tr>
            <tr><td>Departures tomorrow</td><td>Expected departures tomorrow</td><td>Read-only</td></tr>
            <tr><td>Umbrella changes</td><td>Spot relocation log</td><td>CRUD on <code>log_modifiche</code></td></tr>
            <tr><td>All reservations</td><td>Full filterable list</td><td>Same functions as Booking</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 8. PLANNER -->
    <section class="guide-section" id="planner">
      <h3><i class="fa-solid fa-list"></i> 8. Planner</h3>
      <p>Activity and task planning view (<code>attivita</code>). Useful for organizing daily staff tasks (opening, cleaning, arrival preparation).</p>
    </section>

    <!-- 9. PRICE LISTS -->
    <section class="guide-section" id="listini">
      <h3><i class="fa-solid fa-tags"></i> 9. Price lists and rates</h3>
      <h4>Price lists</h4>
      <p>Define periods and covered sectors (e.g. «Summer 2026», sectors A/B/C).</p>
      <h4>Rates</h4>
      <p>Prices per band (<code>tassa</code> = sector): daily, weekly, fortnightly, monthly. Linked to <code>listino_id</code>.</p>
      <div class="guide-tip">
        Configure <strong>Sectors</strong> and <strong>Rates</strong> first, then <strong>Structure</strong> (assign sector to each spot) for correct price calculation in Booking.
      </div>
    </section>

    <!-- 10. CASH REGISTER -->
    <section class="guide-section" id="cassa">
      <h3><i class="fa-solid fa-cash-register"></i> 10. Cash register and flows</h3>
      <h4>Cash register</h4>
      <ul>
        <li>Records income/expenses in <code>movimenti_cassa</code></li>
        <li>Statistics: income/expenses today, balance</li>
        <li>Fields: type, amount, description, method (cash/card/bank transfer), operator</li>
      </ul>
      <h4>Cash flows (menu)</h4>
      <p>Same logic as Cash register, dedicated view in the «Logs and flows» group for aggregated movement analysis.</p>
    </section>

    <!-- 11. CUSTOMERS -->
    <section class="guide-section" id="clienti">
      <h3><i class="fa-solid fa-users"></i> 11. Customers</h3>
      <p>Directory in the <code>clienti</code> table: first name, last name, email, phone, notes.</p>
      <ul>
        <li>Real-time text search</li>
        <li>At least first name is required to save</li>
        <li>Every reservation requires a valid <code>cliente_id</code></li>
      </ul>
    </section>

    <!-- 12. QR -->
    <section class="guide-section" id="qr">
      <h3><i class="fa-solid fa-qrcode"></i> 12. QR Scan</h3>
      <p>Find a reservation by entering QR code, reservation ID, or customer name. Shows detail and check-in status. Ideal for quick beach entry.</p>
    </section>

    <!-- 13. STATISTICS -->
    <section class="guide-section" id="statistiche">
      <h3><i class="fa-solid fa-chart-pie"></i> 13. Statistics</h3>
      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead><tr><th>Module</th><th>Analysis</th></tr></thead>
          <tbody>
            <tr><td>Statistics per umbrella</td><td>Usage and revenue per spot number</td></tr>
            <tr><td>Statistics per sector</td><td>Comparison of bands A / B / C</td></tr>
            <tr><td>Statistics per duration</td><td>Stay distribution (daily, weekly, …)</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 14. LOG -->
    <section class="guide-section" id="log">
      <h3><i class="fa-solid fa-file-lines"></i> 14. Logs and audit</h3>
      <ul>
        <li><strong>Discount log</strong> — applied discounts: operator, customer, %, amount, reason</li>
        <li><strong>Cancellation log</strong> — cancelled reservations with optional penalty</li>
        <li><strong>Cash flows</strong> — financial movements (see Cash register section)</li>
      </ul>
      <p>All logs are persisted in the database and can be viewed read-only by any user.</p>
    </section>

    <!-- 15. COUNTERS -->
    <section class="guide-section" id="contatori">
      <h3><i class="fa-solid fa-calculator"></i> 15. Counters</h3>
      <h4>Hotel counters</h4>
      <p>Hotel convention management: convention code, total assigned spots, spots used.</p>
      <h4>Voucher counters</h4>
      <p>Voucher campaigns (code, issued, used, expiry) — <code>voucher</code> table.</p>
    </section>

    <!-- 16. WAREHOUSE -->
    <section class="guide-section" id="magazzino">
      <h3><i class="fa-solid fa-warehouse"></i> 16. Warehouse</h3>
      <p>Item stock (<code>articoli</code>) and movements (<code>movimenti_magazzino</code>): umbrellas, loungers, towels, etc. Track minimum stock levels and inbound/outbound history.</p>
    </section>

    <!-- 17. SETTINGS -->
    <section class="guide-section" id="impostazioni">
      <h3><i class="fa-solid fa-gear"></i> 17. Settings</h3>
      <p>Accessible from the ⚙ icon in the sidebar. Structural configuration of the facility:</p>
      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead><tr><th>Module</th><th>Table</th><th>Function</th></tr></thead>
          <tbody>
            <tr><td>Elements</td><td><code>elementi</code></td><td>Object types: umbrella, cabin, Hawaiian bed, walkway…</td></tr>
            <tr><td>Services</td><td><code>servizi</code></td><td>Extra services (lounger, parking…)</td></tr>
            <tr><td>Sectors</td><td><code>settori</code></td><td>Price bands / zones (A, B, C…)</td></tr>
            <tr><td>Structure</td><td><code>celle</code>, <code>config</code></td><td>Beach grid layout editor</td></tr>
            <tr><td>Price lists</td><td><code>listini</code></td><td>Seasonal price catalogs</td></tr>
            <tr><td>Rates</td><td><code>tariffe</code></td><td>Prices per sector and duration</td></tr>
            <tr><td>Harbor authority</td><td><code>capitaneria</code></td><td>Concession fee schedule / taxes</td></tr>
            <tr><td>Concessions</td><td><code>esercizi</code></td><td>Bar, kiosk, rental on the facility</td></tr>
            <tr><td>Company</td><td><code>azienda</code></td><td>Legal name, VAT number, contacts</td></tr>
            <tr><td>Users</td><td><code>utenti</code></td><td>App login accounts (admin only)</td></tr>
          </tbody>
        </table>
      </div>
      <h4>Structure editor (detail)</h4>
      <ol>
        <li>Set rows/columns and walkway column</li>
        <li>Select tool: element, tassa (sector), numbering</li>
        <li>Click cells to assign type and sector</li>
        <li><strong>Load from DB</strong> — reads <code>celle</code> from the database</li>
        <li><strong>Save to DB</strong> — saves layout (requires login + token)</li>
      </ol>
      <p>Special elements: <em>Sea</em> (front rows), <em>Walkway</em> (central column), not numbered.</p>
    </section>

    <!-- 18. SWITCH FACILITY -->
    <section class="guide-section" id="cambia">
      <h3><i class="fa-solid fa-right-left"></i> 18. Switch facility</h3>
      <p>Manage local profiles (stored in browser <code>localStorage</code>).</p>
      <ul>
        <li><strong>New</strong> — adds a facility with its own DB</li>
        <li><strong>Activate</strong> — switches data context across the app</li>
        <li><strong>Test connection</strong> — verifies database read access</li>
        <li><strong>Demo profiles</strong> — creates 3 preloaded establishments</li>
      </ul>
      <p>Edit profiles and tokens: <span class="guide-badge admin">Administrator</span> only.</p>
    </section>

    <!-- 19. USERS -->
    <section class="guide-section" id="utenti">
      <h3><i class="fa-solid fa-user-gear"></i> 19. Users and roles</h3>
      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead><tr><th>Role</th><th>Read</th><th>Operational write</th><th>Admin</th></tr></thead>
          <tbody>
            <tr><td>Administrator</td><td>✓</td><td>✓</td><td>✓ users, profiles, token</td></tr>
            <tr><td>Operator</td><td>✓</td><td>✓</td><td>—</td></tr>
            <tr><td>Reader / other</td><td>✓</td><td>—</td><td>—</td></tr>
            <tr><td>Not authenticated</td><td>✓</td><td>—</td><td>—</td></tr>
          </tbody>
        </table>
      </div>
      <p>Passwords are stored as SHA-256 hashes in the <code>password_hash</code> field. User management (CRUD) is reserved for administrators.</p>
    </section>

    <!-- 20. STRIPE -->
    <section class="guide-section" id="stripe">
      <h3><i class="fa-solid fa-credit-card"></i> 20. Stripe payments</h3>
      <p>Consultative modules for online payment integration:</p>
      <ul>
        <li><strong>Stripe payments</strong> — card transactions linked to reservations (<code>pagamenti_stripe</code>)</li>
        <li><strong>Stripe transfers</strong> — payouts to bank account (<code>trasferimenti_stripe</code>)</li>
      </ul>
      <div class="guide-tip">
        Real Stripe payments require a server backend. In this web version the modules record and display demo/historical data in the database.
      </div>
    </section>

    <!-- 21. MOBILE -->
    <section class="guide-section" id="mobile">
      <h3><i class="fa-solid fa-mobile-screen"></i> 21. Use on mobile and tablet</h3>
      <ul>
        <li><strong>≤1024px:</strong> hamburger menu ☰, bottom sidebar with scrollable icons</li>
        <li><strong>≤768px:</strong> single-column dashboard, full-screen modals (bottom sheet)</li>
        <li>Tables: automatic horizontal scroll</li>
        <li>Buttons and inputs: minimum 44px for touch</li>
        <li>Structure: scrollable beach grid, resized cells</li>
      </ul>
      <p>Recommended: add the site to the Home screen on iOS/Android for an app-like experience.</p>
    </section>

    <!-- 22. FAQ -->
    <section class="guide-section" id="faq">
      <h3><i class="fa-solid fa-life-ring"></i> 22. FAQ and troubleshooting</h3>
      <h4>«Illegal invocation» or data connection error</h4>
      <p>Error fixed in the client: reload with Ctrl+Shift+R. If it persists, clear the browser cache.</p>
      <h4>Cannot save / buttons hidden</h4>
      <ol>
        <li>Have you <strong>logged in</strong>?</li>
        <li>Is your role Operator or Administrator?</li>
        <li>Is the <strong>GitHub token</strong> configured in the active profile?</li>
      </ol>
      <h4>Slow save</h4>
      <p>Normal: Synchronization uses GitHub Actions (~10–30 s). Wait for the confirmation message in the status bar.</p>
      <h4>Data not updated after edit</h4>
      <p>GitHub CDN may take 1–2 minutes. Use <strong>Reload</strong> in the module or switch profile and return.</p>
      <h4>Dashboard showing zeros</h4>
      <p>Verify the profile points to the correct DB file and that seed reservations/customers exist.</p>
      <h4>Multi-facility does not change data</h4>
      <p>Use the selector in the top bar; open modules reload automatically.</p>
    </section>

    <!-- 23. TECHNICAL -->
    <section class="guide-section" id="tecnico">
      <h3><i class="fa-solid fa-code"></i> 23. Technical appendix</h3>
      <h4>Stack</h4>
      <ul>
        <li>Static frontend: HTML, CSS, JavaScript ES modules</li>
        <li>Hosting: GitHub Pages (branch <code>gh-pages</code>, folder <code>docs</code>)</li>
        <li>Database: <a href="https://github.com/owner/repo-name">Data repository</a> — JSON + SQL via Actions</li>
        <li>App repo: <code>Falconisilvio/winbeach</code></li>
        <li>Data repo: <code>owner/repo-name</code></li>
      </ul>
      <h4>Database tables (winbeach)</h4>
      <p><code>config</code>, <code>celle</code>, <code>clienti</code>, <code>prenotazioni</code>, <code>elementi</code>, <code>settori</code>, <code>listini</code>, <code>tariffe</code>, <code>servizi</code>, <code>movimenti_cassa</code>, <code>log_sconti</code>, <code>log_cancellazioni</code>, <code>log_modifiche</code>, <code>contatori_albergo</code>, <code>voucher</code>, <code>articoli</code>, <code>movimenti_magazzino</code>, <code>utenti</code>, <code>azienda</code>, <code>capitaneria</code>, <code>esercizi</code>, <code>pagamenti_stripe</code>, <code>trasferimenti_stripe</code>, <code>attivita</code></p>
      <h4>Key files</h4>
      <ul>
        <li><code>js/winbeach-db.js</code> — database connection, multi-profile</li>
        <li><code>js/winbeach-auth.js</code> — login and permissions</li>
        <li><code>js/winbeach-module.js</code> — module utilities and read-only</li>
        <li><code>js/table-crud.js</code> — generic CRUD factory</li>
        <li><code>js/dashboard-stats.js</code> — dashboard KPIs</li>
        <li><code>database/seed-demo.mjs</code> — sample data generator</li>
      </ul>
      <h4>Documentation version</h4>
      <p>Manual updated for WinBeach Web with authentication, multi-DB, and 34 operational modules. June 2026.</p>
    </section>
  `,
};