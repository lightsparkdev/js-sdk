import { SparkWallet } from "@buildonspark/spark-sdk";
import {
  ErrorCode,
  getPubKeyResponse,
  InMemoryPublicKeyCache,
  NonceValidator,
  UmaError,
} from "@uma-sdk/core";
import bodyParser from "body-parser";
import express from "express";
import ReceivingVasp from "./ReceivingVasp.js";
import SendingVasp from "./SendingVasp.js";
import SendingVaspRequestCache from "./SendingVaspRequestCache.js";
import UmaConfig from "./UmaConfig.js";
import UserService from "./UserService.js";
import { errorMessage } from "./errors.js";
import { fullUrlForRequest } from "./networking/expressAdapters.js";

export const createUmaServer = (
  config: UmaConfig,
  pubKeyCache: InMemoryPublicKeyCache,
  sendingVaspRequestCache: SendingVaspRequestCache,
  userService: UserService,
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
    pubKeyCache,
    sendingVaspRequestCache,
    userService,
    nonceCache,
  );
  sendingVasp.registerRoutes(app);
  const receivingVasp = new ReceivingVasp(
    config,
    pubKeyCache,
    userService,
    nonceCache,
  );
  receivingVasp.registerRoutes(app);

  app.get("/.well-known/lnurlpubkey", (_req, res) => {
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

  // Default 404 handler.
  app.use(function (_req, res) {
    res.status(404);
    res.send(errorMessage("Not found."));
  });

  app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack);
    if (res.headersSent) {
      return next(err);
    }

    if (err instanceof UmaError) {
      res.status(err.httpStatusCode).json(JSON.parse(err.toJSON()));
      return;
    }

    const error = new UmaError(
      `Something broke! ${err.message}`,
      ErrorCode.INTERNAL_ERROR,
    );
    res.status(error.httpStatusCode).json(JSON.parse(error.toJSON()));
  });

  return app;
};
