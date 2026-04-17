import crypto from "crypto";
import type { RequestHandler } from "express";
import { AppError } from "../middleware/errorHandler";
import { getDb } from "../db/database";

export const listCategoriesController: RequestHandler = (req, res) => {
  if (!req.user) throw new AppError("Unauthorized", 401);
  const { module } = req.query;
  if (!module) throw new AppError("module is required", 400);
  const db = getDb();
  const rows = db.prepare("SELECT * FROM categories WHERE module_key = ? ORDER BY name ASC").all(module);
  res.json({ success: true, data: rows });
};

export const createCategoryController: RequestHandler = (req, res) => {
  if (!req.user) throw new AppError("Unauthorized", 401);
  const { module_key, name } = req.body;
  if (!module_key || !name) throw new AppError("module_key and name are required", 400);
  const db = getDb();
  const id = crypto.randomUUID();
  db.prepare("INSERT INTO categories (id, module_key, name) VALUES (?, ?, ?)").run(id, module_key, name.trim());
  const row = db.prepare("SELECT * FROM categories WHERE id = ?").get(id);
  res.status(201).json({ success: true, data: row });
};

export const updateCategoryController: RequestHandler = (req, res) => {
  if (!req.user) throw new AppError("Unauthorized", 401);
  const { id } = req.params;
  const { name } = req.body;
  if (!id || !name) throw new AppError("id and name are required", 400);
  const db = getDb();
  const existing = db.prepare("SELECT * FROM categories WHERE id = ?").get(id);
  if (!existing) throw new AppError("Not Found", 404);
  db.prepare("UPDATE categories SET name = ? WHERE id = ?").run(name.trim(), id);
  const row = db.prepare("SELECT * FROM categories WHERE id = ?").get(id);
  res.json({ success: true, data: row });
};

export const deleteCategoryController: RequestHandler = (req, res) => {
  if (!req.user) throw new AppError("Unauthorized", 401);
  const { id } = req.params;
  if (!id) throw new AppError("id is required", 400);
  const db = getDb();
  const existing = db.prepare("SELECT * FROM categories WHERE id = ?").get(id);
  if (!existing) throw new AppError("Not Found", 404);
  db.prepare("DELETE FROM categories WHERE id = ?").run(id);
  res.json({ success: true });
};