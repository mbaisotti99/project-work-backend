// DATA
const mysql = require("mysql2")
const { PASSWORD, DB_NAME } = process.env

// CONNECTION
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: PASSWORD,
    database: DB_NAME
})

connection.connect((err) => {
    if (err) throw err;
    console.log("Connesso al DB", DB_NAME);
})

// EXPORT
module.exports = connection;