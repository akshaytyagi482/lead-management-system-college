const Lead = require("../models/Lead");
const User = require("../models/User");
const { getIo } = require("../realtime/socket");

const canAccessLead = (lead, user) => {
  if (!lead || !user) return false;
  if (user.role === "Admin") return true;
  const assignedToId = lead.assignedTo?._id || lead.assignedTo;
  return assignedToId && String(assignedToId) === String(user._id);
};

exports.getLeads = async (req, res) => {
  try {
    const query = req.user.role === "Admin"
      ? {}
      : { assignedTo: req.user._id };

    const leads = await Lead.find(query)
      .populate("assignedTo", "_id name email role")
      .sort({ createdAt: -1 });

    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch leads" });
  }
};

exports.createLead = async (req, res) => {
  try {
    const { name, email, phone, source } = req.body;

    // 1️⃣ Required fields check
    if (!name || !email || !phone || !source) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // 2️⃣ Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format"
      });
    }

    // 3️⃣ Phone validation (exact 10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: "Phone number must be exactly 10 digits"
      });
    }

    // 4️⃣ Duplicate check (email OR phone)
    const existingLead = await Lead.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingLead) {
      return res.status(409).json({
        message: "Lead already exists with same email or phone"
      });
    }

    // 5️⃣ Create lead
    const lead = await Lead.create({
      name,
      email,
      phone,
      source,
      status: "New",
      createdBy: req.user ? req.user._id : null,
      assignedTo: req.user && req.user.role === "Manager" ? req.user._id : null,
      assignedAt: req.user && req.user.role === "Manager" ? new Date() : null,
    });

    const io = getIo();
    if (io) {
      io.emit("lead:created", lead);
    }

    res.status(201).json(lead);

  } catch (error) {
    console.error("Create Lead Error:", error);
    res.status(500).json({
      message: "Server error while creating lead"
    });
  }
};

exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("assignedTo", "_id name email role");

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const io = getIo();
    if (io) {
      io.emit("lead:updated", lead);
    }

    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: "Failed to update lead" });
  }
};

exports.updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["New", "Contacted", "Qualified", "Converted", "Lost"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid lead status" });
    }

    const existing = await Lead.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const nextUpdate = { status };
    if (!existing.firstResponseAt && status !== "New") {
      nextUpdate.firstResponseAt = new Date();
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      nextUpdate,
      { new: true }
    ).populate("assignedTo", "_id name email role");

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const io = getIo();
    if (io) {
      io.emit("lead:status-updated", lead);
    }

    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: "Failed to update lead status" });
  }
};

exports.assignLeadToManager = async (req, res) => {
  try {
    const { managerId } = req.body;

    if (!managerId) {
      return res.status(400).json({ message: "managerId is required" });
    }

    const manager = await User.findOne({ _id: managerId, role: "Manager" }).select("_id name email role");
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo: manager._id,
        assignedAt: new Date(),
      },
      { new: true }
    ).populate("assignedTo", "_id name email role");

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const io = getIo();
    if (io) {
      io.emit("lead:assigned", {
        leadId: lead._id,
        leadName: lead.name,
        manager: {
          _id: manager._id,
          name: manager.name,
          email: manager.email,
        },
        lead,
      });
      io.emit("lead:updated", lead);
    }

    return res.json(lead);
  } catch (error) {
    return res.status(400).json({ message: "Failed to assign lead" });
  }
};

exports.getLeadNotes = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate("notes.author", "_id name email role")
      .populate("assignedTo", "_id name email role");

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    if (!canAccessLead(lead, req.user)) {
      return res.status(403).json({ message: "Not authorized to view this lead" });
    }

    return res.json({
      leadId: lead._id,
      leadName: lead.name,
      notes: lead.notes,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch lead notes" });
  }
};

exports.addLeadNote = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !String(text).trim()) {
      return res.status(400).json({ message: "Note text is required" });
    }

    const lead = await Lead.findById(req.params.id).populate("assignedTo", "_id name email role");
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    if (!canAccessLead(lead, req.user)) {
      return res.status(403).json({ message: "Not authorized to add note to this lead" });
    }

    lead.notes.push({
      author: req.user._id,
      text: String(text).trim(),
    });

    await lead.save();

    const refreshed = await Lead.findById(req.params.id)
      .populate("notes.author", "_id name email role")
      .populate("assignedTo", "_id name email role");

    const latestNote = refreshed.notes[refreshed.notes.length - 1];

    const io = getIo();
    if (io) {
      io.emit("lead:note-added", {
        leadId: refreshed._id,
        leadName: refreshed.name,
        note: latestNote,
      });
      io.emit("lead:updated", refreshed);
    }

    return res.status(201).json({
      message: "Note added successfully",
      note: latestNote,
      notes: refreshed.notes,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to add note" });
  }
};

exports.getManagerPerformance = async (req, res) => {
  try {
    const managers = await User.find({ role: "Manager" }).select("_id name email role");
    const now = new Date();

    const rows = await Promise.all(
      managers.map(async (manager) => {
        const leads = await Lead.find({ assignedTo: manager._id });
        const totalAssigned = leads.length;
        const converted = leads.filter((lead) => lead.status === "Converted").length;
        const overdueFollowups = leads.filter(
          (lead) => lead.followUpAt && lead.followUpAt < now && !["Converted", "Lost"].includes(lead.status)
        ).length;

        const responseTimesInMinutes = leads
          .filter((lead) => lead.firstResponseAt)
          .map((lead) => (new Date(lead.firstResponseAt) - new Date(lead.createdAt)) / (1000 * 60));

        const avgResponseMinutes = responseTimesInMinutes.length > 0
          ? (responseTimesInMinutes.reduce((sum, item) => sum + item, 0) / responseTimesInMinutes.length)
          : null;

        return {
          manager: {
            _id: manager._id,
            name: manager.name,
            email: manager.email,
          },
          totalAssigned,
          converted,
          conversionRate: totalAssigned > 0 ? Number(((converted / totalAssigned) * 100).toFixed(1)) : 0,
          avgResponseMinutes: avgResponseMinutes !== null ? Number(avgResponseMinutes.toFixed(1)) : null,
          overdueFollowups,
        };
      })
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch manager performance" });
  }
};

exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found"
      });
    }

    await lead.deleteOne();

    const io = getIo();
    if (io) {
      io.emit("lead:deleted", { _id: req.params.id });
    }

    res.status(200).json({
      message: "Lead deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error while deleting lead"
    });
  }
};