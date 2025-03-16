import { LightsparkClient } from "@lightsparkdev/lightspark-sdk";
import {
  fetchPublicKeyForVasp,
  getPubKeyResponse,
  InMemoryPublicKeyCache,
  NonceValidator,
  parsePostTransactionCallback,
  PubKeyResponse,
  verifyPostTransactionCallbackSignature,
} from "@uma-sdk/core";
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
import { fullUrlForRequest } from "./networking/expressAdapters.js";

export const createUmaServer = (
  config: UmaConfig,
  lightsparkClient: LightsparkClient,
  pubKeyCache: InMemoryPublicKeyCache,
  sendingVaspRequestCache: SendingVaspRequestCache,
  userService: UserService,
  ledgerService: InternalLedgerService,
  complianceService: ComplianceService,
  nonceCache: NonceValidator,
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
    nonceCache,
  );
  sendingVasp.registerRoutes(app);
  const receivingVasp = new ReceivingVasp(
    config,
    lightsparkClient,
    pubKeyCache,
    userService,
    complianceService,
    nonceCache,
  );
  receivingVasp.registerRoutes(app);

  app.get("/.well-known/lnurlpubkey", (req, res) => {
    res.send(
      getPubKeyResponse({
        signingCertChainPem: config.umaSigningCertChain,
        encryptionCertChainPem: config.umaEncryptionCertChain,
      }).toJsonString(),
    );
  });

  app.get("/.well-known/uma-configuration", (req, res) => {
    const reqUrl = fullUrlForRequest(req);
    const reqBaseUrl = reqUrl.origin;
    // TODO: Add UMA Auth implementation.
    res.send({
      uma_major_versions: [0, 1],
      uma_request_endpoint: reqBaseUrl + "/api/uma/request_invoice_payment",
    });
  });

  app.post("/api/uma/utxoCallback", async (req, res) => {
    const postTransactionCallback = parsePostTransactionCallback(req.body);

    let pubKeys: PubKeyResponse;
    try {
      pubKeys = await fetchPublicKeyForVasp({
        cache: pubKeyCache,
        vaspDomain: postTransactionCallback.vaspDomain,
      });
    } catch (e) {
      console.error(e);
      return {
        httpStatus: 500,
        data: new Error("Failed to fetch public key.", { cause: e }),
      };
    }

    console.log(`Fetched pubkeys: ${JSON.stringify(pubKeys, null, 2)}`);

    try {
      const isSignatureValid = await verifyPostTransactionCallbackSignature(
        postTransactionCallback,
        pubKeys,
        nonceCache,
      );
      if (!isSignatureValid) {
        return {
          httpStatus: 400,
          data: "Invalid post transaction callback signature.",
        };
      }
    } catch (e) {
      console.error(e);
      return {
        httpStatus: 500,
        data: new Error("Invalid post transaction callback signature.", {
          cause: e,
        }),
      };
    }

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
