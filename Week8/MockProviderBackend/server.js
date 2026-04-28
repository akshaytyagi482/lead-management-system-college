const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 6001;

app.use(cors());
app.use(express.json());

// In-memory cache keeps the same lead data for each provider+account pair.
const accountLeadCache = new Map();

function seededNumber(seedText, min, max) {
  let hash = 0;
  for (let i = 0; i < seedText.length; i += 1) {
    hash = (hash << 5) - hash + seedText.charCodeAt(i);
    hash |= 0;
  }
  const range = max - min + 1;
  return min + (Math.abs(hash) % range);
}

function buildStableLeads(provider, accountId) {
  const cacheKey = `${provider}:${accountId}`;
  if (accountLeadCache.has(cacheKey)) {
    return accountLeadCache.get(cacheKey);
  }

  const count = seededNumber(cacheKey, 5, 10);
  const leads = Array.from({ length: count }, (_, index) => {
    const token = `${provider}-${accountId}-${index + 1}`.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();
    const phoneSuffix = String(seededNumber(token, 1000000, 9999999));

    return {
      externalLeadId: `${provider.toUpperCase()}-${accountId}-${index + 1}`,
      name: `${provider === "google" ? "Google" : "Facebook"} Lead ${index + 1}`,
      email: `${token}@mocklead.local`,
      phone: `9${phoneSuffix.slice(0, 7)}${String(index).padStart(2, "0")}`.slice(0, 10),
      source: provider,
      status: "New",
      accountId,
    };
  });

  accountLeadCache.set(cacheKey, leads);
  return leads;
}

app.get("/", (req, res) => {
  res.json({ message: "Mock Google/Facebook Provider API is running" });
});

app.get("/api/mock/:provider/:accountId/leads", (req, res) => {
  const { provider, accountId } = req.params;
  const normalizedProvider = String(provider).toLowerCase();

  if (!["google", "facebook"].includes(normalizedProvider)) {
    return res.status(400).json({ message: "Provider must be google or facebook" });
  }

  if (!accountId) {
    return res.status(400).json({ message: "accountId is required" });
  }

  const leads = buildStableLeads(normalizedProvider, accountId);
  return res.json({
    provider: normalizedProvider,
    accountId,
    count: leads.length,
    leads,
  });
});

app.listen(PORT, () => {
  console.log(`Mock Provider API running on port ${PORT}`);
});
