// DATA
const connection = require("../data/doc_db")
const { generateSlug } = require("../utils/generateSlug")


// INDEX MEDICI
const indexMed = (req, resp, next) => {

    const filters = req.query;

    let sql = `
        SELECT 
            medici.id,
            medici.slug,
            medici.nome,
            medici.cognome,
            medici.email,
            medici.telefono,
            medici.indirizzo,
            medici.citta,
            medici.immagine,
            specializzazioni.nome_specializzazione AS specializzazione
        FROM medici
        JOIN specializzazioni ON medici.id_specializzazione = specializzazioni.id
    `;

    const params = [];
    const conditions = [];

    if (filters.search) {
        conditions.push("medici.nome LIKE ? OR medici.cognome LIKE ?");
        params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.specializzazione) {
        conditions.push("specializzazioni.nome_specializzazione = ?");
        params.push(filters.specializzazione);
    }

    if (conditions.length > 0) {
        sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    sql += ` ORDER BY medici.id`;

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

    const sql = `
        SELECT 
            medici.id,
            medici.slug,
            medici.nome,
            medici.cognome,
            medici.email,
            medici.telefono,
            medici.indirizzo,
            medici.citta,
            medici.immagine,
            specializzazioni.nome_specializzazione AS specializzazione,
            ROUND(COALESCE(AVG(recensioni.voto), 0), 1) AS media_voti
        FROM medici
        JOIN specializzazioni ON medici.id_specializzazione = specializzazioni.id
        LEFT JOIN recensioni ON medici.id = recensioni.id_medico
        WHERE medici.slug = ?
        GROUP BY medici.id ;`

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
            data: medici[0],
        });
    });

};

// SHOW RECENSIONI
const showRev = (req, resp, next) => {

    const slug = req.params.slug;

    const sql = `    
        SELECT 
            medici.nome AS nome_medico,
            medici.cognome AS cognome_medico, 
            recensioni.recensione, 
            recensioni.voto,
            recensioni.nome_utente,
            recensioni.email_utente
        FROM recensioni
        JOIN medici ON medici.id = recensioni.id_medico
        WHERE medici.slug = ?
        ORDER BY recensioni.id DESC; 
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

    });

};

// STORE MEDICI
const storeMed = (req, res, next) => {

    const imageName = req.file.filename;
    const { nome, cognome, email, telefono, indirizzo, citta, specializzazione } = req.body;

    // VALIDAZIONE FILE
    if (!req.file || !req.file.filename) {

        return res.status(400).json({
            status: "fail",
            message: "An image is required"
        });

    }

    // VALIDAZIONE TUTTI I CAMPI
    if (!nome || !cognome || !email || !telefono || !indirizzo || !citta || !specializzazione) {

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

    // RECUPERA NOME SPECIALIZZAZIONE
    const getSpecializzazioneQuery = "SELECT nome_specializzazione FROM specializzazioni WHERE id = ?";

    connection.query(getSpecializzazioneQuery, [specializzazione], (err, results) => {

        if (err) return next(err);

        if (results.length === 0) {

            return res.status(400).json({
                status: "fail",
                message: "Specializzazione non trovata"
            });

        }

        const nome_specializzazione = results[0].nome_specializzazione;

        // CHECK EMAIL
        const checkMail = "SELECT email FROM medici WHERE email = ?";

        connection.query(checkMail, [email], (err, results) => {

            if (err) return res.status(500).json({ message: "Errore del server", error: err.stack });

            if (results.length > 0) {
                return res.status(400).json({ message: "Mail già presente nel sistema" });
            }

            // GENERAZIONE SLUG BASE
            let baseSlug = generateSlug(cognome, nome_specializzazione);

            // CONTROLLO SLUG
            const checkSimilarSlugs = "SELECT slug FROM medici WHERE slug LIKE ?";

            connection.query(checkSimilarSlugs, [`${baseSlug}%`], (err, slugResults) => {

                if (err) return next(err);

                let finalSlug = baseSlug;

                // SE SLUG ESISTE AGGIUNGE NUMERO
                if (slugResults.length > 0) {

                    let maxNumber = 0;

                    slugResults.forEach(result => {

                        const match = result.slug.match(/-(\d+)$/); // result.slug.match(/-(\d+)$/) cerca un pattern alla fine dello slug
                        // -(\d+)$ significa:
                        // - un trattino (-)
                        // (\d+) uno o più numeri
                        // $ la fine della stringa
                        if (match) {

                            const num = parseInt(match[1]);

                            if (num > maxNumber) {
                                maxNumber = num;
                            }

                        }
                    });

                    finalSlug = `${baseSlug}-${maxNumber + 1}`;

                }

                // INSERIMENTO MEDICO
                const sql = `
                    INSERT INTO medici (slug, nome, cognome, email, telefono, indirizzo, citta, id_specializzazione, immagine)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
                `;

                connection.query(sql, [finalSlug, nome, cognome, email, telefono, indirizzo, citta, specializzazione, imageName], (err, results) => {

                    if (err) return next(err);

                    return res.status(201).json({
                        status: "success",
                        message: "Medico salvato con successo!",
                    });

                });

            });

        });

    });

}

// STORE REVIEW
const storeRev = (req, res, next) => {

    const { slug } = req.params;
    const { nome_utente, email_utente, recensione, voto } = req.body;

    // VALIDAZIONE INPUT
    if (!slug || !nome_utente || !email_utente || !recensione || !voto) {
        return res.status(400).json({
            status: "fail",
            message: "Tutti i campi sono obbligatori"
        });
    }

    // VALIDAZIONE VOTO
    if (voto < 1 || voto > 5) {
        return res.status(400).json({
            status: "fail",
            message: "Il voto deve essere compreso tra 1 e 5"
        });
    }

    // VALIDAZIONE EMAIL
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email_utente)) {
        return res.status(400).json({
            status: "fail",
            message: "L'email inserita non è valida"
        });
    }

    // CERCA MEDICO CON SLUG
    const sqlFindMedico = `SELECT id FROM medici WHERE slug = ?`;

    connection.query(sqlFindMedico, [slug], (err, resultsMedico) => {

        if (err) return next(new Error("Errore del server"));

        if (resultsMedico.length === 0) {
            return res.status(404).json({
                status: "fail",
                message: "Medico non trovato"
            });
        }

        const id_medico = resultsMedico[0].id;

        // CONTROLLO SE GIA' RECENSITO
        const checkExistingReview = `
            SELECT id FROM recensioni 
            WHERE id_medico = ? AND email_utente = ?
        `;

        connection.query(checkExistingReview, [id_medico, email_utente], (err, existingReview) => {

            if (err) return next(new Error("Errore del server"));

            if (existingReview.length > 0) {
                return res.status(400).json({
                    status: "fail",
                    message: "Hai già recensito questo medico"
                });
            }

            // INSERISCI RECENSIONE
            const sqlInsertReview = `
                INSERT INTO recensioni (id_medico, nome_utente, email_utente, recensione, voto)
                VALUES (?, ?, ?, ?, ?);
            `;

            connection.query(sqlInsertReview, [id_medico, nome_utente, email_utente, recensione, voto], (err, result) => {

                if (err) return next(new Error("Errore del server"));

                return res.status(201).json({
                    status: "success",
                    message: "Recensione aggiunta con successo!"
                });

            });

        });

    });

};



const nodemailer = require("nodemailer")

let transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PSW
    }
})


const sendMail = (req, resp, next) => {
    const { slug } = req.params
    const { subject, text } = req.body;

    const sql = `
        SELECT email FROM medici WHERE slug = ?
    `
    connection.query(sql, [slug], (err, result) => {

        console.log(slug);
        console.log(result);
        

        if (subject && text){
            try {
            transport.sendMail({
                from: "gruppo7@esempio.it", // Email mittente
                to: result[0].email, // Email destinatario
                subject, // Oggetto email
                text, // Testo email
            });
            return resp.status(200).json({
                message:`Mail inviata a ${result[0].email}`
            })
        }
        catch (err) {
            resp.status(500).json({
                message: "Errore del server",
                errore: err.stack
            })
        }
    } else {
        return resp.status(500).json({
            message:"Rilevati campi vuoti"
        })
    }
    });
}

// CERCA SPECIALIZZAZIONI
const getSpecializzazioni = (req, res, next) => {
    const sql = "SELECT * FROM specializzazioni";
    
    connection.query(sql, (err, results) => {
        if (err) {
            return next(new Error("Errore del server"));
        }
        
        res.status(200).json(results);
    });
};


    // EXPORT
    module.exports = {
        indexMed,
        showMed,
        showRev,
        storeMed,
        storeRev,
        sendMail,
        getSpecializzazioni,
    }