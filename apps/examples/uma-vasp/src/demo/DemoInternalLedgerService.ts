import { convertCurrencyAmount, CurrencyUnit } from "@lightsparkdev/core";
import {
  getLightsparkNodeQuery,
  LightsparkClient,
} from "@lightsparkdev/lightspark-sdk";
import InternalLedgerService from "../InternalLedgerService.js";
import UmaConfig from "../UmaConfig.js";
import UserService from "../UserService.js";

export default class DemoInternalLedgerService
  implements InternalLedgerService
{
  private readonly pendingOutgoingTransactionsByUserId: Map<
    string,
    Map<string, number>
  >;
  private readonly pendingBalanceDebitsByUserId: Map<string, number>;
  constructor(
    private readonly config: UmaConfig,
    private readonly userService: UserService,
    private readonly lightsparkClient: LightsparkClient,
  ) {
    this.pendingOutgoingTransactionsByUserId = new Map();
    this.pendingBalanceDebitsByUserId = new Map();
  }

  async recordOutgoingTransactionBegan(
    userId: string,
    recivingUmaAddress: string,
    amountMsats: number,
    amountSendingCurrency: number,
    sendingCurrencyCode: string,
    lightsparkTransactionId: string,
  ): Promise<void> {
    console.log(
      `[LEDGER] Recording sent transaction for ${userId} to ${recivingUmaAddress} for ${amountMsats} msats (${amountSendingCurrency} ${sendingCurrencyCode})`,
    );
    const pendingTxMap =
      this.pendingOutgoingTransactionsByUserId.get(userId) || new Map();
    pendingTxMap.set(lightsparkTransactionId, amountMsats);
    this.pendingBalanceDebitsByUserId.set(
      userId,
      (this.pendingBalanceDebitsByUserId.get(userId) || 0) + amountMsats,
    );
  }

  async recordOutgoingTransactionSucceeded(
    userId: string,
    receivingUmaAddress: string,
    amountMsats: number,
    amountSendingCurrency: number,
    sendingCurrencyCode: string,
    lightsparkTransactionId: string,
  ): Promise<void> {
    console.log(
      `[LEDGER] Recording successful outgoing transaction for ${userId} to ${receivingUmaAddress} for ${amountMsats} msats (${amountSendingCurrency} ${sendingCurrencyCode})`,
    );
    this.removePendingOutgoingTransaction(
      userId,
      receivingUmaAddress,
      amountMsats,
      amountSendingCurrency,
      sendingCurrencyCode,
      lightsparkTransactionId,
    );
  }

  async recordOutgoingTransactionFailed(
    userId: string,
    receivingUmaAddress: string,
    amountMsats: number,
    amountSendingCurrency: number,
    sendingCurrencyCode: string,
    lightsparkTransactionId: string,
  ): Promise<void> {
    console.log(
      `[LEDGER] Recording failed outgoing transaction for ${userId} to ${receivingUmaAddress} for ${amountMsats} msats (${amountSendingCurrency} ${sendingCurrencyCode})`,
    );
    this.removePendingOutgoingTransaction(
      userId,
      receivingUmaAddress,
      amountMsats,
      amountSendingCurrency,
      sendingCurrencyCode,
      lightsparkTransactionId,
    );
  }

  async recordReceivedTransaction(
    userId: string,
    sendingUmaAddress: string,
    amountMsats: number,
    amountSendingCurrency: number,
    sendingCurrencyCode: string,
    lightsparkTransactionId: string,
  ): Promise<void> {
    console.log(
      `[LEDGER] Recording received transaction for ${userId} from ${sendingUmaAddress} for ${amountMsats} msats (${amountSendingCurrency} ${sendingCurrencyCode})}`,
    );
    // no-op for demo. Real implementations would record the transaction in a database.
  }

  async changeUserBalance(
    userId: string,
    amountDeltaMsats: number,
  ): Promise<void> {
    console.log(
      `[LEDGER] Changing user balance for ${userId} by ${amountDeltaMsats}`,
    );
    // no-op for demo. Real implementations would record the transaction in a database.
  }

  async getUserBalance(userId: string, currencyCode: string): Promise<number> {
    if (this.userService.getUserById(userId) === undefined) {
      return 0;
    }

    // There's only one user in this demo. Just give them the whole balance.
    const node = await this.lightsparkClient.executeRawQuery(
      getLightsparkNodeQuery(this.config.nodeID),
    );
    if (!node || !node.balances) {
      return 0;
    }

    const nodeBalanceMsats = convertCurrencyAmount(
      node.balances?.availableToSendBalance,
      CurrencyUnit.MILLISATOSHI,
    ).preferredCurrencyValueRounded;

    const pendingBalanceDebits =
      this.pendingBalanceDebitsByUserId.get(userId) || 0;
    return nodeBalanceMsats - pendingBalanceDebits;
  }

  private removePendingOutgoingTransaction(
    userId: string,
    receivingUmaAddress: string,
    amountMsats: number,
    amountSendingCurrency: number,
    sendingCurrencyCode: string,
    lightsparkTransactionId: string,
  ): void {
    const pendingTxMap = this.pendingOutgoingTransactionsByUserId.get(userId);
    if (!pendingTxMap) {
      console.warn(
        `[LEDGER] No pending outgoing transactions for ${userId} to ${receivingUmaAddress} for ${amountMsats} msats (${amountSendingCurrency} ${sendingCurrencyCode}).`,
      );
      return;
    }
    if (!pendingTxMap.has(lightsparkTransactionId)) {
      console.warn(
        `[LEDGER] Completed outgoing transaction ${lightsparkTransactionId} not found for ${userId}.`,
      );
      return;
    }
    pendingTxMap.delete(lightsparkTransactionId);
    if (!this.pendingBalanceDebitsByUserId.has(userId)) {
      console.warn(
        `[LEDGER] Pending balance debit not found for ${userId} for transaction ${lightsparkTransactionId}.`,
      );
      return;
    }
    this.pendingBalanceDebitsByUserId.set(
      userId,
      (this.pendingBalanceDebitsByUserId.get(userId) || 0) - amountMsats,
    );
  }
}

type OutgoingTransaction = {
  sender: string;
  amountMsats: number;
  lightsparkTransactionId: string;
};
