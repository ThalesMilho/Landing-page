import { prisma } from '../config/database';
import { Module, DocumentStatus } from '@prisma/client';
import { AzureAdJwtClaims } from '../types/azureAd';
import path from 'path';

export interface CreateDocumentInput {
  filename: string;
  storedName: string;
  mimeType: string;
  sizeBytes: number;
  module: Module;
  category: string;
  uploader: AzureAdJwtClaims;
  ipAddress?: string | undefined;
}

export const documentService = {
  async create(input: CreateDocumentInput) {
    const filePath = path.join(
      input.module.toLowerCase(),
      new Date().toISOString().slice(0, 7),
      input.storedName,
    );

    const doc = await prisma.document.create({
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
        status: DocumentStatus.PENDING,
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

  async publish(id: string, publisher: AzureAdJwtClaims, ipAddress?: string) {
    const doc = await prisma.document.update({
      where: { id },
      data: {
        status: DocumentStatus.PUBLISHED,
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

  async listByModule(module: Module, status?: DocumentStatus) {
    return prisma.document.findMany({
      where: {
        module,
        status: status ?? DocumentStatus.PUBLISHED,
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

  async getById(id: string) {
    return prisma.document.findUnique({
      where: { id },
      include: { auditLogs: { orderBy: { createdAt: 'desc' } } },
    });
  },

  async logDownload(id: string, downloader: AzureAdJwtClaims, ipAddress?: string) {
    await prisma.auditLog.create({
      data: {
        documentId: id,
        action: 'DOWNLOAD',
        performedBy: downloader.oid ?? 'unknown',
        performerName: downloader.name ?? 'Unknown',
        ...(ipAddress ? { ipAddress } : {}),
      },
    });
  },

  async archive(id: string, actor: AzureAdJwtClaims, ipAddress?: string) {
    return prisma.document.update({
      where: { id },
      data: {
        status: DocumentStatus.ARCHIVED,
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
