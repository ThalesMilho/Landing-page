const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const db = new Database("./data/hospital.db");
const UPLOAD_DIR = "./data/uploads";

const insert = db.prepare(`
  INSERT INTO documents (id, module_key, category, name, original_name, mime_type, size_bytes, storage_name, storage_path, created_at, created_by_oid, created_by_name)
  VALUES (@id, @module_key, @category, @name, @original_name, @mime_type, @size_bytes, @storage_name, @storage_path, @created_at, @created_by_oid, @created_by_name)
`);

const files = fs.readdirSync(UPLOAD_DIR).filter(f => f.endsWith(".pdf"));

console.log(`Found ${files.length} files to recover...`);

const recover = db.transaction(() => {
  for (const filename of files) {
    const filePath = path.resolve(UPLOAD_DIR, filename);
    const stat = fs.statSync(filePath);
    const id = filename.replace(".pdf", "");

    insert.run({
      id,
      module_key: "rh",
      category: "Geral",
      name: filename,
      original_name: filename,
      mime_type: "application/pdf",
      size_bytes: stat.size,
      storage_name: filename,
      storage_path: filePath,
      created_at: stat.mtime.toISOString(),
      created_by_oid: "recovered",
      created_by_name: "Recuperado",
    });
    console.log("Inserted:", filename);
  }
});

recover();

const count = db.prepare("SELECT COUNT(*) as c FROM documents").get();
console.log(`\nDone! Total documents in DB: ${count.c}`);
db.close();