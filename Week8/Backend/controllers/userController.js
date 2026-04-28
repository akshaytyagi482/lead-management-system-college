const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
};


exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "Manager"
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "User registration failed" });
  }
};


exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

exports.createManager = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check existing user
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newManager = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "Manager"
    });

    res.status(201).json({
      message: "Manager account created successfully",
      manager: {
        id: newManager._id,
        name: newManager.name,
        email: newManager.email,
        role: newManager.role
      },
      credentialsToShare: {
        email,
        password
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create manager" });
  }
};


exports.getProfile = async (req, res) => {
  res.json(req.user);
};

exports.getManagers = async (req, res) => {
  try {
    const managers = await User.find({ role: "Manager" })
      .select("_id name email role")
      .sort({ name: 1 });

    res.json(managers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch managers" });
  }
};