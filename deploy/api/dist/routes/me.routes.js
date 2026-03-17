"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const meController_1 = require("../controllers/meController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/api/v1/me", auth_1.requireAuth, meController_1.meController);
router.get("/api/v1/me/permissions", auth_1.requireAuth, meController_1.mePermissionsController);
exports.default = router;
//# sourceMappingURL=me.routes.js.map