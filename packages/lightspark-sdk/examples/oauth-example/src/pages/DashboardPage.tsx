import styled from "@emotion/styled";
import { BitcoinNetwork, WalletDashboard } from "@lightsparkdev/lightspark-sdk";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import RequireAuth from "../auth/RequireAuth";
import { Button } from "../components/Button";
import Dashboard from "../components/Dashboard";
import useAccountInfo from "../hooks/useAccountInfo";
import { useLightsparkClient } from "../lightsparkclient/LightsparkClientProvider";

function DashboardPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const { account, nodeId } = useAccountInfo();
  const clientProvider = useLightsparkClient();
  const [dashboard, setDashboard] = useState<WalletDashboard>();
  const auth = useAuth();

  useEffect(() => {
    if (!account || !nodeId) {
      return;
    }
    const client = clientProvider.getClient();
    client
      .getSingleNodeDashboard(nodeId, BitcoinNetwork.REGTEST)
      .then((dashboard) => {
        setDashboard(dashboard);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [account, clientProvider, nodeId]);

  let content;
  if (loading) {
    content = <div>Loading...</div>;
  } else if (!dashboard) {
    content = <div>Something went wrong :-(</div>;
  } else {
    content = (
      <div>
        <Header>
          <Button
            primary
            onClick={() => {
              auth.signout();
            }}
          >
            Sign out
          </Button>
        </Header>
        <Dashboard data={dashboard} />
      </div>
    );
  }

  return <RequireAuth>{content}</RequireAuth>;
}

const Header = styled.div`
  display: flex;
  justify-content: end;
  align-items: center;
  width: 100%;
  max-width: 800px;
  padding: 16px;
`;

export default DashboardPage;
