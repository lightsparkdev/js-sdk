import StreamingDemoAccountCredentials from "./StreamingDemoCredentials";

const RESERVE_ENDPOINT =
  "https://api.dev.dev.sparkinfra.net/streaming_sats/reserve_account";
const UNRESERVE_ENDPOINT =
  "https://api.dev.dev.sparkinfra.net/streaming_sats/unreserve_account";

// TODO: Remove when the backend is fully ready.
const TEST_ACCOUNT = {
  clientId: "0185c15936bf4f89000019ac0f816213",
  clientSecret: "pvKTJfP-DFz66U8ofen9Z2my6nt7ImcpS3rCgW6Ohbs",
};
const TEST_VIEWER_WALLET_ID =
  "LightsparkNode:0185c269-8aa3-f96b-0000-0ae100b58599";
const TEST_CREATOR_WALLET_ID =
  "LightsparkNode:0185c3fb-da63-f96b-0000-dde38238b1b3";
const TEST_CREDS = {
  clientId: TEST_ACCOUNT.clientId,
  clientSecret: TEST_ACCOUNT.clientSecret,
  creatorWalletId: TEST_CREATOR_WALLET_ID,
  viewerWalletId: TEST_VIEWER_WALLET_ID,
};

const getInstanceID = async (): Promise<string> => {
  // TODO: Integrate with IID for realz.
  return chrome.runtime.id + "1";
};

export const reserveStreamingDemoAccountCredentials =
  async (): Promise<StreamingDemoAccountCredentials> => {
    const response = await fetch(RESERVE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Lightspark-Beta": "z2h0BBYxTA83cjW7fi8QwWtBPCzkQKiemcuhKY08LOo",
      },
      body: JSON.stringify({
        extension_id: await getInstanceID(),
      }),
    });
    const data = await response.json();
    return {
      clientId: data.api_token.client_id,
      clientSecret: data.client_secret,
      viewerWalletId: data.sender_node_id,
      creatorWalletId: data.receiver_node_id,
      viewerSigningKey: data.signing_private_key,
      apiTokenId: data.api_token.id,
    };
  };

export const unreserveStreamingDemoAccountCredentials =
    async (credentials: StreamingDemoAccountCredentials): Promise<void> => {
      await fetch(UNRESERVE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Lightspark-Beta": "z2h0BBYxTA83cjW7fi8QwWtBPCzkQKiemcuhKY08LOo",
        },
        body: JSON.stringify({
          extension_id: await getInstanceID(),
          api_token_id: credentials.apiTokenId
        }),
      });
    };
