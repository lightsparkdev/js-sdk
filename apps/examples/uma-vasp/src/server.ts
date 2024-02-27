import { LightsparkClient } from "@lightsparkdev/lightspark-sdk";
import { InMemoryPublicKeyCache } from "@uma-sdk/core";
import bodyParser from "body-parser";
import express from "express";
import ComplianceService from "./ComplianceService.js";
import InternalLedgerService from "./InternalLedgerService.js";
import ReceivingVasp from "./ReceivingVasp.js";
import SendingVasp from "./SendingVasp.js";
import SendingVaspRequestCache from "./SendingVaspRequestCache.js";
import UmaConfig from "./UmaConfig.js";
import UserService from "./UserService.js";
import { errorMessage } from "./errors.js";

export const createUmaServer = (
  config: UmaConfig,
  lightsparkClient: LightsparkClient,
  pubKeyCache: InMemoryPublicKeyCache,
  sendingVaspRequestCache: SendingVaspRequestCache,
  userService: UserService,
  ledgerService: InternalLedgerService,
  complianceService: ComplianceService,
): {
  listen: (
    port: number,
    onStarted: () => void,
  ) => {
    close: (callback?: ((err?: Error | undefined) => void) | undefined) => void;
  };
} => {
  const app = express();

  app.use(bodyParser.text({ type: "*/*" })); // Middleware to parse raw body

  const sendingVasp = new SendingVasp(
    config,
    lightsparkClient,
    pubKeyCache,
    sendingVaspRequestCache,
    userService,
    ledgerService,
    complianceService,
  );
  sendingVasp.registerRoutes(app);
  const receivingVasp = new ReceivingVasp(
    config,
    lightsparkClient,
    pubKeyCache,
    userService,
    complianceService,
  );
  receivingVasp.registerRoutes(app);

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

  return app;
};
