"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = require("crypto");
const env_1 = require("../config/env");
const errorHandler_1 = require("./errorHandler");
const ALLOWED_MIMES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'application/zip',
    'text/plain',
];
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        const dir = path_1.default.resolve(env_1.env.UPLOAD_DIR);
        fs_1.default.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const uuid = (0, crypto_1.randomUUID)();
        cb(null, `${uuid}${ext}`);
    },
});
exports.uploadMiddleware = (0, multer_1.default)({
    storage,
    limits: { fileSize: env_1.env.MAX_FILE_SIZE_MB * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIMES.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new errorHandler_1.AppError(`File type not allowed: ${file.mimetype}`, 400));
        }
    },
});
//# sourceMappingURL=upload.js.map