# Hospital Intranet — Full Project Context for Next AI Agent
**Prepared:** 2026-03-03  
**For:** AI taking over this project  
**Goal:** Complete, parameterized, actionable context

---

## 📁 Project Layout

```
Landing-page/
├── hospital-api/          ← Node.js/TypeScript backend (port 3001)
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts          ← Zod validation of all env vars
│   │   │   ├── logger.ts       ← Pino logger (dev: pretty)
│   │   │   └── database.ts     ← PrismaClient singleton + connect/disconnect
│   │   ├── middleware/
│   │   │   ├── auth.ts         ← Azure AD JWT validation via JWKS
│   │   │   ├── errorHandler.ts ← Express error handling + AppError class
│   │   │   ├── rateLimiter.ts  ├── Express-rate-limit configs
│   │   │   ├── requestLogger.ts
│   │   │   └── upload.ts       ← Multer config (allowed MIMEs, size, UUID naming)
│   │   ├── services/
│   │   │   ├── userService.ts   ← Azure AD claims → UserProfile + Permissions
│   │   │   └── documentService.ts ← CRUD + lifecycle + audit for Document/AuditLog
│   │   ├── controllers/
│   │   │   ├── meController.ts  ← /me endpoint (profile + permissions)
│   │   │   └── documentController.ts ← upload/list/download/publish
│   │   ├── routes/
│   │   │   ├── index.ts        ← Router root; mounts /documents
│   │   │   ├── health.routes.ts
│   │   │   ├── me.routes.ts
│   │   │   └── documents.routes.ts ← /api/v1/documents/*
│   │   ├── types/
│   │   │   └── azureAd.ts      ← AzureAdJwtClaims (added department)
│   │   ├── app.ts              ← Express app builder (helmet, cors, json, limiter)
│   │   └── server.ts           ← Bootstrap async; connectDatabase; graceful shutdown
│   ├── prisma/
│   │   ├── schema.prisma       ← Document + AuditLog + enums (see below)
│   │   └── migrations/20260302142127_init/migration.sql
│   ├── uploads/                ← Multer stores files here (gitignored)
│   ├── .env                    ← See Environment Variables section
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── tsconfig.json           ← Strict TS, exactOptionalProperties
├── hospital-intranet/          ← React + Vite frontend (port 5173)
│   ├── src/
│   ├── vite.config.js          ← Proxy /api → http://localhost:3001
│   ├── package.json
│   └── index.html              ← Title: Intranet Hospitalar
├── SYSTEM_REPORT.md            ← Detailed technical report
└── CONTEXT_FOR_NEXT_AI.md      ← This file
```

---

## 🧠 Database Schema (Prisma)

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

- **Migration applied:** `20260302142127_init`
- **Prisma Studio:** runs on `http://localhost:5555` (visual browser)

---

## 🔐 Environment Variables (`hospital-api/.env`)

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

- **Validation:** `src/config/env.ts` uses Zod; missing required vars cause startup failure.
- **Uploads:** `uploads/` folder created on-demand by Multer; excluded from git.

---

## 🚀 API Endpoints (All require Azure AD JWT)

| Method | Path | Auth | Purpose | Request Body | Response |
|--------|------|------|---------|--------------|----------|
| GET | `/api/v1/documents/:module` | Required | List published docs for a module (`RH`|`QUALIDADE`|`SUPORTE`) | — | `{ success: true, data: Document[] }` |
| POST | `/api/v1/documents/upload` | Required | Upload a file (multipart) | `file` (binary) + `module` + `category` | `{ success: true, data: Document }` |
| GET | `/api/v1/documents/download/:id` | Required | Download file + log audit | — | File stream (attachment) |
| PATCH | `/api/v1/documents/publish/:id` | Required | Publish a pending document | — | `{ success: true, data: Document }` |
| GET | `/api/v1/me` | Required | Current user profile + permissions | — | `{ success: true, data: { profile, permissions, tokenMeta } }` |
| GET | `/api/v1/health` | Public | Health check | — | `{ success: true, timestamp }` |

### Auth Flow
- Frontend sends `Authorization: Bearer <JWT>` (Azure AD)
- Backend validates via JWKS (`login.microsoftonline.com/{tenantId}/v2.0/.well-known/jwks.json`)
- Claims attached to `req.user` (type: `AzureAdJwtClaims`)

---

## 📁 File Upload Mechanics

1. **Multer config** (`src/middleware/upload.ts`):
   - Allowed MIMEs: PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, JPEG, PNG, ZIP, TXT.
   - Size limit: `MAX_FILE_SIZE_MB` MB (default 20).
   - Storage: `uploads/` with UUID filename (`uuid.ext`).
2. **Controller** (`documentController.upload`):
   - Validates `module` and `category` via Zod.
   - Calls `documentService.create` → writes `Document` row + `AuditLog` (`UPLOAD`).
   - Initial status = `PENDING`.
3. **File path in DB**: `filePath` stores relative path (`module/YYYY-MM/uuid.ext`) for future organization; actual file is flat in `uploads/`.

---

## 🔍 How to Verify Everything Works

### 1) Start Backend
```bash
cd hospital-api
npm run dev
# Expected: "Hospital Intranet API running on :3001"
```

### 2) Verify 401 Without Token
```bash
curl -i http://localhost:3001/api/v1/documents/rh
# Expected: HTTP/1.1 401 Unauthorized

curl -i -X POST http://localhost:3001/api/v1/documents/upload
# Expected: HTTP/1.1 401 Unauthorized
```

### 3) Start Frontend (optional)
```bash
cd hospital-intranet
npm run dev
# Expected: "Local: http://localhost:5173/"
```

### 4) Prisma Studio (optional)
```bash
cd hospital-api
npx prisma studio --port 5555
# Open http://localhost:5555
# You should see Document and AuditLog models (tables are empty initially)
```

---

## 🛠️ Development Commands

| Command | Where | What it does |
|---------|-------|--------------|
| `npm run dev` | `hospital-api/` | Start backend dev server (ts-node-dev) |
| `npm run type-check` | `hospital-api/` | TypeScript compile check (no emit) |
| `npm run build` | `hospital-api/` | Compile to `dist/` |
| `npm run dev` | `hospital-intranet/` | Start frontend dev server (Vite) |
| `npx prisma migrate dev --name <name>` | `hospital-api/` | Create and apply migration |
| `npx prisma generate` | `hospital-api/` | Regenerate Prisma Client |
| `npx prisma studio` | `hospital-api/` | Open visual DB browser |

---

## 🧩 Known Gotchas

- **Prisma v7**: `datasource.url` lives in `prisma.config.ts`; schema only has `provider`.
- **Strict TS**: `exactOptionalPropertyTypes` enabled → we conditionally include `ipAddress` only when defined.
- **File storage**: `uploads/` at root; not version-controlled.
- **Azure AD**: `department` was added to `AzureAdJwtClaims` to support `uploaderDept`.
- **Env validation**: Missing required env vars cause immediate startup failure with Zod errors.
- **Rate limiting**: Two layers (`publicLimiter`, `apiLimiter`) applied in `src/app.ts`.

---

## 🎯 What Was Done (Summary)

1. ✅ Installed `prisma`, `@prisma/client`, `multer`, `@types/multer`.
2. ✅ Ran `npx prisma init`; created `prisma/schema.prisma` and `prisma.config.ts`.
3. ✅ Replaced schema with Document/AuditLog models and enums.
4. ✅ Updated `.env` with `DATABASE_URL` (user’s password: `lya100104`), `UPLOAD_DIR`, `MAX_FILE_SIZE_MB`, plus Azure placeholders.
5. ✅ Extended Zod env validation (`src/config/env.ts`) for new fields.
6. ✅ Created Prisma singleton (`src/config/database.ts`) with connect/disconnect.
7. ✅ Added `department` to `AzureAdJwtClaims`.
8. ✅ Created `documentService.ts` (CRUD + audit), `upload.ts` (Multer), `documentController.ts`, `documents.routes.ts`.
9. ✅ Wired routes in `src/routes/index.ts` (`/documents`).
10. ✅ Updated `src/server.ts` to `await connectDatabase()` and graceful shutdown.
11. ✅ Updated `.gitignore` for `uploads/` and `prisma/migrations/`.
12. ✅ Fixed strict TS issues (optional properties, event logging, pino transport).
13. ✅ `npm run type-check` passes.
14. ✅ `npx prisma migrate dev --name init` succeeded → tables exist.
15. ✅ `npx prisma generate` succeeded.
16. ✅ Prisma Studio running on `:5555`.

---

## 📦 What’s Left (if you want to finish)

- **Backend startup**: Ensure `.env` Azure placeholders are present (they should be). Then `npm run dev` should start.
- **Verify 401**: Run the two curl commands above.
- **Optional**: Test a real upload with a valid Azure AD JWT token.
- **Optional**: Add role-based upload restrictions (e.g., only managers can upload to RH).
- **Optional**: Add frontend UI for document upload/list/download.

---

## 📂 Key Files to Read First

- `hospital-api/.env` — current env vars
- `hospital-api/prisma/schema.prisma` — DB models
- `hospital-api/src/config/database.ts` — Prisma singleton
- `hospital-api/src/services/documentService.ts` — business logic
- `hospital-api/src/middleware/upload.ts` — Multer config
- `hospital-api/src/routes/documents.routes.ts` — API routes
- `hospital-api/src/server.ts` — bootstrap + DB connect

---

## 🧭 Quick Start for You

1. **Backend**:
   ```bash
   cd hospital-api
   npm run dev
   ```
2. **Verify 401**:
   ```bash
   curl -i http://localhost:3001/api/v1/documents/rh
   curl -i -X POST http://localhost:3001/api/v1/documents/upload
   ```
3. **Frontend (optional)**:
   ```bash
   cd hospital-intranet
   npm run dev
   ```

If anything fails, check the env vars and the console output. The system is deliberately strict; missing env vars or auth will surface immediately.

---

**Prepared by:** Cascade (AI Assistant)  
**For:** Next AI agent taking over the Hospital Intranet project  
**Context:** Backend with PostgreSQL/Prisma + file uploads + Azure AD auth; frontend ready; migrations applied; type-check passing.
