import { type Currency } from "./Currency.js";
import { type KycStatus } from "./KycStatus.js";
import { type PayerData, type PayerDataOptions } from "./PayerData.js";

// LnurlpRequest is the first request in the UMA protocol.
// It is sent by the VASP that is sending the payment to find out information about the receiver.
export type LnurlpRequest = {
  // ReceiverAddress is the address of the user at VASP2 that is receiving the payment.
  receiverAddress: string;
  // Nonce is a random string that is used to prevent replay attacks.
  nonce: string;
  // Signature is the base64-encoded signature of sha256(ReceiverAddress|Nonce|Timestamp).
  signature: string;
  // IsSubjectToTravelRule indicates VASP1 is a financial institution that requires travel rule information.
  isSubjectToTravelRule: boolean;
  // VaspDomain is the domain of the VASP that is sending the payment. It will be used by VASP2 to fetch the public keys of VASP1.
  vaspDomain: string;
  // Timestamp is the unix timestamp of when the request was sent. Used in the signature.
  timestamp: Date;
  // UmaVersion is the version of the UMA protocol that VASP1 prefers to use for this transaction. For the version
  // negotiation flow, see https://static.swimlanes.io/87f5d188e080cb8e0494e46f80f2ae74.png
  umaVersion: string;
};

// LnurlpResponse is the response to the LnurlpRequest.
// It is sent by the VASP that is receiving the payment to provide information to the sender about the receiver.
export type LnurlpResponse = {
  tag: string;
  callback: string;
  minSendable: number;
  maxSendable: number;
  encodedMetadata: string;
  currencies: Currency[];
  requiredPayerData: PayerDataOptions;
  compliance: LnurlComplianceResponse;
  // UmaVersion is the version of the UMA protocol that VASP2 has chosen for this transaction based on its own support
  // and VASP1's specified preference in the LnurlpRequest. For the version negotiation flow, see
  // https://static.swimlanes.io/87f5d188e080cb8e0494e46f80f2ae74.png
  umaVersion: string;
};

// LnurlComplianceResponse is the `compliance` field  of the LnurlpResponse.
export type LnurlComplianceResponse = {
  // KycStatus indicates whether VASP2 has KYC information about the receiver.
  kycStatus: KycStatus;
  // Signature is the base64-encoded signature of sha256(ReceiverAddress|Nonce|Timestamp).
  signature: string;
  // Nonce is a random string that is used to prevent replay attacks.
  signatureNonce: string;
  // Timestamp is the unix timestamp of when the request was sent. Used in the signature.
  signatureTimestamp: number;
  // IsSubjectToTravelRule indicates whether VASP2 is a financial institution that requires travel rule information.
  isSubjectToTravelRule: boolean;
  // ReceiverIdentifier is the identifier of the receiver at VASP2.
  receiverIdentifier: string;
};

// PayRequest is the request sent by the sender to the receiver to retrieve an invoice.
export type PayRequest = {
  // CurrencyCode is the ISO 3-digit currency code that the receiver will receive for this payment.
  currencyCode: string;
  // Amount is the amount that the receiver will receive for this payment in the smallest unit of the specified currency (i.e. cents for USD).
  amount: number;
  // PayerData is the data that the sender will send to the receiver to identify themselves.
  payerData: PayerData;
};

// PayReqResponse is the response sent by the receiver to the sender to provide an invoice.
export type PayReqResponse = {
  // EncodedInvoice is the BOLT11 invoice that the sender will pay.
  encodedInvoice: string;
  // Routes is usually just an empty list from legacy LNURL, which was replaced by route hints in the BOLT11 invoice.
  routes: Route[];
  compliance: PayReqResponseCompliance;
  paymentInfo: PayReqResponsePaymentInfo;
};

export type Route = {
  pubkey: string;
  path: {
    pubkey: string;
    fee: number;
    msatoshi: number;
    channel: string;
  }[];
};

export type PayReqResponseCompliance = {
  // NodePubKey is the public key of the receiver's node if known.
  nodePubKey?: string;
  // Utxos is a list of UTXOs of channels over which the receiver will likely receive the payment.
  utxos: string[];
  // UtxoCallback is the URL that the sender VASP will call to send UTXOs of the channel that the sender used to send the payment once it completes.
  utxoCallback: string;
};

export type PayReqResponsePaymentInfo = {
  // CurrencyCode is the ISO 3-digit currency code that the receiver will receive for this payment.
  currencyCode: string;
  // Multiplier is the conversion rate. It is the number of millisatoshis that the receiver will receive for 1 unit of the specified currency.
  multiplier: number;
  // ExchangeFeesMillisatoshi is the fees charged (in millisats) by the receiving VASP for this transaction. This is
  // separate from the Multiplier.
  exchangeFeesMillisatoshi: number;
};

// PubKeyResponse is sent from a VASP to another VASP to provide its public keys.
// It is the response to GET requests at `/.well-known/lnurlpubkey`.
export type PubKeyResponse = {
  // SigningPubKey is used to verify signatures from a VASP.
  signingPubKey: string;
  // EncryptionPubKey is used to encrypt TR info sent to a VASP.
  encryptionPubKey: string;
  // ExpirationTimestamp [Optional] Seconds since epoch at which these pub keys must be refreshed.
  // They can be safely cached until this expiration (or forever if null).
  expirationTimestamp?: number;
};

// UtxoWithAmount is a pair of utxo and amount transferred over that corresponding channel.
// It can be used to register payment for KYT.
export type UtxoWithAmount = {
  // Utxo The utxo of the channel over which the payment went through in the format of <transaction_hash>:<output_index>.
  utxo: string;
  // Amount The amount of funds transferred in the payment in mSats.
  amount: number;
};

export function dateToUnixSeconds(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

export function encodeToUrl(q: LnurlpRequest): URL {
  const receiverAddressParts = q.receiverAddress.split("@");
  if (receiverAddressParts.length !== 2) {
    throw new Error("invalid receiver address");
  }
  const scheme = receiverAddressParts[1].startsWith("localhost:")
    ? "http"
    : "https";
  const lnurlpUrl = new URL(
    `${scheme}://${receiverAddressParts[1]}/.well-known/lnurlp/${receiverAddressParts[0]}`,
  );
  const queryParams = lnurlpUrl.searchParams;
  queryParams.set("signature", q.signature);
  queryParams.set("vaspDomain", q.vaspDomain);
  queryParams.set("nonce", q.nonce);
  queryParams.set("isSubjectToTravelRule", q.isSubjectToTravelRule.toString());
  queryParams.set("timestamp", String(dateToUnixSeconds(q.timestamp)));
  queryParams.set("umaVersion", q.umaVersion);
  lnurlpUrl.search = queryParams.toString();
  return lnurlpUrl;
}

export function encodePayRequest(q: PayRequest) {
  return JSON.stringify(q);
}

export function getSignableLnurlpRequestPayload(q: LnurlpRequest): string {
  return [
    q.receiverAddress,
    q.nonce,
    String(dateToUnixSeconds(q.timestamp)),
  ].join("|");
}

export function getSignableLnurlpResponsePayload(r: LnurlpResponse): string {
  return [
    r.compliance.receiverIdentifier,
    r.compliance.signatureNonce,
    r.compliance.signatureTimestamp.toString(),
  ].join("|");
}

export function getSignablePayRequestPayload(q: PayRequest): string {
  return `${q.payerData.identifier}|${
    q.payerData.compliance.signatureNonce
  }|${q.payerData.compliance.signatureTimestamp.toString()}`;
}
