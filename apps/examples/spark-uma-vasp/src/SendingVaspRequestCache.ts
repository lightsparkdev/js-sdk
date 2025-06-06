import { Currency, LnurlpResponse } from "@uma-sdk/core";
import { PaymentRequestObject } from "bolt11";

/**
 * A simple in-memory cache for data that needs to be remembered between calls to VASP1. In practice, this would be
 * stored in a database or other persistent storage.
 */
export default interface SendingVaspRequestCache {
  getLnurlpResponseData(
    uuid: string,
  ): SendingVaspInitialRequestData | undefined;

  getPayReqData(uuid: string): SendingVaspPayReqData | undefined;

  getPendingPayReqs(): SendingVaspPayReqData[];

  saveLnurlpResponseData(
    lnurlpResponse: LnurlpResponse,
    receiverId: string,
    receivingVaspDomain: string,
  ): string;

  savePayReqData(
    receiverUmaAddress: string,
    encodedInvoice: string,
    invoiceUUID: string | undefined,
    utxoCallback: string | undefined,
    invoiceData: PaymentRequestObject | undefined,
    senderCurrencies: Currency[] | undefined,
  ): string;

  removePayReq(uuid: string): void;
}

/**
 * This is the data that we cache for the initial Lnurlp request.
 */
export interface SendingVaspInitialRequestData {
  lnurlpResponse: LnurlpResponse;
  receiverId: string;
  receivingVaspDomain: string;
}

/**
 * This is the data that we cache for the payreq request.
 */
export interface SendingVaspPayReqData {
  receiverUmaAddress: string;
  encodedInvoice: string;
  utxoCallback: string | undefined;
  invoiceData: PaymentRequestObject | undefined;
  senderCurrencies: Currency[] | undefined;
}
