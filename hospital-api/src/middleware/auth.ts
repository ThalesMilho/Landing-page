
import type { RequestHandler } from "express";
import jwksRsa from "jwks-rsa";
import type { SigningKey } from "jwks-rsa";
import jwt, { type JwtHeader, type VerifyErrors } from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "./errorHandler";
import type { AzureAdJwtClaims } from "../types/azureAd";

const jwksClient = jwksRsa({
  jwksUri: `https://login.microsoftonline.com/${env.AZURE_TENANT_ID}/discovery/v2.0/keys`,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 10 * 60 * 1000,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

function getKey(header: JwtHeader, callback: (err: Error | null, key?: string) => void) {
  if (!header.kid) {
    callback(new AppError("Missing token kid", 401));
    return;
  }

  jwksClient.getSigningKey(header.kid, (err: Error | null, key?: SigningKey) => {
    if (err || !key) {
      callback(new AppError("Unable to fetch signing key", 401));
      return;
    }

    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const authHeader = req.header("authorization");
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    next(new AppError("Missing bearer token", 401));
    return;
  }

  const token = authHeader.slice("bearer ".length).trim();
  const issuer = `https://login.microsoftonline.com/${env.AZURE_TENANT_ID}/v2.0`;

  jwt.verify(
    token,
    getKey,
    {
      algorithms: ["RS256"],
      issuer,
      audience: env.AZURE_AUDIENCE,
    },
    (err: VerifyErrors | null, decoded: unknown) => {
      if (err) {
        next(new AppError(err.message, 401));
        return;
      }

      const claims = decoded as AzureAdJwtClaims;
      req.user = claims;
      next();
    },
  );
};

