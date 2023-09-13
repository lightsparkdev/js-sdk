import { type KycStatus } from "./KycStatus.js";

export type PayerDataOptions = {
  nameRequired: boolean;
  emailRequired: boolean;
  complianceRequired: boolean;
};

export type PayerData = {
  name?: string;
  email?: string;
  identifier: string;
  compliance: CompliancePayerData;
};

export type CompliancePayerData = {
  // Utxos is the list of UTXOs of the sender's channels that might be used to fund the payment.
  utxos?: string[];
  // NodePubKey is the public key of the sender's node if known.
  nodePubKey?: string;
  // KycStatus indicates whether VASP1 has KYC information about the sender.
  kycStatus: KycStatus;
  // EncryptedTravelRuleInfo is the travel rule information of the sender. This is encrypted with the receiver's public encryption key.
  encryptedTravelRuleInfo?: string;
  // Signature is the base64-encoded signature of sha256(ReceiverAddress|Nonce|Timestamp).
  signature: string;
  signatureNonce: string;
  signatureTimestamp: number;
  // UtxoCallback is the URL that the receiver will call to send UTXOs of the channel that the receiver used to receive the payment once it completes.
  utxoCallback: string;
};

export function payerDataOptionsToJSON(p: PayerDataOptions): string {
  return JSON.stringify({
    identifier: { mandatory: true },
    name: { mandatory: p.nameRequired },
    email: { mandatory: p.emailRequired },
    compliance: { mandatory: p.complianceRequired },
  });
}
