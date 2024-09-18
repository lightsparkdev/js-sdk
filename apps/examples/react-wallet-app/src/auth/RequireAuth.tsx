import { useJwtAuth } from "@lightsparkdev/react-wallet";
import { useNavigate } from "@lightsparkdev/ui/router";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Routes } from "src/routes";

function RequireAuth({ children }: { children: JSX.Element }) {
  const auth = useJwtAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    void auth.isAuthorized().then((isAuthorized: boolean) => {
      if (!isAuthorized) {
        navigate(Routes.Login);
      }
    });
  }, [auth, location, navigate]);

  return children;
}

export default RequireAuth;
