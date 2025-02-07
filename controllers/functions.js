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

// Store
const store = (req, res, next) => {

    const { nome, cognome, email, telefono, indirizzo, specializzazione } = req.body;


    // Name Validation
    if (!nome || nome.length < 3) {
        return res.status(400).json({
            status: "fail",
            message: "Name should be at least 3 characters long"
        });
    }


    const sql = `
    INSERT INTO medici(nome, cognome, email, telefono, indirizzo, specializzazione)
    VALUES(?, ?, ?, ?, ?, ?);
    `;

    connection.query(sql, [nome, cognome, email, telefono, indirizzo, specializzazione], (err, results) => {

        if (err) {
            return next(new Error("Internal Server Error"))
        }

        return res.status(201).json({
            status: "success",
            message: "Saved successfully!",
        })

    })

}

module.exports = { indexMed, showMed, showRev, store }