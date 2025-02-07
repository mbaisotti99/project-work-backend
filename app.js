// DATA
const express = require('express');
const routes = require("./routes/routes");
const errorHandler = require("./middleware/errorHandler");
const app = express();
const port = process.env.SERVER_PORT;

// EXPRESS JSON
app.use(express.json());

// STATIC
app.use(express.static("public"));

// ROUTES
app.use("/medici", routes);

// MIDDLEWARES
app.use(errorHandler);

// SERVER LISTEN
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});