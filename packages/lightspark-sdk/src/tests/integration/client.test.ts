import LightsparkClient from "../../client.js";
import { getCredentialsFromEnvOrThrow } from "../../env.js";
import {
  AccountTokenAuthProvider,
  BitcoinNetwork,
} from "../../index.js";

describe("lightspark-sdk client", () => {
  const { apiTokenClientId, apiTokenClientSecret, baseUrl } =
    getCredentialsFromEnvOrThrow();
  const accountAuthProvider = new AccountTokenAuthProvider(
    apiTokenClientId,
    apiTokenClientSecret,
  );
  let regtestNodeId: string | undefined;

  function getRegtestNodeId() {
    expect(regtestNodeId).toBeDefined();
    if (!regtestNodeId) {
      throw new Error("regtestNodeId is not set");
    }
    return regtestNodeId as string;
  }

  it("should get env vars and construct the client successfully", async () => {
    const lightsparkClient = new LightsparkClient(accountAuthProvider, baseUrl);
    expect(lightsparkClient).toBeDefined();
  });

  it("should successfully get the current account regtest node", async () => {
    const lightsparkClient = new LightsparkClient(accountAuthProvider, baseUrl);

    const account = await lightsparkClient.getCurrentAccount();
    const nodesConnection = await account?.getNodes(lightsparkClient, 1, [
      BitcoinNetwork.REGTEST,
    ]);

    const regtestNode = nodesConnection?.entities[0];
    expect(regtestNode).toBeDefined();
    regtestNodeId = regtestNode?.id;
  });

  it("should successfully create an uma invoice", async () => {
    const nodeId = getRegtestNodeId();
    const lightsparkClient = new LightsparkClient(accountAuthProvider, baseUrl);

    const metadata = JSON.stringify([
      ["text/plain", "Pay to vasp2.com user $bob"],
      ["text/identifier", "$bob@vasp2.com"],
    ]);

    const umaInvoice = await lightsparkClient.createInvoice(
      nodeId,
      1000,
      metadata,
    );
    expect(umaInvoice).toBeDefined();
  });
});
