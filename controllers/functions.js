const connection = require("../data/doc_db")

// INDEX
const indexMed = (req, resp, next) => {
    const sql = `   SELECT * 
                    FROM medici    `

    connection.query(sql, (err, docs) => {
        if (err) {
            return next(new Error("Errore del server"))
            // return resp.status(500).json({
            //     err: err.stack
            // })
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


    const id = req.params.id
    connection.query(sql, (err) => {
        if (err) {
            return next(new Error("Internal Server Error"));
        } else {
            const sql2 = `  SELECT *
                            FROM medici
                            WHERE id = ?                
            `
            connection.query(sql2, [id], (err, results) => {
                if (err) throw new Error("Internal Server Error")


                return resp.status(200).json({
                    message: "Medico non Trovato", // Da rifare. nota: malfunzionante su postman
                    data: results
                })

            })
        }
    })
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

            const id = req.params.id

            const sql2 = `
                SELECT medici.nome as nome_medico, medici.cognome as cognome_medico, utenti.nome_utente as utente, recensioni.recensione, recensioni.voto
                FROM recensioni
                JOIN medici
                ON medici.id = recensioni.id_medico
                JOIN utenti
                ON utenti.id = recensioni.id_utente
            `

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
        }
    })
}

module.exports = { indexMed, showMed, showRev }