import fs from "fs";
import path from "path";
import crypto from "crypto";

import type { Request } from "express";

import { env } from "../config/env";
import { AppError } from "../middleware/errorHandler";
import { getDb } from "../db/database";

export type ModuleKey = "rh" | "qualidade" | "suporte";

export type CreateDocumentInput = {
  moduleKey: ModuleKey;
  category: string;
  displayName: string;
  allowDownload: boolean;
  file: {
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    buffer: Buffer;
  };
  createdBy: {
    oid: string;
    name: string;
  };
};

export type DocumentDto = {
  id: string;
  moduleKey: string;
  category: string;
  name: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  createdByName: string;
  downloadUrl: string;
};

function ensureUploadDir() {
  const resolved = path.resolve(env.UPLOAD_DIR);
  fs.mkdirSync(resolved, { recursive: true });
  return resolved;
}

function toDto(row: any): DocumentDto {
  return {
    id: row.id,
    moduleKey: row.module_key,
    category: row.category,
    name: row.name,
    originalName: row.original_name,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    createdAt: row.created_at,
    createdByName: row.created_by_name,
    downloadUrl: `/api/v1/documents/${row.id}/download`,
  };
}

export function assertCanUpload(req: Request, moduleKey: ModuleKey) {
  const roles = req.user?.roles ?? [];
  const isAdmin = roles.includes("Intranet.Admin");

  const can =
    isAdmin ||
    (moduleKey === "rh" && roles.includes("Intranet.RH.Manager")) ||
    (moduleKey === "qualidade" && roles.includes("Intranet.Quality.Manager")) ||
    (moduleKey === "suporte" && roles.includes("Intranet.IT"));

  if (!can) {
    throw new AppError("Forbidden", 403);
  }
}

export function createDocument(input: CreateDocumentInput): DocumentDto {
  const uploadDir = ensureUploadDir();
  const id = crypto.randomUUID();

  const safeStorageName = `${id}${path.extname(input.file.originalName)}`;
  const storagePath = path.join(uploadDir, safeStorageName);

  fs.writeFileSync(storagePath, input.file.buffer);

  const createdAt = new Date().toISOString();

  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO documents (
      id, module_key, category, name, original_name, mime_type, size_bytes,
      storage_name, storage_path, allow_download, created_at, created_by_oid, created_by_name
    ) VALUES (
      @id, @module_key, @category, @name, @original_name, @mime_type, @size_bytes,
      @storage_name, @storage_path, @allow_download, @created_at, @created_by_oid, @created_by_name
    )
  `);

  stmt.run({
    id,
    module_key: input.moduleKey,
    category: input.category,
    name: input.displayName,
    original_name: input.file.originalName,
    mime_type: input.file.mimeType || "application/octet-stream",
    size_bytes: input.file.sizeBytes,
    storage_name: safeStorageName,
    storage_path: storagePath,
    allow_download: input.allowDownload ? 1 : 0,
    created_at: createdAt,
    created_by_oid: input.createdBy.oid,
    created_by_name: input.createdBy.name,
  });

  const row = db
    .prepare("SELECT * FROM documents WHERE id = ?")
    .get(id);

  if (!row) throw new AppError("Failed to create document", 500);
  return toDto(row);
}

export function listDocuments(params: { moduleKey: ModuleKey; category?: string }): DocumentDto[] {
  const db = getDb();

  const rows = (params.category
    ? db
        .prepare(
          "SELECT * FROM documents WHERE module_key = ? AND category = ? ORDER BY created_at DESC",
        )
        .all(params.moduleKey, params.category)
    : db
        .prepare("SELECT * FROM documents WHERE module_key = ? ORDER BY created_at DESC")
        .all(params.moduleKey)) as any[];

  return rows.map(toDto);
}

export function getDocumentRow(id: string): any {
  const db = getDb();
  const row = db.prepare("SELECT * FROM documents WHERE id = ?").get(id);
  if (!row) throw new AppError("Not Found", 404);
  return row;
}

export function deleteDocument(id: string): void {
  const db = getDb();
  const row = db.prepare("SELECT * FROM documents WHERE id = ?").get(id) as any;
  if (!row) throw new AppError("Not Found", 404);
  try { fs.unlinkSync(row.storage_path); } catch { /* arquivo já não existe no disco */ }
  db.prepare("DELETE FROM documents WHERE id = ?").run(id);
}