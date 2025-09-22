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
  hexDigest: string,
  webhookSecret: string,
): Promise<WebhookEvent> => {
  /* dynamic import to avoid bundling crypto in browser */
  const { createHmac, timingSafeEqual } = await import("crypto");
  const sig = new Uint8Array(
    createHmac("sha256", webhookSecret).update(data).digest(),
  );

  const digestBytes = new Uint8Array(Buffer.from(hexDigest, "hex"));
  if (
    // Ensure there are no extra chars, since Buffer.from silently drops them.
    // Each byte is represented by two hex characters.
    digestBytes.length !== hexDigest.length / 2 ||
    // timingSafeEqual checks this, but throws a different error.
    sig.length !== digestBytes.length ||
    !timingSafeEqual(sig, digestBytes)
  ) {
    throw new Error("Webhook message hash does not match signature");
  }

  return parseWebhook(data);
};

const parseWebhook = (data: Uint8Array): WebhookEvent => {
  const dataStr = new TextDecoder().decode(data);
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
  should_sign: (event: WebhookEvent) => boolean | Promise<boolean>;
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

    // Pre-parse to expose a typed event to the validator and allow async decisions.
    const event = await verifyAndParseWebhook(
      data,
      webhookSignature,
      webhookSecret,
    );

    const decision = await this.validator.should_sign(event);

    const { wasm_handle_remote_signing_webhook_event } = await import(
      "@lightsparkdev/crypto-wasm"
    );

    const response = wasm_handle_remote_signing_webhook_event(
      data,
      webhookSignature,
      webhookSecret,
      this.#masterSeed,
      { should_sign: () => decision },
    );
    if (!response) {
      return;
    }

    /* WASM returns a double-encoded JSON string for variables: */
    let jsonVariablesString: string;
    let variables: {
      [key: string]: unknown;
    };
    try {
      jsonVariablesString = JSON.parse(response.variables);
    } catch (e) {
      throw new LightsparkSigningException(
        "Unable to get JSON variables string from response",
      );
    }
    try {
      variables = JSON.parse(jsonVariablesString);
    } catch (e) {
      throw new LightsparkSigningException(
        "Unable to parse JSON variables from response",
      );
    }
    return this.client.executeRawQuery({
      queryPayload: response.query,
      variables,
      constructObject: (rawData: unknown) => rawData,
    });
  }
}
