
import { Router } from "express";
import healthRoutes from "./health.routes";
import meRoutes from "./me.routes";
import documentRoutes from "./documents.routes";

const router = Router();

router.use(healthRoutes);
router.use(meRoutes);
router.use("/documents", documentRoutes);

export default router;

