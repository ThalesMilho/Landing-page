import { Module, DocumentStatus } from '../types/enums';
import { AzureAdJwtClaims } from '../types/azureAd';
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
export declare const documentService: {
    create(input: CreateDocumentInput): Promise<{
        status: string;
        module: string;
        id: string;
        filename: string;
        storedName: string;
        mimeType: string;
        sizeBytes: number;
        filePath: string;
        category: string;
        uploaderOid: string;
        uploaderName: string;
        uploaderEmail: string;
        uploaderDept: string;
        publishedAt: Date | null;
        archivedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    publish(id: string, publisher: AzureAdJwtClaims, ipAddress?: string): Promise<{
        status: string;
        module: string;
        id: string;
        filename: string;
        storedName: string;
        mimeType: string;
        sizeBytes: number;
        filePath: string;
        category: string;
        uploaderOid: string;
        uploaderName: string;
        uploaderEmail: string;
        uploaderDept: string;
        publishedAt: Date | null;
        archivedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listByModule(module: Module, status?: DocumentStatus): Promise<{
        status: string;
        id: string;
        filename: string;
        mimeType: string;
        sizeBytes: number;
        category: string;
        uploaderName: string;
        createdAt: Date;
    }[]>;
    getById(id: string): Promise<({
        auditLogs: {
            id: string;
            createdAt: Date;
            action: string;
            performedBy: string;
            performerName: string;
            ipAddress: string | null;
            userAgent: string | null;
            notes: string | null;
            documentId: string;
        }[];
    } & {
        status: string;
        module: string;
        id: string;
        filename: string;
        storedName: string;
        mimeType: string;
        sizeBytes: number;
        filePath: string;
        category: string;
        uploaderOid: string;
        uploaderName: string;
        uploaderEmail: string;
        uploaderDept: string;
        publishedAt: Date | null;
        archivedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    logDownload(id: string, downloader: AzureAdJwtClaims, ipAddress?: string): Promise<void>;
    archive(id: string, actor: AzureAdJwtClaims, ipAddress?: string): Promise<{
        status: string;
        module: string;
        id: string;
        filename: string;
        storedName: string;
        mimeType: string;
        sizeBytes: number;
        filePath: string;
        category: string;
        uploaderOid: string;
        uploaderName: string;
        uploaderEmail: string;
        uploaderDept: string;
        publishedAt: Date | null;
        archivedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
};
//# sourceMappingURL=documentService.d.ts.map