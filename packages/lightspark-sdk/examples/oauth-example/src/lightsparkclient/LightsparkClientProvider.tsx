import { AuthProvider } from "@lightsparkdev/core";
import { LightsparkClient } from "@lightsparkdev/lightspark-sdk";
import React, { useState } from "react";
import LightsparkClientContextType from "./LightsparkClientContext";

let LightsparkClientContext = React.createContext<LightsparkClientContextType>(
  null!
);

function LightsparkClientProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<LightsparkClient | null>(null);

  const getClient = () => {
    if (!client) {
      throw new Error(
        "LightsparkClient not initialized. Set an auth provider before using the client."
      );
    }

    return client;
  };

  const isAuthenticated = () => {
    if (!client) {
      return Promise.resolve(false);
    }
    return client.isAuthorized();
  };

  const setAuthProvider = (authProvider: AuthProvider) => {
    if (!client) {
      setClient(
        new LightsparkClient(authProvider, "api.dev.dev.sparkinfra.net")
      );
    } else {
      client.setAuthProvider(authProvider);
    }
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
