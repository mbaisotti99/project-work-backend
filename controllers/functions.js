const connection = require("../data/doc_db")
const { generateSlug } = require("../utils/generateSlug")

// INDEX
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

// SHOW
const showMed = (req, resp, next) => {
    const sql = ` SELECT * FROM medici; `;


    const id = parseInt(req.params.id)
    if (!isNaN(id)) {
        connection.query(sql, (err) => {
            if (err) {
                return next(new Error("Internal Server Error"));
            } else {
                const sql2 = `  SELECT *
                                FROM medici
                                WHERE id = ?                
                `
                connection.query(sql2, [id], (err, results) => {
                    if (err) {
                        return next(new Error("Internal Server Error"))
                    } else if (results.length !== 0) {
                        return resp.status(200).json({
                            message: "Medico Trovato",
                            data: results
                        })
                    } else {
                        return resp.status(404).json({
                            message: "Medico NON Trovato"
                        })
                    }



                })
            }
        })
    } else {
        return resp.status(500).json({
            message: "Id non valido"
        })
    }
}

// SHOW RECENSIONI
const showRev = (req, resp, next) => {
    const sql =
        `
        SELECT *
        FROM recensioni
        JOIN medici
        ON medici.id = recensioni.id_medico
        JOIN utenti
        ON utenti.id = recensioni.id_utente
    `

    connection.query(sql, (err) => {
        if (err) {
            return next(new Error("Errore del server"))
        } else {

            const id = parseInt(req.params.id)

            const sql2 = `
                SELECT medici.nome AS nome_medico, medici.cognome AS cognome_medico, 
                utenti.nome_utente AS utente, recensioni.recensione, recensioni.voto
                FROM recensioni
                JOIN medici ON medici.id = recensioni.id_medico
                JOIN utenti ON utenti.id = recensioni.id_utente
                WHERE medici.id = ?; `;


            if (!isNaN(id)) {
                connection.query(sql2, [id], (err, reviews) => {
                    if (err) {
                        return next(new Error("Errore del server"))
                    } else {
                        resp.status(200).json({
                            message: "Recensioni trovate",
                            data: reviews
                        })
                    }
                })
            } else {
                return resp.status(500).json({
                    message: "Id non valido"
                })
            }
        }
    })
}

// STORE
const store = (req, res, next) => {

    const { nome, cognome, email, telefono, indirizzo, citta, specializzazione } = req.body;

    // Validazione tutti i campi
    if (!nome || !cognome || !email || !telefono || !indirizzo || !specializzazione) {
        return res.status(400).json({ status: "fail", message: "Tutti i campi sono obbligatori" });
    }

    // Validazione nome
    if (nome.length < 3) {
        return res.status(400).json({ status: "fail", message: "Il nome deve avere almeno 3 caratteri" });
    }

    // Validazione cognome
    if (cognome.length < 3) {
        return res.status(400).json({ status: "fail", message: "Il cognome deve avere almeno 3 caratteri" });
    }

    // Validazione indirizzo
    if (indirizzo.length < 5) {
        return res.status(400).json({ status: "fail", message: "L'indirizzo deve avere almeno 5 caratteri" });
    }

    // Validazione email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ status: "fail", message: "L'email inserita non è valida" });
    }

    // Validazione telefono
    const telefonoRegex = /^\+[0-9]+$/;
    if (!telefonoRegex.test(telefono)) {
        return res.status(400).json({ status: "fail", message: "Il numero di telefono può contenere solo numeri e '+' all'inizio" });
    }

    // Genera Slug con nome e cognome
    const slug = generateSlug(nome, cognome);

    // Check se il slug esiste gia'
    const checkSlug = "SELECT * FROM medici WHERE slug = ?";

    const checkMail = `SELECT email FROM medici`

    connection.query(checkMail, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "errore",
                err: err.stack
            })
        } else {
            results.forEach((curMail) => {
                if (curMail.email == email) {
                    return res.status(400).json({
                        message:"Mail già presente nel sistema"
                    })
                } 
            })
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

module.exports = { indexMed, showMed, showRev, store }