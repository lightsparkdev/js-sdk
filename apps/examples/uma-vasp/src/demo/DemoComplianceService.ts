import {
  LightsparkClient,
  PaymentDirection,
  PostTransactionData,
  RiskRating,
} from "@lightsparkdev/lightspark-sdk";
import ComplianceService from "../ComplianceService.js";
import UmaConfig from "../UmaConfig.js";

export default class DemoComplianceService implements ComplianceService {
  constructor(
    private readonly config: UmaConfig,
    private readonly lightsparkClient: LightsparkClient,
  ) {}
  async shouldAcceptTransactionFromVasp(
    sendingVaspDomain: string,
    receivingUmaAddress: string,
  ): Promise<boolean> {
    // You can do your own checks here, but for the demo we will just accept everything.
    return true;
  }

  async shouldAcceptTransactionToVasp(
    receivingVaspDomain: string,
    sendingUmaAddress: string,
    receivingUmaAddress: string,
  ): Promise<boolean> {
    // You can do your own checks here, but for the demo we will just accept everything.
    return true;
  }

  async preScreenTransaction(
    sendingUmaAddress: string,
    receivingUmaAddress: string,
    amountMsats: number,
    counterpartyNodeId: string | undefined,
    counterpartyUtxos: string[],
  ): Promise<boolean> {
    if (this.config.complianceProvider && counterpartyNodeId) {
      const risk = await this.lightsparkClient.screenNode(
        this.config.complianceProvider,
        counterpartyNodeId,
      );
      return risk !== RiskRating.HIGH_RISK;
    }

    return true;
  }

  async registerTransactionMonitoring(
    paymentId: string,
    nodePubKey: string | undefined,
    paymentDirection: PaymentDirection,
    lastHopUtxosWithAmounts: PostTransactionData[],
  ): Promise<void> {
    if (this.config.complianceProvider && nodePubKey) {
      await this.lightsparkClient.registerPayment(
        this.config.complianceProvider,
        paymentId,
        nodePubKey,
        paymentDirection,
      );
    }
  }

  async getTravelRuleInfoForTransaction(
    sendingUserId: string,
    sendingUmaAddress: string,
    receivingUmaAddress: string,
    amountMsats: number,
  ): Promise<string | undefined> {
    if (amountMsats > 1_000_000_000) {
      return '["message": "Here is some fake travel rule info. It is up to you to actually implement this if needed."]';
    }
    return undefined;
  }
}
