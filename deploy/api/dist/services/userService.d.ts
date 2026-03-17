import type { AzureAdJwtClaims } from "../types/azureAd";
export type UserProfile = {
    oid: string;
    displayName: string;
    givenName?: string;
    familyName?: string;
    email?: string;
    department?: string;
    jobTitle?: string;
    roles: string[];
    groups: string[];
    tenantId?: string;
};
export type UserPermissions = {
    canAccessAdmin: boolean;
    canViewEscalas: boolean;
    canViewRH: boolean;
    canViewQualidade: boolean;
    canViewRamais: boolean;
    canViewSuporte: boolean;
    canViewBiblioteca: boolean;
};
export declare function buildProfileFromClaims(claims: AzureAdJwtClaims): UserProfile;
export declare function buildPermissions(profile: UserProfile): UserPermissions;
//# sourceMappingURL=userService.d.ts.map