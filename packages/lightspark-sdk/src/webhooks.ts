import { createHmac } from "crypto";
import { WebhookEventType } from "./objects/WebhookEventType.js";

export const WEBHOOKS_SIGNATURE_HEADER = "lightspark-signature";

export interface WebhookEvent {
  event_type: WebhookEventType;
  event_id: string;
  timestamp: Date;
  entity_id: string;
}

export const verify_and_parse_webhook = (
  data: Uint8Array,
  hexdigest: string,
  webhook_secret: string
): Promise<WebhookEvent> => {
  const sig = createHmac("sha256", webhook_secret).update(data).digest("hex");

  if (sig.toLowerCase() !== hexdigest.toLowerCase()) {
    throw new Error("Webhook message hash does not match signature");
  }

  return parse_webhook(data);
};

export const parse_webhook = async (
  data: Uint8Array
): Promise<WebhookEvent> => {
  let td = TextDecoder;
  if (typeof td === "undefined") {
    const tdModule = await import("text-encoding");
    td = tdModule.TextDecoder;
  }
  const dataStr = new td().decode(data);
  const event = JSON.parse(dataStr);

  return {
    event_type: WebhookEventType[event.event_type],
    event_id: event.event_id,
    timestamp: new Date(event.timestamp),
    entity_id: event.entity_id,
  };
};
