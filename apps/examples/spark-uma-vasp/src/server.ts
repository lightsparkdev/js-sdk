import { SparkWallet } from "@buildonspark/spark-sdk";
import { ErrorCode, UmaError } from "@uma-sdk/core";
import bodyParser from "body-parser";
import express from "express";
import ReceivingVasp from "./ReceivingVasp.js";
import SendingVasp from "./SendingVasp.js";
import SendingVaspRequestCache from "./SendingVaspRequestCache.js";
import UmaConfig from "./UmaConfig.js";
import UserService from "./UserService.js";
import { errorMessage } from "./errors.js";

export const createUmaServer = (
  config: UmaConfig,
  sparkWallet: SparkWallet,
  sendingVaspRequestCache: SendingVaspRequestCache,
  userService: UserService,
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
    sendingVaspRequestCache,
    userService,
  );
  sendingVasp.registerRoutes(app);
  const receivingVasp = new ReceivingVasp(sparkWallet, userService);
  receivingVasp.registerRoutes(app);

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
