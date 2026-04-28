const express = require("express");
const router = express.Router();

const {
  getLeads,
  createLead,
  updateLead,
  updateLeadStatus,
  assignLeadToManager,
  getLeadNotes,
  addLeadNote,
  getManagerPerformance,
  deleteLead,
} = require("../controllers/leadController");

const { protect, adminOnly } = require("../middleware/auth");

router.get("/leads", protect, getLeads);
router.post("/leads", protect, createLead);
router.get("/leads/manager-performance", protect, adminOnly, getManagerPerformance);
router.get("/leads/:id/notes", protect, getLeadNotes);
router.post("/leads/:id/notes", protect, addLeadNote);
router.patch("/leads/:id/assign", protect, adminOnly, assignLeadToManager);
router.put("/leads/:id", protect, updateLead);
router.patch("/leads/:id/status", protect, adminOnly, updateLeadStatus);
router.delete("/leads/:id", protect, adminOnly, deleteLead);

module.exports = router;