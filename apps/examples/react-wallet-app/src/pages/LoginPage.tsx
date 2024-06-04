import styled from "@emotion/styled";
import { useJwtAuth } from "@lightsparkdev/react-wallet";
import { useEffect, useState } from "react";
import { Button } from "src/components/Button";
import { useNavigate } from "src/components/router";
import { Routes } from "src/routes";

const LoginPage = () => {
  const navigate = useNavigate();
  const auth = useJwtAuth();
  const [accountId, setAccountId] = useState("");
  const [jwt, setJwt] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [jwtServerUrl, setJwtServerUrl] = useState("");

  useEffect(() => {
    void auth.isAuthorized().then((isAuthorized: boolean) => {
      if (isAuthorized) {
        navigate(Routes.Dashboard);
      }
    });
  }, [auth, navigate]);

  function handleLogin() {
    void auth.login(accountId, jwt).then(() => {
      navigate(Routes.Dashboard);
    });
  }

  const generateDemoTokens = async () => {
    const { token: jwt, accountId: jwtServerAccountId } = await fetch(
      `${jwtServerUrl.replace(
        /\/$/,
        ""
      )}/getJwt?userId=${userName}&password=${password}`,
      {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      }
    ).then(
      (res) => res.json() as Promise<{ token: string; accountId: string }>
    );
    await auth.login(jwtServerAccountId, jwt);
    navigate(Routes.Dashboard);
  };

  return (
    <Container>
      <Description>Log into your Lightspark account to continue</Description>
      <Label>
        <span>Account ID:</span>
        <input
          type="text"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
        />
      </Label>
      <br />
      <Label style={{ marginBottom: "32px" }}>
        <span>JWT:</span>
        <input
          type="text"
          value={jwt}
          onChange={(e) => setJwt(e.target.value)}
        />
      </Label>
      <Button kind="primary" onClick={handleLogin} text="Login" />

      <Description>
        Alternatively, use our demo jwt server with a user name and password.
        <br />
        See js-sdk/packages/wallet-sdk/examples/jwt-server
      </Description>
      <Label>
        <span>JWT Server URL:</span>
        <input
          type="text"
          value={jwtServerUrl}
          onChange={(e) => setJwtServerUrl(e.target.value)}
        />
      </Label>
      <Label>
        <span>User Name:</span>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
      </Label>
      <Label>
        <span>Password:</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Label>
      <Button
        kind="primary"
        onClick={() => {
          void generateDemoTokens();
        }}
        text="Generate Demo Tokens"
      />
    </Container>
  );
};

const Label = styled.label`
  display: flex;
  flex-direction: row;
  font-size: 18px;
  margin-bottom: 16px;
  width: 100%;

  & > span {
    width: 150px;
    color: #666666;
  }

  & > input {
    margin-left: 8px;
    padding: 4px;
    border-radius: 4px;
    border: 1px solid #e0e0e0;
    width: 100%;
  }
`;

const Description = styled.p`
  font-size: 24px;
  text-align: center;
  margin-bottom: 64px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: auto;
  height: 100vh;
  max-width: 600px;
`;

export default LoginPage;
