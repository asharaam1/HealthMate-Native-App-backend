import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword,
  updateProfileImage,
} from "../controllers/authController.js";
import { protect } from "../middlewares/auth.js";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/update-password", protect, updatePassword);
router.put(
  "/profile-image",
  protect,
  upload.single("profileImage"),
  updateProfileImage,
);

export default router;
