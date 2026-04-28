const express = require("express");
const router = express.Router();
const {
  receiveGoogleLead
} = require("../controllers/googleWebhookController");

// Google Ads Lead Form Webhook
router.post("/google/webhook", receiveGoogleLead);

module.exports = router;