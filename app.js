const express = require("express")
const routes = require("./routes/routes")
const {notFound} = require("./controllers/functions")

const app = express()
const port = process.env.SERVER_PORT

app.use(express.json())
app.use(express.static("public"))

app.use("/medici", routes)

app.use(notFound)

app.listen(port, ()=>{
    console.log(`Server is listening on port ${port}`);
    
})