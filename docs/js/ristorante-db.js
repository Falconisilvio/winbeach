import {
  getToken,
  // Assumiamo che winbeach-db.js esponga funzioni generiche o specifiche per le tabelle
  // Se le funzioni sono generiche (es. loadFromDb), usiamo quelle, altrimenti simuliamo la stessa struttura di clienti
} from './winbeach-db.js';
import { applyReadOnlyMode, onAuthChange } from './winbeach-auth.js';
import { t } from './app-i18n.js';
import { $, escapeHtml, initModule, updateDbBar } from './winbeach-module.js';

// Stato locale del modulo Ristorante
let statoRistorante = {
    sale: [],       // Es: [{id: 1, nome: "Sala Interna"}, {id: 2, nome: "Terrazza"}]
    tavoli: [],     // Es: [{id: 101, numero: "1", salaId: 1, stato: "libero", comanda: []}]
    categorie: [],  // Es: [{id: 10, nome: "Bevande"}, {id: 11, nome: "Primi"}]
    prodotti: []    // Es: [{id: 50, nome: "Acqua Minerale", prezzo: 2.50, categoriaId: 10}]
};

/**
 * Carica l'intero archivio del ristorante dal Database
 */
export async function loadRistoranteFromDb() {
    const token = getToken();
    try {
        // Riproduci la stessa logica di loadClientiFromDb adattata per il ristorante
        // In caso di API reali, farai le fetch dedicate. Qui predisponiamo la struttura strutturata:
        
        // Esempio di caricamento (sostituire con le chiamate fetch reali se necessario)
        // const response = await fetch('/api/ristorante', { headers: { 'Authorization': `Bearer ${token}` } });
        // const data = await response.json();
        
        // Per ora popoliamo con una struttura dati pronta all'uso divisa per sale
        statoRistorante.sale = [
            { id: 1, nome: "Sala Interna" },
            { id: 2, nome: "Terrazza Mare" }
        ];
        
        statoRistorante.tavoli = [
            { id: 101, numero: "1", salaId: 1, stato: "libero", comanda: [] },
            { id: 102, numero: "2", salaId: 1, stato: "occupato", comanda: [{ prodId: 50, qta: 2 }] },
            { id: 201, numero: "10", salaId: 2, stato: "libero", comanda: [] }
        ];

        statoRistorante.categorie = [
            { id: 10, nome: "Antipasti" },
            { id: 11, nome: "Primi Piatti" },
            { id: 12, nome: "Bevande" }
        ];

        statoRistorante.prodotti = [
            { id: 50, nome: "Acqua Naturale", prezzo: 2.50, categoriaId: 12 },
            { id: 51, nome: "Spaghetti allo Scoglio", prezzo: 15.00, categoriaId: 11 },
            { id: 52, nome: "Frittura di Paranza", prezzo: 18.00, categoriaId: 10 }
        ];

        updateDbBar(true); // Aggiorna la barra di stato del DB (modulo winbeach)
        return statoRistorante;
    } catch (error) {
        console.error("Errore nel caricamento dei dati ristorante:", error);
        updateDbBar(false);
        return null;
    }
}

/**
 * Ritorna i tavoli raggruppati per la sala di appartenenza
 */
export function getTavoliDivisiPerSale() {
    return statoRistorante.sale.map(sala => {
        return {
            ...sala,
            tavoli: statoRistorante.tavoli.filter(tavolo => tavolo.salaId === sala.id)
        };
    });
}

/**
 * Gestione del Click sul tavolo: Recupera o crea la comanda per il tavolo selezionato
 */
export function selezionaTavolo(tavoloId) {
    const tavolo = statoRistorante.tavoli.find(t => t.id === Number(tavoloId));
    if (!tavolo) return null;
    
    // Cambia lo stato in occupato se si apre una comanda
    if (tavolo.stato === "libero") {
        tavolo.stato = "occupato";
    }
    
    return tavolo; // Ritorna l'oggetto tavolo completo di .comanda corrente
}

/**
 * Salva le modifiche di un tavolo (es. cambio comanda) nel DB
 */
export async function saveTavoloToDb(tavolo) {
    const idx = statoRistorante.tavoli.findIndex(t => t.id === tavolo.id);
    if (idx !== -1) statoRistorante.tavoli[idx] = tavolo;
    // Qui andrà la chiamata fetch POST/PUT verso il database reale
    return true;
}