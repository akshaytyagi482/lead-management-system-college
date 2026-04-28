const express = require("express");
const router = express.Router();
const {
  receiveMetaLead
} = require("../controllers/metaWebhookController");

// Facebook / Instagram Lead Ads Webhook
router.post("/meta/webhook", receiveMetaLead);

module.exports = router;