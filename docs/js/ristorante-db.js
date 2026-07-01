import { getToken } from './winbeach-db.js';
import { updateDbBar } from './winbeach-module.js';

// Stato in memoria locale del modulo Ristorante, sincronizzato con l'archivio
let statoRistorante = {
    sale: [],
    tavoli: [],
    categorie: [],
    prodotti: []
};

/**
 * Carica l'intero archivio del ristorante dal Database/LocalStorage.
 * Se non sono presenti dati, inizializza delle voci di esempio predefinite.
 */
export async function loadRistoranteFromDb() {
    const token = getToken();
    try {
        // Recupera i dati salvati nel LocalStorage per garantire la persistenza locale
        const datiSalvati = localStorage.getItem('winbeach_archivio_ristorante');
        
        if (datiSalvati) {
            statoRistorante = JSON.parse(datiSalvati);
        } else {
            // Inizializzazione dati predefiniti di fallback se l'archivio è totalmente vuoto
            statoRistorante.sale = [
                { id: 1, nome: "Sala Interna" },
                { id: 2, nome: "Terrazza Mare" }
            ];
            
            statoRistorante.tavoli = [
                { id: 101, numero: "1", salaId: 1, stato: "libero", comanda: [] },
                { id: 102, numero: "2", salaId: 1, stato: "libero", comanda: [] },
                { id: 201, numero: "10", salaId: 2, stato: "libero", comanda: [] }
            ];

            statoRistorante.categorie = [
                { id: 10, nome: "Ristorante" },
                { id: 11, nome: "Bevande" }
            ];

            statoRistorante.prodotti = [
                { id: 50, nome: "Acqua Minerale 1L", prezzo: 2.50, categoriaId: 11 },
                { id: 51, nome: "Spaghetti allo Scoglio", prezzo: 15.00, categoriaId: 10 }
            ];
            
            // Salva lo stato iniziale nel localStorage
            localStorage.setItem('winbeach_archivio_ristorante', JSON.stringify(statoRistorante));
        }

        // Se nel tuo backend hai endpoint API reali attivi, puoi scommentare la parte sotto:
        /*
        const response = await fetch('/api/ristorante', { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        if (response.ok) {
            statoRistorante = await response.json();
        }
        */
        
        updateDbBar(true); // Aggiorna la barra di stato del DB nell'interfaccia principale
        return statoRistorante;
    } catch (error) {
        console.error("Errore nel caricamento dell'archivio ristorante:", error);
        updateDbBar(false);
        return null;
    }
}

/**
 * Ritorna l'elenco delle sale mappando al loro interno i relativi tavoli appartenenti
 */
export function getTavoliDivisiPerSale() {
    return statoRistorante.sale.map(sala => {
        return {
            ...sala,
            tavoli: statoRistorante.tavoli.filter(t => t.salaId === sala.id)
        };
    });
}

/**
 * Seleziona un tavolo specifico tramite ID
 */
export function selezionaTavolo(tavoloId) {
    return statoRistorante.tavoli.find(t => t.id === Number(tavoloId)) || null;
}

/**
 * Salva o aggiorna un elemento specifico (sale, tavoli, categorie, prodotti) 
 * all'interno dell'archivio persistente
 */
export async function saveRistoranteItemToDb(tipo, item) {
    try {
        if (!statoRistorante[tipo]) statoRistorante[tipo] = [];
        
        const idx = statoRistorante[tipo].findIndex(x => x.id === item.id);
        if (idx !== -1) {
            // Aggiorna l'elemento esistente
            statoRistorante[tipo][idx] = item;
        } else {
            // Inserisce il nuovo elemento
            statoRistorante[tipo].push(item);
        }

        // Rende persistente la modifica salvando su LocalStorage
        localStorage.setItem('winbeach_archivio_ristorante', JSON.stringify(statoRistorante));

        // Predisposizione per sincronizzazione Cloud (Fetch API)
        /*
        await fetch(`/api/ristorante/${tipo}`, { 
            method: 'POST', 
            body: JSON.stringify(item), 
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}` 
            } 
        });
        */

        updateDbBar(true);
        return true;
    } catch (e) {
        console.error(`Errore durante il salvataggio in ${tipo}:`, e);
        updateDbBar(false);
        return false;
    }
}

/**
 * Rimuove in modo permanente un elemento dall'archivio tramite il suo ID e tipo
 */
export async function deleteRistoranteItemFromDb(tipo, id) {
    try {
        if (!statoRistorante[tipo]) return false;
        
        // Filtra via l'elemento rimosso
        statoRistorante[tipo] = statoRistorante[tipo].filter(x => x.id !== Number(id));
        
        // Cascade Delete Logico: se eliminiamo una sala, rimuoviamo anche i suoi tavoli
        if (tipo === 'sale') {
            statoRistorante.tavoli = statoRistorante.tavoli.filter(t => t.salaId !== Number(id));
        }
        
        // Cascade Delete Logico: se eliminiamo una categoria, rimuoviamo i relativi prodotti
        if (tipo === 'categorie') {
            statoRistorante.prodotti = statoRistorante.prodotti.filter(p => p.categoriaId !== Number(id));
        }

        // Aggiorna il LocalStorage
        localStorage.setItem('winbeach_archivio_ristorante', JSON.stringify(statoRistorante));

        // Predisposizione per sincronizzazione Cloud (Fetch API)
        /*
        await fetch(`/api/ristorante/${tipo}/${id}`, { 
            method: 'DELETE', 
            headers: { 'Authorization': `Bearer ${getToken()}` } 
        });
        */

        updateDbBar(true);
        return true;
    } catch (e) {
        console.error(`Errore durante l'eliminazione da ${tipo}:`, e);
        updateDbBar(false);
        return false;
    }
}

/**
 * Funzione d'appoggio rapida dedicata esclusivamente al salvataggio dello stato dei tavoli 
 * (es: cambi di stato o aggiornamento righe comanda dalla cassa touch)
 */
export async function saveTavoloToDb(tavolo) {
    return await saveRistoranteItemToDb('tavoli', tavolo);
}
