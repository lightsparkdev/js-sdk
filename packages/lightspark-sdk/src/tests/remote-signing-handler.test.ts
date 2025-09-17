import { hexToBytes } from "@lightsparkdev/core";
import { createHmac } from "crypto";
import type LightsparkClient from "../client.js";
import { RemoteSigningWebhookHandler } from "../webhooks.js";

describe("RemoteSigningWebhookHandler (integration with wasm)", () => {
  const seedHex =
    "1a6deac8f74fb2e332677e3f4833b5e962f80d153fb368b8ee322a9caca4113d56cccd88f1c6a74e152669d8cd373fee2f27e3645d80de27640177a8c71395f8";
  const seedBytes = hexToBytes(seedHex);

  test("revoke/ack path returns undefined and does not call client", async () => {
    const dataHex =
      "7b226576656e745f74797065223a202252454d4f54455f5349474e494e47222c20226576656e745f6964223a20223031386665366130346663323036613830303030393538343032643337663465222c20226170695f76657273696f6e223a2022323032332d30392d3133222c202274696d657374616d70223a2022323032342d30362d30355430343a32303a31362e3936323134312b30303a3030222c2022656e746974795f6964223a20224368616e6e656c3a30313866653661302d346661372d363965332d303030302d653139633836386564366564222c202264617461223a207b227375625f6576656e745f74797065223a202252455645414c5f434f554e54455250415254595f5045525f434f4d4d49544d454e545f534543524554222c2022626974636f696e5f6e6574776f726b223a202252454754455354222c20227065725f636f6d6d69746d656e745f7365637265745f696478223a2032373336333139312c20227065725f636f6d6d69746d656e745f736563726574223a202236363837613837386538393733353535353131343039653363633762643934663535336336643265616230656231353831343761383337386266386335333261222c20226e6f64655f6964223a20226e6f64655f776974685f7365727665725f7369676e696e673a30313861393633352d333637332d383864662d303030302d383237663233303531623139227d7d";
    const dataBytes = hexToBytes(dataHex);
    const sig =
      "864f7f575ec2425eb6ecfe457cbf17b41da0e4cbb70cda126c00ea507fbf699c";
    const webhookSecret = "39kyJO140v7fYkwHnR7jz8Y3UphqVeNYQk44Xx049ws";

    const calls: Array<[Parameters<LightsparkClient["executeRawQuery"]>[0]]> =
      [];
    const executeRawQuery: LightsparkClient["executeRawQuery"] = async (
      query,
    ) => {
      calls.push([query]);
      return null;
    };
    const client = { executeRawQuery } as unknown as LightsparkClient;

    const handler = new RemoteSigningWebhookHandler(client, seedBytes, {
      should_sign: async () => true,
    });

    const res = await handler.handleWebhookRequest(
      dataBytes,
      sig,
      webhookSecret,
    );
    expect(res).toBeUndefined();
    expect(calls.length).toBe(0);
  });

  test("async validator true → executes UpdateChannelPerCommitmentPoint", async () => {
    const dataHex =
      "7b226576656e745f74797065223a202252454d4f54455f5349474e494e47222c20226576656e745f6964223a20223031386665366138313066333036613830303030363835353239663539316563222c20226170695f76657273696f6e223a2022323032332d30392d3133222c202274696d657374616d70223a2022323032342d30362d30355430343a32383a34352e3137313839392b30303a3030222c2022656e746974795f6964223a20224368616e6e656c3a30313866653661382d313039362d363965332d303030302d623630373635343330663635222c202264617461223a207b227375625f6576656e745f74797065223a20224745545f5045525f434f4d4d49544d454e545f504f494e54222c2022626974636f696e5f6e6574776f726b223a202252454754455354222c202264657269766174696f6e5f70617468223a20226d2f332f3139333238222c20227065725f636f6d6d69746d656e745f706f696e745f696478223a2032373336333139312c20226e6f64655f6964223a20226e6f64655f776974685f7365727665725f7369676e696e673a30313861393633352d333637332d383864662d303030302d383237663233303531623139227d7d";
    const dataBytes = hexToBytes(dataHex);
    const sig =
      "5809279c1fd8088a6c62be82d3e858c11ce187ee97a0fadae1ae498e2f69442c";
    const webhookSecret = "39kyJO140v7fYkwHnR7jz8Y3UphqVeNYQk44Xx049ws";

    const expectedVarsJson =
      '{"channel_id":"Channel:018fe6a8-1096-69e3-0000-b60765430f65","per_commitment_point":"027ba8a666d57947ba8337d0e211cae9125dbaf7c9883cb34f49393bc1a4907dd8","per_commitment_point_index":27363191}';

    const calls: Array<[Parameters<LightsparkClient["executeRawQuery"]>[0]]> =
      [];
    const executeRawQuery: LightsparkClient["executeRawQuery"] = async (
      query,
    ) => {
      calls.push([query]);
      return null;
    };
    const client = { executeRawQuery } as unknown as LightsparkClient;

    const handler = new RemoteSigningWebhookHandler(client, seedBytes, {
      should_sign: async () => true,
    });

    await handler.handleWebhookRequest(dataBytes, sig, webhookSecret);
    expect(calls.length).toBe(1);
    const [[firstArg]] = calls;
    expect(firstArg.queryPayload).toMatch(
      /^mutation UpdateChannelPerCommitmentPoint/,
    );
    expect(firstArg.variables).toEqual(JSON.parse(expectedVarsJson));
  });

  test("async validator false → does not execute query and throws", async () => {
    const dataHex =
      "7b226576656e745f74797065223a202252454d4f54455f5349474e494e47222c20226576656e745f6964223a20223031386665366138313066333036613830303030363835353239663539316563222c20226170695f76657273696f6e223a2022323032332d30392d3133222c202274696d657374616d70223a2022323032342d30362d30355430343a32383a34352e3137313839392b30303a3030222c2022656e746974795f6964223a20224368616e6e656c3a30313866653661382d313039362d363965332d303030302d623630373635343330663635222c202264617461223a207b227375625f6576656e745f74797065223a20224745545f5045525f434f4d4d49544d454e545f504f494e54222c2022626974636f696e5f6e6574776f726b223a202252454754455354222c202264657269766174696f6e5f70617468223a20226d2f332f3139333238222c20227065725f636f6d6d69746d656e745f706f696e745f696478223a2032373336333139312c20226e6f64655f6964223a20226e6f64655f776974685f7365727665725f7369676e696e673a30313861393633352d333637332d383864662d303030302d383237663233303531623139227d7d";
    const dataBytes = hexToBytes(dataHex);
    const sig =
      "5809279c1fd8088a6c62be82d3e858c11ce187ee97a0fadae1ae498e2f69442c";
    const webhookSecret = "39kyJO140v7fYkwHnR7jz8Y3UphqVeNYQk44Xx049ws";

    const calls: Array<[Parameters<LightsparkClient["executeRawQuery"]>[0]]> =
      [];
    const executeRawQuery: LightsparkClient["executeRawQuery"] = async (
      query,
    ) => {
      calls.push([query]);
      return null;
    };
    const client = { executeRawQuery } as unknown as LightsparkClient;

    const handler = new RemoteSigningWebhookHandler(client, seedBytes, {
      should_sign: async () => false,
    });

    await expect(
      handler.handleWebhookRequest(dataBytes, sig, webhookSecret),
    ).rejects.toBeTruthy();
    expect(calls.length).toBe(0);
  });

  test("async validator false (DERIVE_KEY_AND_SIGN) → decline_to_sign_messages", async () => {
    const event = {
      event_type: "REMOTE_SIGNING",
      event_id: "abc-derive",
      timestamp: "2024-06-05T04:28:45.171899+00:00",
      entity_id: "Node:018fe6a8-1096-69e3-0000-b60765430f65",
      data: {
        sub_event_type: "DERIVE_KEY_AND_SIGN",
        bitcoin_network: "REGTEST",
        signing_jobs: [
          {
            id: "payload-1",
            derivation_path: "m/3/2106220917/0",
            message:
              "476bdd1db5d91897d00d75300eef50c0da7e0b2dada06dde93cbb5903b7e16b2",
            is_raw: true,
          },
        ],
      },
    };
    const json = JSON.stringify(event);
    const dataBytes = new TextEncoder().encode(json);
    const webhookSecret = "39kyJO140v7fYkwHnR7jz8Y3UphqVeNYQk44Xx049ws";
    const sig = createHmac("sha256", webhookSecret)
      .update(dataBytes)
      .digest("hex");

    const calls: Array<[Parameters<LightsparkClient["executeRawQuery"]>[0]]> =
      [];
    const executeRawQuery: LightsparkClient["executeRawQuery"] = async (
      query,
    ) => {
      calls.push([query]);
      return null;
    };
    const client = { executeRawQuery } as unknown as LightsparkClient;

    const handler = new RemoteSigningWebhookHandler(client, seedBytes, {
      should_sign: async () => false,
    });

    await handler.handleWebhookRequest(dataBytes, sig, webhookSecret);
    expect(calls.length).toBe(1);
    const [[firstArg]] = calls;
    expect(firstArg.queryPayload).toMatch(/decline_to_sign_messages\s*\(/);
    expect(firstArg.variables).toEqual({ payload_ids: ["payload-1"] });
  });
});
