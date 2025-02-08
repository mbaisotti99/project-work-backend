// DATA
const connection = require("../data/doc_db")
const { generateSlug } = require("../utils/generateSlug")

// INDEX MEDICI
const indexMed = (req, resp, next) => {

    const filters = req.query;

    let sql = ` SELECT * FROM medici `

    const params = [];
    const conditions = [];

    if (filters.search) {
        conditions.push("nome LIKE ? OR cognome LIKE ?");
        params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.specializzazione) {
        conditions.push("specializzazione = ?");
        params.push(filters.specializzazione);
    }

    if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    connection.query(sql, params, (err, docs) => {

        if (err) {
            return next(new Error("Errore del server"))
        } else {
            resp.status(200).json({
                message: "Medici trovati",
                data: docs
            })
        }

    })

}

// SHOW MEDICI
const showMed = (req, res, next) => {

    const sql = ` SELECT * FROM medici
                  WHERE slug = ? ; `;

    const slug = req.params.slug;

    connection.query(sql, [slug], (err, medici) => {

        if (err) return next(new Error("Internal Server Error"));

        if (medici.length === 0) {
            return res.status(404).json({
                status: "fail",
                message: "Dottore non trovato",
            });
        }

        return res.status(200).json({
            status: "success",
            data: {
                status: "success",
                data: medici,
            }
        })

    })

}

// SHOW RECENSIONI
const showRev = (req, resp, next) => {

    const slug = req.params.slug;

    const sql = `    
        SELECT  medici.nome AS nome_medico,
                medici.cognome AS cognome_medico, 
                utenti.nome_utente AS utente,
                recensioni.recensione, 
                recensioni.voto
        FROM recensioni
        JOIN medici ON medici.id = recensioni.id_medico
        JOIN utenti ON utenti.id = recensioni.id_utente
        WHERE medici.slug = ?; 
    `;

    connection.query(sql, [slug], (err, recensioni) => {

        if (err) {
            return next(new Error("Errore del server"))
        }

        if (recensioni.length === 0) {
            return resp.status(404).json({
                status: "fail",
                message: "Nessuna recensione trovata per questo medico",
            });
        }

        return resp.status(200).json({
            status: "success",
            data: recensioni,
        });

    })

}

// STORE MEDICI
const storeMed = (req, res, next) => {

    const { nome, cognome, email, telefono, indirizzo, citta, specializzazione } = req.body;

    // VALIDAZIONE TUTTI I CAMPI
    if (!nome || !cognome || !email || !telefono || !indirizzo || !specializzazione) {
        return res.status(400).json({
            status: "fail",
            message: "Tutti i campi sono obbligatori"
        });
    }

    // VALIDAZIONE NOME
    if (nome.length < 3) {
        return res.status(400).json({
            status: "fail",
            message: "Il nome deve avere almeno 3 caratteri"
        });
    }

    // VALIDAZIONE COGNOME
    if (cognome.length < 3) {
        return res.status(400).json({
            status: "fail",
            message: "Il cognome deve avere almeno 3 caratteri"
        });
    }

    // VALIDAZIONE INDIRIZZO
    if (indirizzo.length < 5) {
        return res.status(400).json({
            status: "fail",
            message: "L'indirizzo deve avere almeno 5 caratteri"
        });
    }

    // VALIDAZIONE EMAIL
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            status: "fail",
            message: "L'email inserita non è valida"
        });
    }

    // VALIDAZIONE TELEFONO
    const telefonoRegex = /^\+[0-9]+$/;
    if (!telefonoRegex.test(telefono)) {
        return res.status(400).json({
            status: "fail",
            message: "Il numero di telefono può contenere solo numeri e '+' all'inizio"
        });
    }

    // GENERA SLUG CON NOME E COGNOME
    const slug = generateSlug(nome, cognome);

    // CHECK SE ESISTE GIA IL SLUG
    const checkSlug = "SELECT * FROM medici WHERE slug = ?";

    const checkMail = "SELECT email FROM medici WHERE email = ?";


    connection.query(checkMail, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Errore del server", error: err.stack });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: "Mail già presente nel sistema" });
        }

        // console.log(results);


        connection.query(checkSlug, [slug], (err, results) => {
            if (err) return next(err);

            if (results.length > 0) {

                return res.status(409).json({
                    status: "fail",
                    message: "Esiste già un medico con questo nome e cognome"
                });
            }

            const sql = `
                    INSERT INTO medici (slug, nome, cognome, email, telefono, indirizzo, citta, specializzazione)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
                `;

            connection.query(sql, [slug, nome, cognome, email, telefono, indirizzo, citta, specializzazione], (err, results) => {
                if (err) return next(err);

                return res.status(201).json({
                    status: "success",
                    message: "Medico salvato con successo!",
                });
            });
        });
    }
    )

}

// EXPORT
module.exports = {
    indexMed,
    showMed,
    showRev,
    storeMed
}