import { useJwtAuth } from "@lightsparkdev/react-wallet";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "src/common/router";
import { Routes } from "src/routes";

function RequireAuth({ children }: { children: JSX.Element }) {
  const auth = useJwtAuth();
  const location = useLocation();
  const navigate = useNavigate();

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
