import { hexToBytes } from "@lightsparkdev/core";
import {
  getLightsparkNodeQuery,
  LightsparkClient,
  LightsparkNode,
} from "@lightsparkdev/lightspark-sdk";
import * as uma from "@uma-sdk/core";
import { Express } from "express";
import ComplianceService from "./ComplianceService.js";
import { errorMessage } from "./errors.js";
import {
  fullUrlForRequest,
  isDomainLocalhost,
  sendResponse,
} from "./networking/expressAdapters.js";
import { HttpResponse } from "./networking/HttpResponse.js";
import UmaConfig from "./UmaConfig.js";
import { User } from "./User.js";
import UserService from "./UserService.js";

export default class ReceivingVasp {
  constructor(
    private readonly config: UmaConfig,
    private readonly lightsparkClient: LightsparkClient,
    private readonly pubKeyCache: uma.PublicKeyCache,
    private readonly userService: UserService,
    private readonly complianceService: ComplianceService,
    private readonly nonceCache: uma.NonceValidator,
  ) {}

  registerRoutes(app: Express): void {
    app.get("/.well-known/lnurlp/:username", async (req, resp) => {
      const response = await this.handleLnurlpRequest(
        req.params.username,
        fullUrlForRequest(req),
      );
      sendResponse(resp, response);
    });

    app.get("/api/lnurl/payreq/:uuid", async (req, resp) => {
      const response = await this.handleLnurlPayreq(
        req.params.uuid,
        fullUrlForRequest(req),
      );
      sendResponse(resp, response);
    });

    app.post("/api/uma/payreq/:uuid", async (req, resp) => {
      const response = await this.handleUmaPayreq(
        req.params.uuid,
        fullUrlForRequest(req),
        req.body,
      );
      sendResponse(resp, response);
    });
  }

  private async handleLnurlpRequest(
    username: string,
    requestUrl: URL,
  ): Promise<HttpResponse> {
    const user = await this.userService.getUserByUma(username);
    if (!user) {
      return { httpStatus: 404, data: "User not found." };
    }

    if (uma.isUmaLnurlpQuery(requestUrl)) {
      return this.handleUmaLnurlp(requestUrl, user);
    }

    // Fall back to normal LNURLp.
    const callback = this.getLnurlpCallback(requestUrl, false, user);
    const metadata = this.getEncodedMetadata(requestUrl, user);
    return {
      httpStatus: 200,
      data: {
        callback: callback,
        maxSendable: 10_000_000,
        minSendable: 1_000,
        metadata: metadata,
        tag: "payRequest",
      },
    };
  }

  private async handleUmaLnurlp(
    requestUrl: URL,
    user: User,
  ): Promise<HttpResponse> {
    let umaQuery: uma.LnurlpRequest;
    try {
      umaQuery = uma.parseLnurlpRequest(requestUrl);
    } catch (e: any) {
      if (e instanceof uma.UnsupportedVersionError) {
        // For unsupported versions, return a 412 "Precondition Failed" as per the spec.
        return {
          httpStatus: 412,
          data: {
            supportedMajorVersions: e.supportedMajorVersions,
            unsupportedVersion: e.unsupportedVersion,
          },
        };
      }
      return {
        httpStatus: 500,
        data: new Error("Invalid UMA Query", { cause: e }),
      };
    }

    if (
      !this.complianceService.shouldAcceptTransactionFromVasp(
        umaQuery.vaspDomain,
        umaQuery.receiverAddress,
      )
    ) {
      return {
        httpStatus: 403,
        data: "This user is not allowed to transact with this VASP.",
      };
    }

    let pubKeys: uma.PubKeyResponse;
    try {
      pubKeys = await uma.fetchPublicKeyForVasp({
        cache: this.pubKeyCache,
        vaspDomain: umaQuery.vaspDomain,
      });
    } catch (e) {
      console.error(e);
      return {
        httpStatus: 500,
        data: new Error("Failed to fetch public key.", { cause: e }),
      };
    }

    try {
      const isSignatureValid = await uma.verifyUmaLnurlpQuerySignature(
        umaQuery,
        hexToBytes(pubKeys.signingPubKey),
        this.nonceCache,
      );
      if (!isSignatureValid) {
        return {
          httpStatus: 500,
          data: "Invalid UMA query signature.",
        };
      }
    } catch (e) {
      return {
        httpStatus: 500,
        data: new Error("Invalid UMA query signature.", { cause: e }),
      };
    }

    const currencyPrefs = await this.userService.getCurrencyPreferencesForUser(
      user.id,
    );
    if (!currencyPrefs) {
      return {
        httpStatus: 500,
        data: "Failed to fetch currency preferences.",
      };
    }

    const [minSendableSats, maxSendableSats] =
      await this.userService.getReceivableSatsRangeForUser(user.id);

    try {
      const response = await uma.getLnurlpResponse({
        request: umaQuery,
        callback: this.getLnurlpCallback(requestUrl, true, user),
        requiresTravelRuleInfo: true,
        encodedMetadata: this.getEncodedMetadata(requestUrl, user),
        minSendableSats,
        maxSendableSats,
        privateKeyBytes: this.config.umaSigningPrivKey(),
        receiverKycStatus: user.kycStatus,
        payerDataOptions: {
          identifier: { mandatory: true },
          name: { mandatory: false },
          email: { mandatory: false },
          compliance: { mandatory: true },
        },
        currencyOptions: currencyPrefs,
      });
      return { httpStatus: 200, data: response };
    } catch (e) {
      console.error(e);
      return {
        httpStatus: 500,
        data: new Error("Failed to generate UMA response.", { cause: e }),
      };
    }
  }

  private async handleUmaPayreq(
    userId: string,
    requestUrl: URL,
    requestBody: string,
  ): Promise<HttpResponse> {
    const user = await this.userService.getUserById(userId);
    if (!user) {
      return { httpStatus: 404, data: "User not found." };
    }

    let payreq: uma.PayRequest;
    try {
      payreq = uma.parsePayRequest(requestBody);
    } catch (e) {
      console.error("Failed to parse pay req", e);
      return {
        httpStatus: 500,
        data: new Error("Invalid UMA pay request.", { cause: e }),
      };
    }
    console.log(`Parsed payreq: ${JSON.stringify(payreq, null, 2)}`);

    let pubKeys: uma.PubKeyResponse;
    try {
      pubKeys = await uma.fetchPublicKeyForVasp({
        cache: this.pubKeyCache,
        vaspDomain: uma.getVaspDomainFromUmaAddress(
          payreq.payerData.identifier,
        ),
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
      const isSignatureValid = await uma.verifyPayReqSignature(
        payreq,
        hexToBytes(pubKeys.signingPubKey),
        this.nonceCache,
      );
      if (!isSignatureValid) {
        return { httpStatus: 400, data: "Invalid payreq signature." };
      }
    } catch (e) {
      console.error(e);
      return {
        httpStatus: 500,
        data: new Error("Invalid payreq signature.", { cause: e }),
      };
    }

    console.log(`Verified payreq signature.`);

    const currencyPrefs = await this.userService.getCurrencyPreferencesForUser(
      user.id,
    );
    if (!currencyPrefs) {
      console.error("Failed to fetch currency preferences.");
      return {
        httpStatus: 500,
        data: "Failed to fetch currency preferences.",
      };
    }
    const currency = currencyPrefs.find((c) => c.code === payreq.currency);
    if (!currency) {
      console.error(`Invalid currency: ${payreq.currency}`);
      return {
        httpStatus: 400,
        data: `Invalid currency. This user does not accept ${payreq.currency}.`,
      };
    }

    if (
      payreq.amount < currency.minSendable ||
      payreq.amount > currency.maxSendable
    ) {
      return {
        httpStatus: 400,
        data: `Invalid amount. This user only accepts between ${currency.minSendable} and ${currency.maxSendable} ${currency.code}.`,
      };
    }

    // TODO(Jeremy): Move this to the currency service.
    const receiverFeesMillisats = 0;
    const amountMsats =
      payreq.amount * currency.multiplier + receiverFeesMillisats;
    const shouldTransact = await this.complianceService.preScreenTransaction(
      payreq.payerData.identifier,
      user.id,
      amountMsats,
      payreq.payerData.compliance.nodePubKey,
      payreq.payerData.compliance.utxos ?? [],
    );
    if (!shouldTransact) {
      return {
        httpStatus: 403,
        data: "This transaction is too risky.",
      };
    }

    // 3 minutes invoice expiration to avoid big fluctuations in exchange rate.
    const expirationTimeSec = 60 * 3;
    // In a real implementation, this would be the txId for your own internal
    // tracking in post-transaction hooks.
    const txId = "1234";
    const umaInvoiceCreator = {
      createUmaInvoice: async (amountMsats: number, metadata: string) => {
        console.log(`Creating invoice for ${amountMsats} msats.`);
        const invoice = await this.lightsparkClient.createUmaInvoice(
          this.config.nodeID,
          amountMsats,
          metadata,
          expirationTimeSec,
        );
        console.log(`Created invoice: ${invoice?.id}`);
        return invoice?.data.encodedPaymentRequest;
      },
    };

    let response: uma.PayReqResponse;
    try {
      response = await uma.getPayReqResponse({
        conversionRate: currency.multiplier,
        currencyCode: currency.code,
        currencyDecimals: currency.decimals,
        invoiceCreator: umaInvoiceCreator,
        metadata: this.getEncodedMetadata(requestUrl, user),
        query: payreq,
        receiverChannelUtxos: [],
        receiverFeesMillisats: receiverFeesMillisats,
        receiverNodePubKey: await this.getReceiverNodePubKey(),
        utxoCallback: this.getUtxoCallback(requestUrl, txId),
      });
      return { httpStatus: 200, data: response };
    } catch (e) {
      console.log(`Failed to generate UMA response: ${e}`);
      console.error(e);
      return {
        httpStatus: 500,
        data: new Error("Failed to generate UMA response.", { cause: e }),
      };
    }
  }

  /**
   * Handler for a normal LNURL (non-UMA) LNURLp request.
   */
  private async handleLnurlPayreq(
    userId: string,
    requestUrl: URL,
  ): Promise<HttpResponse> {
    const user = await this.userService.getUserById(userId);
    if (!user) {
      return { httpStatus: 404, data: "User not found." };
    }

    const amountMsats = parseInt(
      requestUrl.searchParams.get("amount") as string,
    );
    if (!amountMsats) {
      return {
        httpStatus: 400,
        data: errorMessage("Missing amount query parameter."),
      };
    }

    const invoice = await this.lightsparkClient.createLnurlInvoice(
      this.config.nodeID,
      amountMsats,
      this.getEncodedMetadata(requestUrl, user),
    );
    if (!invoice) {
      return {
        httpStatus: 500,
        data: errorMessage("Invoice creation failed."),
      };
    }
    return {
      httpStatus: 200,
      data: { pr: invoice.data.encodedPaymentRequest, routes: [] },
    };
  }

  private getEncodedMetadata(requestUrl: URL, user: User): string {
    return JSON.stringify([
      ["text/plain", `Pay ${user.umaUserName}@${requestUrl.hostname}`],
      ["text/identifier", `${user.umaUserName}@${requestUrl.hostname}`],
    ]);
  }

  private getLnurlpCallback(fullUrl: URL, isUma: boolean, user: User): string {
    const protocol = isDomainLocalhost(fullUrl.hostname) ? "http" : "https";
    const port = fullUrl.port;
    const portString =
      port === "80" || port === "443" || port === "" ? "" : `:${port}`;
    const umaOrLnurl = isUma ? "uma" : "lnurl";
    const path = `/api/${umaOrLnurl}/payreq/${user.id}`;
    return `${protocol}://${fullUrl.hostname}${portString}${path}`;
  }

  private async getReceiverNodePubKey(): Promise<string> {
    const nodeQuery = getLightsparkNodeQuery(this.config.nodeID);
    let node: LightsparkNode | null;
    try {
      node = await this.lightsparkClient.executeRawQuery(nodeQuery);
    } catch (e) {
      throw new Error(`Failed to fetch node ${this.config.nodeID}.`);
    }
    if (!node) {
      throw new Error(`Node ${this.config.nodeID} not found.`);
    }
    if (!node.publicKey) {
      throw new Error(`Node ${this.config.nodeID} has no known public key.`);
    }
    return node.publicKey;
  }

  private getUtxoCallback(requestUrl: URL, txId: String): string {
    const path = `/api/uma/utxoCallback?txId=${txId}`;
    return `${requestUrl.protocol}//${requestUrl.hostname}${path}`;
  }
}
