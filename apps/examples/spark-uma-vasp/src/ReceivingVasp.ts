import { SparkWallet } from "@buildonspark/spark-sdk";
import * as uma from "@uma-sdk/core";
import { createHash } from "crypto";
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
import { User } from "./User.js";
import UserService from "./UserService.js";

export default class ReceivingVasp {
  constructor(
    private readonly sparkWallet: SparkWallet,
    private readonly userService: UserService,
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
  }

  private async handleLnurlpRequest(
    username: string,
    requestUrl: URL,
  ): Promise<HttpResponse> {
    const user = await this.userService.getUserByUma(username);
    if (!user) {
      throw new uma.UmaError("User not found.", uma.ErrorCode.USER_NOT_FOUND);
    }

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

    const receivingCurrency = payreq.receivingCurrencyCode ? SATS_CURRENCY : undefined;
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

    // 1 hour invoice expiration is fine since there's no currency conversion happening here.
    const expirationTimeSec = 60 * 60;
    const payeeIdentifier = `$${user.umaUserName}@${hostNameWithPort(
      requestUrl,
    )}`;
    const invoiceCreator = {
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
        conversionRate: receivingCurrency?.multiplier,
        receivingCurrencyCode: receivingCurrency?.code,
        receivingCurrencyDecimals: receivingCurrency?.decimals,
        invoiceCreator,
        metadata: this.getEncodedMetadata(requestUrl, user),
        payeeData: payeeData,
        payeeIdentifier: payeeIdentifier,
        receiverChannelUtxos: undefined,
        receiverFeesMillisats: undefined,
        receivingVaspPrivateKey: undefined,
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

  private getPayeeData(
    options: uma.CounterPartyDataOptions | undefined,
    user: User,
    requestUrl: URL,
  ) {
    // You can also just choose to reject requests if you don't wish to provide
    // any payee data.
    const name = options?.name?.mandatory ? user.umaUserName : undefined;
    const email = options?.email?.mandatory ? user.emailAddress : undefined;
    return {
      name: name,
      email: email,
      identifier: `${user.umaUserName}@${requestUrl.hostname}`,
    };
  }
}
