const Lead = require("../models/Lead");


exports.receiveMetaLead = async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value || !value.leadgen_id) {
      return res.status(400).json({ message: "Invalid Meta payload" });
    }

    // Extract lead fields
    const leadFields = {};
    value.field_data.forEach((field) => {
      leadFields[field.name] = field.values[0];
    });

    const leadData = {
      name: leadFields.full_name || "",
      email: leadFields.email || "",
      phone: leadFields.phone_number || "",
      campaign: value.campaign_name || "",
      adset: value.adset_name || "",
      source: value.platform || "Facebook",
      rawPayload: req.body
    };

    if (!leadData.phone && !leadData.email) {
      return res.status(400).json({ message: "Empty lead received" });
    }

    await Lead.create(leadData);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Meta Webhook Error:", error);
    res.status(500).json({ message: "Meta webhook processing failed" });
  }
};