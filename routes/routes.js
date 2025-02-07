// DATA
const express = require("express");
const router = express.Router();
const { indexMed, showRev, showMed, storeMed } = require("../controllers/functions");

// ROUTES
router.get("/:slug/recensioni", showRev);
router.get("/:slug", showMed);
router.post("/", storeMed);
router.get("/", indexMed);

// EXPORT
module.exports = router;