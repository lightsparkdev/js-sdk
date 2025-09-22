import { expect } from "@jest/globals";
import WebhookEventType from "../objects/WebhookEventType.js";
import { verifyAndParseWebhook } from "../webhooks.js";

describe("Webhooks", () => {
  test("should verify and parse webhook data", async () => {
    const data = `{"event_type": "NODE_STATUS", "event_id": "1615c8be5aa44e429eba700db2ed8ca5", "timestamp": "2023-05-17T23:56:47.874449+00:00", "entity_id": "lightning_node:01882c25-157a-f96b-0000-362d42b64397"}`;
    const hexDigest =
      "62a8829aeb48b4142533520b1f7f86cdb1ee7d718bf3ea15bc1c662d4c453b74";
    const webhookSecret = "3gZ5oQQUASYmqQNuEk0KambNMVkOADDItIJjzUlAWjX";

    const webhook = await verifyAndParseWebhook(
      Buffer.from(data),
      hexDigest,
      webhookSecret,
    );

    expect(webhook.entity_id).toBe(
      "lightning_node:01882c25-157a-f96b-0000-362d42b64397",
    );
    expect(webhook.event_id).toBe("1615c8be5aa44e429eba700db2ed8ca5");
    expect(webhook.event_type).toBe(WebhookEventType.NODE_STATUS);
    expect(webhook.timestamp).toEqual(
      new Date("2023-05-17T23:56:47.874449+00:00"),
    );
  });

  test.each([
    ["wrong length", "deadbeef"],
    ["is incorrect", "a".repeat(64)],
    ["is not hex", "NotAHexValue"],
    [
      "has extra bytes",
      "62a8829aeb48b4142533520b1f7f86cdb1ee7d718bf3ea15bc1c662d4c453b74" + "qq",
    ],
  ])("should error when hex digest %s", async (name, digest) => {
    const data = `{"event_type": "NODE_STATUS", "event_id": "1615c8be5aa44e429eba700db2ed8ca5", "timestamp": "2023-05-17T23:56:47.874449+00:00", "entity_id": "lightning_node:01882c25-157a-f96b-0000-362d42b64397"}`;
    const webhookSecret = "3gZ5oQQUASYmqQNuEk0KambNMVkOADDItIJjzUlAWjX";

    expect.assertions(1);
    await expect(
      verifyAndParseWebhook(Buffer.from(data), digest, webhookSecret),
    ).rejects.toThrow("Webhook message hash does not match signature");
  });

  test("should throw on invalid signature", async () => {
    const data = `{"event_type": "NODE_STATUS", "event_id": "1615c8be5aa44e429eba700db2ed8ca5", "timestamp": "2023-05-17T23:56:47.874449+00:00", "entity_id": "lightning_node:01882c25-157a-f96b-0000-362d42b64397"}`;
    const invalidHex =
      "62a8829aeb48b4142533520b1f7f86cdb1ee7d718bf3ea15bc1c662d4c453b70";
    const webhookSecret = "3gZ5oQQUASYmqQNuEk0KambNMVkOADDItIJjzUlAWjX";

    await expect(
      verifyAndParseWebhook(
        new TextEncoder().encode(data),
        invalidHex,
        webhookSecret,
      ),
    ).rejects.toThrow("Webhook message hash does not match signature");
  });
});
