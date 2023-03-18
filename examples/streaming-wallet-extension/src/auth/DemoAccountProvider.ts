import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { v4 as uuid } from "uuid";
import { INSTANCE_ID_KEY } from "../common/storage";
import StreamingDemoAccountCredentials from "./StreamingDemoCredentials";

const GRAPH_QL_ENDPOINT = "https://api.dev.dev.sparkinfra.net/graphql";

dayjs.extend(utc);

const getInstanceID = (): Promise<string> => {
  return new Promise<string>((resolve) => {
    chrome.storage.local.get(INSTANCE_ID_KEY, (result) => {
      if (result.instanceID) {
        resolve(result.instanceID);
      } else {
        const instanceID = uuid();
        chrome.storage.local.set({ [INSTANCE_ID_KEY]: instanceID }, () => {
          resolve(instanceID);
        });
      }
    });
  });
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
            allocation_time
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
      console.error(
        "Failed to reserve demo account",
        JSON.stringify(responseJson.errors)
      );
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
      allocationTime: data.allocation_time,
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
