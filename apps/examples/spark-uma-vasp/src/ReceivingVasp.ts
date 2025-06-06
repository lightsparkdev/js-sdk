import { SparkWallet } from "@buildonspark/spark-sdk";
import * as uma from "@uma-sdk/core";
import { decode } from "bolt11";
import { Express } from "express";
import asyncHandler from "express-async-handler";
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
    private readonly sparkWallet: SparkWallet,
    private readonly pubKeyCache: uma.PublicKeyCache,
    private readonly userService: UserService,
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
        currencyOptions: [SATS_CURRENCY],
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
    if (
      payreq.receivingCurrencyCode &&
      payreq.receivingCurrencyCode !== "SAT"
    ) {
      console.error(`Invalid currency: ${payreq.receivingCurrencyCode}`);
      throw new uma.UmaError(
        `Invalid currency. This user does not accept ${payreq.receivingCurrencyCode}.`,
        uma.ErrorCode.INVALID_CURRENCY,
      );
    }

    const isSendingAmountMsats = !payreq.sendingAmountCurrencyCode;
    const [minSendableSats, maxSendableSats] =
      await this.userService.getReceivableMsatsRangeForUser(user.id);
    const isCurrencyAmountInBounds = isSendingAmountMsats
      ? payreq.amount >= minSendableSats &&
        payreq.amount / 1000 <= maxSendableSats
      : payreq.amount >= SATS_CURRENCY.minSendable &&
        payreq.amount <= SATS_CURRENCY.maxSendable;
    if (!isCurrencyAmountInBounds) {
      throw new uma.UmaError(
        `Invalid amount. This user only accepts between ${SATS_CURRENCY.minSendable} ` +
          `and ${SATS_CURRENCY.maxSendable} ${SATS_CURRENCY.code}.`,
        uma.ErrorCode.AMOUNT_OUT_OF_RANGE,
      );
    }

    if (
      payreq.sendingAmountCurrencyCode &&
      payreq.sendingAmountCurrencyCode !== "SAT"
    ) {
      throw new uma.UmaError(
        `Invalid sending currency. Cannot convert from ${payreq.sendingAmountCurrencyCode}.`,
        uma.ErrorCode.INVALID_CURRENCY,
      );
    }
    const isUmaRequest = payreq.isUma();

    // 1 hour invoice expiration is fine since there's no currency conversion happening here.
    const expirationTimeSec = 60 * 60;
    const payeeIdentifier = `$${user.umaUserName}@${hostNameWithPort(
      requestUrl,
    )}`;
    const umaInvoiceCreator = {
      createUmaInvoice: async (amountMsats: number, metadata: string) => {
        console.log(`Creating invoice for ${amountMsats} msats.`);
        const invoiceRequest = await this.sparkWallet.createLightningInvoice({
          amountSats: Math.round(amountMsats / 1000),
          expirySeconds: expirationTimeSec,
          receiverIdentityPubkey: user.sparkIdentityPubkey,
          // Pushing to SDK shortly:
          // descriptionHash: createHash("sha256").update(metadata).digest("hex"),
        });
        console.log(`Created invoice: ${invoiceRequest.id}`);
        return invoiceRequest.invoice.encodedInvoice;
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
        conversionRate: SATS_CURRENCY.multiplier,
        receivingCurrencyCode: SATS_CURRENCY.code,
        receivingCurrencyDecimals: SATS_CURRENCY.decimals,
        invoiceCreator: umaInvoiceCreator,
        metadata: this.getEncodedMetadata(requestUrl, user),
        receiverChannelUtxos: [],
        receiverFeesMillisats: 0,
        receiverNodePubKey: isUmaRequest
          ? await this.getReceiverNodePubKey(user.sparkIdentityPubkey)
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

  private async getReceiverNodePubKey(
    receiverIdentityPubkey: string,
  ): Promise<string> {
    // TODO: There's probably a better way to get this...
    const invoiceRequest = await this.sparkWallet.createLightningInvoice({
      amountSats: 1000,
      // receiverIdentityPubkey: user.sparkIdentityPubkey,
      // TODO: Metadata hash...
    });
    const invoice = decode(invoiceRequest.invoice.encodedInvoice);
    return invoice.payeeNodeKey || receiverIdentityPubkey;
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
