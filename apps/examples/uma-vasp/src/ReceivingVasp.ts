import { LightsparkClient } from "@lightsparkdev/lightspark-sdk";
import { Express, Request, Response } from "express";
import { errorMessage } from "./errors.js";
import UmaConfig from "./UmaConfig.js";
import * as uma from "@uma-sdk/core";

export default class ReceivingVasp {
  constructor(
    private readonly config: UmaConfig,
    private readonly lightsparkClient: LightsparkClient,
    app: Express,
  ) {
    app.get(
      "/.well-known/lnurlp/:username",
      this.handleLnrulpRequest.bind(this),
    );

    app.get("/api/uma/payreq/:uuid", this.handleLnurlPayreq.bind(this));

    app.post("/api/uma/payreq/:uuid", this.handleUmaPayreq.bind(this));
  }

  private async handleLnrulpRequest(req: Request, res: Response, next: any) {
    const username = req.params.username;
    if (username !== this.config.username) {
      return next(new Error("User not found."));
    }
    const callback = this.getLnurlpCallback(req);
    const metadata = this.getEncodedMetadata();

    const isUma = uma.isUmaLnurlpQuery(new URL(req.url, `${req.protocol}://${req.hostname}`));

    if (isUma) {
      return this.handleUmaLnurlp(req, res, next);
    } else {
      res.send({
        callback: callback,
        maxSendable: 10_000_000,
        minSendable: 1_000,
        metadata: metadata,
        tag: "payRequest",
      });
    }
    // const lookup = await this.lookup(receiver);
    res.send("ok");
  }

  private async handleUmaLnurlp(req: Request, res: Response, next: any) {
    const uuid = req.params.uuid;
    let umaQuery: uma.LnurlpRequest;
    // TODO: Handle versioning.
    try {
      umaQuery = uma.parseLnurlpRequest(new URL(req.url, `${req.protocol}://${req.hostname}`));
    } catch (e) {
      return next(new Error("Invalid UMA query.", { cause: e }));
    }
    // const payreq = await this.payreq(callbackUuid);
    res.send("ok");
  }

  private async handleUmaPayreq(req: Request, res: Response) {
    const uuid = req.params.uuid;
    // const payreq = await this.payreq(callbackUuid);
    res.send("ok");
  }

  /**
   * Handler for a normal LNURL (non-UMA) LNURLp request.
   */
  private async handleLnurlPayreq(req: Request, res: Response, next: any) {
    const uuid = req.params.uuid;
    if (uuid !== this.config.userID) {
      return next(new Error("User not found."));
    }

    const amountMsats = parseInt(req.query.amount as string);
    if (!amountMsats) {
      res.status(400).send(errorMessage("Missing amount query parameter."));
      return;
    }

    const invoice = await this.lightsparkClient.createLnurlInvoice(
      this.config.nodeID,
      amountMsats,
      this.getEncodedMetadata(),
    );
    if (!invoice) {
      return next(new Error("Invoice creation failed."));
    }
    res.send({ pr: invoice.data.encodedPaymentRequest, routes: [] });
  }

  private getEncodedMetadata(): string {
    return JSON.stringify([
      ["text/plain", `Pay ${this.config.username}@vasp2.com`],
      ["text/identifier", `${this.config.username}@vasp2.com`],
    ]);
  }

  private getLnurlpCallback(req: Request): String {
    const protocol = req.protocol;
    const fullUrl = new URL(req.url, `${protocol}://${req.hostname}`);
    const port = fullUrl.port;
    const portString = port === "80" || port === "443" ? "" : `:${port}`;
    const path = `/api/uma/payreq/${this.config.userID}`;
    return `${protocol}://${req.hostname}${portString}${path}`;
  }

  private getUtxoCallback(req: Request, txId: String): String {
    const path = "/api/uma/utxoCallback?txId=${txId}";
    return `${req.protocol}://${req.hostname}${path}`;
  }
}
