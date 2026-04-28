const express = require("express");
const router = express.Router();

const {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
} = require("../controllers/leadController");

const { protect, adminOnly } = require("../middleware/auth");

router.get("/leads", protect, getLeads);
router.post("/leads", createLead);
router.put("/leads/:id", protect, updateLead);
router.delete("/leads/:id", protect, adminOnly, deleteLead);

module.exports = router;