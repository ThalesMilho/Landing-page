import crypto from "crypto";
import type { RequestHandler } from "express";
import { AppError } from "../middleware/errorHandler";
import { getDb, type IndicatorRow } from "../db/database";

// ── Indicators ──────────────────────────────────────────────

export const listIndicatorsController: RequestHandler = (_req, res) => {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM indicators ORDER BY sort_order ASC")
    .all() as IndicatorRow[];
  res.json({ success: true, data: rows });
};

export const createIndicatorController: RequestHandler = (req, res) => {
  const { label, value, color } = req.body;
  if (!label || !value) throw new AppError("label and value are required", 400);

  const db = getDb();
  const maxOrder = (
    db.prepare("SELECT MAX(sort_order) as m FROM indicators").get() as any
  ).m ?? 0;

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO indicators (id, label, value, color, sort_order, updated_at)
    VALUES (@id, @label, @value, @color, @sort_order, @updated_at)
  `).run({
    id,
    label: String(label).trim(),
    value: String(value).trim(),
    color: String(color || "#1a56db").trim(),
    sort_order: maxOrder + 1,
    updated_at: now,
  });

  const row = db
    .prepare("SELECT * FROM indicators WHERE id = ?")
    .get(id) as IndicatorRow;
  res.status(201).json({ success: true, data: row });
};

export const updateIndicatorController: RequestHandler = (req, res) => {
  const { id } = req.params;
  const { label, value, color } = req.body;
  const db = getDb();

  const existing = db
    .prepare("SELECT * FROM indicators WHERE id = ?")
    .get(id) as IndicatorRow | undefined;
  if (!existing) throw new AppError("Not Found", 404);

  db.prepare(`
    UPDATE indicators SET
      label = @label,
      value = @value,
      color = @color,
      updated_at = @updated_at
    WHERE id = @id
  `).run({
    id,
    label: String(label ?? existing.label).trim(),
    value: String(value ?? existing.value).trim(),
    color: String(color ?? existing.color).trim(),
    updated_at: new Date().toISOString(),
  });

  const updated = db
    .prepare("SELECT * FROM indicators WHERE id = ?")
    .get(id) as IndicatorRow;
  res.json({ success: true, data: updated });
};

export const deleteIndicatorController: RequestHandler = (req, res) => {
  const { id } = req.params;
  const db = getDb();
  const existing = db
    .prepare("SELECT * FROM indicators WHERE id = ?")
    .get(id) as IndicatorRow | undefined;
  if (!existing) throw new AppError("Not Found", 404);

  db.prepare("DELETE FROM indicators WHERE id = ?").run(id);
  res.json({ success: true });
};

// ── Settings (POP text etc) ─────────────────────────────────

export const getSettingController: RequestHandler = (req, res) => {
  const { key } = req.params;
  const db = getDb();
  const row = db
    .prepare("SELECT * FROM settings WHERE key = ?")
    .get(key) as { value: string } | undefined;
  res.json({ success: true, data: row?.value ?? "" });
};

export const putSettingController: RequestHandler = (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  if (value === undefined) throw new AppError("value is required", 400);

  const db = getDb();
  db.prepare(`
    INSERT INTO settings (key, value, updated_at)
    VALUES (@key, @value, @updated_at)
    ON CONFLICT(key) DO UPDATE SET value = @value, updated_at = @updated_at
  `).run({ key, value: String(value), updated_at: new Date().toISOString() });

  res.json({ success: true });
};