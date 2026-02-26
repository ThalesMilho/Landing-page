# Hospital Intranet API

Secure Node.js/TypeScript Resource Server for the Hospital Intranet.
Implements Zero Trust authentication via Azure Active Directory JWT validation.

---

## Architecture

```
src/
├── config/
│   ├── env.ts            ← Zod-validated env vars (crashes if invalid)
│   └── logger.ts         ← Structured JSON logging (pino)
│
├── middleware/
│   ├── auth.ts           ← Azure AD JWT validation (JWKS + RS256)
│   ├── errorHandler.ts   ← Global error handler + AppError class
│   ├── rateLimiter.ts    ← 3-tier rate limiting
│   └── requestLogger.ts  ← Per-request HTTP logging
│
├── routes/
│   ├── index.ts          ← Central route registry
│   ├── health.routes.ts  ← GET /health (public)
│   └── me.routes.ts      ← GET /api/v1/me (protected)
│
├── controllers/
│   ├── healthController.ts
│   └── meController.ts
│
├── services/
│   └── userService.ts    ← Business logic (mock → swap for DB)
│
├── types/
│   ├── azureAd.ts        ← Typed AD JWT claims
│   └── express.d.ts      ← req.user type augmentation
│
├── app.ts                ← Express setup (middleware + routes wired)
└── server.ts             ← Entry point + graceful shutdown
```

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# → Fill in AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_AUDIENCE

# 3. Run in development
npm run dev

# 4. Test public endpoint
curl http://localhost:3001/health

# 5. Test protected endpoint (requires real Azure AD token)
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/v1/me
```

---

## API Endpoints

| Method | Path                     | Auth     | Description                        |
|--------|--------------------------|----------|------------------------------------|
| GET    | /health                  | ❌ Public | Server health check                |
| GET    | /api/v1/me               | ✅ Bearer | Authenticated user profile         |
| GET    | /api/v1/me/permissions   | ✅ Bearer | User permission flags              |

### GET /health
```json
{
  "status": "healthy",
  "service": "hospital-intranet-api",
  "environment": "production",
  "timestamp": "2025-02-24T13:00:00.000Z",
  "uptime": 3600.12
}
```

### GET /api/v1/me (200 OK)
```json
{
  "success": true,
  "data": {
    "profile": {
      "oid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "displayName": "Dr. Carlos Silva",
      "givenName": "Carlos",
      "familyName": "Silva",
      "email": "dr.silva@hospital.com",
      "department": "Clínica Geral",
      "jobTitle": "Médico Clínico",
      "roles": ["Intranet.User"],
      "groups": [],
      "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    },
    "permissions": {
      "canAccessAdmin": false,
      "canViewEscalas": true,
      "canViewRH": false,
      "canViewQualidade": false,
      "canViewRamais": true,
      "canViewSuporte": true,
      "canViewBiblioteca": true
    },
    "tokenMeta": {
      "issuedAt": "2025-02-24T12:00:00.000Z",
      "expiresAt": "2025-02-24T13:00:00.000Z",
      "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    }
  }
}
```

### Error Responses (consistent shape)
```json
{ "status": 401, "error": "Unauthorized",     "message": "Token has expired" }
{ "status": 403, "error": "Forbidden",        "message": "Required role(s): Intranet.Admin" }
{ "status": 400, "error": "Bad Request",      "message": "Input validation failed",
  "details": [{ "field": "employeeId", "message": "Required" }] }
{ "status": 429, "error": "Too Many Requests","message": "Request limit exceeded" }
{ "status": 500, "error": "Internal Server Error", "message": "An unexpected error occurred" }
```

---

## Azure AD Setup (for IT Admin)

### 1. Create App Registration
Azure Portal → Azure AD → App Registrations → New Registration
- Name: `Hospital Intranet API`
- Supported account types: `Single tenant`
- Redirect URI: leave empty (this is an API, not a SPA)

### 2. Configure App Roles (in Manifest)
```json
"appRoles": [
  {
    "allowedMemberTypes": ["User"],
    "displayName": "Intranet Admin",
    "id": "generate-a-uuid-here",
    "isEnabled": true,
    "value": "Intranet.Admin"
  },
  {
    "allowedMemberTypes": ["User"],
    "displayName": "Intranet User",
    "id": "generate-a-uuid-here",
    "isEnabled": true,
    "value": "Intranet.User"
  },
  {
    "allowedMemberTypes": ["User"],
    "displayName": "Intranet RH",
    "id": "generate-a-uuid-here",
    "isEnabled": true,
    "value": "Intranet.RH"
  }
]
```

### 3. Enable Group Claims (optional)
In Manifest, set: `"groupMembershipClaims": "SecurityGroup"`

### 4. Note your values for .env
- Tenant ID: Overview → Directory (tenant) ID
- Client ID: Overview → Application (client) ID
- Audience: same as Client ID, or `api://{client-id}` for custom

---

## Security Checklist

- [x] JWT signature verified via JWKS (RS256 only)
- [x] Issuer (iss) claim validated against tenant
- [x] Audience (aud) claim validated against app
- [x] Expiration (exp) enforced
- [x] Algorithm confusion attack prevented (RS256 whitelist)
- [x] Stack traces never sent to client in production
- [x] PII redacted from logs
- [x] Rate limiting (3 tiers)
- [x] Helmet security headers
- [x] CORS locked to allowed origin
- [x] Request body size limited (50kb)
- [x] Graceful shutdown handled
- [x] Unhandled rejection crashes process (fail fast)
