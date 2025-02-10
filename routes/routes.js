// DATA
const express = require("express");
const router = express.Router();
const { indexMed, showRev, showMed, storeMed } = require("../controllers/functions");
const upload = require('../middleware/uploadImage');

// ROUTES
router.get("/:slug/recensioni", showRev);
router.get("/:slug", showMed);
router.post("/", upload.single("immagine"), storeMed);
router.get("/", indexMed);

// EXPORT
module.exports = router;