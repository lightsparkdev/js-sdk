import {
  ComplianceProvider,
  PaymentDirection,
  PostTransactionData,
} from "@lightsparkdev/lightspark-sdk";

export default interface ComplianceService {
  shouldAcceptTransactionFromVasp(
    sendingVaspDomain: string,
    receivingUmaAddress: string,
  ): Promise<boolean>;

  shouldAcceptTransactionToVasp(
    receivingVaspDomain: string,
    sendingUmaAddress: string,
    receivingUmaAddress: string,
  ): Promise<boolean>;

  preScreenTransaction(
    sendingUmaAddress: string,
    receivingUmaAddress: string,
    amountMsats: number,
    counterpartyNodeId: string|undefined,
    counterpartyUtxos: string[],
  ): Promise<boolean>;

  registerTransactionMonitoring(
    paymentId: string,
    nodePubKey: string|undefined,
    paymentDirection: PaymentDirection,
    lastHopUtxosWithAmounts: PostTransactionData[],
  ): Promise<void>;

  getTravelRuleInfoForTransaction(
    sendingUserId: string,
    sendingUmaAddress: string,
    receivingUmaAddress: string,
    amountMsats: number,
  ): Promise<string | undefined>;
}
