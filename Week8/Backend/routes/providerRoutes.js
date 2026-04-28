const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const { syncProviderLeads } = require("../controllers/providerController");

router.post("/provider/sync", protect, syncProviderLeads);

module.exports = router;
