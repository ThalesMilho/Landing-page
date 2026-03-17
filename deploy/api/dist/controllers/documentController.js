"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentController = void 0;
const documentService_1 = require("../services/documentService");
const errorHandler_1 = require("../middleware/errorHandler");
const zod_1 = require("zod");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const env_1 = require("../config/env");
const uploadSchema = zod_1.z.object({
    module: zod_1.z.enum(['RH', 'QUALIDADE', 'SUPORTE']),
    category: zod_1.z.string().min(1).max(100),
});
exports.documentController = {
    async upload(req, res, next) {
        try {
            if (!req.file)
                throw new errorHandler_1.AppError('No file provided', 400);
            if (!req.user)
                throw new errorHandler_1.AppError('Not authenticated', 401);
            const body = uploadSchema.parse(req.body);
            const doc = await documentService_1.documentService.create({
                filename: req.file.originalname,
                storedName: req.file.filename,
                mimeType: req.file.mimetype,
                sizeBytes: req.file.size,
                module: body.module,
                category: body.category,
                uploader: req.user,
                ...(req.ip ? { ipAddress: req.ip } : {}),
            });
            res.status(201).json({ success: true, data: doc });
        }
        catch (err) {
            next(err);
        }
    },
    async listByModule(req, res, next) {
        try {
            const module = req.params['module']?.toUpperCase();
            if (!['RH', 'QUALIDADE', 'SUPORTE'].includes(module ?? '')) {
                throw new errorHandler_1.AppError('Invalid module', 400);
            }
            const docs = await documentService_1.documentService.listByModule(module);
            res.json({ success: true, data: docs });
        }
        catch (err) {
            next(err);
        }
    },
    async download(req, res, next) {
        try {
            if (!req.user)
                throw new errorHandler_1.AppError('Not authenticated', 401);
            const doc = await documentService_1.documentService.getById(req.params['id'] ?? '');
            if (!doc)
                throw new errorHandler_1.AppError('Document not found', 404);
            await documentService_1.documentService.logDownload(doc.id, req.user, req.ip);
            const filePath = path_1.default.resolve(env_1.env.UPLOAD_DIR, doc.storedName);
            if (!fs_1.default.existsSync(filePath))
                throw new errorHandler_1.AppError('File not found on disk', 404);
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.filename)}"`);
            res.setHeader('Content-Type', doc.mimeType);
            res.sendFile(filePath);
        }
        catch (err) {
            next(err);
        }
    },
    async publish(req, res, next) {
        try {
            if (!req.user)
                throw new errorHandler_1.AppError('Not authenticated', 401);
            const doc = await documentService_1.documentService.publish(req.params['id'] ?? '', req.user, req.ip);
            res.json({ success: true, data: doc });
        }
        catch (err) {
            next(err);
        }
    },
};
//# sourceMappingURL=documentController.js.map