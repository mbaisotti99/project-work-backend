import express from "express"
import routes from "./routes/routes"

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(express.static("public"))

app.use("/doctors", routes)

app.listen(port, ()=>{
    console.log("Server is listening");
    
})