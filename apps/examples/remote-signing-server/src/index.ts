import { hexToBytes } from "@lightsparkdev/core";
import {
  AccountTokenAuthProvider,
  LightsparkClient,
  RemoteSigningWebhookHandler,
  verifyAndParseWebhook,
  WebhookEvent,
  WebhookEventType,
  WEBHOOKS_SIGNATURE_HEADER,
} from "@lightsparkdev/lightspark-sdk";
import {
  EnvCredentials,
  getCredentialsFromEnvOrThrow,
} from "@lightsparkdev/lightspark-sdk/env";
import bodyParser from "body-parser";
import express from "express";

export const app = express();

const WEBHOOK_SECRET = process.env.RK_WEBHOOK_SECRET;
const MASTER_SEED_HEX = process.env.RK_MASTER_SEED_HEX;

app.use(bodyParser.raw({ type: "*/*" })); // Middleware to parse raw body

app.get("/ping", (req, res) => {
  console.log("ping");
  res.send("OK");
});

app.post("/lightspark-webhook", async (req, res) => {
  let credentials: EnvCredentials;
  try {
    const signatureHeader = req.headers[WEBHOOKS_SIGNATURE_HEADER];

    if (typeof signatureHeader !== "string") {
      res.status(400).send("Invalid signature header");
      return;
    }

    const webhook = await verifyAndParseWebhook(
      req.body,
      signatureHeader,
      WEBHOOK_SECRET,
    );

    switch (webhook.event_type) {
      case WebhookEventType.REMOTE_SIGNING:
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

        const validator = {
          should_sign: (webhook: WebhookEvent) => true,
        };

        const remoteSigningHandler = new RemoteSigningWebhookHandler(
          lightsparkClient,
          hexToBytes(MASTER_SEED_HEX),
          validator,
        );

        const result = remoteSigningHandler.handleWebhookRequest(
          req.body,
          signatureHeader,
          WEBHOOK_SECRET,
        );
        break;
      default:
        res.status(400).send("Unknown webhook type");
    }

    res.send("OK");
  } catch (e) {
    res.status(500).send("Internal server error");
  }
});
