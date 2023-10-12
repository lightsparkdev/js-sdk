import { Express, Request, Response } from "express";
import UmaConfig from "./UmaConfig.js";
import { LightsparkClient } from "@lightsparkdev/lightspark-sdk";

export default class SendingVasp {
  constructor(
    private readonly config: UmaConfig,
    private readonly lightsparkClient: LightsparkClient,
    app: Express,
  ) {
    app.get("/api/umalookup/:receiver", this.handleClientUmaLookup.bind(this));

    app.get(
      "/api/umapayreq/:callbackUuid",
      this.handleClientUmaPayreq.bind(this),
    );

    app.get(
      "/api/sendpayment/:callbackUuid",
      this.handleClientSendPayment.bind(this),
    );
  }

  private async handleClientUmaLookup(req: Request, res: Response) {
    const receiver = req.params.receiver;
    // const lookup = await this.lookup(receiver);
    res.send("ok");
  }

  private async handleClientUmaPayreq(req: Request, res: Response) {
    const callbackUuid = req.params.callbackUuid;
    // const payreq = await this.payreq(callbackUuid);
    res.send("ok");
  }

  private async handleClientSendPayment(req: Request, res: Response) {
    const callbackUuid = req.params.callbackUuid;
    // const payment = await this.sendPayment(callbackUuid);
    res.send("ok");
  }
}
