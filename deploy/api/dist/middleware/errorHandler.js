"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const logger_1 = require("../config/logger");
const env_1 = require("../config/env");
class AppError extends Error {
    status;
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, _next) => {
    const status = err instanceof AppError ? err.status : 500;
    const message = err instanceof Error ? err.message : "An unexpected error occurred";
    const logPayload = {
        err: err instanceof Error ? err : undefined,
        status,
        method: req.method,
        path: req.originalUrl,
    };
    if (status >= 500) {
        logger_1.logger.error(logPayload, "Request failed");
    }
    else {
        logger_1.logger.warn(logPayload, "Request failed");
    }
    res.status(status).json({
        status,
        error: status === 401
            ? "Unauthorized"
            : status === 403
                ? "Forbidden"
                : status === 400
                    ? "Bad Request"
                    : status === 429
                        ? "Too Many Requests"
                        : status === 404
                            ? "Not Found"
                            : status === 500
                                ? "Internal Server Error"
                                : "Error",
        message: env_1.env.NODE_ENV === "production" && status === 500 ? "An unexpected error occurred" : message,
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map