const generateSlug = (nome, cognome) => {
    return `${nome} ${cognome}` // Combina nome e cognome
        .toLowerCase() // Converte in minuscolo
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Rimuove accenti
        .replace(/[^a-z0-9\s]/g, "") // Rimuove caratteri speciali
        .replace(/\s+/g, "-"); // Sostituisce spazi con trattini
};

// EXPORT
module.exports = {
    generateSlug,
}