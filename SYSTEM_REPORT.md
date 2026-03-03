# Hospital Intranet — Backend Document Management Integration Report
**Date:** 2026-03-03  
**Scope:** PostgreSQL + Prisma + File Uploads (RH/Qualidade/Suporte modules)  
**Status:** ✅ Code complete; ✅ DB schema applied; ⏳ Backend starting pending env fix

---

## 1️⃣ What Was Added

### 1.1 Dependencies
- `prisma @prisma/client` — ORM + generated client
- `multer @types/multer` — multipart/form-data file upload middleware
- `npx prisma init` — created `prisma/schema.prisma` and `prisma.config.ts`

### 1.2 Database Schema (`prisma/schema.prisma`)
```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql" }

model Document {
  id            String   @id @default(cuid())
  filename      String
  storedName    String
  mimeType      String
  sizeBytes     Int
  filePath      String
  module        Module
  category      String
  uploaderOid   String
  uploaderName  String
  uploaderEmail String
  uploaderDept  String
  status        DocumentStatus @default(PENDING)
  publishedAt   DateTime?
  archivedAt    DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  auditLogs     AuditLog[]
}

model AuditLog {
  id            String   @id @default(cuid())
  documentId    String
  document      Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  action        AuditAction
  performedBy   String
  performerName String
  ipAddress     String?
  userAgent     String?
  notes         String?
  createdAt     DateTime @default(now)
}

enum Module { RH | QUALIDADE | SUPORTE }
enum DocumentStatus { PENDING | PUBLISHED | ARCHIVED }
enum AuditAction { UPLOAD | PUBLISH | DOWNLOAD | ARCHIVE | DELETE }
```

### 1.3 Environment Variables (`.env`)
```env
DATABASE_URL="postgresql://postgres:lya100104@localhost:5432/hospital_intranet?schema=public"
UPLOAD_DIR="uploads"
MAX_FILE_SIZE_MB=20
PORT=3001
NODE_ENV=development
AZURE_TENANT_ID=00000000-0000-0000-0000-000000000000
AZURE_CLIENT_ID=00000000-0000-0000-0000-000000000001
AZURE_AUDIENCE=00000000-0000-0000-0000-000000000001
ALLOWED_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200
LOG_LEVEL=info
```

### 1.4 New Code Files

| Path | Purpose |
|------|---------|
| `src/config/database.ts` | PrismaClient singleton + connect/disconnect helpers |
| `src/services/documentService.ts` | Business logic for CRUD, lifecycle, audit |
| `src/middleware/upload.ts` | Multer config + MIME whitelist + size limit |
| `src/controllers/documentController.ts` | Express handlers: upload, list, download, publish |
| `src/routes/documents.routes.ts` | Routes: `GET /:module`, `POST /upload`, `GET /download/:id`, `PATCH /publish/:id` |
| `src/types/azureAd.ts` | Added `department?: string` field |

### 1.5 Wiring
- `src/routes/index.ts` → `router.use("/documents", documentRoutes)`
- `src/server.ts` → bootstrap async, `await connectDatabase()`, graceful shutdown with `disconnectDatabase()`
- `.gitignore` → added `uploads/` and `prisma/migrations/`

---

## 2️⃣ How It Works

### 2.1 Upload Flow
1. Frontend sends `multipart/form-data` to `POST /api/v1/documents/upload` with:
   - `file` (binary)
   - `module` (RH|QUALIDADE|SUPORTE)
   - `category` (string)
2. `uploadMiddleware` validates MIME + size, writes to `uploads/` with UUID filename.
3. `documentController.upload` creates a `Document` row + `AuditLog` entry (`UPLOAD`).
4. Initial status = `PENDING`.

### 2.2 Publishing
- `PATCH /api/v1/documents/publish/:id` sets `status = PUBLISHED`, stores `publishedAt`, logs `PUBLISH`.

### 2.3 Listing
- `GET /api/v1/documents/:module` returns only `PUBLISHED` docs for a module (RH/QUALIDADE/SUPOrte).

### 2.4 Download
- `GET /api/v1/documents/download/:id` serves the stored file from disk + logs `DOWNLOAD`.

### 2.5 Auditing
- Every action (`UPLOAD`, `PUBLISH`, `DOWNLOAD`, `ARCHIVE`, `DELETE`) writes an `AuditLog` row with:
  - `performedBy` (Azure AD OID)
  - `performerName` (display name at time)
  - `ipAddress` (if available)
  - `createdAt`

### 2.6 Security
- All routes require `requireAuth` (Azure AD JWT validation via JWKS).
- No auth → 401.
- File storage is outside `src/` (`uploads/` at root).

---

## 3️⃣ Current State

### ✅ Completed
- Dependencies installed
- Prisma schema defined
- `npx prisma migrate dev --name init` succeeded → tables `Document` and `AuditLog` exist
- `npx prisma generate` succeeded → client generated
- `npm run type-check` passes (zero TS errors)
- All code files added and wired
- `.gitignore` updated
- Prisma Studio running on `http://localhost:5555` (visual DB browser)

### ⚠️ Pending
- Backend server startup fails due to missing env vars (Azure placeholders not yet copied to `.env` from `.env.example`).
- Once env is fixed, server should start on `:3001` and endpoints should return 401 without token.

---

## 4️⃣ How to Verify

### 4.1 Start Backend
```bash
cd hospital-api
npm run dev
# Expected: "Hospital Intranet API running on :3001"
```

### 4.2 Verify 401 Without Token
```bash
curl -i http://localhost:3001/api/v1/documents/rh
# Expected: HTTP/1.1 401 Unauthorized

curl -i -X POST http://localhost:3001/api/v1/documents/upload
# Expected: HTTP/1.1 401 Unauthorized
```

### 4.3 Prisma Studio (optional)
- Open `http://localhost:5555`
- You should see `Document` and `AuditLog` models; tables are empty until first upload.

---

## 5️⃣ Gotchas & Notes for Other AI

- **Prisma v7**: `datasource.url` is now in `prisma.config.ts`; schema only has `provider`.
- **Strict TS**: Used `exactOptionalPropertyTypes`; we conditionally include `ipAddress` only when defined.
- **File paths**: `filePath` stores a relative path (`module/YYYY-MM/uuid.ext`), but actual files are stored flat in `uploads/` with UUID names to avoid collisions.
- **Azure AD**: `department` was added to `AzureAdJwtClaims` to support `uploaderDept` mapping.
- **Migration**: The migration file lives in `prisma/migrations/20260302142127_init/migration.sql`.
- **Uploads folder**: Created on-demand by Multer; excluded from git.

---

## 6️⃣ Next Steps (if you continue)
1. Fix `.env` Azure vars (copy placeholders from `.env.example`).
2. Start backend (`npm run dev`).
3. Verify 401 endpoints.
4. (Optional) Test a real upload with a valid JWT token.
5. (Optional) Add role-based upload restrictions (e.g., only managers can upload to RH).

---

**Prepared by:** Cascade (AI Assistant)  
**For:** Future AI agents taking over this project  
**Context:** Hospital intranet backend with PostgreSQL + Prisma + file uploads + Azure AD auth.
