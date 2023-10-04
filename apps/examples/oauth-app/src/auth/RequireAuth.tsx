import { useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { Navigate } from "src/components/router";
import { MainRoutes } from "src/routes";

function RequireAuth({ children }: { children: JSX.Element }) {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.isAuthorized()) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return (
      <Navigate to={MainRoutes.Login} state={{ from: location }} replace />
    );
  }

  return children;
}

export default RequireAuth;
