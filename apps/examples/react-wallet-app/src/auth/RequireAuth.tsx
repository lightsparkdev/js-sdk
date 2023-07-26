import { useJwtAuth } from "@lightsparkdev/react-wallet";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "src/common/router";
import { Routes } from "src/routes";

function RequireAuth({ children }: { children: JSX.Element }) {
  let auth = useJwtAuth();
  let location = useLocation();
  let navigate = useNavigate();

  useEffect(() => {
    auth.isAuthorized().then((isAuthorized: boolean) => {
      if (!isAuthorized) {
        navigate(Routes.Login);
      }
    });
  }, [auth, location, navigate]);

  return children;
}

export default RequireAuth;
