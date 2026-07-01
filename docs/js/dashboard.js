window.addEventListener("load", function () {
    // Inizializza i grafici e le animazioni della dashboard
    createPaymentChart();
    createChannelChart();
    createPresenceChart();
    createArrivalChart();
    animateNumbers();

    // Attiva il motore di gestione dei click e della navigazione fluida
    setupAppNavigation();
    setupMobileNav();
});

//=========================================================
// CENTRALIZZAZIONE DELLA NAVIGAZIONE (SCOMPARI E APPARI)
//=========================================================
function setupAppNavigation() {
    const sidebarIcons = document.querySelectorAll(".sidebar .icon");
    const submenuImpostazioni = document.getElementById("submenu-impostazioni");
    const clickableMenuItems = document.querySelectorAll(".leftmenu ul li[data-page]");
    const btnMenuDashboard = document.getElementById("btn-menu-dashboard");

    // 1. Gestione Clic sulle Icone della Sidebar (Sinistra Esterna)
    sidebarIcons.forEach(function(icon) {
        icon.addEventListener("click", function(e) {
            
            // CONTROLLO PULSANTE RISTORANTE (Evita il 404 e muove solo il menu interno)
            if (this.id === 'btn-sidebar-ristorante') {
                e.preventDefault();
                e.stopPropagation();

                sidebarIcons.forEach(i => i.classList.remove("active"));
                this.classList.add("active");

                const leftMenu = document.querySelector('.leftmenu');
                if (leftMenu) leftMenu.classList.add('open');

                const voceRistoranteMenu = document.querySelector('.leftmenu li.group[data-page="tavoli"]');
                if (voceRistoranteMenu) {
                    voceRistoranteMenu.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    voceRistoranteMenu.style.transition = 'background-color 0.3s';
                    voceRistoranteMenu.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                    setTimeout(() => {
                        voceRistoranteMenu.style.backgroundColor = '';
                    }, 1000);
                }
                return; // Ferma il codice qui per l'icona ristorante
            }

            // Comportamento standard per le altre icone della sidebar
            sidebarIcons.forEach(i => i.classList.remove("active"));
            this.classList.add("active");

            const layout = document.getElementById("app-layout");
            if (layout) layout.classList.remove("menu-open");
            const overlay = document.getElementById("menu-overlay");
            if (overlay) overlay.classList.remove("show");
            document.body.classList.remove("menu-lock");

            const page = this.getAttribute("data-page");

            if (page === "impostazioni") {
                submenuImpostazioni.classList.add("show");
                submenuImpostazioni.scrollIntoView({ behavior: 'smooth', block: 'end' });
            } else if (page === "dashboard") {
                submenuImpostazioni.classList.remove("show");
                caricaProceduraEsterna("dashboard");
            } else if (page) {
                submenuImpostazioni.classList.remove("show");
                caricaProceduraEsterna(page);
            }
        });
    });

    // 2. Gestione Clic su tutte le voci del Menu Testuale (Sinistra Interna)
    clickableMenuItems.forEach(function(item) {
        item.addEventListener("click", function() {
            document.querySelectorAll(".leftmenu ul li").forEach(li => li.classList.remove("active-item"));
            this.classList.add("active-item");

            const paginaScelta = this.getAttribute("data-page");
            caricaProceduraEsterna(paginaScelta);
        });
    });

    // 3. Clic sulla scritta "Dashboard" (In alto nel Leftmenu) per resettare l'applicazione
    if (btnMenuDashboard) {
        btnMenuDashboard.addEventListener("click", function() {
            caricaProceduraEsterna("dashboard");
            sidebarIcons.forEach(i => i.classList.remove("active"));
            document.getElementById("btn-sidebar-statistiche").classList.add("active");
            document.querySelectorAll(".leftmenu ul li").forEach(li => li.classList.remove("active-item"));
        });
    }

    // 4. Link "Dettaglio" sulle card della dashboard
    document.querySelectorAll("[data-nav]").forEach(function(link) {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            const pagina = this.getAttribute("data-nav");
            caricaProceduraEsterna(pagina);
            document.querySelectorAll(".leftmenu ul li").forEach(li => li.classList.remove("active-item"));
            const menuItem = document.querySelector(`.leftmenu ul li[data-page="${pagina}"]`);
            if (menuItem) menuItem.classList.add("active-item");
        });
    });

    // 5. Pulsante nuova prenotazione nella topbar
    const btnNuova = document.querySelector(".topbar .btn-blue");
    if (btnNuova) {
        btnNuova.addEventListener("click", function() {
            caricaProceduraEsterna("booking");
            sidebarIcons.forEach(i => i.classList.remove("active"));
            const bookingIcon = document.querySelector('.sidebar .icon[data-page="booking"]');
            if (bookingIcon) bookingIcon.classList.add("active");
        });
    }
}

function setupMobileNav() {
    const layout = document.getElementById("app-layout");
    const toggle = document.getElementById("btn-menu-toggle");
    const overlay = document.getElementById("menu-overlay");
    if (!layout || !toggle) return;

    function closeMenu() {
        layout.classList.remove("menu-open");
        if (overlay) overlay.classList.remove("show");
        document.body.classList.remove("menu-lock");
    }

    function openMenu() {
        layout.classList.add("menu-open");
        if (overlay) overlay.classList.add("show");
        document.body.classList.add("menu-lock");
    }

    toggle.addEventListener("click", function () {
        if (layout.classList.contains("menu-open")) closeMenu();
        else openMenu();
    });

    if (overlay) overlay.addEventListener("click", closeMenu);

    document.querySelectorAll(".leftmenu ul li[data-page], .leftmenu .group[data-page]").forEach(function (item) {
        item.addEventListener("click", closeMenu);
    });

    window.addEventListener("resize", function () {
        if (window.innerWidth > 1024) closeMenu();
    });
}

function risolviPercorso(nomePagina) {
    if (nomePagina === "struttura") return "struttura.html";
    return `pages/${nomePagina}.html`;
}

// Cambia l'area di destra inserendo un iframe dinamico o ripristinando la dashboard nativa
window.caricaProceduraEsterna = function caricaProceduraEsterna(nomePagina, opts) {
    const dashboardView = document.getElementById("dashboard-view");
    const procedureView = document.getElementById("procedure-view");
    const params = new URLSearchParams();
    if (opts && opts.q) params.set("q", opts.q);
    if (opts && opts.cella) params.set("cella", opts.cella);
    const query = params.toString() ? `?${params.toString()}` : "";

    if (nomePagina === "dashboard") {
        procedureView.style.display = "none";
        procedureView.innerHTML = "";
        dashboardView.style.display = "block";
    } else {
        const percorso = risolviPercorso(nomePagina) + query;
        dashboardView.style.display = "none";
        procedureView.style.display = "block";
        procedureView.innerHTML = `<iframe src="${percorso}" class="procedure-iframe" title="${nomePagina}"></iframe>`;
        const iframe = procedureView.querySelector("iframe");
        if (iframe) {
            iframe.addEventListener("load", function () {
                const theme = localStorage.getItem("winbeach_theme")
                    || document.documentElement.getAttribute("data-theme")
                    || "light";
                try {
                    iframe.contentWindow.postMessage({ type: "winbeach-theme-change", theme: theme }, "*");
                    const lang = localStorage.getItem("winbeach-app-lang") || "it";
                    iframe.contentWindow.postMessage({ type: "winbeach-lang-change", lang: lang }, "*");
                } catch { /* ignore */ }
            });
        }

        const sidebarIcons = document.querySelectorAll(".sidebar .icon");
        const submenuImpostazioni = document.getElementById("submenu-impostazioni");
        const pageToIcon = {
            booking: "booking", clienti: "clienti", spiaggia: "spiaggia",
            "qr-scan": "qr-scan", cassa: "cassa", planner: "planner", listini: "listini",
            cambia: "cambia", guida: "guida",
        };
        const iconPage = pageToIcon[nomePagina];
        if (iconPage) {
            sidebarIcons.forEach((i) => i.classList.remove("active"));
            const icon = document.querySelector(`.sidebar .icon[data-page="${iconPage}"]`);
            if (icon) icon.add("active");
            if (submenuImpostazioni) submenuImpostazioni.classList.remove("show");
        }
    }
};

//=========================================================
// CONFIGURAZIONE GRAFICI CHART.JS
//=========================================================
function chartLegendPosition() {
    return window.innerWidth < 768 ? "bottom" : "right";
}

function mergeChartOptions(extra = {}) {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    const text = dark ? "#94a3b8" : "#666666";
    const grid = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
    const base = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: chartLegendPosition(),
                labels: { color: text },
            },
        },
        scales: {
            x: { ticks: { color: text }, grid: { color: grid } },
            y: { ticks: { color: text }, grid: { color: grid }, beginAtZero: false },
        },
    };
    return {
        ...base,
        ...extra,
        plugins: {
            ...base.plugins,
            ...extra.plugins,
            legend: { ...base.plugins.legend, ...extra.plugins?.legend },
        },
        scales: {
            x: { ...base.scales.x, ...extra.scales?.x },
            y: { ...base.scales.y, ...extra.scales?.y },
        },
    };
}

// Interfaccia i18n etichette
function chartLabels() {
    const T = window.__wbT || ((k) => k);
    return {
        payment: [T('chart.paidFull'), T('chart.paidPartial'), T('chart.unpaid')],
        channel: [T('chart.chanOffline'), T('chart.chanWidget'), T('chart.chanPortal')],
        presence: T('chart.presence'),
        arrivals: T('chart.arrivals'),
        departures: T('chart.departures'),
    };
}

function refreshChartsI18n() {
    const L = chartLabels();
    const pay = Chart.getChart('chartPayment');
    if (pay) { pay.data.labels = L.payment; pay.update(); }
    const ch = Chart.getChart('chartChannel');
    if (ch) { ch.data.labels = L.channel; ch.update(); }
    const line1 = Chart.getChart('chartLine1');
    if (line1?.data.datasets[0]) { line1.data.datasets[0].label = L.presence; line1.update(); }
    const line2 = Chart.getChart('chartLine2');
    if (line2?.data.datasets[0]) {
        line2.data.datasets[0].label = L.arrivals;
        line2.data.datasets[1].label = L.departures;
        line2.update();
    }
}

function refreshAllChartsTheme() {
    ["chartPayment", "chartChannel", "chartLine1", "chartLine2"].forEach((id) => {
        const c = Chart.getChart(id);
        if (!c) return;
        const dark = document.documentElement.getAttribute("data-theme") === "dark";
        const text = dark ? "#94a3b8" : "#666666";
        const grid = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
        if (c.options.plugins?.legend?.labels) c.options.plugins.legend.labels.color = text;
        ["x", "y"].forEach((axis) => {
            if (c.options.scales?.[axis]?.ticks) c.options.scales[axis].ticks.color = text;
            if (c.options.scales?.[axis]?.grid) c.options.scales[axis].grid.color = grid;
        });
        c.update();
    });
}

function createPaymentChart() {
    const L = chartLabels();
    new Chart(document.getElementById("chartPayment"), {
        type: "doughnut",
        data: {
            labels: L.payment,
            datasets: [{ data: [53, 20, 9], backgroundColor: ["#0084FF", "#74B9FF", "#A5D8FF"], borderWidth: 0 }]
        },
        options: mergeChartOptions({ cutout: "70%" }),
    });
}

function createChannelChart() {
    const L = chartLabels();
    new Chart(document.getElementById("chartChannel"), {
        type: "doughnut",
        data: {
            labels: L.channel,
            datasets: [{ data: [62, 30, 20], backgroundColor: ["#F39C12", "#F1C40F", "#FDEBD0"], borderWidth: 0 }]
        },
        options: mergeChartOptions({ cutout: "70%" }),
    });
}

function buildDayLabels(days) {
    const labels = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        labels.push(`${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    return labels;
}

function createPresenceChart() {
    const L = chartLabels();
    const labels = buildDayLabels(14);
    new Chart(document.getElementById("chartLine1"), {
        type: "line",
        data: {
            labels: labels,
            datasets: [{ label: L.presence, data: labels.map(() => 0), borderColor: "#0084FF", backgroundColor: "transparent", borderWidth: 2, tension: 0.4 }]
        },
        options: mergeChartOptions({ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }),
    });
}

function createArrivalChart() {
    const L = chartLabels();
    const labels = buildDayLabels(14);
    new Chart(document.getElementById("chartLine2"), {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                { label: L.arrivals, data: labels.map(() => 0), borderColor: "#74B9FF", backgroundColor: "transparent", borderWidth: 2, tension: 0.4 },
                { label: L.departures, data: labels.map(() => 0), borderColor: "#A5A5A5", backgroundColor: "transparent", borderWidth: 2, tension: 0.4 }
            ]
        },
        options: mergeChartOptions({ plugins: { legend: { position: "bottom" } }, scales: { y: { beginAtZero: true } } }),
    });
}

window.addEventListener("winbeach-lang-change", refreshChartsI18n);
window.addEventListener("message", (e) => {
    if (e.data?.type === "winbeach-lang-change") refreshChartsI18n();
});

window.addEventListener("winbeach-theme-change", refreshAllChartsTheme);
window.addEventListener("message", (e) => {
    if (e.data?.type === "winbeach-theme-change") refreshAllChartsTheme();
});

window.addEventListener("message", function (e) {
    if (e.data?.type === "winbeach-navigate" && e.data.page) {
        const opts = {};
        if (e.data.q) opts.q = e.data.q;
        if (e.data.cella) opts.cella = e.data.cella;
        caricaProceduraEsterna(e.data.page, opts);
    }
});

function animateNumbers() {
    document.querySelectorAll(".number").forEach(function (item) {
        let txt = item.innerText;
        let valore = parseInt(txt.replace(/[^0-9]/g, ""));
        if (isNaN(valore)) return;
        let n = 0; let step = Math.ceil(valore / 60); 
        let timer = setInterval(function () {
            n += step;
            if (n >= valore) { n = valore; clearInterval(timer); }
            let stringaFormattata = n.toLocaleString('it-IT');
            item.innerHTML = txt.replace(txt.match(/[0-9.]+/g), stringaFormattata);
        }, 15);
    });
}

// Cambio pagina da moduli figli (es. tavoli → cassa ristorante)
window.addEventListener('message', function (event) {
    if (event.data && event.data.comando === 'cambiaPagina') {
        const targetPage = String(event.data.target).toLowerCase();
        caricaProceduraEsterna(targetPage);
        document.querySelectorAll('.leftmenu ul li').forEach((li) => li.classList.remove('active-item'));
        const voceMenu = document.querySelector(`.leftmenu ul li[data-page="${targetPage}"]`);
        if (voceMenu) voceMenu.classList.add('active-item');
    }
});
