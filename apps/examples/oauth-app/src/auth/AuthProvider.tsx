import { OAuthProvider as LsOauthProvider } from "@lightsparkdev/oauth";
import React, { useState } from "react";
import { useLightsparkClient } from "src/lightsparkclient/LightsparkClientProvider";
import type AuthContextType from "./AuthContext";
import { OAuthProvider } from "./oauthProvider";

const AuthContext = React.createContext<AuthContextType>(null!);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [oauthProvider] = useState<OAuthProvider>(new OAuthProvider());
  const clientProvider = useLightsparkClient();

  const checkAuth = async () => {
    if (await oauthProvider.checkAuth()) {
      clientProvider.setAuthProvider(
        new LsOauthProvider(oauthProvider.oauthHelper)
      );
      return true;
    }
    return false;
  };

  const signin = (callback: VoidFunction) => {
    return oauthProvider.signin(callback);
  };

  const signout = () => {
    return oauthProvider.signout();
  };

  const isAuthorized = () => {
    return oauthProvider.isAuthorized();
  };

  const value = { signin, signout, checkAuth, isAuthorized };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}

export default AuthProvider;
