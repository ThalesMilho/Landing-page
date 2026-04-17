import { Router } from "express";
import healthRoutes from "./health.routes";
import meRoutes from "./me.routes";
import documentsRoutes from "./documents.routes";
import indicatorsRoutes from "./indicators.routes";
import settingsRoutes from "./settings.routes";
import categoriesRoutes from "./categories.routes";


const router = Router();

router.use(healthRoutes);
router.use(meRoutes);
router.use(documentsRoutes);
router.use(indicatorsRoutes);
router.use(settingsRoutes);
router.use(categoriesRoutes);


export default router;
