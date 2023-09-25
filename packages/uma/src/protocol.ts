import { z } from "zod";
import { CurrencySchema } from "./Currency.js";
import { KycStatus } from "./KycStatus.js";
import { PayerDataOptionsSchema, PayerDataSchema } from "./PayerData.js";

// LnurlpRequest is the first request in the UMA protocol. It is sent by the VASP that is sending the payment to find out information about the receiver.
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
  // UmaVersion is the version of the UMA protocol that VASP1 prefers to use for this transaction. For the version negotiation flow, see https://static.swimlanes.io/87f5d188e080cb8e0494e46f80f2ae74.png
  umaVersion: string;
};

// LnurlComplianceResponse is the `compliance` field  of the LnurlpResponse.
export const LnurlpComplianceResponseSchema = z.object({
  // KycStatus indicates whether VASP2 has KYC information about the receiver.
  kycStatus: z.nativeEnum(KycStatus),
  // Signature is the base64-encoded signature of sha256(ReceiverAddress|Nonce|Timestamp).
  signature: z.string(),
  // Nonce is a random string that is used to prevent replay attacks.
  signatureNonce: z.string(),
  // Timestamp is the unix timestamp of when the request was sent. Used in the signature.
  signatureTimestamp: z.number(),
  // IsSubjectToTravelRule indicates whether VASP2 is a financial institution that requires travel rule information.
  isSubjectToTravelRule: z.boolean(),
  // ReceiverIdentifier is the identifier of the receiver at VASP2.
  receiverIdentifier: z.string(),
});

export type LnurlComplianceResponse = z.infer<
  typeof LnurlpComplianceResponseSchema
>;

// LnurlpResponse is the response to the LnurlpRequest. It is sent by the VASP that is receiving the payment to provide information to the sender about the receiver.
export const LnurlpResponseSchema = z.object({
  tag: z.string(),
  callback: z.string(),
  minSendable: z.number(),
  maxSendable: z.number(),
  encodedMetadata: z.string(),
  currencies: z.array(CurrencySchema),
  requiredPayerData: PayerDataOptionsSchema,
  compliance: LnurlpComplianceResponseSchema,
  // UmaVersion is the version of the UMA protocol that VASP2 has chosen for this transaction based on its own support and VASP1's specified preference in the LnurlpRequest. For the version negotiation flow, see https://static.swimlanes.io/87f5d188e080cb8e0494e46f80f2ae74.png
  umaVersion: z.string(),
});

export type LnurlpResponse = z.infer<typeof LnurlpResponseSchema>;

export function parseLnurlpResponse(jsonStr: string): LnurlpResponse {
  const parsed = JSON.parse(jsonStr);
  let validated: LnurlpResponse;
  try {
    validated = LnurlpResponseSchema.parse(parsed);
  } catch (e) {
    throw new Error("invalid lnurlp response");
  }
  return validated;
}

// PayRequest is the request sent by the sender to the receiver to retrieve an invoice.
export const PayRequestSchema = z.object({
  // CurrencyCode is the ISO 3-digit currency code that the receiver will receive for this payment.
  currencyCode: z.string(),
  // Amount is the amount that the receiver will receive for this payment in the smallest unit of the specified currency (i.e. cents for USD).
  amount: z.number(),
  // PayerData is the data that the sender will send to the receiver to identify themselves.
  payerData: PayerDataSchema,
});

export type PayRequest = z.infer<typeof PayRequestSchema>;

export const RouteSchema = z.object({
  pubkey: z.string(),
  path: z.array(
    z.object({
      pubkey: z.string(),
      fee: z.number(),
      msatoshi: z.number(),
      channel: z.string(),
    }),
  ),
});

export type Route = z.infer<typeof RouteSchema>;

export const PayReqResponseComplianceSchema = z.object({
  // nodePubKey is the public key of the receiver's node if known.
  nodePubKey: z.string().optional(),
  // utxos is a list of UTXOs of channels over which the receiver will likely receive the payment.
  utxos: z.array(z.string()),
  // utxoCallback is the URL that the sender VASP will call to send UTXOs of the channel that the sender used to send the payment once it completes.
  utxoCallback: z.string(),
});

export type PayReqResponseCompliance = z.infer<
  typeof PayReqResponseComplianceSchema
>;

export const PayReqResponsePaymentInfoSchema = z.object({
  // currencyCode is the ISO 3-digit currency code that the receiver will receive for this payment.
  currencyCode: z.string(),
  // multiplier is the conversion rate. It is the number of millisatoshis that the receiver will receive for 1 unit of the specified currency.
  multiplier: z.number(),
  // exchangeFeesMillisatoshi is the fees charged (in millisats) by the receiving VASP for this transaction. This is separate from the Multiplier.
  exchangeFeesMillisatoshi: z.number(),
});

export type PayReqResponsePaymentInfo = z.infer<
  typeof PayReqResponsePaymentInfoSchema
>;

// PayReqResponse is the response sent by the receiver to the sender to provide an invoice.
export const PayReqResponseSchema = z.object({
  // encodedInvoice is the BOLT11 invoice that the sender will pay.
  encodedInvoice: z.string(),
  // routes is usually just an empty list from legacy LNURL, which was replaced by route hints in the BOLT11 invoice.
  routes: z.array(RouteSchema),
  compliance: PayReqResponseComplianceSchema,
  paymentInfo: PayReqResponsePaymentInfoSchema,
});

export type PayReqResponse = z.infer<typeof PayReqResponseSchema>;

// PubKeyResponse is sent from a VASP to another VASP to provide its public keys. It is the response to GET requests at `/.well-known/lnurlpubkey`.
export type PubKeyResponse = {
  // SigningPubKey is used to verify signatures from a VASP.
  signingPubKey: string;
  // EncryptionPubKey is used to encrypt TR info sent to a VASP.
  encryptionPubKey: string;
  // ExpirationTimestamp [Optional] Seconds since epoch at which these pub keys must be refreshed. They can be safely cached until this expiration (or forever if null).
  expirationTimestamp?: number;
};

// UtxoWithAmount is a pair of utxo and amount transferred over that corresponding channel. It can be used to register payment for KYT.
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

export function parsePayRequest(payRequest: string): PayRequest {
  const parsed = JSON.parse(payRequest);
  let validated: PayRequest;
  try {
    validated = PayRequestSchema.parse(parsed);
  } catch (e) {
    throw new Error("invalid pay request");
  }
  return validated;
}

export function parsePayReqResponse(jsonStr: string): PayReqResponse {
  const parsed = JSON.parse(jsonStr);
  let validated: PayReqResponse;
  try {
    validated = PayReqResponseSchema.parse(parsed);
  } catch (e) {
    throw new Error("invalid pay request response");
  }
  return validated;
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
