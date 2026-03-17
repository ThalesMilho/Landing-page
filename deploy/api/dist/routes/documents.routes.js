"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const rateLimiter_1 = require("../middleware/rateLimiter");
const upload_1 = require("../middleware/upload");
const documentController_1 = require("../controllers/documentController");
const router = (0, express_1.Router)();
router.use(rateLimiter_1.apiLimiter);
router.use(auth_1.requireAuth);
router.get('/:module', documentController_1.documentController.listByModule);
router.post('/upload', upload_1.uploadMiddleware.single('file'), documentController_1.documentController.upload);
router.get('/download/:id', documentController_1.documentController.download);
router.patch('/publish/:id', documentController_1.documentController.publish);
exports.default = router;
//# sourceMappingURL=documents.routes.js.map