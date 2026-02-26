
import { Router } from "express";
import healthRoutes from "./health.routes";
import meRoutes from "./me.routes";

const router = Router();

router.use(healthRoutes);
router.use(meRoutes);

export default router;

