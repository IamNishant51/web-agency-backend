// portfolio-backend/server.js

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
// const morgan = require('morgan'); // Optional: Uncomment and install if you want request logging

dotenv.config();

const app = express();

// Security and performance middlewares
app.use(helmet());
app.use(compression());
// app.use(morgan('tiny')); // Optional: Log requests, 'tiny' is less verbose than 'dev'

// CORS setup
const allowedOrigin = process.env.ALLOWED_ORIGIN || "https://web-bridge-lac.vercel.app";
app.use(
  cors({
    origin: allowedOrigin,
    optionsSuccessStatus: 204, // Changed from 200 to 204 for OPTIONS preflight requests
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Explicitly list methods
    credentials: true, // If you send cookies or authorization headers
  })
);

app.use(express.json({ limit: "1mb" }));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI) // Removed deprecated options
  .then(() => console.log("MongoDB connected successfully!"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Message Schema and Model
const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("Portfolio Backend API is running!");
});

// Contact form submission route
app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ error: "Name, email, and message are required." });
  }
  try {
    const newMessage = new Message({ name, email, subject, message });
    await newMessage.save();
    res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error saving message:", error); // More specific error logging
    res.status(500).json({ error: "Failed to send message." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});