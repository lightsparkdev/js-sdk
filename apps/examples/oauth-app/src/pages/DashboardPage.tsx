import styled from "@emotion/styled";
import {
  BitcoinNetwork,
  type SingleNodeDashboard,
} from "@lightsparkdev/lightspark-sdk";
import { useEffect, useState } from "react";
import { useAuth } from "src/auth/AuthProvider";
import RequireAuth from "src/auth/RequireAuth";
import Dashboard from "src/components/Dashboard";
import useAccountInfo from "src/hooks/useAccountInfo";
import { useLightsparkClient } from "src/lightsparkclient/LightsparkClientProvider";
import { Button } from "src/components/Button";

function DashboardPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const { account, nodeId } = useAccountInfo();
  const clientProvider = useLightsparkClient();
  const [dashboard, setDashboard] = useState<SingleNodeDashboard>();
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
            text="Sign out"
            onClick={() => {
              auth.signout().catch((err) => {
                console.log("Error signing out", err);
              });
            }}
          />
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
