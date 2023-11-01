import {
  AccountTokenAuthProvider,
  LightsparkClient,
} from "@lightsparkdev/lightspark-sdk";
import { InMemoryPublicKeyCache } from "@uma-sdk/core";
import bodyParser from "body-parser";
import express from "express";
import { errorMessage } from "./errors.js";
import ReceivingVasp from "./ReceivingVasp.js";
import SendingVasp from "./SendingVasp.js";
import UmaConfig from "./UmaConfig.js";

export const app = express();
const config = UmaConfig.fromEnvironment();

app.use(bodyParser.text({ type: "*/*" })); // Middleware to parse raw body

const lightsparkClient = new LightsparkClient(
  new AccountTokenAuthProvider(config.apiClientID, config.apiClientSecret),
  config.clientBaseURL,
);

const pubKeyCache = new InMemoryPublicKeyCache();
const sendingVasp = new SendingVasp(config, lightsparkClient, pubKeyCache, app);
const receivingVasp = new ReceivingVasp(
  config,
  lightsparkClient,
  pubKeyCache,
  app,
);

app.get("/.well-known/lnurlpubkey", (req, res) => {
  res.send({
    signingPubKey: config.umaSigningPubKeyHex,
    encryptionPubKey: config.umaEncryptionPubKeyHex,
  });
});

app.post("/api/uma/utxoCallback", (req, res) => {
  console.log(`Received UTXO callback for ${req.query.txid}`);
  console.log(`  ${req.body}`);
  res.send("ok");
});

// Default 404 handler.
app.use(function (req, res, next) {
  res.status(404);
  res.send(errorMessage("Not found."));
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  if (res.headersSent) {
    return next(err);
  }

  if (err.message === "User not found.") {
    res.status(404).send(errorMessage(err.message));
    return;
  }

  res.status(500).send(errorMessage(`Something broke! ${err.message}`));
});
