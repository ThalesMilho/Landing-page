import type { ErrorRequestHandler } from "express";
export declare class AppError extends Error {
    readonly status: number;
    constructor(message: string, status: number);
}
export declare const errorHandler: ErrorRequestHandler;
//# sourceMappingURL=errorHandler.d.ts.map