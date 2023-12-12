import {
  CustomJwtAuthProvider,
  InMemoryJwtStorage,
  LocalStorageJwtStorage,
  type JwtStorage,
} from "@lightsparkdev/wallet-sdk";
import React, { useEffect, useState } from "react";
import { useLightsparkClient } from "../lightsparkclient/LightsparkClientProvider.js";
import type JwtAuthContextType from "./JwtAuthContext.js";

const AuthContext = React.createContext<JwtAuthContextType>(null!);

/**
 * A provider element that provides the JWT auth context to its children.
 *
 * @param children
 * @param useLocalStorage Set this to true to use persisent local storage instead of in-memory storage.
 *     This should only be used in a web context and not with React Native.
 *     For React Native, set the customTokenStorage param to an instance of the
 *     EncryptedLocalTokenStorage class from the @lightsparkdev/react-native package.
 * @param customTokenStorage Allows you to provide a custom implementation of the JwtStorage interface.
 *     Useful for React Native to inject the EncryptedLocalTokenStorage class from the
 *     @lightsparkdev/react-native package.
 */
function JwtAuthProvider({
  children,
  useLocalStorage,
  customTokenStorage,
}: {
  children: React.ReactNode;
  useLocalStorage?: boolean;
  customTokenStorage?: JwtStorage;
}) {
  const getTokenStorage = () => {
    if (customTokenStorage) {
      return customTokenStorage;
    }
    return useLocalStorage
      ? new LocalStorageJwtStorage()
      : new InMemoryJwtStorage();
  };
  const [authProvider] = useState<CustomJwtAuthProvider>(
    new CustomJwtAuthProvider(getTokenStorage()),
  );
  const clientProvider = useLightsparkClient();

  useEffect(() => {
    clientProvider.setAuthProvider(authProvider);
  }, [authProvider, clientProvider]);

  const login = async (accountId: string, jwt: string) => {
    clientProvider.setAuthProvider(authProvider);
    return await clientProvider
      .getClient()
      .loginWithJWT(accountId, jwt, getTokenStorage());
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
