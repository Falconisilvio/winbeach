window.addEventListener("load", function () {
    // Inizializza i grafici e le animazioni della dashboard
    createPaymentChart();
    createChannelChart();
    createPresenceChart();
    createArrivalChart();
    animateNumbers();

    // Attiva il motore di gestione dei click e della navigazione fluida
    setupAppNavigation();
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
        icon.addEventListener("click", function() {
            sidebarIcons.forEach(i => i.classList.remove("active"));
            this.classList.add("active");

            const page = this.getAttribute("data-page");

            if (page === "impostazioni") {
                // Srotola il sottomenu impostazioni sotto Magazzino
                submenuImpostazioni.classList.add("show");
                submenuImpostazioni.scrollIntoView({ behavior: 'smooth', block: 'end' });
            } else if (page === "clienti") {
                // Chiude il sottomenu e apre direttamente clienti.html
                submenuImpostazioni.classList.remove("show");
                caricaProceduraEsterna("clienti");
            } else {
                // Per qualsiasi altra icona, reimposta la vista e torna alla Dashboard
                submenuImpostazioni.classList.remove("show");
                caricaProceduraEsterna("dashboard");
            }
        });
    });

    // 2. Gestione Clic su tutte le voci del Menu Testuale (Sinistra Interna)
    clickableMenuItems.forEach(function(item) {
        item.addEventListener("click", function() {
            // Rimuove la selezione grafica da tutte le altre scritte
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
            // Ripristina graficamente l'icona delle statistiche nella sidebar
            sidebarIcons.forEach(i => i.classList.remove("active"));
            document.getElementById("btn-sidebar-statistiche").classList.add("active");
            document.querySelectorAll(".leftmenu ul li").forEach(li => li.classList.remove("active-item"));
        });
    }
}

const PAGES_IN_CARTELLA = new Set(["clienti", "servizi"]);

function risolviPercorso(nomePagina) {
    if (nomePagina === "struttura") return "struttura.html";
    if (PAGES_IN_CARTELLA.has(nomePagina)) return `pages/${nomePagina}.html`;
    return "pages/template.html";
}

// Cambia l'area di destra inserendo un iframe dinamico o ripristinando la dashboard nativa
function caricaProceduraEsterna(nomePagina) {
    const dashboardView = document.getElementById("dashboard-view");
    const procedureView = document.getElementById("procedure-view");

    if (nomePagina === "dashboard") {
        procedureView.style.display = "none";
        procedureView.innerHTML = "";
        dashboardView.style.display = "block";
    } else {
        const percorso = risolviPercorso(nomePagina);
        dashboardView.style.display = "none";
        procedureView.style.display = "block";
        procedureView.innerHTML = `<iframe src="${percorso}" class="procedure-iframe" title="${nomePagina}"></iframe>`;
    }
}

//=========================================================
// CONFIGURAZIONE GRAFICI CHART.JS
//=========================================================
function createPaymentChart() {
    new Chart(document.getElementById("chartPayment"), {
        type: "doughnut",
        data: {
            labels: ["Interamente saldate", "Parzialmente saldate", "Da saldare"],
            datasets: [{ data: [53, 20, 9], backgroundColor: ["#0084FF", "#74B9FF", "#A5D8FF"], borderWidth: 0 }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: "70%", plugins: { legend: { position: "right" } } }
    });
}

function createChannelChart() {
    new Chart(document.getElementById("chartChannel"), {
        type: "doughnut",
        data: {
            labels: ["Prenotazioni Offline", "Prenotazioni Widget", "Prenotazioni Portale"],
            datasets: [{ data: [62, 30, 20], backgroundColor: ["#F39C12", "#F1C40F", "#FDEBD0"], borderWidth: 0 }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: "70%", plugins: { legend: { position: "right" } } }
    });
}

function createPresenceChart() {
    new Chart(document.getElementById("chartLine1"), {
        type: "line",
        data: {
            labels: ["10 Nov", "11 Nov", "12 Nov", "13 Nov", "14 Nov", "15 Nov", "16 Nov", "17 Nov"],
            datasets: [{ label: "Presenze", data: [100, 140, 130, 155, 150, 175, 160, 200], borderColor: "#0084FF", backgroundColor: "transparent", borderWidth: 2, tension: 0.4 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 240 } } }
    });
}

function createArrivalChart() {
    new Chart(document.getElementById("chartLine2"), {
        type: "line",
        data: {
            labels: ["10 Nov", "11 Nov", "12 Nov", "13 Nov", "14 Nov", "15 Nov", "16 Nov", "17 Nov"],
            datasets: [
                { label: "Arrivi", data: [40, 90, 60, 85, 70, 110, 140, 90], borderColor: "#74B9FF", backgroundColor: "transparent", borderWidth: 2, tension: 0.4 },
                { label: "Partenze", data: [20, 45, 55, 30, 85, 40, 95, 110], borderColor: "#A5A5A5", backgroundColor: "transparent", borderWidth: 2, tension: 0.4 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } }, scales: { y: { beginAtZero: true, max: 240 } } }
    });
}

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