const connection = require("../data/doc_db")

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
const showRev = (err, req, resp, next) => {
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
                SELECT medici.nome as nome_medico, medici.cognome as cognome_medico, utenti.nome_utente as utente, recensioni.recensione, recensioni.voto
                FROM recensioni
                JOIN medici
                ON medici.id = recensioni.id_medico
                JOIN utenti
                ON utenti.id = recensioni.id_utente
            `
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


const createMed = (req, resp, next) => {
    const { nome, cognome, mail, cell, indirizzo, spec } = req.body
    const mailDupes = []
    const sql = `
        INSERT INTO medici (nome, cognome, email, telefono, indirizzo, specializzazione)
        VALUES (?, ?, ?, ?, ?, ?)
    `

    const controlSql = `SELECT email FROM medici WHERE email = ?`
    connection.query(controlSql, [mail], (err, result) => {
        if (err) {
            return next(new Error("Errore nel controllo"))
        } else if (result.length !== 0) {
            return resp.send(500).json({
                message: "Mail già presente"
            })
        } else {
            connection.query(sql, [nome, cognome, mail, cell, indirizzo, spec], (err, results) => {
                if (err) {
                    return next(new Error("Medico non caricato"))
                } else {
                    return resp.status(500).json({
                        message: "OK! Medico caricato"
                    })
                }
            })
        }
    })

}


module.exports = { indexMed, showMemodule, createMed, showRev }