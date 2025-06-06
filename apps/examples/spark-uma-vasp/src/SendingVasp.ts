import * as uma from "@uma-sdk/core";
import { decode, PaymentRequestObject } from "bolt11";
import { Express } from "express";
import asyncHandler from "express-async-handler";
import SendingVaspRequestCache from "./SendingVaspRequestCache.js";
import UmaConfig from "./UmaConfig.js";
import { User } from "./User.js";
import UserService from "./UserService.js";
import { SATS_CURRENCY } from "./currencies.js";
import { HttpResponse } from "./networking/HttpResponse.js";
import {
  fullUrlForRequest,
  hostNameWithPort,
  sendResponse,
} from "./networking/expressAdapters.js";

export default class SendingVasp {
  constructor(
    private readonly config: UmaConfig,
    private readonly requestCache: SendingVaspRequestCache,
    private readonly userService: UserService,
  ) {}

  registerRoutes(app: Express): void {
    app.get(
      "/api/umalookup/:receiver",
      asyncHandler(async (req, resp) => {
        const user = await this.userService.getCallingUserFromRequest(
          fullUrlForRequest(req),
          req.headers,
        );
        if (!user) {
          throw new uma.UmaError(
            "Unauthorized. Check your credentials.",
            uma.ErrorCode.FORBIDDEN,
          );
        }
        const response = await this.handleClientUmaLookup(req.params.receiver);
        sendResponse(resp, response);
      }),
    );

    app.get(
      "/api/umapayreq/:callbackUuid",
      asyncHandler(async (req, resp) => {
        const user = await this.userService.getCallingUserFromRequest(
          fullUrlForRequest(req),
          req.headers,
        );
        if (!user) {
          throw new uma.UmaError(
            "Unauthorized. Check your credentials.",
            uma.ErrorCode.FORBIDDEN,
          );
        }
        const response = await this.handleClientUmaPayreq(
          user,
          req.params.callbackUuid,
          fullUrlForRequest(req),
        );
        sendResponse(resp, response);
      }),
    );
  }

  private async handleClientUmaLookup(
    receiverUmaAddress: string,
  ): Promise<HttpResponse> {
    if (!receiverUmaAddress) {
      throw new uma.UmaError("Missing receiver", uma.ErrorCode.INVALID_INPUT);
    }

    const [receiverId, receivingVaspDomain] = receiverUmaAddress.split("@");
    if (!receiverId || !receivingVaspDomain) {
      console.error(`Invalid receiver: ${receiverUmaAddress}`);
      throw new uma.UmaError("Invalid receiver", uma.ErrorCode.INVALID_INPUT);
    }

    let lnurlpRequestUrl: URL;
    const lnurlpRequest: uma.LnurlpRequest = {
      receiverAddress: receiverUmaAddress,
    };
    lnurlpRequestUrl = uma.encodeToUrl(lnurlpRequest);

    console.log(`Making lnurlp request: ${lnurlpRequestUrl}`);

    let response: globalThis.Response;
    try {
      response = await fetch(lnurlpRequestUrl);
    } catch (e) {
      console.error("Error fetching Lnurlp request.", e);
      throw new uma.UmaError(
        "Error fetching Lnurlp request.",
        uma.ErrorCode.INTERNAL_ERROR,
      );
    }

    if (!response.ok) {
      throw new uma.UmaError(
        `Error fetching Lnurlp request. ${response.status}`,
        uma.ErrorCode.LNURLP_REQUEST_FAILED,
      );
    }

    let lnurlpResponse: uma.LnurlpResponse;
    const responseJson = await response.text();
    try {
      lnurlpResponse = uma.LnurlpResponse.fromJson(responseJson);
    } catch (e) {
      console.error("Error parsing lnurlp response.", e, responseJson);
      throw new uma.UmaError(
        `Error parsing Lnurlp response. ${e}`,
        uma.ErrorCode.PARSE_LNURLP_RESPONSE_ERROR,
      );
    }
    if (lnurlpResponse.isUma()) {
      throw new uma.UmaError(
        "Only lnurl requests are supported for now.",
        uma.ErrorCode.INVALID_INPUT,
      );
    }

    const callbackUuid = this.requestCache.saveLnurlpResponseData(
      lnurlpResponse,
      receiverId,
      receivingVaspDomain,
    );
    return {
      httpStatus: 200,
      data: {
        receiverCurrencies: lnurlpResponse.currencies || [SATS_CURRENCY],
        callbackUuid: callbackUuid,
        maxSendSats: lnurlpResponse.maxSendable,
        minSendSats: lnurlpResponse.minSendable,
        receiverKycStatus: uma.KycStatus.NotVerified,
      },
    };
  }

  private async handleClientUmaPayreq(
    user: User,
    callbackUuid: string,
    requestUrl: URL,
  ): Promise<HttpResponse> {
    if (!callbackUuid || callbackUuid === "") {
      throw new uma.UmaError(
        "Missing callbackUuid",
        uma.ErrorCode.INVALID_INPUT,
      );
    }

    const initialRequestData =
      this.requestCache.getLnurlpResponseData(callbackUuid);
    if (!initialRequestData) {
      throw new uma.UmaError(
        "callbackUuid not found",
        uma.ErrorCode.REQUEST_NOT_FOUND,
      );
    }

    const amountStr = requestUrl.searchParams.get("amount");
    if (!amountStr || typeof amountStr !== "string") {
      throw new uma.UmaError("Missing amount", uma.ErrorCode.INVALID_INPUT);
    }
    const amount = parseFloat(amountStr);
    if (isNaN(amount)) {
      throw new uma.UmaError("Invalid amount", uma.ErrorCode.INVALID_INPUT);
    }

    if (!initialRequestData.lnurlpResponse) {
      throw new uma.UmaError(
        "Invalid callbackUuid",
        uma.ErrorCode.INVALID_INPUT,
      );
    }

    const receivingCurrencyCode = requestUrl.searchParams.get(
      "receivingCurrencyCode",
    );

    let payerProfile: PayerProfile | null = null;
    if (initialRequestData.lnurlpResponse.payerData) {
      payerProfile = this.getPayerProfile(
        user,
        initialRequestData.lnurlpResponse.payerData,
        this.getSendingVaspDomain(requestUrl),
      );
    }

    const msatsParam = requestUrl.searchParams.get("isAmountInMsats");

    let response: globalThis.Response;
    try {
      const url = new URL(initialRequestData.lnurlpResponse.callback);
      if (msatsParam && msatsParam === "true") {
        url.searchParams.append("amount", `${amount}.SAT`);
      } else {
        url.searchParams.append("amount", amount.toString());
      }
      if (receivingCurrencyCode) {
        url.searchParams.append("convert", receivingCurrencyCode);
      }
      if (
        payerProfile &&
        (payerProfile.identifier || payerProfile.email || payerProfile.name)
      ) {
        url.searchParams.append("payerData", JSON.stringify(payerProfile));
      }
      response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (e) {
      console.error("Error sending payreq.", e);
      throw new uma.UmaError(
        "Error sending payreq.",
        uma.ErrorCode.INTERNAL_ERROR,
      );
    }

    const responseText = await response.text();
    if (!response.ok) {
      throw new uma.UmaError(
        `Payreq failed. ${response.status}`,
        uma.ErrorCode.PAYREQ_REQUEST_FAILED,
      );
    }

    const responseJson = JSON.parse(responseText);
    if (responseJson.status === "ERROR") {
      console.error("Error on pay request.", responseJson.reason);
      throw new uma.UmaError(
        `Error on pay request. reason: ${responseJson.reason} code: ${responseJson.code}`,
        uma.ErrorCode.PAYREQ_REQUEST_FAILED,
      );
    }
    let payreqResponse: uma.PayReqResponse;
    try {
      payreqResponse = uma.PayReqResponse.fromJson(responseText);
    } catch (e) {
      console.error("Error parsing payreq response.", e);
      throw new uma.UmaError(
        "Error parsing payreq response.",
        uma.ErrorCode.PARSE_PAYREQ_RESPONSE_ERROR,
      );
    }

    const encodedInvoice = payreqResponse.pr;

    let invoice: PaymentRequestObject;
    try {
      invoice = await decode(encodedInvoice);
    } catch (e) {
      console.error("Error decoding invoice.", e);
      throw new uma.UmaError(
        "Error decoding invoice.",
        uma.ErrorCode.INVALID_INVOICE,
      );
    }

    const newCallbackUuid = this.requestCache.savePayReqData(
      payreqResponse.payeeData?.identifier ?? "",
      encodedInvoice,
      undefined, // no invoice id
      "", // No utxo callback for non-UMA lnurl.
      invoice,
      [],
    );

    return {
      httpStatus: 200,
      data: {
        callbackUuid: newCallbackUuid,
        encodedInvoice: encodedInvoice,
        amount: payreqResponse.converted?.amount ?? invoice.millisatoshis,
        conversionRate: payreqResponse.converted?.multiplier ?? 1000,
        exchangeFeesMillisatoshi: payreqResponse.converted?.fee ?? 0,
        currencyCode: receivingCurrencyCode ?? "SAT",
      },
    };
  }

  /**
   * NOTE: In a real application, you'd want to use the authentication context to pull out this information. It's not
   * actually always Alice sending the money ;-).
   */
  private getPayerProfile(
    user: User,
    requiredPayerData: uma.CounterPartyDataOptions,
    vaspDomain: string,
  ): PayerProfile {
    return {
      name: requiredPayerData.name?.mandatory ? user.name ?? "" : undefined,
      email: requiredPayerData.email?.mandatory
        ? user.emailAddress ?? ""
        : undefined,
      identifier: !!requiredPayerData.identifier
        ? `$${user.umaUserName}@${vaspDomain}`
        : undefined,
    };
  }

  private getSendingVaspDomain(requestUrl: URL): string {
    const configVaspDomain = this.config.sendingVaspDomain;
    if (configVaspDomain) {
      return configVaspDomain;
    }
    return hostNameWithPort(requestUrl);
  }
}

type PayerProfile = {
  name?: string;
  email?: string;
  identifier?: string;
};
