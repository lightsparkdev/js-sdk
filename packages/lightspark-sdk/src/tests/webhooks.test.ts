import WebhookEventType from "../objects/WebhookEventType.js";
import { verifyAndParseWebhook } from "../webhooks.js";

describe("Webhooks", () => {
  test("should verify and parse webhook data", async () => {
    const eventType = WebhookEventType.NODE_STATUS;
    const eventId = "1615c8be5aa44e429eba700db2ed8ca5";
    const entityId = "lightning_node:01882c25-157a-f96b-0000-362d42b64397";
    const timeStamp = new Date("2023-05-17T23:56:47.874449+00:00");
    const data = `{"event_type": "NODE_STATUS", "event_id": "1615c8be5aa44e429eba700db2ed8ca5", "timestamp": "2023-05-17T23:56:47.874449+00:00", "entity_id": "lightning_node:01882c25-157a-f96b-0000-362d42b64397"}`;
    const hexdigest =
      "62a8829aeb48b4142533520b1f7f86cdb1ee7d718bf3ea15bc1c662d4c453b74";
    const webhookSecret = "3gZ5oQQUASYmqQNuEk0KambNMVkOADDItIJjzUlAWjX";

    const webhook = await verifyAndParseWebhook(
      Buffer.from(data, "utf-8"),
      hexdigest,
      webhookSecret,
    );

    expect(webhook.entity_id).toBe(entityId);
    expect(webhook.event_id).toBe(eventId);
    expect(webhook.event_type).toBe(eventType);
    expect(webhook.timestamp).toEqual(timeStamp);
  });
});
