// routes/vitalsRoutes.js
import express from "express";
import {
  addVitals,
  getVitals,
  getVitalById,
  updateVitals,
  deleteVitals,
  getVitalsStats,
  getVitalsInsights,
} from "../controllers/vitalsController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.get("/stats", getVitalsStats);
router.post("/insights", getVitalsInsights);
router.post("/", addVitals);
router.get("/", getVitals);
router.get("/:id", getVitalById);
router.put("/:id", updateVitals);
router.delete("/:id", deleteVitals);

export default router;
