import { Account } from "@lightsparkdev/lightspark-sdk";
import { useEffect, useState } from "react";
import { useLightsparkClient } from "../lightsparkclient/LightsparkClientProvider";

const useAccountInfo = () => {
  const clientProvider = useLightsparkClient();
  const [account, setAccount] = useState<Account | null>(null);
  const [nodeId, setNodeId] = useState<string | null>(null);

  useEffect(() => {
    clientProvider.isAuthenticated().then((isAuthed) => {
      if (!isAuthed) {
        return;
      }
      const client = clientProvider.getClient();
      client.getCurrentAccount().then(async (account) => {
        if (account) {
          setAccount(account);
        }

        const nodes = await account?.getNodes(client);
        const nodeId = nodes?.entities[0].id ?? null;
        setNodeId(nodeId);
      });
    });
  }, [clientProvider]);

  return { account, nodeId };
};

export default useAccountInfo;
