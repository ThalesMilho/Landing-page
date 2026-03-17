"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mePermissionsController = exports.meController = void 0;
const errorHandler_1 = require("../middleware/errorHandler");
const userService_1 = require("../services/userService");
const meController = (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError("Unauthorized", 401);
    }
    const profile = (0, userService_1.buildProfileFromClaims)(req.user);
    const permissions = (0, userService_1.buildPermissions)(profile);
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
exports.meController = meController;
const mePermissionsController = (req, res) => {
    if (!req.user) {
        throw new errorHandler_1.AppError("Unauthorized", 401);
    }
    const profile = (0, userService_1.buildProfileFromClaims)(req.user);
    const permissions = (0, userService_1.buildPermissions)(profile);
    res.json({
        success: true,
        data: {
            permissions,
        },
    });
};
exports.mePermissionsController = mePermissionsController;
//# sourceMappingURL=meController.js.map