// DATA
const express = require("express");
const router = express.Router();
const { indexMed, showRev, showMed, storeMed, storeRev, sendMail, getSpecializzazioni } = require("../controllers/functions");
const upload = require('../middleware/uploadImage');

// ROUTES GET
router.get("/specializzazioni", getSpecializzazioni);
router.get("/:slug/recensioni", showRev);
router.get("/:slug", showMed);
router.get("/", indexMed);

// ROUTES POST
router.post("/:slug/send-mail", sendMail);
router.post("/:slug/recensioni", storeRev);
router.post("/", upload.single("immagine"), storeMed);

// EXPORT
module.exports = router;