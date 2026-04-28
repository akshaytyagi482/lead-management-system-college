const axios = require("axios");
const Lead = require("../models/Lead");
const { getIo } = require("../realtime/socket");

const ALLOWED_PROVIDERS = ["google", "facebook"];
const getMockProviderBaseUrl = () => {
  const configuredUrl = process.env.MOCK_PROVIDER_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:6001";
  }

  throw new Error("MOCK_PROVIDER_URL is not configured");
};

exports.syncProviderLeads = async (req, res) => {
  try {
    const { provider } = req.body;
    const normalizedProvider = String(provider || "").toLowerCase();

    if (!ALLOWED_PROVIDERS.includes(normalizedProvider)) {
      return res.status(400).json({ message: "Provider must be google or facebook" });
    }

    const accountId = `${req.user._id}-${normalizedProvider}`;
  const baseUrl = getMockProviderBaseUrl();
    const url = `${baseUrl}/api/mock/${normalizedProvider}/${accountId}/leads`;

    const { data } = await axios.get(url);
    const providerLeads = data.leads || [];

    let inserted = 0;
    let updated = 0;

    for (const item of providerLeads) {
      const existing = await Lead.findOne({
        externalLeadId: item.externalLeadId,
        source: normalizedProvider,
        providerAccountId: accountId,
      });

      const shouldAssignToCurrentManager = req.user.role === "Manager";

      if (existing) {
        const nextValues = {
          name: item.name,
          email: item.email,
          phone: item.phone,
          source: normalizedProvider,
          providerAccountId: accountId,
          fetchedBy: req.user._id,
        };

        if (shouldAssignToCurrentManager && !existing.assignedTo) {
          nextValues.assignedTo = req.user._id;
          nextValues.assignedAt = new Date();
        }

        const hasChanges = ["name", "email", "phone", "source", "providerAccountId"]
          .some((key) => existing[key] !== nextValues[key]);
        const hasAssignmentChanges = Object.prototype.hasOwnProperty.call(nextValues, "assignedTo");

        if (hasChanges || hasAssignmentChanges) {
          await Lead.findByIdAndUpdate(existing._id, nextValues, { new: true });
          updated += 1;
        }
      } else {
        await Lead.create({
          name: item.name,
          email: item.email,
          phone: item.phone,
          source: normalizedProvider,
          status: "New",
          externalLeadId: item.externalLeadId,
          providerAccountId: accountId,
          fetchedBy: req.user._id,
          assignedTo: shouldAssignToCurrentManager ? req.user._id : null,
          assignedAt: shouldAssignToCurrentManager ? new Date() : null,
        });
        inserted += 1;
      }
    }

    const allLeads = await Lead.find().sort({ createdAt: -1 });
    const io = getIo();
    if (io) {
      io.emit("leads:refresh", { reason: "provider-sync" });
    }

    return res.json({
      message: `${normalizedProvider} leads synced successfully`,
      provider: normalizedProvider,
      accountId,
      fetched: providerLeads.length,
      inserted,
      updated,
      totalLeadsInSystem: allLeads.length,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to sync provider leads",
      error: error.message,
    });
  }
};
