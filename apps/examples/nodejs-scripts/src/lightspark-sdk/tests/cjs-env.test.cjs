const {
  AccountTokenAuthProvider,
  BitcoinNetwork,
  InvoiceType,
  LightsparkClient,
  LightsparkNodeWithOSK,
  RemoteSigningWebhookHandler,
  Wallet,
  WebhookEventType,
  assertValidBitcoinNetwork,
  getBitcoinNetworkOrThrow,
  getDepositQuery,
  getLightsparkNodeQuery,
  getNodeQuery,
  isBitcoinNetwork,
  verifyAndParseWebhook,
} = require("@lightsparkdev/lightspark-sdk");

describe("cjs environment", () => {
  it("should be able to import modules from lightspark-sdk", () => {
    expect(AccountTokenAuthProvider).toBeDefined();
    expect(InvoiceType).toBeDefined();
    expect(LightsparkClient).toBeDefined();
    expect(getDepositQuery).toBeDefined();
    expect(getLightsparkNodeQuery).toBeDefined();
    expect(getNodeQuery).toBeDefined();
    expect(isBitcoinNetwork).toBeDefined();
    expect(assertValidBitcoinNetwork).toBeDefined();
    expect(getBitcoinNetworkOrThrow).toBeDefined();
    expect(BitcoinNetwork).toBeDefined();
    expect(verifyAndParseWebhook).toBeDefined();
    expect(RemoteSigningWebhookHandler).toBeDefined();
    expect(WebhookEventType).toBeDefined();
    expect(Wallet).toBeDefined();
    expect(LightsparkNodeWithOSK).toBeDefined();
  });
});
