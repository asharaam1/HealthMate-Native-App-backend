import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword,
} from "../controllers/authController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/update-password", protect, updatePassword);

export default router;
