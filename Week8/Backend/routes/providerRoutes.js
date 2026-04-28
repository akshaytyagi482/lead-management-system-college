const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const { syncProviderLeads, checkProviderHealth } = require("../controllers/providerController");

router.get("/provider/health", protect, checkProviderHealth);
router.post("/provider/sync", protect, syncProviderLeads);

module.exports = router;
