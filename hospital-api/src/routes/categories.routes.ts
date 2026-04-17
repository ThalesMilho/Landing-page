import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  createCategoryController,
  deleteCategoryController,
  listCategoriesController,
  updateCategoryController,
} from "../controllers/categoriesController";

const router = Router();

router.get("/api/v1/categories", requireAuth, listCategoriesController);
router.post("/api/v1/categories", requireAuth, createCategoryController);
router.put("/api/v1/categories/:id", requireAuth, updateCategoryController);
router.delete("/api/v1/categories/:id", requireAuth, deleteCategoryController);

export default router;