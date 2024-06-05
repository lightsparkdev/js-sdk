import { LightsparkSigningException, isNode } from "@lightsparkdev/core";
import type LightsparkClient from "./client.js";
import { WebhookEventType } from "./objects/WebhookEventType.js";

export const WEBHOOKS_SIGNATURE_HEADER = "lightspark-signature";

export interface WebhookEvent {
  event_type: WebhookEventType;
  event_id: string;
  timestamp: Date;
  entity_id: string;
  wallet_id?: string;
}

export const verifyAndParseWebhook = async (
  data: Uint8Array,
  hexdigest: string,
  webhook_secret: string,
): Promise<WebhookEvent> => {
  /* dynamic import to avoid bundling crypto in browser */
  const { createHmac } = await import("crypto");
  const sig = createHmac("sha256", webhook_secret).update(data).digest("hex");

  if (sig.toLowerCase() !== hexdigest.toLowerCase()) {
    throw new Error("Webhook message hash does not match signature");
  }

  return parseWebhook(data);
};

const parseWebhook = async (data: Uint8Array): Promise<WebhookEvent> => {
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
    wallet_id: event.wallet_id,
  };
};

type Validator = {
  should_sign: (event: WebhookEvent) => boolean;
};

export class RemoteSigningWebhookHandler {
  client: LightsparkClient;
  #masterSeed: Uint8Array;
  validator: Validator;

  constructor(
    client: LightsparkClient,
    masterSeed: Uint8Array,
    validator: Validator,
  ) {
    this.client = client;
    this.#masterSeed = masterSeed;
    this.validator = validator;
  }

  async handleWebhookRequest(
    data: Uint8Array,
    webhookSignature: string,
    webhookSecret: string,
  ) {
    if (!isNode) {
      throw new LightsparkSigningException(
        "Environment not supported for handling webhooks.",
      );
    }

    const { wasm_handle_remote_signing_webhook_event } = await import(
      "@lightsparkdev/crypto-wasm"
    );
    const response = wasm_handle_remote_signing_webhook_event(
      data,
      webhookSignature,
      webhookSecret,
      this.#masterSeed,
      this.validator,
    );
    if (!response) {
      return;
    }
    const variables = JSON.parse(response.variables);
    return this.client.executeRawQuery({
      queryPayload: response.query,
      variables,
      constructObject: (rawData: unknown) => rawData,
    });
  }
}
