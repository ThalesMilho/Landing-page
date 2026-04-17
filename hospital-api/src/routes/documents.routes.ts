import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth";
import {
  deleteDocumentController,
  downloadDocumentController,
  listDocumentsController,
  uploadDocumentController,
  viewDocumentController,
} from "../controllers/documentsController";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

router.get("/api/v1/documents", requireAuth, listDocumentsController);
router.post("/api/v1/documents", requireAuth, upload.single("file"), uploadDocumentController);
router.get("/api/v1/documents/:id/download", requireAuth, downloadDocumentController);
router.get("/api/v1/documents/:id/view", requireAuth, viewDocumentController);
router.delete("/api/v1/documents/:id", requireAuth, deleteDocumentController);

export default router;