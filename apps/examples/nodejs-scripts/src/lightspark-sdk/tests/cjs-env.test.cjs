const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
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
    assert.notEqual(AccountTokenAuthProvider, undefined);
    assert.notEqual(InvoiceType, undefined);
    assert.notEqual(LightsparkClient, undefined);
    assert.notEqual(getDepositQuery, undefined);
    assert.notEqual(getLightsparkNodeQuery, undefined);
    assert.notEqual(getNodeQuery, undefined);
    assert.notEqual(isBitcoinNetwork, undefined);
    assert.notEqual(assertValidBitcoinNetwork, undefined);
    assert.notEqual(getBitcoinNetworkOrThrow, undefined);
    assert.notEqual(BitcoinNetwork, undefined);
    assert.notEqual(verifyAndParseWebhook, undefined);
    assert.notEqual(RemoteSigningWebhookHandler, undefined);
    assert.notEqual(WebhookEventType, undefined);
    assert.notEqual(Wallet, undefined);
    assert.notEqual(LightsparkNodeWithOSK, undefined);
  });
});
