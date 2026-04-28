const Lead = require("../models/Lead");

exports.getLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
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
      status: "New"
    });

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
    });
    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: "Failed to update lead" });
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

    res.status(200).json({
      message: "Lead deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error while deleting lead"
    });
  }
};