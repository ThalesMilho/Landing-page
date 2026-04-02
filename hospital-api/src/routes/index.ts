import { Router } from "express";
import healthRoutes from "./health.routes";
import meRoutes from "./me.routes";
import documentsRoutes from "./documents.routes";

const router = Router();

router.use(healthRoutes);
router.use(meRoutes);
router.use(documentsRoutes);

export default router;
