"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const errorHandler_1 = require("./errorHandler");
const jwksClient = (0, jwks_rsa_1.default)({
    jwksUri: `https://login.microsoftonline.com/${env_1.env.AZURE_TENANT_ID}/discovery/v2.0/keys`,
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 10 * 60 * 1000,
    rateLimit: true,
    jwksRequestsPerMinute: 10,
});
function getKey(header, callback) {
    if (!header.kid) {
        callback(new errorHandler_1.AppError("Missing token kid", 401));
        return;
    }
    jwksClient.getSigningKey(header.kid, (err, key) => {
        if (err || !key) {
            callback(new errorHandler_1.AppError("Unable to fetch signing key", 401));
            return;
        }
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
    });
}
const requireAuth = (req, _res, next) => {
    const authHeader = req.header("authorization");
    if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
        next(new errorHandler_1.AppError("Missing bearer token", 401));
        return;
    }
    const token = authHeader.slice("bearer ".length).trim();
    const issuer = `https://login.microsoftonline.com/${env_1.env.AZURE_TENANT_ID}/v2.0`;
    jsonwebtoken_1.default.verify(token, getKey, {
        algorithms: ["RS256"],
        issuer,
        audience: env_1.env.AZURE_AUDIENCE,
    }, (err, decoded) => {
        if (err) {
            next(new errorHandler_1.AppError(err.message, 401));
            return;
        }
        const claims = decoded;
        req.user = claims;
        next();
    });
};
exports.requireAuth = requireAuth;
//# sourceMappingURL=auth.js.map