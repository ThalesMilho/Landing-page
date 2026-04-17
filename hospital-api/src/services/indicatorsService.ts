import crypto from "crypto";
import { getDb } from "../db/database";
import { AppError } from "../middleware/errorHandler";

export type IndicatorRow = {
  id: string;
  label: string;
  value: string;
  color: string;
  sort_order: number;
};

export type IndicatorDto = {
  id: string;
  label: string;
  value: string;
  color: string;
  sortOrder: number;
};

function toDto(row: IndicatorRow): IndicatorDto {
  return {
    id: row.id,
    label: row.label,
    value: row.value,
    color: row.color,
    sortOrder: row.sort_order,
  };
}

export function listIndicators(): IndicatorDto[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM indicators ORDER BY sort_order ASC").all() as IndicatorRow[];
  return rows.map(toDto);
}

export function createIndicator(data: { label: string; value: string; color?: string }): IndicatorDto {
  const db = getDb();
  const id = crypto.randomUUID();
  const maxOrder = (db.prepare("SELECT MAX(sort_order) as m FROM indicators").get() as any)?.m ?? -1;
  db.prepare("INSERT INTO indicators (id, label, value, color, sort_order) VALUES (@id, @label, @value, @color, @sort_order)").run({
    id,
    label: data.label,
    value: data.value,
    color: data.color || "#16a34a",
    sort_order: maxOrder + 1,
  });
  const row = db.prepare("SELECT * FROM indicators WHERE id = ?").get(id) as IndicatorRow;
  return toDto(row);
}

export function updateIndicator(id: string, data: { label?: string; value?: string; color?: string }): IndicatorDto {
  const db = getDb();
  const existing = db.prepare("SELECT * FROM indicators WHERE id = ?").get(id) as IndicatorRow | undefined;
  if (!existing) throw new AppError("Not Found", 404);
  db.prepare("UPDATE indicators SET label = @label, value = @value, color = @color WHERE id = @id").run({
    id,
    label: data.label ?? existing.label,
    value: data.value ?? existing.value,
    color: data.color ?? existing.color,
  });
  const row = db.prepare("SELECT * FROM indicators WHERE id = ?").get(id) as IndicatorRow;
  return toDto(row);
}

export function deleteIndicator(id: string): void {
  const db = getDb();
  const existing = db.prepare("SELECT * FROM indicators WHERE id = ?").get(id) as IndicatorRow | undefined;
  if (!existing) throw new AppError("Not Found", 404);
  db.prepare("DELETE FROM indicators WHERE id = ?").run(id);
}