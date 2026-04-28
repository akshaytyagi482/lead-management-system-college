const Lead = require("../models/Lead");

/**
 * @desc    Receive Google Ads Lead Form webhook
 * @route   POST /api/google/webhook
 * @access  Public (secured via Google verification token if needed)
 */
exports.receiveGoogleLead = async (req, res) => {
  try {
    const payload = req.body;

    

    const leadData = {
      name: getField(payload, "FULL_NAME"),
      email: getField(payload, "EMAIL"),
      phone: getField(payload, "PHONE_NUMBER"),
      service: getField(payload, "JOB_TYPE"),
      campaign: payload.campaign_name || payload.campaign || "Google Ads",
      keyword: payload.keyword || payload.search_term || "",
      source: "Google",
      rawPayload: payload 
    };

    
    if (!leadData.email && !leadData.phone) {
      return res.status(400).json({
        success: false,
        message: "Invalid lead data received from Google"
      });
    }

    
    await Lead.create(leadData);

    return res.status(200).json({
      success: true,
      message: "Google lead saved successfully"
    });

  } catch (error) {
    console.error("Google Webhook Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while processing Google lead"
    });
  }
};


function getField(payload, fieldName) {
  if (!payload || !payload.user_column_data) return "";

  const field = payload.user_column_data.find(
    (item) => item.column_name === fieldName
  );

  return field && field.string_value ? field.string_value : "";
}