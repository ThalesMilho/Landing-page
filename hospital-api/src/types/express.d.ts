
import type { AzureAdJwtClaims } from "./azureAd";

declare global {
  namespace Express {
    interface Request {
      user?: AzureAdJwtClaims;
    }
  }
}

export {};

