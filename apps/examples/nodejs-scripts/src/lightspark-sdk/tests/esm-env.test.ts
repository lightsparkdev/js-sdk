import {
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
} from "@lightsparkdev/lightspark-sdk";
import { getCredentialsFromEnvOrThrow } from "@lightsparkdev/lightspark-sdk/env";

describe("esm environment", () => {
  it("should be able to import modules from lightspark-sdk", () => {
    expect(getCredentialsFromEnvOrThrow).toBeDefined();
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
