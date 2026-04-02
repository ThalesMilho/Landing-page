import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

import { env } from "../config/env";

let db: Database.Database | null = null;

export function getDb() {
  if (db) return db;

  const dbPath = path.resolve(env.DB_PATH);
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

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
    CREATE INDEX IF NOT EXISTS idx_documents_module_cat_created
      ON documents(module_key, category, created_at DESC);
  `);

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
  created_at: string;
  created_by_oid: string;
  created_by_name: string;
};
