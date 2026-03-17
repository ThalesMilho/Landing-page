"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentService = void 0;
const database_1 = require("../config/database");
const enums_1 = require("../types/enums");
const path_1 = __importDefault(require("path"));
exports.documentService = {
    async create(input) {
        const filePath = path_1.default.join(input.module.toLowerCase(), new Date().toISOString().slice(0, 7), input.storedName);
        const doc = await database_1.prisma.document.create({
            data: {
                filename: input.filename,
                storedName: input.storedName,
                mimeType: input.mimeType,
                sizeBytes: input.sizeBytes,
                filePath,
                module: input.module,
                category: input.category,
                uploaderOid: input.uploader.oid ?? 'unknown',
                uploaderName: input.uploader.name ?? 'Unknown',
                uploaderEmail: input.uploader.email ?? input.uploader.preferred_username ?? '',
                uploaderDept: input.uploader.department ?? '',
                status: enums_1.DocumentStatus.PENDING,
                auditLogs: {
                    create: {
                        action: 'UPLOAD',
                        performedBy: input.uploader.oid ?? 'unknown',
                        performerName: input.uploader.name ?? 'Unknown',
                        ...(input.ipAddress ? { ipAddress: input.ipAddress } : {}),
                    },
                },
            },
        });
        return doc;
    },
    async publish(id, publisher, ipAddress) {
        const doc = await database_1.prisma.document.update({
            where: { id },
            data: {
                status: enums_1.DocumentStatus.PUBLISHED,
                publishedAt: new Date(),
                auditLogs: {
                    create: {
                        action: 'PUBLISH',
                        performedBy: publisher.oid ?? 'unknown',
                        performerName: publisher.name ?? 'Unknown',
                        ...(ipAddress ? { ipAddress } : {}),
                    },
                },
            },
        });
        return doc;
    },
    async listByModule(module, status) {
        return database_1.prisma.document.findMany({
            where: {
                module,
                status: status ?? enums_1.DocumentStatus.PUBLISHED,
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                filename: true,
                mimeType: true,
                sizeBytes: true,
                category: true,
                uploaderName: true,
                createdAt: true,
                status: true,
            },
        });
    },
    async getById(id) {
        return database_1.prisma.document.findUnique({
            where: { id },
            include: { auditLogs: { orderBy: { createdAt: 'desc' } } },
        });
    },
    async logDownload(id, downloader, ipAddress) {
        await database_1.prisma.auditLog.create({
            data: {
                documentId: id,
                action: 'DOWNLOAD',
                performedBy: downloader.oid ?? 'unknown',
                performerName: downloader.name ?? 'Unknown',
                ...(ipAddress ? { ipAddress } : {}),
            },
        });
    },
    async archive(id, actor, ipAddress) {
        return database_1.prisma.document.update({
            where: { id },
            data: {
                status: enums_1.DocumentStatus.ARCHIVED,
                archivedAt: new Date(),
                auditLogs: {
                    create: {
                        action: 'ARCHIVE',
                        performedBy: actor.oid ?? 'unknown',
                        performerName: actor.name ?? 'Unknown',
                        ...(ipAddress ? { ipAddress } : {}),
                    },
                },
            },
        });
    },
};
//# sourceMappingURL=documentService.js.map