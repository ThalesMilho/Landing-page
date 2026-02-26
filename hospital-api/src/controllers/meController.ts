
import type { RequestHandler } from "express";
import { AppError } from "../middleware/errorHandler";
import { buildPermissions, buildProfileFromClaims } from "../services/userService";

export const meController: RequestHandler = (req, res) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const profile = buildProfileFromClaims(req.user);
  const permissions = buildPermissions(profile);

  res.json({
    success: true,
    data: {
      profile,
      permissions,
      tokenMeta: {
        issuedAt: req.user.iat ? new Date(req.user.iat * 1000).toISOString() : undefined,
        expiresAt: req.user.exp ? new Date(req.user.exp * 1000).toISOString() : undefined,
        tenantId: req.user.tid,
      },
    },
  });
};

export const mePermissionsController: RequestHandler = (req, res) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  const profile = buildProfileFromClaims(req.user);
  const permissions = buildPermissions(profile);

  res.json({
    success: true,
    data: {
      permissions,
    },
  });
};

