import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  createIndicatorController,
  deleteIndicatorController,
  listIndicatorsController,
  updateIndicatorController,
} from "../controllers/indicatorsController";

const router = Router();

router.get("/api/v1/indicators", requireAuth, listIndicatorsController);
router.post("/api/v1/indicators", requireAuth, createIndicatorController);
router.put("/api/v1/indicators/:id", requireAuth, updateIndicatorController);
router.delete("/api/v1/indicators/:id", requireAuth, deleteIndicatorController);

export default router;