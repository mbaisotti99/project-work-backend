const connection = require("../data/doc_db")

const getDoc = (req, resp, next) => {
    const sql = `   SELECT * 
                    FROM medici
                    `


    const id = req.params.id
    connection.query(sql, (err) => {
        if (err) {
            return next(new Error("Errore del server"))
        } else {
            const sql2 = `  SELECT *
                            FROM medici
                            WHERE id = ?                
            `
            connection.query(sql2, [id], (err, results) => {
                if (err) {
                    // return next(new Error("Errore del server"))
                    return resp.status(500).json({
                        err: err.stack
                    })
                } else {
                    return resp.status(200).json({
                        message: "Medico Trovato",
                        data: results
                    })
                }
            })
        }
    })
}

const getAllDocs = (req, resp, next) => {
    const sql = `   SELECT * 
                    FROM medici    `

    connection.query(sql, (err, docs) => {
        if (err) {
            // return next(new Error("Errore del server"))
            return resp.status(500).json({
                err: err.stack
            })
        } else {
            resp.status(200).json({
                message: "Medici trovati",
                data: docs
            })
        }
    })
}

const getReviews = (req, resp, next) => {
    const sql =
        `
        SELECT *
        FROM recensione
        JOIN medici
        ON medici.id = recensione.id_medico
        JOIN utente
        ON utente.id = recensione.id_utente
    `

    connection.query(sql, (err) => {
        if (err) {
            return next(new Error("Errore del server"))
        } else {

            const id = req.params.id 

            const sql2 = `
                SELECT medici.nome as nome_medico, medici.cognome as cognome_medico, utente.nome_utente as utente, recensione.recensione, recensione.voto
                FROM recensione
                JOIN medici
                ON medici.id = recensione.id_medico
                JOIN utente
                ON utente.id = recensione.id_utente
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


const notFound = (resp) => {
    resp.status(404).json({
        message: "Route not found"
    })
}

module.exports = { getDoc, getAllDocs, getReviews, notFound }