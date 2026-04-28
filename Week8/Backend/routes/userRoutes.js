const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  createManager,
  getManagers
} = require("../controllers/userController");

const { protect, adminOnly } = require("../middleware/auth");
// Auth routes
router.post("/auth/register",registerUser);
router.post("/auth/login", loginUser);
router.get("/auth/profile", protect, getProfile);
router.get("/managers", protect, adminOnly, getManagers);
router.post("/manager/create", protect, adminOnly, createManager);

module.exports = router;