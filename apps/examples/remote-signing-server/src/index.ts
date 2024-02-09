import { hexToBytes, isUint8Array } from "@lightsparkdev/core";
import {
  AccountTokenAuthProvider,
  LightsparkClient,
  RemoteSigningWebhookHandler,
  WEBHOOKS_SIGNATURE_HEADER,
  WebhookEventType,
  verifyAndParseWebhook,
  type WebhookEvent,
} from "@lightsparkdev/lightspark-sdk";
import {
  getCredentialsFromEnvOrThrow,
  type EnvCredentials,
} from "@lightsparkdev/lightspark-sdk/env";
import bodyParser from "body-parser";
import express from "express";

type LightsparkNodeJsGlobals = {
  RK_WEBHOOK_SECRET: string;
  RK_MASTER_SEED_HEX: string;
};
type ProcessEnv = NodeJS.ProcessEnv & LightsparkNodeJsGlobals;
const env = process.env as ProcessEnv;

export const app = express();

const WEBHOOK_SECRET = env.RK_WEBHOOK_SECRET;
const MASTER_SEED_HEX = env.RK_MASTER_SEED_HEX;

app.use(bodyParser.raw({ type: "*/*" })); // Middleware to parse raw body

app.get("/ping", (req, res) => {
  console.log("ping");
  res.send("OK");
});

app.post("/lightspark-webhook", (req, res) => {
  (async () => {
    let credentials: EnvCredentials;
    try {
      const signatureHeader = req.headers[WEBHOOKS_SIGNATURE_HEADER];

      if (typeof signatureHeader !== "string") {
        res.status(400).send("Invalid signature header");
        return;
      }

      let requestBody: Uint8Array | undefined;
      if (isUint8Array(req.body)) {
        requestBody = req.body;
      } else {
        res.status(400).send("req.body must be a Uint8Array");
        return;
      }

      const webhook = await verifyAndParseWebhook(
        requestBody,
        signatureHeader,
        WEBHOOK_SECRET,
      );

      try {
        credentials = getCredentialsFromEnvOrThrow();
      } catch (e) {
        res.status(500).send("Unable to get credentials from env");
        return;
      }

      const lightsparkClient = new LightsparkClient(
        new AccountTokenAuthProvider(
          credentials.apiTokenClientId,
          credentials.apiTokenClientSecret,
        ),
        credentials.baseUrl,
      );

      switch (webhook.event_type) {
        case WebhookEventType.REMOTE_SIGNING:
          await handleRemoteSigningWebhook(
            lightsparkClient,
            webhook,
            requestBody,
            signatureHeader,
          );
          break;
        default:
          res.status(400).send("Unknown webhook type");
      }

      res.send("OK");
    } catch (e) {
      res.status(500).send("Internal server error");
    }
  })().catch((e) => {
    console.error(e);
    res.status(500).send("Internal server error");
  });
});

async function handleRemoteSigningWebhook(
  lightsparkClient: LightsparkClient,
  webhook: WebhookEvent,
  requestBody: Uint8Array,
  signatureHeader: string,
) {
  const validator = {
    should_sign: (webhook: WebhookEvent) => true,
  };

  const remoteSigningHandler = new RemoteSigningWebhookHandler(
    lightsparkClient,
    hexToBytes(MASTER_SEED_HEX),
    validator,
  );

  await remoteSigningHandler.handleWebhookRequest(
    requestBody,
    signatureHeader,
    WEBHOOK_SECRET,
  );
}
