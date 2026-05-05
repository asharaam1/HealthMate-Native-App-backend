// import dotenv from "dotenv";
// dotenv.config();
import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
// const cors = require('cors');
import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import familyMemberRoutes from "./routes/familyMemberRoutes.js";
import vitalsRoutes from "./routes/vitalsRoutes.js";

connectDB();
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Middleware
// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.send("💚 HealthMate API - Sehat ka Smart Dost");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Service is running" });
});

app.get("/api/data", (req, res) => {
  res.json({ data: [] });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/family-members", familyMemberRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/vitals", vitalsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});

export default app;
