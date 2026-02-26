
import { Router } from "express";
import { meController, mePermissionsController } from "../controllers/meController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/api/v1/me", requireAuth, meController);
router.get("/api/v1/me/permissions", requireAuth, mePermissionsController);

export default router;

