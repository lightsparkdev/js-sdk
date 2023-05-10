import { useJwtAuth } from "@lightsparkdev/react-wallet";
import { useCallback, useEffect, useState } from "react";
import SignIn from "./components/SignIn";
import DashboardPage from "./pages/DashboardPage";

export default function PageContainer() {
  const auth = useJwtAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    auth.isAuthorized().then(setIsAuthorized);
  }, [auth]);

  const refreshAuth = useCallback(async () => {
    auth.isAuthorized().then(setIsAuthorized);
  }, [auth]);

  return isAuthorized ? (
    <DashboardPage onSignOut={refreshAuth} />
  ) : (
    <SignIn onSignIn={refreshAuth} />
  );
}
