import {
  CustomJwtAuthProvider,
  InMemoryJwtStorage,
  LocalStorageJwtStorage,
} from "@lightsparkdev/wallet-sdk";
import React, { useEffect, useState } from "react";
import { useLightsparkClient } from "../lightsparkclient/LightsparkClientProvider.js";
import JwtAuthContextType from "./JwtAuthContext.js";

const AuthContext = React.createContext<JwtAuthContextType>(null!);

function JwtAuthProvider({
  children,
  useLocalStorage,
}: {
  children: React.ReactNode;
  useLocalStorage: boolean;
}) {
  const [authProvider] = useState<CustomJwtAuthProvider>(
    new CustomJwtAuthProvider(
      useLocalStorage ? new LocalStorageJwtStorage() : new InMemoryJwtStorage()
    )
  );
  const clientProvider = useLightsparkClient();

  useEffect(() => {
    clientProvider.setAuthProvider(authProvider);
  }, [authProvider, clientProvider]);

  const login = async (accountId: string, jwt: string) => {
    const jwtStorage = useLocalStorage
      ? new LocalStorageJwtStorage()
      : new InMemoryJwtStorage();
    clientProvider.setAuthProvider(authProvider);
    return await clientProvider
      .getClient()
      .loginWithJWT(accountId, jwt, jwtStorage);
  };

  const logout = () => {
    return authProvider.logout();
  };

  const isAuthorized = () => {
    return authProvider.isAuthorized();
  };

  const value = { login, logout, isAuthorized };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useJwtAuth() {
  return React.useContext(AuthContext);
}

export default JwtAuthProvider;
