import {
  AccountTokenAuthProvider,
  LightsparkClient,
} from "@lightsparkdev/lightspark-sdk";
import bodyParser from "body-parser";
import express, { RequestHandler } from "express";
import { errorMessage } from "./errors.js";
import ReceivingVasp from "./ReceivingVasp.js";
import SendingVasp from "./SendingVasp.js";
import UmaConfig from "./UmaConfig.js";
import { PublicKeyCache } from "@uma-sdk/core";

export const app = express();
const config = UmaConfig.fromEnvironment();

app.use(bodyParser.text({ type: "*/*" })); // Middleware to parse raw body

// Default 404 handler.
app.use(function (req, res, next) {
  res.status(404);
  res.send(errorMessage("Not found."));
});

app.use((err, req, res, next) => {
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

const lightsparkClient = new LightsparkClient(
  new AccountTokenAuthProvider(config.apiClientID, config.apiClientSecret),
  config.clientBaseURL,
);

const pubKeyCache = new PublicKeyCache();
const sendingVasp = new SendingVasp(config, lightsparkClient, pubKeyCache, app);
const receivingVasp = new ReceivingVasp(config, lightsparkClient, pubKeyCache, app);
