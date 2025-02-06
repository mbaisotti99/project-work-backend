const express = require('express');
const routes = require("./routes/routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

require("dotenv").config(); // Assicurati di caricare le variabili d'ambiente
const port = process.env.SERVER_PORT || 3000; // Valore di default se la variabile non è definita

app.use(express.json());
app.use(express.static("public"));

app.use("/medici", routes);

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);

});