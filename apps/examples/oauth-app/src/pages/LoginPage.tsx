import styled from "@emotion/styled";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "src/auth/AuthProvider";
import { Button } from "src/components/Button";
import { useNavigate } from "src/components/router";
import { MainRoutes } from "src/routes";

type LocationState =
  | {
      from: { pathname: string };
    }
  | undefined;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  useEffect(() => {
    if (window.location.search.includes("code")) {
      const queryString = window.location.search.substring(1); // includes '?'
      navigate(MainRoutes.Oauth, { query: queryString });
    }
    auth
      .checkAuth()
      .then((isAuthorized: boolean) => {
        if (isAuthorized) {
          navigate(MainRoutes.Base);
        }
      })
      .catch((err) => {
        console.log("Error checking auth", err);
      });
  }, [auth, navigate]);

  const from = (location.state as LocationState)?.from?.pathname || "/";

  function handleLogin() {
    auth.signin(() => {
      // Send them back to the page they tried to visit when they were
      // redirected to the login page. Use { replace: true } so we don't create
      // another entry in the history stack for the login page.  This means that
      // when they get to the protected page and click the back button, they
      // won't end up back on the login page, which is also really nice for the
      // user experience.
      navigate(from as MainRoutes, undefined, { replace: true });
    });
  }

  return (
    <Container>
      <Description>Log into your Lightspark account to continue</Description>
      <Button text="Login" primary onClick={handleLogin} />
    </Container>
  );
};

const Description = styled.p`
  font-size: 20px;
  text-align: center;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: auto;
  height: 100vh;
`;

export default LoginPage;
