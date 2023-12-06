export default interface InternalLedgerService {
  recordOutgoingTransactionBegan(
    userId: string,
    receivingUmaAddress: string,
    amountMsats: number,
    amountSendingCurrency: number,
    sendingCurrencyCode: string,
    lightsparkTransactionId: string,
  ): Promise<void>;
  recordOutgoingTransactionSucceeded(
    userId: string,
    receivingUmaAddress: string,
    amountMsats: number,
    amountSendingCurrency: number,
    sendingCurrencyCode: string,
    lightsparkTransactionId: string,
  ): Promise<void>;
  recordOutgoingTransactionFailed(
    userId: string,
    receivingUmaAddress: string,
    amountMsats: number,
    amountSendingCurrency: number,
    sendingCurrencyCode: string,
    lightsparkTransactionId: string,
  ): Promise<void>;
  recordReceivedTransaction(
    userId: string,
    sendingUmaAddress: string,
    amountMsats: number,
    amountSendingCurrency: number,
    sendingCurrencyCode: string,
    lightsparkTransactionId: string,
  ): Promise<void>;
  changeUserBalance(userId: string, amountDeltaMsats: number): Promise<void>;
  getUserBalance(userId: string, currencyCode: string): Promise<number>;
}
