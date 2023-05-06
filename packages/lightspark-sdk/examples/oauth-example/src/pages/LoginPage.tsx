import styled from "@emotion/styled";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { Button } from "../components/Button";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  useEffect(() => {
    if (window.location.search.includes("code")) {
      const queryString = window.location.search.substring(1); // includes '?'
      const path = ["/oauth", queryString].join("#");
      navigate(path);
    }
    auth.checkAuth().then((isAuthorized: boolean) => {
      if (isAuthorized) {
        navigate("/");
      }
    });
  }, [auth, navigate]);

  const from = location.state?.from?.pathname || "/";

  function handleLogin() {
    auth.signin(() => {
      // Send them back to the page they tried to visit when they were
      // redirected to the login page. Use { replace: true } so we don't create
      // another entry in the history stack for the login page.  This means that
      // when they get to the protected page and click the back button, they
      // won't end up back on the login page, which is also really nice for the
      // user experience.
      navigate(from, { replace: true });
    });
  }

  return (
    <Container>
      <Description>Log into your Lightspark account to continue</Description>
      <Button primary onClick={handleLogin}>
        Login
      </Button>
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
