import { KycStatus } from "../KycStatus.js";
import { PayRequestSchema } from "../protocol.js";

describe("uma protocol", () => {
  it("should validate pay requests", async () => {
    /* Missing payerData: */
    await expect(() =>
      PayRequestSchema.parse({
        currencyCode: "USD",
        amount: 100,
      }),
    ).toThrow(/.*payerData.*/g);

    /* Invalid compliance: */
    await expect(() =>
      PayRequestSchema.parse({
        currencyCode: "USD",
        amount: 100,
        payerData: {
          name: "Bob",
          email: "$bob@lightspark.com",
          identifier: "1234",
          compliance: {
            utxos: ["utxo1", "utxo2"],
            nodePubKey: "nodePubKey",
            kycStatus: KycStatus.Pending,
            encryptedTravelRuleInfo: "encryptedTravelRuleInfo",
            signature: "signature",
            signatureNonce: "signatureNonce",
            signatureTimestamp: "this should be a number",
            utxoCallback: "utxoCallback",
          },
        },
      }),
    ).toThrow(/.*signatureTimestamp.*/g);

    /* Valid request: */
    await expect(() =>
      PayRequestSchema.parse({
        currencyCode: "USD",
        amount: 100,
        payerData: {
          name: "Bob",
          email: "$bob@lightspark.com",
          identifier: "1234",
          compliance: {
            utxos: ["utxo1", "utxo2"],
            nodePubKey: "nodePubKey",
            kycStatus: KycStatus.Pending,
            encryptedTravelRuleInfo: "encryptedTravelRuleInfo",
            signature: "signature",
            signatureNonce: "signatureNonce",
            signatureTimestamp: 12345678,
            utxoCallback: "utxoCallback",
          },
        },
      }),
    ).not.toThrow();
  });
});
