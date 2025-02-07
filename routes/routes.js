const express = require("express")

const { indexMed, showRev, showMed, createMed } = require("../controllers/functions")

const router = express.Router()

router.get("/", indexMed)
router.post("/post", createMed)
router.get("/:id", showMed)
router.get("/:id/recensioni", showRev)


module.exports = router;