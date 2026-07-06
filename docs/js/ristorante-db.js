import { loadTable, saveTableRow, deleteTableRow } from './winbeach-db.js';
import { updateDbBar } from './winbeach-module.js';

const TABELLE = {
    sale: ['nome'],
    tavoli: ['salaId', 'numero', 'posti', 'posizione', 'stato'],
    categorie: ['nome', 'stampante', 'immagine'],
    prodotti: ['nome', 'prezzo', 'categoriaId', 'attivo', 'immagine', 'varianti'],
};

let statoRistorante = {
    sale: [],
    tavoli: [],
    categorie: [],
    prodotti: [],
    impostazioni: {}
};

export async function loadRistoranteFromDb() {
    try {
        const risultati = await Promise.all([
            loadTable('sale'),
            loadTable('tavoli'),
            loadTable('categorie'),
            loadTable('prodotti'),
            loadTable('impostazioni_ristorante'),
        ]);

        statoRistorante.sale = risultati[0].ok ? risultati[0].data : [];
        statoRistorante.tavoli = risultati[1].ok ? risultati[1].data : [];
        statoRistorante.categorie = risultati[2].ok ? risultati[2].data : [];
        statoRistorante.prodotti = risultati[3].ok ? risultati[3].data : [];

        statoRistorante.impostazioni = {};
        if (risultati[4].ok) {
            for (const r of risultati[4].data) {
                statoRistorante.impostazioni[r.chiave] = r.valore;
            }
        }

        updateDbBar(true);
        return statoRistorante;
    } catch (error) {
        console.error("Errore nel caricamento dell'archivio ristorante:", error);
        updateDbBar(false);
        return null;
    }
}

export function getTavoliDivisiPerSale() {
    if (!statoRistorante.sale) return [];
    return statoRistorante.sale.map(sala => ({
        ...sala,
        tavoli: statoRistorante.tavoli ? statoRistorante.tavoli.filter(t => t.salaId === sala.id) : []
    }));
}

export function selezionaTavolo(tavoloId) {
    if (!statoRistorante.tavoli) return null;
    return statoRistorante.tavoli.find(t => t.id === Number(tavoloId)) || null;
}

export function getImpostazioniRistorante() {
    return { ...statoRistorante.impostazioni };
}

export async function saveImpostazioneRistorante(chiave, valore) {
    try {
        const res = (await loadTable('impostazioni_ristorante'));
        const rows = res.ok ? res.data : [];
        const existing = rows.find(r => r.chiave === chiave);

        const item = existing
            ? { ...existing, valore: String(valore) }
            : { id: (rows.length > 0 ? Math.max(...rows.map(r => Number(r.id) || 0)) + 1 : 1), chiave, valore: String(valore) };

        const saveRes = await saveTableRow('impostazioni_ristorante', item, ['chiave', 'valore'], rows);
        if (saveRes.ok) {
            statoRistorante.impostazioni[chiave] = String(valore);
        }
        return saveRes.ok;
    } catch (e) {
        console.error(`Errore salvataggio impostazione ${chiave}:`, e);
        return false;
    }
}

export async function saveRistoranteItemToDb(tipo, item) {
    try {
        const fields = TABELLE[tipo];
        if (!fields) return false;

        if (!statoRistorante[tipo]) statoRistorante[tipo] = [];

        const res = await saveTableRow(tipo, item, fields, statoRistorante[tipo]);
        if (!res.ok) return false;

        const idx = statoRistorante[tipo].findIndex(x => x.id === res.id);
        const updated = { ...item, id: res.id };
        if (idx !== -1) {
            statoRistorante[tipo][idx] = updated;
        } else {
            statoRistorante[tipo].push(updated);
        }

        updateDbBar(true);
        return true;
    } catch (e) {
        console.error(`Errore durante il salvataggio in ${tipo}:`, e);
        updateDbBar(false);
        return false;
    }
}

export async function deleteRistoranteItemFromDb(tipo, id) {
    try {
        if (!statoRistorante[tipo]) return false;

        const res = await deleteTableRow(tipo, id);
        if (!res.ok) return false;

        statoRistorante[tipo] = statoRistorante[tipo].filter(x => x.id !== Number(id));

        if (tipo === 'sale') {
            const tavoliDaEliminare = statoRistorante.tavoli.filter(t => t.salaId === Number(id));
            for (const t of tavoliDaEliminare) {
                await deleteTableRow('tavoli', t.id);
            }
            statoRistorante.tavoli = statoRistorante.tavoli.filter(t => t.salaId !== Number(id));
        }

        if (tipo === 'categorie') {
            const prodottiDaEliminare = statoRistorante.prodotti.filter(
                p => p.categoriaId === id || p.categoriaId === Number(id)
            );
            for (const p of prodottiDaEliminare) {
                await deleteTableRow('prodotti', p.id);
            }
            statoRistorante.prodotti = statoRistorante.prodotti.filter(
                p => p.categoriaId !== id && p.categoriaId !== Number(id)
            );
        }

        updateDbBar(true);
        return true;
    } catch (e) {
        console.error(`Errore durante l'eliminazione da ${tipo}:`, e);
        updateDbBar(false);
        return false;
    }
}

export async function saveTavoloToDb(tavolo) {
    return await saveRistoranteItemToDb('tavoli', tavolo);
}

export function getStatoRistorante() {
    return statoRistorante;
}
