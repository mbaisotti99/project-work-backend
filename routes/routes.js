const express = require("express")

const {getDoc, getAllDocs} = require("../controllers/functions")

const router = express.Router()


router.get("/:id", getDoc)
router.get("/", getAllDocs)


module.exports = router