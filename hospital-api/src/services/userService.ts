
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

export function buildProfileFromClaims(claims: AzureAdJwtClaims): UserProfile {
  const roles = claims.roles ?? [];
  const groups = claims.groups ?? [];
  const email = claims.preferred_username ?? claims.upn ?? claims.email;

  return {
    oid: claims.oid ?? "unknown",
    displayName: claims.name ?? email ?? "Unknown User",
    ...(claims.given_name ? { givenName: claims.given_name } : {}),
    ...(claims.family_name ? { familyName: claims.family_name } : {}),
    ...(email ? { email } : {}),
    roles,
    groups,
    ...(claims.tid ? { tenantId: claims.tid } : {}),
  };
}

export function buildPermissions(profile: UserProfile): UserPermissions {
  const hasRole = (r: string) => profile.roles.includes(r);

  const isAdmin = hasRole("Intranet.Admin");
  const isRH = hasRole("Intranet.RH");
  const isUser = hasRole("Intranet.User") || profile.roles.length === 0;

  return {
    canAccessAdmin: isAdmin,
    canViewEscalas: isUser || isAdmin,
    canViewRH: isRH || isAdmin,
    canViewQualidade: isUser || isAdmin,
    canViewRamais: isUser || isAdmin,
    canViewSuporte: isUser || isAdmin,
    canViewBiblioteca: isUser || isAdmin,
  };
}

