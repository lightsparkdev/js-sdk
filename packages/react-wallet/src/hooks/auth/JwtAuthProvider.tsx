import {
  CustomJwtAuthProvider,
  InMemoryTokenStorage,
  type AccessTokenStorage,
} from "@lightsparkdev/wallet-sdk";
import React, { useEffect, useState } from "react";
import { useLightsparkClient } from "../lightsparkclient/LightsparkClientProvider.js";
import type JwtAuthContextType from "./JwtAuthContext.js";

const AuthContext = React.createContext<JwtAuthContextType>(null!);

/**
 * A provider element that provides the JWT auth context to its children.
 *
 * @param children
 * @param tokenStorage Allows you to provide a custom implementation of the AccessTokenStorage interface for persistent storage.
 *     In React Native, inject the EncryptedLocalTokenStorage class from the
 *     @lightsparkdev/react-native package.
 *     For chrome extensions, inject the ChromeExtensionLocalTokenStorage class.
 *     Web apps should just use the InMemoryTokenStorage class, which is the default.
 */
function JwtAuthProvider({
  children,
  tokenStorage,
}: {
  children: React.ReactNode;
  tokenStorage?: AccessTokenStorage;
}) {
  const [authProvider] = useState<CustomJwtAuthProvider>(
    new CustomJwtAuthProvider(tokenStorage ?? new InMemoryTokenStorage()),
  );
  const clientProvider = useLightsparkClient();

  useEffect(() => {
    clientProvider.setAuthProvider(authProvider);
  }, [authProvider, clientProvider]);

  const login = async (accountId: string, jwt: string) => {
    clientProvider.setAuthProvider(authProvider);
    return await clientProvider
      .getClient()
      .loginWithJWT(accountId, jwt, tokenStorage ?? new InMemoryTokenStorage());
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
