const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const { setIo } = require("./realtime/socket");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  res.send("Lead Management API running");
});

app.use("/api", require("./routes/leadRoutes"));
app.use("/api", require("./routes/userRoutes"));
app.use("/api", require("./routes/metaRoutes"));
app.use("/api", require("./routes/googleRoutes"));
app.use("/api", require("./routes/providerRoutes"));

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Unauthorized"));
    }

    jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    return next(new Error("Unauthorized"));
  }
});

io.on("connection", () => {
  // Socket connected for realtime lead updates.
});

setIo(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});