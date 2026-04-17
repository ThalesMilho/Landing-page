import path from "path";
import type { Request, RequestHandler, Response } from "express";
import { AppError } from "../middleware/errorHandler";
import {
  assertCanUpload,
  createDocument,
  deleteDocument,
  getDocumentRow,
  listDocuments,
  type ModuleKey,
} from "../services/documentsService";

const allowedModules: ModuleKey[] = ["rh", "qualidade", "suporte"];

function parseModuleKey(value: unknown): ModuleKey {
  if (typeof value !== "string") throw new AppError("Bad Request", 400);
  if (!allowedModules.includes(value as ModuleKey)) throw new AppError("Bad Request", 400);
  return value as ModuleKey;
}

export const listDocumentsController: RequestHandler = (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Unauthorized", 401);

  const moduleKey = parseModuleKey(req.query.module);
  const category = typeof req.query.category === "string" ? req.query.category : undefined;

  const docs = listDocuments({ moduleKey, ...(category !== undefined && { category }) });
  res.json({ success: true, data: docs });
};

export const uploadDocumentController: RequestHandler = (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Unauthorized", 401);

  const moduleKey = parseModuleKey(req.body.moduleKey);
  const category = typeof req.body.category === "string" && req.body.category.trim() ? req.body.category.trim() : "Geral";
  const displayName =
    typeof req.body.name === "string" && req.body.name.trim() ? req.body.name.trim() : undefined;

  const file = req.file;
  if (!file) throw new AppError("Missing file", 400);

  assertCanUpload(req, moduleKey);

  const created = createDocument({
    moduleKey,
    category,
    displayName: displayName ?? file.originalname,
    file: {
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      buffer: file.buffer,
    },
    createdBy: {
      oid: req.user.oid ?? "unknown",
      name: req.user.name ?? "Unknown",
    },
  });

  res.status(201).json({ success: true, data: created });
};

export const downloadDocumentController: RequestHandler = (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Unauthorized", 401);

  const id = req.params.id;
  if (!id) throw new AppError("Bad Request", 400);

  const row = getDocumentRow(id);

  res.setHeader("Content-Type", row.mime_type);
  res.setHeader("Content-Length", String(row.size_bytes));
  res.setHeader("Content-Disposition", `inline; filename*=UTF-8''${encodeURIComponent(row.original_name)}`);

  res.sendFile(path.resolve(row.storage_path));
};

export const deleteDocumentController: RequestHandler = (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Unauthorized", 401);
  const id = req.params.id;
  if (!id) throw new AppError("Bad Request", 400);
  deleteDocument(id);
  res.json({ success: true });
};
export const viewDocumentController: RequestHandler = (req: Request, res: Response) => {
  if (!req.user) throw new AppError("Unauthorized", 401);
  const id = req.params.id;
  if (!id) throw new AppError("Bad Request", 400);
  const row = getDocumentRow(id);
  res.setHeader("Content-Type", row.mime_type);
  res.setHeader("Content-Disposition", `inline; filename="${row.original_name}"`);
  res.sendFile(path.resolve(row.storage_path));
};