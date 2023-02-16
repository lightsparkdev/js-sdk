import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import StreamingDemoAccountCredentials from "./StreamingDemoCredentials";

const GRAPH_QL_ENDPOINT =
  "https://api.dev.dev.sparkinfra.net/graphql";

dayjs.extend(utc);

// TODO: Remove when the backend is fully ready.
// const TEST_ACCOUNT = {
//   clientId: "0185c15936bf4f89000019ac0f816213",
//   clientSecret: "pvKTJfP-DFz66U8ofen9Z2my6nt7ImcpS3rCgW6Ohbs",
// };
// const TEST_VIEWER_WALLET_ID =
//   "LightsparkNode:0185c269-8aa3-f96b-0000-0ae100b58599";
// const TEST_CREATOR_WALLET_ID =
//   "LightsparkNode:0185c3fb-da63-f96b-0000-dde38238b1b3";
// const TEST_CREDS = {
//   clientId: TEST_ACCOUNT.clientId,
//   clientSecret: TEST_ACCOUNT.clientSecret,
//   creatorWalletId: TEST_CREATOR_WALLET_ID,
//   viewerWalletId: TEST_VIEWER_WALLET_ID,
// };

declare namespace chrome {
  namespace instanceID {
    function getID(callback: (id: string) => void): void;
  }
}

const getInstanceID = (): Promise<string> => {
  return new Promise<string>((resolve) => chrome.instanceID.getID(resolve));
};

export const reserveStreamingDemoAccountCredentials =
  async (): Promise<StreamingDemoAccountCredentials | null> => {
    const response = await fetch(GRAPH_QL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Lightspark-Beta": "z2h0BBYxTA83cjW7fi8QwWtBPCzkQKiemcuhKY08LOo",
      },
      body: JSON.stringify({
        query: `mutation DemoAccountReserve {
          DEMO_reserve_streaming_sats_account(input: { extension_id: "${await getInstanceID()}" }) {
            signing_private_key
            sender_node_id
            receiver_node_id
            client_secret
            api_token {
              id
              client_id
              name
            }
            expires_at
          }
        }`,
        operationName: "DemoAccountReserve",
      }),
    });
    if (!response.ok) {
      console.error("Failed to reserve demo account", response.statusText);
      return null;
    }
    const responseJson = await response.json();
    const data = responseJson.data.DEMO_reserve_streaming_sats_account;
    if (!data) {
      console.error("Failed to reserve demo account", JSON.stringify(responseJson.errors));
      return null;
    }
    return {
      clientId: data.api_token.client_id,
      clientSecret: data.client_secret,
      viewerWalletId: data.sender_node_id,
      creatorWalletId: data.receiver_node_id,
      viewerSigningKey: data.signing_private_key,
      apiTokenId: data.api_token.id,
      expiresAt: dayjs.utc(data.expires_at).utc().valueOf(),
    };
  };

export const unreserveStreamingDemoAccountCredentials = async (
  credentials: StreamingDemoAccountCredentials
): Promise<void> => {
  await fetch(GRAPH_QL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Lightspark-Beta": "z2h0BBYxTA83cjW7fi8QwWtBPCzkQKiemcuhKY08LOo",
    },
    body: JSON.stringify({
      query: `mutation DemoAccountUnreserve {
        DEMO_unreserve_streaming_sats_account(input: {
          extension_id: "${await getInstanceID()}"
          api_token_id: "${credentials.apiTokenId}"
        }) {
          success
        }
      }`,
      operationName: "DemoAccountUnreserve",
    }),
  });
};
