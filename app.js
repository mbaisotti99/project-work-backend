const express = require("express")
const routes = require("./routes/routes")
const {notFound} = require("./controllers/functions")

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(express.static("public"))

app.use("/doctors", routes)

app.use(notFound)

app.listen(port, ()=>{
    console.log("Server is listening");
    
})