import { AuthProvider, StubAuthProvider } from "@lightsparkdev/core";
import { LightsparkClient } from "@lightsparkdev/wallet-sdk";
import React, { useState } from "react";
import LightsparkClientContextType from "./LightsparkClientContext.js";

let LightsparkClientContext = React.createContext<LightsparkClientContextType>(
  null!
);

function LightsparkClientProvider({
  children,
  serverUrl,
}: {
  children: React.ReactNode;
  serverUrl?: string;
}) {
  const [client] = useState<LightsparkClient>(
    new LightsparkClient(new StubAuthProvider(), serverUrl)
  );

  const getClient = () => {
    return client;
  };

  const isAuthenticated = () => {
    return client.isAuthorized();
  };

  const setAuthProvider = (authProvider: AuthProvider) => {
    client.setAuthProvider(authProvider);
  };

  let value = { getClient, setAuthProvider, isAuthenticated };

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
