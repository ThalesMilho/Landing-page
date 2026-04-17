import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  getSettingController,
  putSettingController,
} from "../controllers/indicatorsController";

const router = Router();

router.get("/api/v1/settings/:key", requireAuth, getSettingController);
router.put("/api/v1/settings/:key", requireAuth, putSettingController);

export default router;