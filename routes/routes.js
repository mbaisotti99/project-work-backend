// DATA
const express = require("express");
const router = express.Router();
const { indexMed, showRev, showMed, storeMed, storeRev, sendMail, getSpecializzazioni, getLatestReviews, getTopDoctors } = require("../controllers/functions");
const upload = require('../middleware/uploadImage');

// ROUTES GET
router.get("/", indexMed);
router.get("/specializzazioni", getSpecializzazioni);
router.get("/top", getTopDoctors);
router.get("/recensioni/recenti", getLatestReviews);
router.get("/:slug", showMed);
router.get("/:slug/recensioni", showRev);

// ROUTES POST
router.post("/:slug/send-mail", sendMail);
router.post("/:slug/recensioni", storeRev);
router.post("/", upload.single("immagine"), storeMed);

// EXPORT
module.exports = router;