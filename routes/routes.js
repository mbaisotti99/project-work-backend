const express = require("express")

const { indexMed, showRev, showMed, store } = require("../controllers/functions")

const router = express.Router()

router.get("/:id/recensioni", showRev)
router.get("/:id", showMed)
router.post("/", store)
router.get("/", indexMed)


module.exports = router;