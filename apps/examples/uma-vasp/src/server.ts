import { LightsparkClient } from "@lightsparkdev/lightspark-sdk";
import {
  ErrorCode,
  fetchPublicKeyForVasp,
  getPubKeyResponse,
  InMemoryPublicKeyCache,
  NonceValidator,
  parsePostTransactionCallback,
  PubKeyResponse,
  UmaError,
  verifyPostTransactionCallbackSignature,
} from "@uma-sdk/core";
import bodyParser from "body-parser";
import express from "express";
import asyncHandler from "express-async-handler";
import ComplianceService from "./ComplianceService.js";
import InternalLedgerService from "./InternalLedgerService.js";
import ReceivingVasp from "./ReceivingVasp.js";
import SendingVasp from "./SendingVasp.js";
import SendingVaspRequestCache from "./SendingVaspRequestCache.js";
import UmaConfig from "./UmaConfig.js";
import UserService from "./UserService.js";
import { errorMessage } from "./errors.js";
import {
  fullUrlForRequest,
  sendResponse,
} from "./networking/expressAdapters.js";

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

  app.post(
    "/api/uma/utxoCallback",
    asyncHandler(async (req, resp) => {
      const postTransactionCallback = parsePostTransactionCallback(req.body);

      let pubKeys: PubKeyResponse;
      try {
        pubKeys = await fetchPublicKeyForVasp({
          cache: pubKeyCache,
          vaspDomain: postTransactionCallback.vaspDomain,
        });
      } catch (e) {
        console.error(e);
        if (e instanceof UmaError) {
          throw e;
        }
        throw new UmaError(
          "Failed to fetch public key.",
          ErrorCode.COUNTERPARTY_PUBKEY_FETCH_ERROR,
        );
      }

      console.log(`Fetched pubkeys: ${JSON.stringify(pubKeys, null, 2)}`);

      try {
        const isSignatureValid = await verifyPostTransactionCallbackSignature(
          postTransactionCallback,
          pubKeys,
          nonceCache,
        );
        if (!isSignatureValid) {
          throw new UmaError(
            "Invalid post transaction callback signature.",
            ErrorCode.INVALID_SIGNATURE,
          );
        }
      } catch (e) {
        console.error(e);
        if (e instanceof UmaError) {
          throw e;
        }
        throw new UmaError(
          "Invalid post transaction callback signature.",
          ErrorCode.INVALID_SIGNATURE,
        );
      }

      console.log(`Received UTXO callback for ${req.query.txid}`);
      console.log(`  ${req.body}`);
      sendResponse(resp, {
        httpStatus: 200,
        data: "ok",
      });
    }),
  );

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
