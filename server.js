// portfolio-backend/server.js

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

dotenv.config();

const app = express();

// Security and performance middlewares
app.use(helmet());
app.use(compression());

// CORS setup (use env var or fallback)
const allowedOrigin =
  process.env.ALLOWED_ORIGIN || "https://web-ajency.vercel.app";
app.use(
  cors({
    origin: allowedOrigin,
    optionsSuccessStatus: 200,
  })
);

app.use(express.json({ limit: "1mb" }));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
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

// Project Schema and Model
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  link: { type: String },
  createdAt: { type: Date, default: Date.now },
});
const Project =
  mongoose.models.Project || mongoose.model("Project", projectSchema);

// BlogPost Schema and Model
const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});
const BlogPost =
  mongoose.models.BlogPost || mongoose.model("BlogPost", blogPostSchema);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("Portfolio Backend API is running!");
});

// Contact Messages API
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
    res.status(500).json({ error: "Failed to send message." });
  }
});
app.get("/api/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages." });
  }
});

// Projects API
app.post("/api/projects", async (req, res) => {
  const { title, description, link } = req.body;
  if (!title || !description) {
    return res
      .status(400)
      .json({ error: "Title and description are required." });
  }
  try {
    const project = new Project({ title, description, link });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: "Failed to create project." });
  }
});
app.get("/api/projects", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects." });
  }
});

// Blog Posts API
app.post("/api/blog-posts", async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required." });
  }
  try {
    const post = new BlogPost({ title, content });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to create blog post." });
  }
});
app.get("/api/blog-posts", async (req, res) => {
  try {
    const posts = await BlogPost.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blog posts." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
