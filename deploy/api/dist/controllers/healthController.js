"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthController = void 0;
const env_1 = require("../config/env");
const healthController = (_req, res) => {
    res.json({
        status: "healthy",
        service: "hospital-intranet-api",
        environment: env_1.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
};
exports.healthController = healthController;
//# sourceMappingURL=healthController.js.map