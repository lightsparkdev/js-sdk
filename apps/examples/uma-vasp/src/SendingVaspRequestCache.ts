import { InvoiceData } from "@lightsparkdev/lightspark-sdk";
import { Currency, LnurlpResponse } from "@uma-sdk/core";
import { NonUmaLnurlpResponse } from "./rawLnurl.js";

/**
 * A simple in-memory cache for data that needs to be remembered between calls to VASP1. In practice, this would be
 * stored in a database or other persistent storage.
 */
export default interface SendingVaspRequestCache {
  getLnurlpResponseData(
    uuid: string,
  ): SendingVaspInitialRequestData | undefined;

  getPayReqData(uuid: string): SendingVaspPayReqData | undefined;

  saveLnurlpResponseData(
    lnurlpResponse: LnurlpResponse,
    receiverId: string,
    receivingVaspDomain: string,
  ): string;

  saveNonUmaLnurlpResponseData(
    nonUmaLnurlpResponse: NonUmaLnurlpResponse,
    receiverId: string,
    receivingVaspDomain: string,
  ): string;

  savePayReqData(
    receiverUmaAddress: string,
    encodedInvoice: string,
    utxoCallback: string,
    invoiceData: InvoiceData,
    senderCurrencies: Currency[],
  ): string;
}

/**
 * This is the data that we cache for the initial Lnurlp request.
 */
export interface SendingVaspInitialRequestData {
  lnurlpResponse?: LnurlpResponse | undefined;
  nonUmaLnurlpResponse?: NonUmaLnurlpResponse | undefined;
  receiverId: string;
  receivingVaspDomain: string;
}

/**
 * This is the data that we cache for the payreq request.
 */
export interface SendingVaspPayReqData {
  receiverUmaAddress: string;
  encodedInvoice: string;
  utxoCallback: string;
  invoiceData: InvoiceData;
  senderCurrencies: Currency[];
}
