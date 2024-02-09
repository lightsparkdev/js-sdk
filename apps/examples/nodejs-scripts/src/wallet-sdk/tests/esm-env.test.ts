import {
  ChromeExtensionLocalTokenStorage,
  CustomJwtAuthProvider,
  GraphNode,
  InMemoryTokenStorage,
  InvoiceType,
  LightsparkClient,
  Wallet,
} from "@lightsparkdev/wallet-sdk";
import { getCredentialsFromEnvOrThrow } from "@lightsparkdev/wallet-sdk/env";

describe("esm environment", () => {
  it("should be able to import modules from wallet-sdk", () => {
    expect(LightsparkClient).toBeDefined();
    expect(InvoiceType).toBeDefined();
    expect(InMemoryTokenStorage).toBeDefined();
    expect(ChromeExtensionLocalTokenStorage).toBeDefined();
    expect(getCredentialsFromEnvOrThrow).toBeDefined();
    expect(CustomJwtAuthProvider).toBeDefined();
    expect(Wallet).toBeDefined();
    expect(GraphNode).toBeDefined();
  });
});
