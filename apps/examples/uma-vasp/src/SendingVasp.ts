import { convertCurrencyAmount } from "@lightsparkdev/core";
import {
  CurrencyUnit,
  getLightsparkNodeQuery,
  InvoiceData,
  LightsparkClient,
  OutgoingPayment,
  PaymentDirection,
  TransactionStatus,
} from "@lightsparkdev/lightspark-sdk";
import * as uma from "@uma-sdk/core";
import { Express } from "express";
import asyncHandler from "express-async-handler";
import ComplianceService from "./ComplianceService.js";
import InternalLedgerService from "./InternalLedgerService.js";
import SendingVaspRequestCache, {
  SendingVaspInitialRequestData,
  SendingVaspPayReqData,
} from "./SendingVaspRequestCache.js";
import UmaConfig from "./UmaConfig.js";
import { User } from "./User.js";
import UserService from "./UserService.js";
import {
  CURRENCIES,
  CurrencyType,
  isCurrencyType,
  SATS_CURRENCY,
} from "./currencies.js";
import { HttpResponse } from "./networking/HttpResponse.js";
import {
  fullUrlForRequest,
  hostNameWithPort,
  sendResponse,
} from "./networking/expressAdapters.js";

export default class SendingVasp {
  constructor(
    private readonly config: UmaConfig,
    private readonly lightsparkClient: LightsparkClient,
    private readonly pubKeyCache: uma.PublicKeyCache,
    private readonly requestCache: SendingVaspRequestCache,
    private readonly userService: UserService,
    private readonly ledgerService: InternalLedgerService,
    private readonly complianceService: ComplianceService,
    private readonly nonceCache: uma.NonceValidator,
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
        const response = await this.handleClientUmaLookup(
          user,
          req.params.receiver,
          fullUrlForRequest(req),
        );
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

    app.post(
      "/api/sendpayment/:callbackUuid",
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
        const response = await this.handleClientSendPayment(
          user,
          req.params.callbackUuid,
          fullUrlForRequest(req),
        );
        sendResponse(resp, response);
      }),
    );

    app.post(
      "/api/uma/pay_invoice",
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
        const response = await this.handlePayInvoice(
          user,
          fullUrlForRequest(req),
        );
        sendResponse(resp, response);
      }),
    );

    app.post(
      "/api/uma/request_invoice_payment",
      asyncHandler(async (req, resp) => {
        let invoiceBech32Str;
        try {
          invoiceBech32Str = JSON.parse(req.body)["invoice"];
        } catch (e) {
          throw new uma.UmaError(
            "Error. unable to parse uma invoice .",
            uma.ErrorCode.INVALID_INPUT,
          );
        }
        if (!invoiceBech32Str || typeof invoiceBech32Str !== "string") {
          throw new uma.UmaError(
            "Error. Required invoice not provided.",
            uma.ErrorCode.INVALID_INPUT,
          );
        }
        const invoice = uma.InvoiceSerializer.fromBech32(invoiceBech32Str);
        if (!invoice.senderUma) {
          throw new uma.UmaError(
            "Error. Sender Uma not present on invoice.",
            uma.ErrorCode.INVALID_INPUT,
          );
        }
        const response = await this.handleRequestPayInvoice(
          invoice,
          invoiceBech32Str,
        );
        sendResponse(resp, response);
      }),
    );

    app.get(
      "/api/uma/pending_requests",
      asyncHandler(async (req, resp) => {
        const pendingRequests = this.requestCache.getPendingPayReqs();
        sendResponse(resp, {
          httpStatus: 200,
          data: pendingRequests,
        });
      }),
    );
  }

  private async handleClientUmaLookup(
    user: User,
    receiverUmaAddress: string,
    requestUrl: URL,
  ): Promise<HttpResponse> {
    if (!receiverUmaAddress) {
      throw new uma.UmaError("Missing receiver", uma.ErrorCode.INVALID_INPUT);
    }

    const [receiverId, receivingVaspDomain] = receiverUmaAddress.split("@");
    if (!receiverId || !receivingVaspDomain) {
      console.error(`Invalid receiver: ${receiverUmaAddress}`);
      throw new uma.UmaError("Invalid receiver", uma.ErrorCode.INVALID_INPUT);
    }

    if (
      !this.complianceService.shouldAcceptTransactionToVasp(
        receivingVaspDomain,
        user.umaUserName,
        receiverUmaAddress,
      )
    ) {
      throw new uma.UmaError(
        `Transaction not allowed to ${receiverUmaAddress}.`,
        uma.ErrorCode.COUNTERPARTY_NOT_ALLOWED,
      );
    }

    let lnurlpRequestUrl: URL;
    if (receiverUmaAddress.startsWith("$")) {
      lnurlpRequestUrl = await uma.getSignedLnurlpRequestUrl({
        isSubjectToTravelRule: true,
        receiverAddress: receiverUmaAddress,
        signingPrivateKey: this.config.umaSigningPrivKey(),
        senderVaspDomain: this.getSendingVaspDomain(requestUrl),
      });
    } else {
      const nonUmaLnurlpRequest: uma.LnurlpRequest = {
        receiverAddress: receiverUmaAddress,
      };
      lnurlpRequestUrl = uma.encodeToUrl(nonUmaLnurlpRequest);
    }

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

    if (response.status === 412) {
      try {
        response = await this.retryForUnsupportedVersion(
          response,
          receiverUmaAddress,
          requestUrl,
        );
      } catch (e) {
        console.error("Error fetching Lnurlp request.", e);
        throw new uma.UmaError(
          "Error fetching Lnurlp request.",
          uma.ErrorCode.INTERNAL_ERROR,
        );
      }
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

    if (!lnurlpResponse.isUma()) {
      console.log("Couldn't parse as uma. Trying raw lnurl.");
      return await this.handleAsNonUmaLnurlpResponse(
        lnurlpResponse,
        receiverId,
        receivingVaspDomain,
      );
    }

    let pubKeys = await this.fetchPubKeys(receivingVaspDomain);
    if (!pubKeys)
      throw new uma.UmaError(
        "Error fetching receiving vasp public key.",
        uma.ErrorCode.COUNTERPARTY_PUBKEY_FETCH_ERROR,
      );

    try {
      const isSignatureValid = await uma.verifyUmaLnurlpResponseSignature(
        lnurlpResponse,
        pubKeys,
        this.nonceCache,
      );
      if (!isSignatureValid) {
        throw new uma.UmaError(
          "Invalid UMA response signature.",
          uma.ErrorCode.INVALID_SIGNATURE,
        );
      }
    } catch (e) {
      console.error("Error verifying UMA response signature.", e);
      if (e instanceof uma.UmaError) {
        throw e;
      }
      throw new uma.UmaError(
        "Error verifying UMA response signature.",
        uma.ErrorCode.INVALID_SIGNATURE,
      );
    }

    const callbackUuid = this.requestCache.saveLnurlpResponseData(
      lnurlpResponse,
      receiverId,
      receivingVaspDomain,
    );

    const senderCurrencies =
      await this.userService.getCurrencyPreferencesForUser(user.id);

    return {
      httpStatus: 200,
      data: {
        senderCurrencies: senderCurrencies ?? [],
        receiverCurrencies: lnurlpResponse.currencies,
        minSendableSats: lnurlpResponse.minSendable,
        maxSendableSats: lnurlpResponse.maxSendable,
        callbackUuid,
        // You might not actually send this to a client in practice.
        receiverKycStatus: lnurlpResponse.compliance.kycStatus,
      },
    };
  }

  private async retryForUnsupportedVersion(
    response: globalThis.Response,
    receiver: string,
    requestUrl: URL,
  ) {
    const responseJson: any = await response.json();
    const supportedMajorVersions = responseJson.supportedMajorVersions;
    const newSupportedVersion = uma.selectHighestSupportedVersion(
      supportedMajorVersions,
    );
    const retryRequest = await uma.getSignedLnurlpRequestUrl({
      isSubjectToTravelRule: true,
      receiverAddress: receiver,
      signingPrivateKey: this.config.umaSigningPrivKey(),
      senderVaspDomain: this.getSendingVaspDomain(requestUrl),
      umaVersionOverride: newSupportedVersion,
    });
    return fetch(retryRequest);
  }

  private async handleAsNonUmaLnurlpResponse(
    lnurlpResponse: uma.LnurlpResponse,
    receiverId: string,
    receivingVaspDomain: string,
  ): Promise<HttpResponse> {
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

    const isUma = initialRequestData.lnurlpResponse.isUma();

    let payerProfile: PayerProfile | null = null;
    if (initialRequestData.lnurlpResponse.payerData) {
      payerProfile = this.getPayerProfile(
        user,
        initialRequestData.lnurlpResponse.payerData,
        this.getSendingVaspDomain(requestUrl),
        isUma,
      );
    }

    if (!isUma) {
      const msatsParam = requestUrl.searchParams.get("isAmountInMsats");
      return await this.handleNonUmaPayReq(
        initialRequestData,
        amount,
        payerProfile,
        msatsParam,
        receivingCurrencyCode,
      );
    }

    if (!payerProfile) {
      throw new uma.UmaError(
        "Missing payerData",
        uma.ErrorCode.REQUEST_NOT_FOUND,
      );
    }

    if (!receivingCurrencyCode || typeof receivingCurrencyCode !== "string") {
      throw new uma.UmaError(
        "Missing currencyCode",
        uma.ErrorCode.INVALID_INPUT,
      );
    }

    const selectedCurrency = (
      initialRequestData.lnurlpResponse.currencies || []
    ).find((c) => c.code === receivingCurrencyCode);
    if (selectedCurrency === undefined) {
      throw new uma.UmaError(
        "Currency code not supported",
        uma.ErrorCode.INVALID_CURRENCY,
      );
    }

    const msatsParam = requestUrl.searchParams.get("isAmountInMsats");
    const isAmountInMsats = msatsParam?.toLocaleLowerCase() === "true";
    const amountValueMillisats = isAmountInMsats
      ? amount
      : selectedCurrency.multiplier * amount;
    const sendingCurrencyCode =
      requestUrl.searchParams.get("sendingCurrency") ?? "SAT";
    const sendingCurrency = (
      await this.userService.getCurrencyPreferencesForUser(user.id)
    )?.find((c) => c.code === sendingCurrencyCode);
    if (sendingCurrency === undefined) {
      throw new uma.UmaError(
        "Sending currency code not supported",
        uma.ErrorCode.INVALID_CURRENCY,
      );
    }
    const sendingCurrencyAmount =
      amountValueMillisats / sendingCurrency.multiplier;

    if (
      !this.checkInternalLedgerBalance(
        user.id,
        amountValueMillisats,
        sendingCurrencyAmount,
        sendingCurrencyCode,
      )
    ) {
      throw new uma.UmaError(
        "Insufficient balance.",
        uma.ErrorCode.INTERNAL_ERROR,
      );
    }

    let pubKeys = await this.fetchPubKeys(
      initialRequestData.receivingVaspDomain,
    );
    if (!pubKeys) {
      throw new uma.UmaError(
        "Error fetching receiving vasp public key.",
        uma.ErrorCode.COUNTERPARTY_PUBKEY_FETCH_ERROR,
      );
    }

    const umaVersion =
      initialRequestData.lnurlpResponse.umaVersion ??
      uma.getHighestSupportedVersionForMajorVersion(1);

    return this.handleUmaPayReqInternal({
      callback: initialRequestData.lnurlpResponse.callback,
      user: user,
      currencyCode: receivingCurrencyCode as CurrencyType,
      receiverUma: `${initialRequestData.receiverId}@${initialRequestData.receivingVaspDomain}`,
      amount: amount,
      amountValueMillisats: amountValueMillisats,
      isAmountInMsats: isAmountInMsats,
      sendingUma: payerProfile.identifier!,
      umaVersion: umaVersion,
      requestUrl: requestUrl,
      senderProfile: payerProfile,
      pubKeys: pubKeys,
      invoiceUUID: undefined,
    });
  }

  private async handleUmaPayReqInternal({
    callback,
    user,
    currencyCode,
    receiverUma,
    amount,
    amountValueMillisats,
    isAmountInMsats,
    sendingUma,
    umaVersion,
    requestUrl,
    senderProfile: payerProfile,
    pubKeys,
    invoiceUUID,
  }: {
    callback: string;
    user: User;
    currencyCode: CurrencyType;
    receiverUma: string;
    amount: number;
    amountValueMillisats: number;
    isAmountInMsats: boolean;
    sendingUma: string;
    umaVersion: string;
    requestUrl: URL;
    senderProfile: PayerProfile;
    pubKeys: uma.PubKeyResponse;
    invoiceUUID: string | undefined;
  }): Promise<HttpResponse> {
    const trInfo = await this.complianceService.getTravelRuleInfoForTransaction(
      user.id,
      sendingUma,
      receiverUma,
      amountValueMillisats,
    );
    const node = await this.getLightsparkNode();
    const utxoCallback = this.getUtxoCallback(requestUrl, "1234abcd");

    console.log(`Generating payreq for ${amountValueMillisats} msats.`);
    console.log(`  isAmountInMsats: ${isAmountInMsats}`);
    console.log(`  amount: ${amount}`);
    let payReq: uma.PayRequest;
    try {
      payReq = await uma.getPayRequest({
        receiverEncryptionPubKey: pubKeys.getEncryptionPubKey(),
        sendingVaspPrivateKey: this.config.umaSigningPrivKey(),
        receivingCurrencyCode: currencyCode,
        isAmountInReceivingCurrency: !isAmountInMsats,
        amount: amount,
        payerIdentifier: sendingUma,
        payerKycStatus: user.kycStatus,
        utxoCallback,
        trInfo,
        payerUtxos: node.umaPrescreeningUtxos,
        payerNodePubKey: node.publicKey ?? "",
        payerName: payerProfile.name,
        payerEmail: payerProfile.email,
        requestedPayeeData: {
          // Compliance and Identifier are mandatory fields added automatically.
          name: { mandatory: false },
          email: { mandatory: false },
        },
        umaMajorVersion: umaVersion // sending uma version?
          ? uma.getMajorVersion(umaVersion)
          : 1,
      });
    } catch (e) {
      console.error("Error generating payreq.", e);
      if (e instanceof uma.UmaError) {
        throw e;
      }
      throw new uma.UmaError(
        "Error generating payreq.",
        uma.ErrorCode.INTERNAL_ERROR,
      );
    }

    console.log(
      `Sending payreq: ${JSON.stringify(payReq.toJsonSchemaObject(), null, 2)}`,
    );
    let response: globalThis.Response;
    try {
      response = await fetch(callback, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: payReq.toJsonString(),
      });
    } catch (e) {
      if (e instanceof uma.UmaError) {
        throw e;
      }
      throw new uma.UmaError(
        "Error sending payreq.",
        uma.ErrorCode.INTERNAL_ERROR,
      );
    }

    if (!response.ok || response.status !== 200) {
      throw new uma.UmaError(
        `Payreq failed. ${response.status}, ${response.body}`,
        uma.ErrorCode.PAYREQ_REQUEST_FAILED,
      );
    }

    let payResponse: uma.PayReqResponse;
    const bodyText = await response.text();
    try {
      payResponse = uma.PayReqResponse.fromJson(bodyText);
    } catch (e) {
      console.error("Error parsing payreq response. Raw response: " + bodyText);
      console.error("Error:", e);
      throw new uma.UmaError(
        "Error parsing payreq response.",
        uma.ErrorCode.PARSE_PAYREQ_RESPONSE_ERROR,
      );
    }

    if (!payResponse.isUma()) {
      console.log("Received non-uma response for uma payreq.");
      throw new uma.UmaError(
        "Received non-uma response for uma payreq.",
        uma.ErrorCode.MISSING_REQUIRED_UMA_PARAMETERS,
      );
    }

    try {
      if (payReq.umaMajorVersion !== 0) {
        const isSignatureValid = await uma.verifyPayReqResponseSignature(
          payResponse,
          sendingUma,
          receiverUma,
          pubKeys,
          this.nonceCache,
        );
        if (!isSignatureValid) {
          throw new uma.UmaError(
            "Invalid payreq response signature.",
            uma.ErrorCode.INVALID_SIGNATURE,
          );
        }
      }
    } catch (e) {
      console.error(e);
      if (e instanceof uma.UmaError) {
        throw e;
      }
      throw new uma.UmaError(
        "Invalid payreq response signature.",
        uma.ErrorCode.INVALID_SIGNATURE,
      );
    }

    console.log(`Verified payreq response signature.`);

    const shouldTransact = await this.complianceService.preScreenTransaction(
      sendingUma,
      receiverUma,
      amountValueMillisats,
      payResponse.payeeData?.compliance?.nodePubKey ?? undefined,
      payResponse.payeeData?.compliance?.utxos ?? [],
    );
    if (!shouldTransact) {
      throw new uma.UmaError(
        "Transaction not allowed due to risk rating.",
        uma.ErrorCode.COUNTERPARTY_NOT_ALLOWED,
      );
    }

    let invoice: InvoiceData;
    try {
      invoice = await this.lightsparkClient.decodeInvoice(payResponse.pr);
    } catch (e) {
      console.error("Error decoding invoice.", e);
      throw new uma.UmaError(
        "Error decoding invoice.",
        uma.ErrorCode.INTERNAL_ERROR,
      );
    }

    const senderCurrencies =
      (await this.userService.getCurrencyPreferencesForUser(user.id)) ?? [];

    const newCallbackUuid = this.requestCache.savePayReqData(
      sendingUma,
      payResponse.pr,
      invoiceUUID,
      utxoCallback,
      invoice,
      senderCurrencies,
    );

    const amountMsats = convertCurrencyAmount(
      invoice.amount, // not a number it's an objcet
      CurrencyUnit.MILLISATOSHI,
    ).preferredCurrencyValueRounded;

    return {
      httpStatus: 200,
      data: {
        senderCurrencies: senderCurrencies ?? [],
        callbackUuid: newCallbackUuid,
        encodedInvoice: payResponse.pr,
        amountMsats: amountMsats,
        amountReceivingCurrency: payResponse.converted!.amount,
        conversionRate: payResponse.converted!.multiplier,
        exchangeFeesMsats: payResponse.converted!.fee,
        receivingCurrencyCode: payResponse.converted!.currencyCode,
      },
    };
  }

  private async handleNonUmaPayReq(
    initialRequestData: SendingVaspInitialRequestData,
    amount: number,
    payerProfile: PayerProfile | null,
    sendingCurrencyCode: string | null,
    receivingCurrencyCode: string | null,
  ): Promise<HttpResponse> {
    let response: globalThis.Response;
    try {
      const url = new URL(initialRequestData.lnurlpResponse.callback);
      if (sendingCurrencyCode) {
        url.searchParams.append("amount", `${amount}.${sendingCurrencyCode}`);
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

    let invoice: InvoiceData;
    try {
      invoice = await this.lightsparkClient.decodeInvoice(encodedInvoice);
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
        amount: payreqResponse.converted?.amount ?? invoice.amount,
        conversionRate: payreqResponse.converted?.multiplier ?? 1000,
        exchangeFeesMillisatoshi: payreqResponse.converted?.fee ?? 0,
        currencyCode: receivingCurrencyCode ?? "SAT",
      },
    };
  }

  private async getLightsparkNode() {
    const node = await this.lightsparkClient.executeRawQuery(
      getLightsparkNodeQuery(this.config.nodeID),
    );
    if (!node) {
      throw new uma.UmaError("Node not found.", uma.ErrorCode.INTERNAL_ERROR);
    }

    return node;
  }

  private async fetchPubKeys(receivingVaspDomain: string) {
    try {
      return await uma.fetchPublicKeyForVasp({
        cache: this.pubKeyCache,
        vaspDomain: receivingVaspDomain,
      });
    } catch (e) {
      console.error("Error fetching public key.", e);
      if (e instanceof uma.UmaError) {
        throw e;
      }
      throw new uma.UmaError(
        "Error fetching public key.",
        uma.ErrorCode.COUNTERPARTY_PUBKEY_FETCH_ERROR,
      );
    }
  }

  private async handleClientSendPayment(
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

    const payReqData = this.requestCache.getPayReqData(callbackUuid);
    if (!payReqData || !payReqData?.invoiceData) {
      throw new uma.UmaError(
        "Could not find pay request associated with uuid",
        uma.ErrorCode.REQUEST_NOT_FOUND,
      );
    }

    if (new Date(payReqData.invoiceData.expiresAt) < new Date()) {
      throw new uma.UmaError("Invoice expired", uma.ErrorCode.INVOICE_EXPIRED);
    }

    if (payReqData.invoiceData.amount.originalValue <= 0) {
      throw new uma.UmaError(
        "Invalid invoice amount. Positive amount required.",
        uma.ErrorCode.INVALID_INPUT,
      );
    }

    const sendingCurrencyCode =
      requestUrl.searchParams.get("sendingCurrency") ?? "SAT";
    const sendingCurrency = (
      await this.userService.getCurrencyPreferencesForUser(user.id)
    )?.find((c) => c.code === sendingCurrencyCode);
    if (sendingCurrency === undefined) {
      throw new uma.UmaError(
        "Sending currency code not supported",
        uma.ErrorCode.INVALID_CURRENCY,
      );
    }

    const amountMsats = convertCurrencyAmount(
      payReqData.invoiceData.amount,
      CurrencyUnit.MILLISATOSHI,
    ).preferredCurrencyValueRounded;

    const sendingCurrencyAmount = amountMsats / sendingCurrency.multiplier;
    if (sendingCurrencyAmount < sendingCurrency.minSendable) {
      throw new uma.UmaError(
        `Invalid invoice amount. Minimum amount is ${sendingCurrency.minSendable} ${sendingCurrency.code}.`,
        uma.ErrorCode.AMOUNT_OUT_OF_RANGE,
      );
    }
    if (sendingCurrencyAmount > sendingCurrency.maxSendable) {
      throw new uma.UmaError(
        `Invalid invoice amount. Maximum amount is ${sendingCurrency.maxSendable} ${sendingCurrency.code}.`,
        uma.ErrorCode.AMOUNT_OUT_OF_RANGE,
      );
    }

    if (
      !this.checkInternalLedgerBalance(
        user.id,
        amountMsats,
        sendingCurrencyAmount,
        sendingCurrencyCode,
      )
    ) {
      throw new uma.UmaError(
        "Insufficient balance.",
        uma.ErrorCode.INTERNAL_ERROR,
      );
    }

    let payment: OutgoingPayment;
    let paymentId: string | undefined = undefined;
    try {
      const signingKeyLoaded = await this.loadNodeSigningKey();
      if (!signingKeyLoaded) {
        throw new uma.UmaError(
          "Error loading signing key.",
          uma.ErrorCode.INTERNAL_ERROR,
        );
      }
      const paymentResult = await this.lightsparkClient.payUmaInvoice(
        this.config.nodeID,
        payReqData.encodedInvoice,
        /* maxFeesMsats */ 1_000_000,
      );
      if (!paymentResult) {
        throw new uma.UmaError(
          "Payment request failed.",
          uma.ErrorCode.INTERNAL_ERROR,
        );
      }
      paymentId = paymentResult.id;
      await this.ledgerService.recordOutgoingTransactionBegan(
        user.id,
        payReqData.receiverUmaAddress,
        amountMsats,
        sendingCurrencyAmount,
        sendingCurrency.code,
        paymentId!,
      );
      payment = await this.waitForPaymentCompletion(paymentResult);
      await this.ledgerService.recordOutgoingTransactionSucceeded(
        user.id,
        payReqData.receiverUmaAddress,
        amountMsats,
        sendingCurrencyAmount,
        sendingCurrency.code,
        paymentId!,
      );
    } catch (e) {
      console.error("Error paying invoice.", e);
      if (paymentId !== undefined) {
        await this.ledgerService.recordOutgoingTransactionFailed(
          user.id,
          payReqData.receiverUmaAddress,
          amountMsats,
          sendingCurrencyAmount,
          sendingCurrency.code,
          paymentId,
        );
      }
      if (e instanceof uma.UmaError) {
        throw e;
      }
      throw new uma.UmaError(
        "Error paying invoice.",
        uma.ErrorCode.INTERNAL_ERROR,
      );
    }

    await this.sendPostTransactionCallback(payment, payReqData, requestUrl);

    const nodePubKey = (await this.getLightsparkNode()).publicKey;
    await this.complianceService.registerTransactionMonitoring(
      payment.id,
      nodePubKey,
      PaymentDirection.SENT,
      payment.umaPostTransactionData ?? [],
    );

    // send payment was successful, remove key from cache
    this.requestCache.removePayReq(callbackUuid);
    return {
      httpStatus: 200,
      data: {
        paymentId: payment.id,
        didSucceed: payment.status === TransactionStatus.SUCCESS,
      },
    };
  }

  private async handlePayInvoice(user: User, requestUrl: URL) {
    const invoiceStr = requestUrl.searchParams.get("invoice");
    if (!invoiceStr) {
      throw new uma.UmaError(
        "Missing argument: invoice",
        uma.ErrorCode.INVALID_INPUT,
      );
    }
    // payments can also be done via uuid of cached request
    // by checking uma prefix, determine if invoiceStr is a bech32 encoded invoice.
    // if prefix not present, treat as uuid/ zod can parse this
    let encodedInvoice;
    if (!invoiceStr.startsWith("uma")) {
      encodedInvoice =
        this.requestCache.getPayReqData(invoiceStr)?.encodedInvoice;
    }
    let invoice: uma.Invoice;
    try {
      invoice = uma.InvoiceSerializer.fromBech32(encodedInvoice ?? invoiceStr);
    } catch (e) {
      throw new uma.UmaError(
        "Cannot parse Invoice from invoice parameter",
        uma.ErrorCode.INVALID_INVOICE,
      );
    }

    let payerProfile = this.getPayerProfile(
      user,
      invoice.requiredPayerData ?? {},
      this.getSendingVaspDomain(requestUrl),
      true,
    );

    const [, receivingVaspDomain] = invoice.receiverUma.split("@");
    let pubKeys = await this.fetchPubKeys(receivingVaspDomain);
    if (!pubKeys)
      throw new uma.UmaError(
        "Error fetching receiving vasp public key.",
        uma.ErrorCode.COUNTERPARTY_PUBKEY_FETCH_ERROR,
      );

    const signatureVerified = uma.verifyUmaInvoiceSignature(
      invoice,
      pubKeys.getSigningPubKey(),
    );
    if (!signatureVerified) {
      throw new uma.UmaError(
        "Unable to verify invoice signature",
        uma.ErrorCode.INVALID_SIGNATURE,
      );
    }

    if (!isCurrencyType(invoice.receivingCurrency.code)) {
      throw new uma.UmaError(
        `Invalid currency code ${invoice.receivingCurrency.code}`,
        uma.ErrorCode.INVALID_CURRENCY,
      );
    }
    const isAmountInMsats =
      invoice.receivingCurrency.code == SATS_CURRENCY.code;
    const currency = CURRENCIES[invoice.receivingCurrency.code as CurrencyType];
    const currencyInMsats = invoice.amount * currency.multiplier;

    if (invoice.expiration < Date.now()) {
      throw new uma.UmaError(
        "Unable to process expired invoice",
        uma.ErrorCode.INVOICE_EXPIRED,
      );
    }

    return this.handleUmaPayReqInternal({
      callback: invoice.callback,
      user: user,
      currencyCode: invoice.receivingCurrency.code as CurrencyType,
      receiverUma: invoice.receiverUma,
      amount: invoice.amount,
      amountValueMillisats: currencyInMsats, // todo
      isAmountInMsats: isAmountInMsats, //todo
      sendingUma:
        invoice.senderUma ??
        this.formatUma(user.umaUserName, this.getSendingVaspDomain(requestUrl)),
      requestUrl: requestUrl,
      senderProfile: payerProfile,
      pubKeys: pubKeys,
      umaVersion: invoice.umaVersions,
      invoiceUUID: invoice.invoiceUUID,
    });
  }

  private formatUma(umaUsername: string, umaDomain: string): string {
    return `$${umaUsername}@${umaDomain}`;
  }

  private async handleRequestPayInvoice(
    invoice: uma.Invoice,
    encodedInvoice: string,
  ): Promise<HttpResponse> {
    const [, receivingVaspDomain] = invoice.receiverUma.split("@");
    let pubKeys = await this.fetchPubKeys(receivingVaspDomain);

    if (!pubKeys) {
      throw new uma.UmaError(
        "Error, unable to get receiving Vasp public signing key",
        uma.ErrorCode.COUNTERPARTY_PUBKEY_FETCH_ERROR,
      );
    }
    const verified = uma.verifyUmaInvoiceSignature(
      invoice,
      pubKeys.getSigningPubKey(),
    );
    if (!verified) {
      throw new uma.UmaError(
        "Error, unable to verify uma invoice",
        uma.ErrorCode.INVALID_SIGNATURE,
      );
    }
    // save request
    this.requestCache.savePayReqData(
      invoice.receiverUma,
      encodedInvoice,
      invoice.invoiceUUID,
      // invoice data / utxo callback / etc not required
      undefined,
      undefined,
      undefined,
    );
    // In a real VASP, here you might push a notification to inform the sender that
    // a new invoice has arrived.
    return {
      httpStatus: 200,
    };
  }

  private async checkInternalLedgerBalance(
    userId: string,
    amountMsats: number,
    sendingCurrencyAmount: number,
    sendingCurrencyCode: string,
  ): Promise<boolean> {
    const balanceMsats = await this.ledgerService.getUserBalance(
      userId,
      sendingCurrencyCode,
    );
    return balanceMsats >= sendingCurrencyAmount;
  }

  /**
   * NOTE: In a real application, you'd want to use the authentication context to pull out this information. It's not
   * actually always Alice sending the money ;-).
   */
  private getPayerProfile(
    user: User,
    requiredPayerData: uma.CounterPartyDataOptions,
    vaspDomain: string,
    isUma: boolean,
  ): PayerProfile {
    return {
      name: requiredPayerData.name?.mandatory ? user.name ?? "" : undefined,
      email: requiredPayerData.email?.mandatory
        ? user.emailAddress ?? ""
        : undefined,
      identifier:
        isUma || !!requiredPayerData.identifier
          ? `$${user.umaUserName}@${vaspDomain}`
          : undefined,
    };
  }

  private getUtxoCallback(requestUrl: URL, txId: String): string {
    const path = `/api/uma/utxoCallback?txId=${txId}`;
    return `${requestUrl.protocol}//${hostNameWithPort(requestUrl)}${path}`;
  }

  private async waitForPaymentCompletion(
    paymentResult: OutgoingPayment,
    retryNum = 0,
  ): Promise<OutgoingPayment> {
    if (paymentResult.status === TransactionStatus.SUCCESS) {
      return paymentResult;
    }

    const payment = await this.lightsparkClient.executeRawQuery(
      OutgoingPayment.getOutgoingPaymentQuery(paymentResult.id),
    );
    if (!payment) {
      throw new uma.UmaError(
        "Payment not found.",
        uma.ErrorCode.INTERNAL_ERROR,
      );
    }

    if (payment.status !== TransactionStatus.PENDING) {
      return payment;
    }

    const maxRetries = 40;
    if (retryNum >= maxRetries) {
      throw new uma.UmaError(
        "Payment timed out.",
        uma.ErrorCode.INTERNAL_ERROR,
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
    return this.waitForPaymentCompletion(payment);
  }

  private async sendPostTransactionCallback(
    payment: OutgoingPayment,
    payReqData: SendingVaspPayReqData,
    requestUrl: URL,
  ) {
    if (!payReqData.utxoCallback || payReqData.utxoCallback === "") {
      return;
    }
    const utxos: uma.UtxoWithAmount[] =
      payment.umaPostTransactionData?.map((d) => {
        return {
          utxo: d.utxo,
          amountMsats: convertCurrencyAmount(
            d.amount,
            CurrencyUnit.MILLISATOSHI,
          ).preferredCurrencyValueRounded,
        };
      }) ?? [];
    const postTransactionCallback = await uma.getPostTransactionCallback({
      utxos: utxos,
      vaspDomain: this.getSendingVaspDomain(requestUrl),
      signingPrivateKey: this.config.umaSigningPrivKey(),
    });
    try {
      const postTxResponse = await fetch(payReqData.utxoCallback, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postTransactionCallback),
      });
      if (!postTxResponse.ok) {
        console.error(
          `Error sending post transaction callback. ${postTxResponse.status}`,
        );
      }
    } catch (e) {
      console.error("Error sending post transaction callback.", e);
    }
  }

  private async loadNodeSigningKey(): Promise<boolean> {
    const node = await this.lightsparkClient.executeRawQuery(
      getLightsparkNodeQuery(this.config.nodeID),
    );
    if (!node) {
      throw new uma.UmaError("Node not found.", uma.ErrorCode.INTERNAL_ERROR);
    }

    if (node.typename.includes("OSK")) {
      if (
        !this.config.oskSigningKeyPassword ||
        this.config.oskSigningKeyPassword === ""
      ) {
        throw new uma.UmaError(
          "Node is an OSK, but no signing key password was provided in the config. " +
            "Set the LIGHTSPARK_UMA_OSK_NODE_SIGNING_KEY_PASSWORD environment variable",
          uma.ErrorCode.INTERNAL_ERROR,
        );
      }
      return await this.lightsparkClient.loadNodeSigningKey(
        this.config.nodeID,
        {
          password: this.config.oskSigningKeyPassword,
        },
      );
    }

    // Assume remote signing node.
    const remoteSigningMasterSeed = this.config.remoteSigningMasterSeed();
    if (!remoteSigningMasterSeed) {
      throw new uma.UmaError(
        "Node is a remote signing node, but no master seed was provided in the config. " +
          "Set the LIGHTSPARK_UMA_REMOTE_SIGNING_NODE_MASTER_SEED environment variable",
        uma.ErrorCode.INTERNAL_ERROR,
      );
    }
    return await this.lightsparkClient.loadNodeSigningKey(this.config.nodeID, {
      masterSeed: remoteSigningMasterSeed,
      network: node.bitcoinNetwork,
    });
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
