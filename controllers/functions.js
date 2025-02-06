import { data } from "react-router"
import connection from "../data/doc_db"

const getDoc = (req, resp, next) =>{
    const sql = `   SELECT * 
                    FROM doctors
                    `


    const id = req.params.id
    connection.query(sql, (err, docs) =>{
        if (err) {
            return next(new Error("Errore del server"))
        } else {
            const sql2 = `  SELECT *
                            FROM doctors
                            WHERE id = ?                
            `
            connection.query(sql2, [id], (err, results) =>{
                if (err) {
                    return next(new Error("Errore del server"))
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
                    FROM doctors    `

    connection.query(sql, (err, docs) =>{
        if (err) {
            return next(new Error("Errore del server"))
        } else{
            resp.status(200).json({
                message: "Medici trovati",
                data: docs
            })
        }
    })
}

module.exports = {getDoc, getAllDocs}