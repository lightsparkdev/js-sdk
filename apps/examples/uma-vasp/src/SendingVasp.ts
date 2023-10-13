import { hexToBytes } from "@lightsparkdev/core";
import { InvoiceData, LightsparkClient } from "@lightsparkdev/lightspark-sdk";
import * as uma from "@uma-sdk/core";
import { Express, Request, Response } from "express";
import settings from "../../settings.json" assert { type: "json" };
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

    let pubKeys = await this.fetchPubKeysOrFail(receivingVaspDomain, res);
    if (!pubKeys) return;

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
    if (!callbackUuid) {
      res.status(400).send("Missing callbackUuid");
      return;
    }

    const initialRequestData =
      this.requestCache.getLnurlpResponseData(callbackUuid);
    if (!initialRequestData) {
      res.status(400).send("callbackUuid not found");
      return;
    }

    const amountStr = req.query.amount;
    if (!amountStr || typeof amountStr !== "string") {
      res.status(400).send("Missing amount");
      return;
    }
    const amount = parseInt(amountStr);
    if (isNaN(amount)) {
      res.status(400).send("Invalid amount");
      return;
    }

    const currencyCode = req.query.currencyCode;
    if (!currencyCode || typeof currencyCode !== "string") {
      res.status(400).send("Missing currencyCode");
      return;
    }
    const currencyValid = initialRequestData.lnurlpResponse.currencies.some(
      (c) => c.code === currencyCode,
    );
    if (!currencyValid) {
      res.status(400).send("Currency code not supported");
      return;
    }

    let pubKeys = await this.fetchPubKeysOrFail(
      initialRequestData.receivingVaspDomain,
      res,
    );
    if (!pubKeys) return;

    const payerProfile = this.getPayerProfile(
      initialRequestData.lnurlpResponse.requiredPayerData,
    );
    const trInfo =
      '["message": "Here is some fake travel rule info. It is up to you to actually implement this if needed."]';
    // In practice this should be loaded from your node:
    const payerUtxos: string[] = [];
    const utxoCallback = this.getUtxoCallback(req, "1234abcd");

    let payReq: uma.PayRequest;
    try {
      payReq = await uma.getPayRequest({
        receiverEncryptionPubKey: hexToBytes(pubKeys.encryptionPubKey),
        sendingVaspPrivateKey: this.config.umaSigningPrivKey(),
        currencyCode,
        amount,
        payerIdentifier: payerProfile.identifier,
        payerKycStatus: uma.KycStatus.Verified,
        utxoCallback,
        trInfo,
        payerUtxos,
        payerName: payerProfile.name,
        payerEmail: payerProfile.email,
      });
    } catch (e) {
      console.error("Error generating payreq.", e);
      res.status(500).send("Error generating payreq.");
      return;
    }

    let response: globalThis.Response;
    try {
      response = await fetch(initialRequestData.lnurlpResponse.callback, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payReq),
      });
    } catch (e) {
      res.status(500).send("Error sending payreq.");
      return;
    }

    if (!response.ok) {
      res.status(424).send(`Payreq failed. ${response.status}`);
      return;
    }

    let payResponse: uma.PayReqResponse;
    try {
      payResponse = await uma.parsePayReqResponse(await response.text());
    } catch (e) {
      console.error("Error parsing payreq response.", e);
      res.status(424).send("Error parsing payreq response.");
      return;
    }

    // This is where you'd pre-screen the UTXOs from payResponse.compliance.utxos.

    let invoice: InvoiceData;
    try {
      invoice = await this.lightsparkClient.decodeInvoice(
        payResponse.encodedInvoice,
      );
    } catch (e) {
      console.error("Error decoding invoice.", e);
      res.status(500).send("Error decoding invoice.");
      return;
    }

    const newCallbackUuid = this.requestCache.savePayReqData(
      payResponse.encodedInvoice,
      utxoCallback,
      invoice,
    );

    res.send({
      callbackUuid: newCallbackUuid,
      encodedInvoice: payResponse.encodedInvoice,
      amount: invoice.amount,
      conversionRate: payResponse.paymentInfo.multiplier,
      exchangeFeesMillisatoshi:
        payResponse.paymentInfo.exchangeFeesMillisatoshi,
      currencyCode: payResponse.paymentInfo.currencyCode,
    });
  }

  private async fetchPubKeysOrFail(receivingVaspDomain: string, res: Response) {
    try {
      return await uma.fetchPublicKeyForVasp({
        cache: this.pubKeyCache,
        vaspDomain: receivingVaspDomain,
      });
    } catch (e) {
      console.error("Error fetching public key.", e);
      res.status(424).send("Error fetching public key.");
    }
  }

  private async handleClientSendPayment(req: Request, res: Response) {
    const callbackUuid = req.params.callbackUuid;
    // const payment = await this.sendPayment(callbackUuid);
    res.send("ok");
  }

  /**
   * NOTE: In a real application, you'd want to use the authentication context to pull out this information. It's not
   * actually always Alice sending the money ;-).
   */
  private getPayerProfile(requiredPayerData: uma.PayerDataOptions) {
    const port = process.env.PORT || settings.umaVasp.port;
    return {
      name: requiredPayerData.nameRequired ? "Alice FakeName" : undefined,
      email: requiredPayerData.emailRequired ? "alice@vasp1.com" : undefined,
      // Note: This is making an assumption that this is running on localhost. We should make it configurable.
      identifier: `$alice@localhost:${port}`,
    };
  }

  private getUtxoCallback(req: Request, txId: string): string {
    const protocol = req.protocol;
    const host = req.hostname;
    const path = `/api/uma/utxoCallback?txId=${txId}`;
    return `${protocol}://${host}${path}`;
  }
}
