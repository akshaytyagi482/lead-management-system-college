
const metaConfig = {
  webhookSecret: process.env.META_WEBHOOK_SECRET || "",

 
  verifyWebhook: (req) => {
    const signature = req.headers["x-hub-signature-256"];
    if (!signature) return false;

   
    return true;
  },

  
  verifySubscription: (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === process.env.META_WEBHOOK_SECRET) {
      return res.status(200).send(challenge);
    } else {
      return res.sendStatus(403);
    }
  }
};

module.exports = metaConfig;