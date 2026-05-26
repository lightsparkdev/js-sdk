import {
  getLightsparkNodeQuery,
  LightsparkClient,
  LightsparkNode,
} from "@lightsparkdev/lightspark-sdk";
import * as uma from "@uma-sdk/core";
import { Express } from "express";
import asyncHandler from "express-async-handler";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import ComplianceService from "./ComplianceService.js";
import { SATS_CURRENCY } from "./currencies.js";
import {
  fullUrlForRequest,
  hostNameWithPort,
  isDomainLocalhost,
  sendResponse,
} from "./networking/expressAdapters.js";
import { HttpResponse } from "./networking/HttpResponse.js";
import { PAYER_DATA_OPTIONS } from "./PayerDataOptions.js";
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
    app.get(
      "/.well-known/lnurlp/:username",
      asyncHandler(async (req, resp) => {
        const response = await this.handleLnurlpRequest(
          req.params.username,
          fullUrlForRequest(req),
        );
        sendResponse(resp, response);
      }),
    );

    app.get(
      "/api/lnurl/payreq/:uuid",
      asyncHandler(async (req, resp) => {
        const response = await this.handleLnurlPayreq(
          req.params.uuid,
          fullUrlForRequest(req),
        );
        sendResponse(resp, response);
      }),
    );

    app.post(
      "/api/uma/payreq/:uuid",
      asyncHandler(async (req, resp) => {
        const response = await this.handleUmaPayreq(
          req.params.uuid,
          fullUrlForRequest(req),
          req.body,
        );
        sendResponse(resp, response);
      }),
    );

    app.post(
      "/api/uma/create_invoice",
      asyncHandler(async (req, resp) => {
        const user = await this.userService.getCallingUserFromRequest(
          fullUrlForRequest(req),
          req.headers,
        );
        if (!user) {
          throw new uma.UmaError(
            "User not found.",
            uma.ErrorCode.USER_NOT_FOUND,
          );
        }
        const response = await this.handleUmaCreateInvoice(
          user,
          fullUrlForRequest(req),
        );
        sendResponse(resp, response);
      }),
    );

    app.post(
      "/api/uma/create_and_send_invoice",
      asyncHandler(async (req, resp) => {
        const user = await this.userService.getCallingUserFromRequest(
          fullUrlForRequest(req),
          req.headers,
        );
        if (!user) {
          throw new uma.UmaError(
            "User not found.",
            uma.ErrorCode.USER_NOT_FOUND,
          );
        }
        const response = await this.handleUmaCreateAndSendInvoice(
          user,
          fullUrlForRequest(req),
        );
        sendResponse(resp, response);
      }),
    );
  }

  private async handleLnurlpRequest(
    username: string,
    requestUrl: URL,
  ): Promise<HttpResponse> {
    const user = await this.userService.getUserByUma(username);
    if (!user) {
      throw new uma.UmaError("User not found.", uma.ErrorCode.USER_NOT_FOUND);
    }

    let lnurlpRequest: uma.LnurlpRequest;
    try {
      lnurlpRequest = uma.parseLnurlpRequest(requestUrl);
    } catch (e: any) {
      if (e instanceof uma.UnsupportedVersionError) {
        // For unsupported versions, return a 412 "Precondition Failed" as per the spec.
        throw e;
      }
      throw new uma.UmaError(
        "Invalid lnurlp Query",
        uma.ErrorCode.PARSE_LNURLP_REQUEST_ERROR,
      );
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
      throw new uma.UmaError(
        "Invalid UMA query.",
        uma.ErrorCode.INTERNAL_ERROR,
      );
    }
    if (
      !this.complianceService.shouldAcceptTransactionFromVasp(
        umaQuery.vaspDomain!,
        umaQuery.receiverAddress,
      )
    ) {
      throw new uma.UmaError(
        "This user is not allowed to transact with this VASP.",
        uma.ErrorCode.COUNTERPARTY_NOT_ALLOWED,
      );
    }

    let pubKeys: uma.PubKeyResponse;
    try {
      pubKeys = await uma.fetchPublicKeyForVasp({
        cache: this.pubKeyCache,
        vaspDomain: umaQuery.vaspDomain!,
      });
    } catch (e) {
      console.error(e);
      throw new uma.UmaError(
        "Failed to fetch public key.",
        uma.ErrorCode.COUNTERPARTY_PUBKEY_FETCH_ERROR,
      );
    }

    try {
      const isSignatureValid = await uma.verifyUmaLnurlpQuerySignature(
        umaQuery,
        pubKeys,
        this.nonceCache,
      );
      if (!isSignatureValid) {
        throw new uma.UmaError(
          "Invalid UMA query signature.",
          uma.ErrorCode.INVALID_SIGNATURE,
        );
      }
    } catch (e) {
      if (e instanceof uma.UmaError) {
        throw e;
      }
      throw new uma.UmaError(
        "Invalid UMA query signature.",
        uma.ErrorCode.INVALID_SIGNATURE,
      );
    }

    const currencyPrefs = await this.userService.getCurrencyPreferencesForUser(
      user.id,
    );
    if (!currencyPrefs) {
      throw new uma.UmaError(
        "Failed to fetch currency preferences.",
        uma.ErrorCode.INTERNAL_ERROR,
      );
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
      if (e instanceof uma.UmaError) {
        throw e;
      }
      throw new uma.UmaError(
        "Failed to generate UMA response.",
        uma.ErrorCode.INTERNAL_ERROR,
      );
    }
  }

  private async handleUmaPayreq(
    userId: string,
    requestUrl: URL,
    requestBody: string,
  ): Promise<HttpResponse> {
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new uma.UmaError("User not found.", uma.ErrorCode.USER_NOT_FOUND);
    }

    let payreq: uma.PayRequest;
    try {
      console.log(`Parsing payreq: ${requestBody}`);
      payreq = uma.PayRequest.fromJson(requestBody);
    } catch (e) {
      console.error("Failed to parse pay req", e);
      throw new uma.UmaError(
        "Invalid UMA pay request.",
        uma.ErrorCode.PARSE_PAYREQ_REQUEST_ERROR,
      );
    }
    console.log(
      `Parsed payreq: ${JSON.stringify(payreq.toJsonSchemaObject(), null, 2)}`,
    );
    if (!payreq.isUma()) {
      throw new uma.UmaError(
        "Invalid UMA pay request.",
        uma.ErrorCode.MISSING_REQUIRED_UMA_PARAMETERS,
      );
    }

    if (!payreq.payerData!.identifier) {
      throw new uma.UmaError(
        "Payer identifier is missing.",
        uma.ErrorCode.MISSING_REQUIRED_UMA_PARAMETERS,
      );
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
      throw new uma.UmaError(
        "Failed to fetch public key.",
        uma.ErrorCode.COUNTERPARTY_PUBKEY_FETCH_ERROR,
      );
    }

    console.log(`Fetched pubkeys: ${JSON.stringify(pubKeys, null, 2)}`);

    try {
      const isSignatureValid = await uma.verifyPayReqSignature(
        payreq,
        pubKeys,
        this.nonceCache,
      );
      if (!isSignatureValid) {
        throw new uma.UmaError(
          "Invalid payreq signature.",
          uma.ErrorCode.INVALID_SIGNATURE,
        );
      }
    } catch (e) {
      console.error(e);
      if (e instanceof uma.UmaError) {
        throw e;
      }
      throw new uma.UmaError(
        "Invalid payreq signature.",
        uma.ErrorCode.INVALID_SIGNATURE,
      );
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
      throw new uma.UmaError(
        "Failed to fetch currency preferences.",
        uma.ErrorCode.INTERNAL_ERROR,
      );
    }
    let receivingCurrency = currencyPrefs.find(
      (c) => c.code === payreq.receivingCurrencyCode,
    );
    if (payreq.receivingCurrencyCode && !receivingCurrency) {
      console.error(`Invalid currency: ${payreq.receivingCurrencyCode}`);
      throw new uma.UmaError(
        `Invalid currency. This user does not accept ${payreq.receivingCurrencyCode}.`,
        uma.ErrorCode.INVALID_CURRENCY,
      );
    } else if (!payreq.receivingCurrencyCode) {
      receivingCurrency = SATS_CURRENCY;
    } else if (!receivingCurrency) {
      // This can't actually happen, but TypeScript doesn't know that.
      throw new uma.UmaError(
        "Invalid currency.",
        uma.ErrorCode.INVALID_CURRENCY,
      );
    }

    const isSendingAmountMsats = !payreq.sendingAmountCurrencyCode;
    const [minSendableSats, maxSendableSats] =
      await this.userService.getReceivableMsatsRangeForUser(user.id);
    const isCurrencyAmountInBounds = isSendingAmountMsats
      ? payreq.amount >= minSendableSats &&
        payreq.amount / 1000 <= maxSendableSats
      : payreq.amount >= receivingCurrency.minSendable &&
        payreq.amount <= receivingCurrency.maxSendable;
    if (!isCurrencyAmountInBounds) {
      throw new uma.UmaError(
        `Invalid amount. This user only accepts between ${receivingCurrency.minSendable} ` +
          `and ${receivingCurrency.maxSendable} ${receivingCurrency.code}.`,
        uma.ErrorCode.AMOUNT_OUT_OF_RANGE,
      );
    }

    // TODO(Jeremy): Move this to the currency service.
    if (
      payreq.sendingAmountCurrencyCode &&
      payreq.sendingAmountCurrencyCode !== "SAT" &&
      payreq.sendingAmountCurrencyCode !== receivingCurrency.code
    ) {
      throw new uma.UmaError(
        `Invalid sending currency. Cannot convert from ${payreq.sendingAmountCurrencyCode}.`,
        uma.ErrorCode.INVALID_CURRENCY,
      );
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
        throw new uma.UmaError(
          "This transaction is too risky.",
          uma.ErrorCode.COUNTERPARTY_NOT_ALLOWED,
        );
      }
    }

    // 3 minutes invoice expiration to avoid big fluctuations in exchange rate.
    const expirationTimeSec = 60 * 3;
    // In a real implementation, this would be the txId for your own internal
    // tracking in post-transaction hooks.
    const txId = "1234";
    const payeeIdentifier = `$${user.umaUserName}@${hostNameWithPort(
      requestUrl,
    )}`;
    // Controls whether UMA analytics will be enabled. If `true`, the receiver
    // identifier will be hashed using a monthly-rotated seed and used for
    // anonymized analysis.
    const enableAnalytics = true;
    const umaInvoiceCreator = {
      createUmaInvoice: async (
        amountMsats: number,
        metadata: string,
        receiverIdentifier: string | undefined,
      ) => {
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
      if (e instanceof uma.UmaError) {
        throw e;
      }
      throw new uma.UmaError(
        "Failed to generate UMA response.",
        uma.ErrorCode.INTERNAL_ERROR,
      );
    }
  }

  private async handleUmaCreateInvoice(
    user: User,
    requestUrl: URL,
  ): Promise<HttpResponse> {
    return this.parseAndEncodeUmaInvoice(user, requestUrl, undefined);
  }

  private async handleUmaCreateAndSendInvoice(user: User, requestUrl: URL) {
    const senderUma = requestUrl.searchParams.get("senderUma");
    if (!senderUma) {
      throw new uma.UmaError(
        "missing parameter senderUma",
        uma.ErrorCode.MISSING_REQUIRED_UMA_PARAMETERS,
      );
    }
    const { httpStatus, data: bech32EncodedInvoice } =
      await this.parseAndEncodeUmaInvoice(user, requestUrl, senderUma);
    if (httpStatus !== 200) {
      throw new uma.UmaError(
        `Failed to parse and encode UMA invoice: ${bech32EncodedInvoice}`,
        uma.ErrorCode.INVALID_INVOICE,
      );
    }

    const [, senderDomain] = senderUma.split("@");

    // Fetch the UMA configuration from the sender's domain
    let umaRequestEndpoint: string;
    try {
      umaRequestEndpoint = await this.fetchUmaRequestEndpoint(
        requestUrl,
        senderDomain,
      );
    } catch (e) {
      console.error("Error fetching UMA configuration:", e);
      throw new uma.UmaError(
        "Error fetching UMA configuration.",
        uma.ErrorCode.INTERNAL_ERROR,
      );
    }

    const senderUrl = new URL(umaRequestEndpoint);
    let response: globalThis.Response;
    try {
      response = await fetch(senderUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invoice: bech32EncodedInvoice }),
      });
    } catch (e) {
      throw new uma.UmaError(
        "Error sending payreq.",
        uma.ErrorCode.PAYREQ_REQUEST_FAILED,
      );
    }

    if (response.status !== 200) {
      throw new uma.UmaError(
        `Error sending payreq: ${response.statusText}`,
        uma.ErrorCode.PAYREQ_REQUEST_FAILED,
      );
    }

    return {
      httpStatus: 200,
      data: response.body,
    };
  }

  private async parseAndEncodeUmaInvoice(
    user: User,
    requestUrl: URL,
    senderUma: string | undefined,
  ): Promise<HttpResponse> {
    const currencyCode = requestUrl.searchParams.get("currencyCode");
    const currencyPrefs = await this.userService.getCurrencyPreferencesForUser(
      user.id,
    );
    if (!currencyPrefs) {
      throw new uma.UmaError(
        "Failed to fetch currency preferences.",
        uma.ErrorCode.INTERNAL_ERROR,
      );
    }
    let receivingCurrency = currencyPrefs.find((c) => c.code === currencyCode);
    if (currencyCode && !receivingCurrency) {
      console.error(`Invalid currency: ${currencyCode}`);
      throw new uma.UmaError(
        `Invalid currency. This user does not accept ${currencyCode}.`,
        uma.ErrorCode.INVALID_CURRENCY,
      );
    } else if (!currencyCode) {
      throw new uma.UmaError(
        `Invalid target currency code: ${currencyCode}`,
        uma.ErrorCode.INVALID_CURRENCY,
      );
    }
    const amountResult = z.coerce
      .number()
      .safeParse(requestUrl.searchParams.get("amount"));
    if (!amountResult.success) {
      throw new uma.UmaError(
        "Invalid amount parameter.",
        uma.ErrorCode.INVALID_INPUT,
      );
    }
    const amount = amountResult.data;
    const { code, minSendable, maxSendable } =
      receivingCurrency ?? SATS_CURRENCY;
    const isSendingAmountMsats = code === SATS_CURRENCY.code;

    const [minSendableSats, maxSendableSats] =
      await this.userService.getReceivableMsatsRangeForUser(user.id);
    const isCurrencyAmountInBounds = isSendingAmountMsats
      ? amount >= minSendableSats && amount / 1000 <= maxSendableSats
      : amount >= minSendable && amount <= maxSendable;
    if (!isCurrencyAmountInBounds) {
      throw new uma.UmaError(
        `Invalid amount. This user only accepts between ${minSendable} ` +
          `and ${maxSendable} ${code}.`,
        uma.ErrorCode.AMOUNT_OUT_OF_RANGE,
      );
    }

    const umaDomain = hostNameWithPort(requestUrl);
    const bech32EncodedInvoice = await this.createUmaInvoiceBechEncoding(
      user,
      amount,
      umaDomain,
      receivingCurrency ?? SATS_CURRENCY,
      senderUma,
    );
    return {
      httpStatus: 200,
      data: bech32EncodedInvoice,
    };
  }

  private async fetchUmaRequestEndpoint(
    fullUrl: URL,
    domain: string,
  ): Promise<string> {
    const protocol = isDomainLocalhost(fullUrl.hostname) ? "http" : "https";
    const umaConfigResponse = await fetch(
      `${protocol}://${domain}/.well-known/uma-configuration`,
    );
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
    senderUma: string | undefined = undefined,
  ): Promise<string> {
    const { code, name, symbol, decimals } = currency;

    const expiration = Date.now() + 2 * 24 * 60 * 60 * 1000; // +2 days

    const invoice = await uma.createUmaInvoice(
      {
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
        callback: this.buildCallbackUrl(
          umaDomain,
          `/api/uma/payreq/${user.id}`,
        ),
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
      throw new uma.UmaError("User not found.", uma.ErrorCode.USER_NOT_FOUND);
    }

    let request: uma.PayRequest;
    try {
      request = uma.PayRequest.fromUrlSearchParams(requestUrl.searchParams);
    } catch (e) {
      throw new uma.UmaError(
        "Invalid pay request: " + e,
        uma.ErrorCode.PARSE_PAYREQ_REQUEST_ERROR,
      );
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
      throw new uma.UmaError(
        `Failed to fetch node ${this.config.nodeID}.`,
        uma.ErrorCode.INTERNAL_ERROR,
      );
    }
    if (!node) {
      throw new uma.UmaError(
        `Node ${this.config.nodeID} not found.`,
        uma.ErrorCode.INTERNAL_ERROR,
      );
    }
    if (!node.publicKey) {
      throw new uma.UmaError(
        `Node ${this.config.nodeID} has no known public key.`,
        uma.ErrorCode.INTERNAL_ERROR,
      );
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
