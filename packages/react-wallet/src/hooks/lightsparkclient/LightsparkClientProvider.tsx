import type { AuthProvider, CryptoInterface } from "@lightsparkdev/core";
import { StubAuthProvider } from "@lightsparkdev/core";
import { LightsparkClient } from "@lightsparkdev/wallet-sdk";
import React, { useState } from "react";
import type LightsparkClientContextType from "./LightsparkClientContext.js";

const LightsparkClientContext =
  React.createContext<LightsparkClientContextType>(null!);

function LightsparkClientProvider({
  children,
  serverUrl,
  customCryptoImpl,
}: {
  children: React.ReactNode;
  serverUrl?: string;
  customCryptoImpl?: CryptoInterface;
}) {
  const [client] = useState<LightsparkClient>(
    new LightsparkClient(new StubAuthProvider(), serverUrl, customCryptoImpl),
  );

  const getClient = () => {
    return client;
  };

  const isAuthenticated = () => {
    return client.isAuthorized();
  };

  const setAuthProvider = (authProvider: AuthProvider) => {
    return client.setAuthProvider(authProvider);
  };

  const value = { getClient, setAuthProvider, isAuthenticated };

  return (
    <LightsparkClientContext.Provider value={value}>
      {children}
    </LightsparkClientContext.Provider>
  );
}

export function useLightsparkClient() {
  return React.useContext(LightsparkClientContext);
}

export default LightsparkClientProvider;
