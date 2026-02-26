
export type AzureAdJwtClaims = {
  aud?: string | string[];
  iss?: string;
  iat?: number;
  nbf?: number;
  exp?: number;
  tid?: string;
  oid?: string;
  sub?: string;
  preferred_username?: string;
  upn?: string;
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  roles?: string[];
  groups?: string[];
};

