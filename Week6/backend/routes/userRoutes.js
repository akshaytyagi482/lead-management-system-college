const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  createAdmin,
} = require("../controllers/userController");

const { protect, adminOnly } = require("../middleware/auth");

// Auth routes
router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);
router.get("/auth/profile", protect, getProfile);
router.post("/admin/create", protect, adminOnly, createAdmin);

module.exports = router;
