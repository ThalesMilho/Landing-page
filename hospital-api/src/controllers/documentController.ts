import type { NextFunction, Request, Response } from 'express';
import { Module } from '../types/enums';
import { documentService } from '../services/documentService';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';

const uploadSchema = z.object({
  module: z.enum(['RH', 'QUALIDADE', 'SUPORTE']),
  category: z.string().min(1).max(100),
});

export const documentController = {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new AppError('No file provided', 400);
      if (!req.user) throw new AppError('Not authenticated', 401);

      const body = uploadSchema.parse(req.body);

      const doc = await documentService.create({
        filename: req.file.originalname,
        storedName: req.file.filename,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
        module: body.module as Module,
        category: body.category,
        uploader: req.user,
        ...(req.ip ? { ipAddress: req.ip } : {}),
      });

      res.status(201).json({ success: true, data: doc });
    } catch (err) {
      next(err);
    }
  },

  async listByModule(req: Request, res: Response, next: NextFunction) {
    try {
      const module = req.params['module']?.toUpperCase();
      if (!['RH', 'QUALIDADE', 'SUPORTE'].includes(module ?? '')) {
        throw new AppError('Invalid module', 400);
      }

      const docs = await documentService.listByModule(module as Module);
      res.json({ success: true, data: docs });
    } catch (err) {
      next(err);
    }
  },

  async download(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Not authenticated', 401);

      const doc = await documentService.getById(req.params['id'] ?? '');
      if (!doc) throw new AppError('Document not found', 404);

      await documentService.logDownload(doc.id, req.user, req.ip);

      const filePath = path.resolve(env.UPLOAD_DIR, doc.storedName);
      if (!fs.existsSync(filePath)) throw new AppError('File not found on disk', 404);

      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.filename)}"`);
      res.setHeader('Content-Type', doc.mimeType);
      res.sendFile(filePath);
    } catch (err) {
      next(err);
    }
  },

  async publish(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError('Not authenticated', 401);

      const doc = await documentService.publish(req.params['id'] ?? '', req.user, req.ip);
      res.json({ success: true, data: doc });
    } catch (err) {
      next(err);
    }
  },
};
