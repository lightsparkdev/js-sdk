import { hexToBytes } from "@lightsparkdev/core";
import { LightsparkClient } from "@lightsparkdev/lightspark-sdk";
import * as uma from "@uma-sdk/core";
import { Express, Request, Response } from "express";
import SendingVaspRequestCache from "./SendingVaspRequestCache.js";
import UmaConfig from "./UmaConfig.js";

export default class SendingVasp {
  private readonly requestCache: SendingVaspRequestCache =
    new SendingVaspRequestCache();

  constructor(
    private readonly config: UmaConfig,
    private readonly lightsparkClient: LightsparkClient,
    private readonly pubKeyCache: uma.PublicKeyCache,
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
    if (!receiver) {
      res.status(400).send("Missing receiver");
      return;
    }

    const [receiverId, receivingVaspDomain] = receiver.split("@");
    if (!receiverId || !receivingVaspDomain) {
      res.status(400).send("Invalid receiver");
      return;
    }

    const lnrulpRequestUrl = await uma.getSignedLnurlpRequestUrl({
      isSubjectToTravelRule: true,
      receiverAddress: receiver,
      signingPrivateKey: this.config.umaSigningPrivKey(),
      senderVaspDomain: req.hostname, // TODO: Might need to include the port here.
    });

    let response: globalThis.Response;
    try {
      response = await fetch(lnrulpRequestUrl);
    } catch (e) {
      res.status(424).send("Error fetching Lnurlp request.");
      return;
    }

    // TODO: Handle versioning via the 412 response.

    if (!response.ok) {
      res.status(424).send(`Error fetching Lnurlp request. ${response.status}`);
      return;
    }

    let lnurlpResponse: uma.LnurlpResponse;
    try {
      lnurlpResponse = uma.parseLnurlpResponse(await response.text());
    } catch (e) {
      console.error("Error parsing lnurlp response.", e);
      res.status(424).send("Error parsing Lnurlp response.");
      return;
    }

    let pubKeys: uma.PubKeyResponse;
    try {
      pubKeys = await uma.fetchPublicKeyForVasp({
        cache: this.pubKeyCache,
        vaspDomain: receivingVaspDomain,
      });
    } catch (e) {
      console.error("Error fetching public key.", e);
      res.status(424).send("Error fetching public key.");
      return;
    }

    try {
      const isSignatureValid = await uma.verifyUmaLnurlpResponseSignature(
        lnurlpResponse,
        hexToBytes(pubKeys.signingPubKey),
      );
      if (!isSignatureValid) {
        res.status(424).send("Invalid UMA response signature.");
        return;
      }
    } catch (e) {
      console.error("Error verifying UMA response signature.", e);
      res.status(424).send("Error verifying UMA response signature.");
      return;
    }

    const callbackUuid = this.requestCache.saveLnurlpResponseData(
      lnurlpResponse,
      receiverId,
      receivingVaspDomain,
    );

    res.send({
      currencies: lnurlpResponse.currencies,
      minSendableSats: lnurlpResponse.minSendable,
      maxSendableSats: lnurlpResponse.maxSendable,
      callbackUuid: callbackUuid,
      // You might not actually send this to a client in practice.
      receiverKycStatus: lnurlpResponse.compliance.kycStatus,
    });
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
