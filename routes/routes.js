const express = require("express")

const { indexMed, showRev, showMed } = require("../controllers/functions")

const router = express.Router()

router.get("/", indexMed)
router.get("/:id", showMed)
router.get("/:id/recensioni", showRev)


module.exports = router;