"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
require("express-async-errors");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const env_1 = require("./config/env");
const rateLimiter_1 = require("./middleware/rateLimiter");
const requestLogger_1 = require("./middleware/requestLogger");
const errorHandler_1 = require("./middleware/errorHandler");
const routes_1 = __importDefault(require("./routes"));
function buildApp() {
    const app = (0, express_1.default)();
    app.set("trust proxy", 1);
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: env_1.env.ALLOWED_ORIGIN,
        credentials: true,
    }));
    app.use(express_1.default.json({ limit: "50kb" }));
    app.use(requestLogger_1.requestLogger);
    app.use(rateLimiter_1.publicLimiter);
    app.use(rateLimiter_1.apiLimiter);
    app.use(routes_1.default);
    app.use((_req, _res, next) => next(new errorHandler_1.AppError("Not Found", 404)));
    app.use(errorHandler_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map