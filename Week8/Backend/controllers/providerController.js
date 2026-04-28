const axios = require("axios");
const Lead = require("../models/Lead");
const { getIo } = require("../realtime/socket");

const ALLOWED_PROVIDERS = ["google", "facebook"];
const PROVIDER_REQUEST_TIMEOUT_MS = Number(process.env.PROVIDER_REQUEST_TIMEOUT_MS || 10000);
const PROVIDER_SYNC_RETRIES = Number(process.env.PROVIDER_SYNC_RETRIES || 3);
const PROVIDER_SYNC_COOLDOWN_MS = Number(process.env.PROVIDER_SYNC_COOLDOWN_MS || 15000);
const recentSyncCache = new Map();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getRetryDelayMs = (attempt, retryAfterHeader) => {
  const retryAfterSeconds = Number(retryAfterHeader);
  if (!Number.isNaN(retryAfterSeconds) && retryAfterSeconds > 0) {
    return retryAfterSeconds * 1000;
  }

  return Math.min(2000 * Math.pow(2, attempt - 1), 12000);
};

const fetchProviderLeads = async (url) => {
  let lastError;

  for (let attempt = 1; attempt <= PROVIDER_SYNC_RETRIES; attempt += 1) {
    try {
      const response = await axios.get(url, {
        timeout: PROVIDER_REQUEST_TIMEOUT_MS,
      });

      return response.data;
    } catch (error) {
      lastError = error;
      const status = error.response?.status;
      const isRetriableStatus = [429, 502, 503, 504].includes(status);
      const isTimeout = error.code === "ECONNABORTED";
      const isLastAttempt = attempt === PROVIDER_SYNC_RETRIES;

      if (isLastAttempt || (!isRetriableStatus && !isTimeout)) {
        break;
      }

      const delayMs = getRetryDelayMs(attempt, error.response?.headers?.["retry-after"]);
      await sleep(delayMs);
    }
  }

  throw lastError;
};

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
    const cacheKey = `${normalizedProvider}:${accountId}`;
    const lastSyncAt = recentSyncCache.get(cacheKey);
    const now = Date.now();

    if (lastSyncAt && now - lastSyncAt < PROVIDER_SYNC_COOLDOWN_MS) {
      const cachedLeads = await Lead.find({
        source: normalizedProvider,
        providerAccountId: accountId,
      }).sort({ createdAt: -1 });
      const totalLeadsInSystem = await Lead.countDocuments();

      return res.json({
        message: `${normalizedProvider} leads already synced recently`,
        provider: normalizedProvider,
        accountId,
        fetched: cachedLeads.length,
        inserted: 0,
        updated: 0,
        totalLeadsInSystem,
        cached: true,
      });
    }

    const data = await fetchProviderLeads(url);
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
    recentSyncCache.set(cacheKey, now);

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
    const upstreamStatus = error.response?.status;

    if (upstreamStatus === 429) {
      return res.status(429).json({
        message: "Provider rate limit reached. Please retry in a few seconds.",
        error: error.message,
      });
    }

    if ([502, 503, 504].includes(upstreamStatus)) {
      return res.status(502).json({
        message: "Provider service is temporarily unavailable. Please retry shortly.",
        error: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to sync provider leads",
      error: error.message,
    });
  }
};
