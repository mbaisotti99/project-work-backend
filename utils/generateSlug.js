const generateSlug = (cognome, specializzazione) => {
    return `dr-${cognome}-${specializzazione}`
        .toLowerCase() // Converte in minuscolo
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Rimuove accenti
        .replace(/[^a-z0-9\s-]/g, "") // Rimuove caratteri speciali eccetto trattini
        .replace(/\s+/g, "-") // Sostituisce spazi con trattini
        .replace(/-+/g, "-") // Evita trattini multipli consecutivi
        .trim(); // Rimuove eventuali spazi iniziali o finali
};

// EXPORT
module.exports = {
    generateSlug,
}