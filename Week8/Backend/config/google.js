
const googleConfig = {
  webhookSecret: process.env.GOOGLE_WEBHOOK_SECRET || "",

  
  verifyWebhook: (req) => {
    const signature = req.headers["x-goog-signature"];
    return signature === process.env.GOOGLE_WEBHOOK_SECRET;
  }
};

module.exports = googleConfig;