import { hexToBytes } from "@lightsparkdev/core";
import { v4 as uuidv4 } from "uuid";
import {
  getLightsparkNodeQuery,
  LightsparkClient,
  LightsparkNode,
} from "@lightsparkdev/lightspark-sdk";
import * as uma from "@uma-sdk/core";
import { Express } from "express";
import ComplianceService from "./ComplianceService.js";
import { SATS_CURRENCY } from "./currencies.js";
import { PAYER_DATA_OPTIONS } from "./PayerDataOptions.js";
import {
  fullUrlForRequest,
  isDomainLocalhost,
  sendResponse,
  hostNameWithPort,
} from "./networking/expressAdapters.js";
import { HttpResponse } from "./networking/HttpResponse.js";
import UmaConfig from "./UmaConfig.js";
import { User } from "./User.js";
import UserService from "./UserService.js";
import { z } from "zod";

export default class ReceivingVasp {
  constructor(
    private readonly config: UmaConfig,
    private readonly lightsparkClient: LightsparkClient,
    private readonly pubKeyCache: uma.PublicKeyCache,
    private readonly userService: UserService,
    private readonly complianceService: ComplianceService,
    private readonly nonceCache: uma.NonceValidator,
  ) { }

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

    app.post("/api/uma/create_invoice", async (req, resp) => {
      const user = await this.userService.getCallingUserFromRequest(
        fullUrlForRequest(req),
        req.headers,
      );
      if (!user) {
        return sendResponse(resp, {
          httpStatus: 401,
          data: "Unauthorized. Check your credentials.",
        });
      }
      const response = await this.handleUmaCreateInvoice(
        user,
        fullUrlForRequest(req),
      )
      sendResponse(resp, response);
    });

    app.post("/api/uma/create_and_send_invoice", async(req, resp) => {
      const user = await this.userService.getCallingUserFromRequest(
        fullUrlForRequest(req),
        req.headers,
      );
      if (!user) {
        return sendResponse(resp, {
          httpStatus: 401,
          data: "Unauthorized. Check your credentials.",
        });
      }
      const response = await this.handleUmaCreateAndSendInvoice(
        user,
        fullUrlForRequest(req),
      )
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

    let lnurlpRequest: uma.LnurlpRequest;
    try {
      lnurlpRequest = uma.parseLnurlpRequest(requestUrl);
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
        data: new Error("Invalid lnurlp Query", { cause: e }),
      };
    }

    if (uma.isLnurlpRequestForUma(lnurlpRequest)) {
      return this.handleUmaLnurlp(requestUrl, lnurlpRequest, user);
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
    umaQuery: uma.LnurlpRequest,
    user: User,
  ): Promise<HttpResponse> {
    if (!uma.isLnurlpRequestForUma(umaQuery)) {
      return {
        httpStatus: 400,
        data: "Invalid UMA query.",
      };
    }
    if (
      !this.complianceService.shouldAcceptTransactionFromVasp(
        umaQuery.vaspDomain!,
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
        vaspDomain: umaQuery.vaspDomain!,
      });
    } catch (e) {
      console.error(e);
      return {
        httpStatus: 500,
        data: new Error("Failed to fetch public key.", { cause: e }),
      };
    }

    try {
      const isSignatureValid = await uma.verifyUmaLnurlpQuerySignature(umaQuery, pubKeys, this.nonceCache);
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
      await this.userService.getReceivableMsatsRangeForUser(user.id);

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
        payerDataOptions: PAYER_DATA_OPTIONS,
        currencyOptions: currencyPrefs,
      });
      return { httpStatus: 200, data: response.toJsonSchemaObject() };
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
      console.log(`Parsing payreq: ${requestBody}`);
      payreq = uma.PayRequest.fromJson(requestBody);
    } catch (e) {
      console.error("Failed to parse pay req", e);
      return {
        httpStatus: 500,
        data: new Error("Invalid UMA pay request.", { cause: e }),
      };
    }
    console.log(`Parsed payreq: ${JSON.stringify(payreq.toJsonSchemaObject(), null, 2)}`);
    if (!payreq.isUma()) {
      return { httpStatus: 400, data: "Invalid UMA payreq." };
    }

    if (!payreq.payerData!.identifier) {
      return { httpStatus: 400, data: "Payer identifier is missing" };
    }

    let pubKeys: uma.PubKeyResponse;
    try {
      pubKeys = await uma.fetchPublicKeyForVasp({
        cache: this.pubKeyCache,
        vaspDomain: uma.getVaspDomainFromUmaAddress(
          payreq.payerData!.identifier,
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
      const isSignatureValid = await uma.verifyPayReqSignature(payreq, pubKeys, this.nonceCache);
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
    return this.handlePayReq(payreq, user, requestUrl);
  }

  private async handlePayReq(
    payreq: uma.PayRequest,
    user: User,
    requestUrl: URL,
  ): Promise<HttpResponse> {
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
    let receivingCurrency = currencyPrefs.find(
      (c) => c.code === payreq.receivingCurrencyCode,
    );
    if (payreq.receivingCurrencyCode && !receivingCurrency) {
      console.error(`Invalid currency: ${payreq.receivingCurrencyCode}`);
      return {
        httpStatus: 400,
        data: `Invalid currency. This user does not accept ${payreq.receivingCurrencyCode}.`,
      };
    } else if (!payreq.receivingCurrencyCode) {
      receivingCurrency = SATS_CURRENCY;
    } else if (!receivingCurrency) {
      // This can't actually happen, but TypeScript doesn't know that.
      return { httpStatus: 400, data: "Invalid currency." };
    }

    const isSendingAmountMsats = !payreq.sendingAmountCurrencyCode;
    const [minSendableSats, maxSendableSats] =
      await this.userService.getReceivableMsatsRangeForUser(user.id);
    const isCurrencyAmountInBounds = isSendingAmountMsats
      ? payreq.amount >= minSendableSats && payreq.amount / 1000 <= maxSendableSats
      : payreq.amount >= receivingCurrency.minSendable &&
      payreq.amount <= receivingCurrency.maxSendable;
    if (!isCurrencyAmountInBounds) {
      return {
        httpStatus: 400,
        data:
          `Invalid amount. This user only accepts between ${receivingCurrency.minSendable} ` +
          `and ${receivingCurrency.maxSendable} ${receivingCurrency.code}.`,
      };
    }

    // TODO(Jeremy): Move this to the currency service.
    if (
      payreq.sendingAmountCurrencyCode &&
      payreq.sendingAmountCurrencyCode !== "SAT" &&
      payreq.sendingAmountCurrencyCode !== receivingCurrency.code
    ) {
      return {
        httpStatus: 400,
        data: `Invalid sending currency. Cannot convert from ${payreq.sendingAmountCurrencyCode}.`,
      };
    }
    const receiverFeesMillisats = 0;
    const amountMsats = isSendingAmountMsats
      ? payreq.amount
      : payreq.amount * receivingCurrency.multiplier + receiverFeesMillisats;
    const isUmaRequest = payreq.isUma();
    if (isUmaRequest) {
      const shouldTransact = await this.complianceService.preScreenTransaction(
        payreq.payerData.identifier!,
        user.id,
        amountMsats,
        payreq.payerData.compliance?.nodePubKey ?? undefined,
        payreq.payerData.compliance?.utxos ?? [],
      );
      if (!shouldTransact) {
        return {
          httpStatus: 403,
          data: "This transaction is too risky.",
        };
      }
    }

    // 3 minutes invoice expiration to avoid big fluctuations in exchange rate.
    const expirationTimeSec = 60 * 3;
    // In a real implementation, this would be the txId for your own internal
    // tracking in post-transaction hooks.
    const txId = "1234";
    const payeeIdentifier = `$${user.umaUserName}@${hostNameWithPort(requestUrl)}`;
    // Controls whether UMA analytics will be enabled. If `true`, the receiver
    // identifier will be hashed using a monthly-rotated seed and used for
    // anonymized analysis.
    const enableAnalytics = true;
    const umaInvoiceCreator = {
      createUmaInvoice: async (amountMsats: number, metadata: string, receiverIdentifier: string | undefined) => {
        console.log(`Creating invoice for ${amountMsats} msats.`);
        const invoice = await this.lightsparkClient.createUmaInvoice(
          this.config.nodeID,
          amountMsats,
          metadata,
          expirationTimeSec,
          enableAnalytics ? this.config.umaSigningPrivKey() : undefined,
          enableAnalytics ? receiverIdentifier : undefined,
        );
        console.log(`Created invoice: ${invoice?.id}`);
        return invoice?.data.encodedPaymentRequest;
      },
    };
    const payeeData = this.getPayeeData(
      payreq.requestedPayeeData,
      user,
      requestUrl,
    );

    let response: uma.PayReqResponse;
    try {
      response = await uma.getPayReqResponse({
        request: payreq,
        conversionRate: receivingCurrency.multiplier,
        receivingCurrencyCode: receivingCurrency.code,
        receivingCurrencyDecimals: receivingCurrency.decimals,
        invoiceCreator: umaInvoiceCreator,
        metadata: this.getEncodedMetadata(requestUrl, user),
        receiverChannelUtxos: [],
        receiverFeesMillisats: receiverFeesMillisats,
        receiverNodePubKey: isUmaRequest
          ? await this.getReceiverNodePubKey()
          : undefined,
        utxoCallback: isUmaRequest
          ? this.getUtxoCallback(requestUrl, txId)
          : undefined,
        payeeData: payeeData,
        receivingVaspPrivateKey: isUmaRequest
          ? this.config.umaSigningPrivKey()
          : undefined,
        payeeIdentifier: payeeIdentifier,
      });
      return { httpStatus: 200, data: response.toJsonSchemaObject() };
    } catch (e) {
      console.log(`Failed to generate UMA response: ${e}`);
      console.error(e);
      return {
        httpStatus: 500,
        data: new Error("Failed to generate UMA response.", { cause: e }),
      };
    }
  }

  private async handleUmaCreateInvoice(
    user: User,
    requestUrl: URL,
  ): Promise<HttpResponse> {
    if (!requestUrl.searchParams.get("amount")) {
      return { httpStatus: 422, data: "missing parameter amount" };
    }
    
    const currencyCode = requestUrl.searchParams.get("currencyCode");
    const currencyPrefs = await this.userService.getCurrencyPreferencesForUser(
      user.id,
    );
    if (!currencyPrefs) {
      return {
        httpStatus: 500,
        data: "Failed to fetch currency preferences.",
      };
    }
    let receivingCurrency = currencyPrefs.find(
      (c) => c.code === currencyCode,
    );
    if (currencyCode && !receivingCurrency) {
      console.error(`Invalid currency: ${currencyCode}`);
      return {
        httpStatus: 400,
        data: `Invalid currency. This user does not accept ${currencyCode}.`,
      };
    } else if (!currencyCode) {
      return { httpStatus: 422, data: `Invalid target currency code: ${currencyCode}` };
    }

    const { code, minSendable, maxSendable } = receivingCurrency ?? SATS_CURRENCY
    const isSendingAmountMsats = code === SATS_CURRENCY.code;

    const amount = z.coerce.number().parse(requestUrl.searchParams.get("amount"));
    if (!amount) {
      return { httpStatus: 422, data: `Error: must specify currency amount`};
    }

    const [minSendableSats, maxSendableSats] =
      await this.userService.getReceivableMsatsRangeForUser(user.id);
    const isCurrencyAmountInBounds = isSendingAmountMsats
      ? amount >= minSendableSats && amount / 1000 <= maxSendableSats
      : amount >= minSendable &&
      amount <= maxSendable;
    if (!isCurrencyAmountInBounds) {
      return {
        httpStatus: 400,
        data:
          `Invalid amount. This user only accepts between ${minSendable} ` +
          `and ${maxSendable} ${code}.`,
      };
    }

    const umaDomain = hostNameWithPort(requestUrl);

    const bech32EncodedInvoice = await this.createUmaInvoiceBechEncoding(
      user, amount, umaDomain, receivingCurrency ?? SATS_CURRENCY
    );
    return {
      httpStatus: 200, data: bech32EncodedInvoice
    };
  }

  private async handleUmaCreateAndSendInvoice(
    user: User,
    requestUrl: URL
  ) {
    const senderUma = requestUrl.searchParams.get("senderUma");
    if (!senderUma) {
      return { httpStatus: 422, data: "missing parameter senderUma" };
    }
    
    const currencyCode = requestUrl.searchParams.get("currencyCode");
    const currencyPrefs = await this.userService.getCurrencyPreferencesForUser(
      user.id,
    );
    if (!currencyPrefs) {
      return {
        httpStatus: 500,
        data: "Failed to fetch currency preferences.",
      };
    }
    let receivingCurrency = currencyPrefs.find(
      (c) => c.code === currencyCode,
    );
    if (currencyCode && !receivingCurrency) {
      console.error(`Invalid currency: ${currencyCode}`);
      return {
        httpStatus: 400,
        data: `Invalid currency. This user does not accept ${currencyCode}.`,
      };
    } else if (!currencyCode) {
      return { httpStatus: 422, data: `Invalid target currency code: ${currencyCode}` };
    }
    const amount = z.coerce.number().parse(requestUrl.searchParams.get("amount"));
    const { code, minSendable, maxSendable } = receivingCurrency ?? SATS_CURRENCY
    const isSendingAmountMsats = code === SATS_CURRENCY.code;

    const [minSendableSats, maxSendableSats] =
      await this.userService.getReceivableMsatsRangeForUser(user.id);
    const isCurrencyAmountInBounds = isSendingAmountMsats
      ? amount >= minSendableSats && amount / 1000 <= maxSendableSats
      : amount >= minSendable && amount <= maxSendable;
    if (!isCurrencyAmountInBounds) {
      return {
        httpStatus: 400,
        data:
          `Invalid amount. This user only accepts between ${minSendable} ` +
          `and ${maxSendable} ${code}.`,
      };
    }

    const umaDomain = hostNameWithPort(requestUrl);
    const bech32EncodedInvoice = await this.createUmaInvoiceBechEncoding(
      user, amount, umaDomain, receivingCurrency ?? SATS_CURRENCY, senderUma
    );

    const [, senderDomain] = senderUma.split("@");

    // Fetch the UMA configuration from the sender's domain
    let umaRequestEndpoint: string;
    try {
      umaRequestEndpoint = await this.fetchUmaRequestEndpoint(senderDomain);
    } catch (e) {
      console.error("Error fetching UMA configuration:", e);
      return { httpStatus: 500, data: "Error fetching UMA configuration." };
    }

    const senderUrl = new URL(umaRequestEndpoint);
    let response: globalThis.Response;
    try {
      response = await fetch(senderUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({"invoice":bech32EncodedInvoice})
      });
    } catch (e) {
      return { httpStatus: 500, data: "Error sending payreq." };
    }

    if (response.status !== 200) {
      return {
        httpStatus: 200, data: `Error: request pay invoice failed: ${response.text}`
      }
    }

    return {
      httpStatus: 200, data: response.body
    };
  }

  private async fetchUmaRequestEndpoint(domain: string): Promise<string> {
    const umaConfigResponse = await fetch(`https://${domain}/.well-known/uma-configuration`);
    if (!umaConfigResponse.ok) {
      throw new Error(`HTTP error! status: ${umaConfigResponse.status}`);
    }
    const jsonResponse = await umaConfigResponse.json();
    const umaConfiguration = jsonResponse as { uma_request_endpoint: string };
    return umaConfiguration.uma_request_endpoint;
  }

  private async createUmaInvoiceBechEncoding(
    user: User,
    amount: number,
    umaDomain: string,
    currency: uma.Currency,
    senderUma: string | undefined = undefined
  ): Promise<string> {
    const { code, name, symbol, decimals } = currency;

    const expiration = Date.now() + (2 * 24 * 60 * 60 * 1000); // +2 days

    const invoice = await uma.createUmaInvoice({
      receiverUma: `$${user.umaUserName}@${umaDomain}`,
      invoiceUUID: uuidv4(),
      amount: amount,
      receivingCurrency: { code, name, symbol, decimals },
      expiration: expiration,
      isSubjectToTravelRule: true,
      requiredPayerData: PAYER_DATA_OPTIONS,
      commentCharsAllowed: undefined,
      senderUma: senderUma,
      invoiceLimit: undefined,
      kycStatus: uma.KycStatus.Verified,
      callback: this.buildCallbackUrl(umaDomain, `/api/uma/payreq/${user.id}`),
    },
    
      this.config.umaSigningPrivKey(),
    );
    return uma.InvoiceSerializer.toBech32(invoice);
  }

  private buildCallbackUrl(domain: string, path: string): string {
    const protocol = isDomainLocalhost(domain) ? "http" : "https";
    const callback = `${protocol}://${domain}${path}`;
    return callback;
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

    let request: uma.PayRequest;
    try {
      request = uma.PayRequest.fromUrlSearchParams(requestUrl.searchParams);
    } catch (e) {
      return {
        httpStatus: 400,
        data: "Invalid pay request: " + e,
      };
    }

    return this.handlePayReq(request, user, requestUrl);
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

  private getPayeeData(
    options: uma.CounterPartyDataOptions | undefined,
    user: User,
    requestUrl: URL,
  ) {
    const name = options?.name?.mandatory ? user.umaUserName : undefined;
    const email = options?.email?.mandatory ? user.emailAddress : undefined;
    return {
      name: name,
      email: email,
      identifier: `${user.umaUserName}@${requestUrl.hostname}`,
    };
  }
}
