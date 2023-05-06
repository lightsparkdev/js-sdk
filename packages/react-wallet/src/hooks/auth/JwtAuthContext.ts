import { LoginWithJWTOutput } from "@lightsparkdev/wallet-sdk";

interface JwtAuthContextType {
  login: (accountId: string, jwt: string) => Promise<LoginWithJWTOutput>;
  logout: () => Promise<void>;
  isAuthorized: () => Promise<boolean>;
}

export default JwtAuthContextType;
