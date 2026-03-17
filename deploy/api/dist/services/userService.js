"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildProfileFromClaims = buildProfileFromClaims;
exports.buildPermissions = buildPermissions;
function buildProfileFromClaims(claims) {
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
function buildPermissions(profile) {
    const hasRole = (r) => profile.roles.includes(r);
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
//# sourceMappingURL=userService.js.map