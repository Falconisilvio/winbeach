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
 * Se non sono presenti dati, inizializza un archivio vuoto e pulito senza dati demo forzati.
 */
export async function loadRistoranteFromDb() {
    try {
        // Recupera i dati salvati nel LocalStorage per garantire la prima persistenza locale
        const datiSalvati = localStorage.getItem('winbeach_archivio_ristorante');
        
        if (datiSalvati) {
            statoRistorante = JSON.parse(datiSalvati);
        } else {
            // STRUTTURA PULITA: Nessun dato demo forzato che si rigenera da solo
            statoRistorante = {
                sale: [],
                tavoli: [],
                categorie: [],
                prodotti: []
            };
            
            // Salva lo stato vuoto iniziale nel localStorage
            localStorage.setItem('winbeach_archivio_ristorante', JSON.stringify(statoRistorante));
        }
        
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
    if (!statoRistorante.sale) return [];
    return statoRistorante.sale.map(sala => {
        return {
            ...sala,
            tavoli: statoRistorante.tavoli ? statoRistorante.tavoli.filter(t => t.salaId === sala.id) : []
        };
    });
}

/**
 * Seleziona un tavolo specifico tramite ID
 */
export function selezionaTavolo(tavoloId) {
    if (!statoRistorante.tavoli) return null;
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
            // Nota di compatibilità: gestisce sia ID numerici che stringhe (nomi di categoria)
            statoRistorante.prodotti = statoRistorante.prodotti.filter(p => p.categoriaId !== id && p.categoriaId !== Number(id));
        }

        // Aggiorna il LocalStorage
        localStorage.setItem('winbeach_archivio_ristorante', JSON.stringify(statoRistorante));

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
