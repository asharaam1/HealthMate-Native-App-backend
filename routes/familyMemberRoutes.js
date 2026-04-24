// routes/familyMemberRoutes.js
import express from "express";
import {
  getFamilyMembers,
  getFamilyMember,
  createFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  deleteFamilyMemberImage,
} from "../controllers/familyMemberController.js";
import { protect } from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Family member CRUD routes
router
  .route("/")
  .get(getFamilyMembers)
  .post(upload.single("profileImage"), createFamilyMember);

router
  .route("/:id")
  .get(getFamilyMember)
  .put(upload.single("profileImage"), updateFamilyMember)
  .delete(deleteFamilyMember);

router.route("/:id/image").delete(deleteFamilyMemberImage);

export default router;
