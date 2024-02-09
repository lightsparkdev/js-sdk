const {
  ChromeExtensionLocalTokenStorage,
  CustomJwtAuthProvider,
  GraphNode,
  InMemoryTokenStorage,
  InvoiceType,
  LightsparkClient,
  Wallet,
} = require("@lightsparkdev/wallet-sdk");

describe("cjs environment", () => {
  it("should be able to require modules from wallet-sdk", () => {
    expect(LightsparkClient).toBeDefined();
    expect(InvoiceType).toBeDefined();
    expect(InMemoryTokenStorage).toBeDefined();
    expect(ChromeExtensionLocalTokenStorage).toBeDefined();
    expect(CustomJwtAuthProvider).toBeDefined();
    expect(Wallet).toBeDefined();
    expect(GraphNode).toBeDefined();
  });
});
