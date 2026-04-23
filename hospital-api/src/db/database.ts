import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

import { env } from "../config/env";

let db: Database.Database | null = null;

export function getDb(): any {
  if (db) return db;

  const dbPath = path.resolve(env.DB_PATH);
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  fs.mkdirSync(path.resolve(env.UPLOAD_DIR), { recursive: true });

  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      module_key TEXT NOT NULL,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      storage_name TEXT NOT NULL,
      storage_path TEXT NOT NULL,
      created_at TEXT NOT NULL,
      created_by_oid TEXT NOT NULL,
      created_by_name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS indicators (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      value TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#1a56db',
      sort_order INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      module_key TEXT NOT NULL,
      name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_documents_module_cat_created
      ON documents(module_key, category, created_at DESC);
  `);

  // Tentar adicionar coluna allow_download (pode falhar se já existir)
  try {
    db.exec("ALTER TABLE documents ADD COLUMN allow_download INTEGER NOT NULL DEFAULT 0");
  } catch (err: any) {
    // Coluna já existe, ignorar erro
    if (!err.message.includes('duplicate column name')) {
      console.warn('Warning adding allow_download column:', err.message);
    }
  }

  const count = (db.prepare("SELECT COUNT(*) as c FROM indicators").get() as any).c;

  if (count === 0) {
    const insert = db.prepare(`
      INSERT INTO indicators (id, label, value, color, sort_order, updated_at)
      VALUES (@id, @label, @value, @color, @sort_order, @updated_at)
    `);

    const now = new Date().toISOString();

    const defaults = [
      { label: "Taxa de Infecção Hospitalar", value: "2.3%", color: "#16a34a" },
      { label: "Satisfação do Paciente", value: "94%", color: "#1a56db" },
      { label: "Tempo Médio de Atendimento", value: "18 min", color: "#d97706" },
      { label: "Eventos Adversos", value: "3", color: "#dc2626" },
    ];

    defaults.forEach((d, i) => {
      insert.run({
        id: require("crypto").randomUUID(),
        label: d.label,
        value: d.value,
        color: d.color,
        sort_order: i,
        updated_at: now,
      });
    });
  }

  return db;
}

export type DocumentRow = {
  id: string;
  module_key: string;
  category: string;
  name: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  storage_name: string;
  storage_path: string;
  allow_download: number;
  created_at: string;
  created_by_oid: string;
  created_by_name: string;
};

export type IndicatorRow = {
  id: string;
  label: string;
  value: string;
  color: string;
  sort_order: number;
  updated_at: string;
};