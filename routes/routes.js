import express from "express"

import {getDoc, getAllDocs} from "../controllers/functions"

const router = express.Router()

module.exports = router

router.get("/:id", getDoc)
router.get("/", getAllDocs)