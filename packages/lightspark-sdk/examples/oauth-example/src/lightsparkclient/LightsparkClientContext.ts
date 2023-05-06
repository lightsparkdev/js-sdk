import { AuthProvider } from "@lightsparkdev/core";
import { LightsparkClient } from "@lightsparkdev/lightspark-sdk";

interface LightsparkClientContextType {
  getClient: () => LightsparkClient;
  setAuthProvider: (provider: AuthProvider) => void;
  isAuthenticated: () => Promise<boolean>;
}

export default LightsparkClientContextType;
