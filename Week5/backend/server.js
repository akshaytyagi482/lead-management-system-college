const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Lead Management API is running",
    endpoints: {
      "GET /api/leads": "Fetch all leads (protected)",
      "POST /api/leads": "Create a new lead",
      "PUT /api/leads/:id": "Update a lead (protected)",
      "DELETE /api/leads/:id": "Delete a lead (admin only)",
      "POST /api/auth/register": "Register a user",
      "POST /api/auth/login": "Login and get token",
      "GET /api/auth/profile": "Get user profile (protected)"
    }
  });
});

// Routes
app.use("/api", require("./routes/leadRoutes"));
app.use("/api", require("./routes/userRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
