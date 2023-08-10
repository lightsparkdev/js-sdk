import styled from "@emotion/styled";
import { b64encode, DefaultCrypto, KeyOrAlias } from "@lightsparkdev/core";
import { useJwtAuth, useLightsparkClient } from "@lightsparkdev/react-wallet";
import type { WalletDashboard } from "@lightsparkdev/wallet-sdk";
import { KeyType, WalletStatus } from "@lightsparkdev/wallet-sdk";
import { useEffect, useState } from "react";
import { Button } from "src/components/Button";
import { useNavigate } from "src/components/router";
import { Routes } from "src/routes";
import RequireAuth from "../auth/RequireAuth";
import Dashboard from "../components/Dashboard";
import useWalletInfo from "../hooks/useWalletInfo";

function DashboardPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const { wallet, refresh: refreshWallet } = useWalletInfo();
  const clientProvider = useLightsparkClient();
  const [dashboard, setDashboard] = useState<WalletDashboard>();
  const auth = useJwtAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!wallet) {
      return;
    }
    const client = clientProvider.getClient();
    client
      .getWalletDashboard()
      .then((dashboard) => {
        if (dashboard) {
          setDashboard(dashboard);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [wallet, clientProvider]);

  let content;
  if (loading) {
    content = <div>Loading...</div>;
  } else if (!dashboard || dashboard.status === WalletStatus.FAILED) {
    content = <div>Something went wrong :-(</div>;
  } else if (
    dashboard.status === WalletStatus.NOT_SETUP ||
    dashboard.status === WalletStatus.DEPLOYING
  ) {
    content = (
      <DeployWallet
        status={wallet?.status || WalletStatus.FAILED}
        onDeploy={async () => {
          setLoading(true);
          await clientProvider.getClient().deployWalletAndAwaitDeployed();
          await refreshWallet();
          setLoading(false);
        }}
      />
    );
  } else if (
    dashboard.status === WalletStatus.DEPLOYED ||
    dashboard.status === WalletStatus.INITIALIZING
  ) {
    content = (
      <InitializeWallet
        status={wallet?.status || WalletStatus.FAILED}
        onInitialize={async () => {
          setLoading(true);
          const keys = await DefaultCrypto.generateSigningKeyPair();
          const serializedPublicKeyBytes =
            await DefaultCrypto.serializeSigningKey(keys.publicKey, "spki");
          const serializedPrivateKeyBytes =
            await DefaultCrypto.serializeSigningKey(keys.privateKey, "pkcs8");
          // You can save the keys somewhere here if you want to use them later. Here,
          // we're just logging them to the console for demo purposes.
          console.log("Save these keys if you want to use this wallet later!");
          console.log("Public key:", b64encode(serializedPublicKeyBytes));
          console.log("Private key:", b64encode(serializedPrivateKeyBytes));
          await clientProvider
            .getClient()
            .initializeWalletAndAwaitReady(
              KeyType.RSA_OAEP,
              b64encode(serializedPublicKeyBytes),
              KeyOrAlias.key(b64encode(serializedPrivateKeyBytes))
            );
          await refreshWallet();
          setLoading(false);
        }}
      />
    );
  } else {
    content = (
      <div>
        <Header>
          <Button
            text="Sign out"
            primary
            onClick={async () => {
              await auth.logout();
              navigate(Routes.Login);
            }}
          />
        </Header>
        <Dashboard data={dashboard} />
      </div>
    );
  }

  return <RequireAuth>{content}</RequireAuth>;
}

const DeployWallet = ({
  onDeploy,
  status,
}: {
  onDeploy: () => void;
  status: WalletStatus;
}) => {
  return (
    <div>
      <h1>Wallet not yet deployed. Status: {status}</h1>
      <Button primary onClick={onDeploy} text="Deploy Wallet" />
    </div>
  );
};

const InitializeWallet = ({
  onInitialize,
  status,
}: {
  onInitialize: () => void;
  status: WalletStatus;
}) => {
  return (
    <div>
      <h1>Wallet not yet initialized. Status: {status}</h1>
      <Button primary onClick={onInitialize} text="Initialize Wallet" />
    </div>
  );
};

const Header = styled.div`
  display: flex;
  justify-content: end;
  align-items: center;
  width: 100%;
  padding: 16px;
`;

export default DashboardPage;
