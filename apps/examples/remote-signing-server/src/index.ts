import { hexToBytes } from "@lightsparkdev/core";
import {
  AccountTokenAuthProvider,
  LightsparkClient,
  RemoteSigningWebhookHandler,
  WebhookEvent,
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

app.use(bodyParser.text({ type: "*/*" })); // Middleware to parse raw body

app.get("/ping", (req, res) => {
  console.log("ping");
  res.send("OK");
});

app.post("/lightspark-webhook", (req, res) => {
  let credentials: EnvCredentials;
  try {
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

    const signatureHeader = req.headers["lightspark-signature"];
    console.log("signatureHeader", signatureHeader);

    if (typeof signatureHeader !== "string") {
      console.error("Invalid signature header");
      res.status(400).send("Invalid signature header");
      return;
    }

    console.log("body", req.body);

    const result = remoteSigningHandler.handleWebhookRequest(
      hexToBytes(req.body),
      signatureHeader,
      WEBHOOK_SECRET,
    );
    console.log("result", result);

    res.send("OK");
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal server error");
  }
});
