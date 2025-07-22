// portfolio-backend/server.js

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors"); // Make sure you import cors

dotenv.config();

const app = express();

// --- IMPORTANT: UPDATE THIS LINE ---
app.use(
  cors({
    origin: "https://web-ajency.vercel.app", // <--- Remove trailing slash to match browser origin exactly
  })
);
// --- END IMPORTANT ---

// Middleware to parse JSON bodies
app.use(express.json());

// MongoDB Connection (already working!)
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully!"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Message Schema and Model (should already be defined)
const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

// Routes
app.get("/", (req, res) => {
  res.send("Portfolio Backend API is running!");
});

// Contact form submission route
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ error: "Name, email, and message are required." });
    }

    const newMessage = new Message({ name, email, subject, message });
    await newMessage.save();
    console.log("New message saved:", newMessage); // Log the saved message
    res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "Failed to send message." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access it at http://localhost:${PORT}`);
});
