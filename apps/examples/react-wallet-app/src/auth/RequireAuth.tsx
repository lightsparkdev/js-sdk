import { useJwtAuth } from "@lightsparkdev/react-wallet";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function RequireAuth({ children }: { children: JSX.Element }) {
  let auth = useJwtAuth();
  let location = useLocation();
  let navigate = useNavigate();

  useEffect(() => {
    auth.isAuthorized().then((isAuthorized: boolean) => {
      if (!isAuthorized) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience
        // than dropping them off on the home page.
        navigate("/login", { state: { from: location }, replace: true });
      }
    });
  }, [auth, location, navigate]);

  return children;
}

export default RequireAuth;
