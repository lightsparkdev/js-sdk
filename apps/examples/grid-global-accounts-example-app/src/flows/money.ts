// Money movement: external account, quote, sign payload, execute.

import { SANDBOX_SIG } from "../config";
import { apiPost, getMode } from "../api-client";
import { turnkeyStamp } from "../turnkey";
import { addLog, bindClick, el } from "../ui";
import { requireAccountId } from "./context";

export function wireMoneyFlows(): void {
  const extAccountType = el<HTMLSelectElement>("ext-account-type");
  const extSparkFields = el<HTMLDivElement>("ext-spark-fields");
  const extBankFields = el<HTMLDivElement>("ext-bank-fields");
  const quoteDestinationAccountId = el<HTMLInputElement>(
    "quote-destination-account-id",
  );

  extAccountType.addEventListener("change", () => {
    const isSpark = extAccountType.value === "SPARK_WALLET";
    extSparkFields.style.display = isSpark ? "" : "none";
    extBankFields.style.display = isSpark ? "none" : "";
  });

  bindClick(
    "btn-create-external-account",
    "ext-account-status",
    "Create External Account",
    "Creating external account...",
    async () => {
      let body: Record<string, unknown>;
      if (extAccountType.value === "SPARK_WALLET") {
        const address = el<HTMLInputElement>("ext-spark-address").value.trim();
        if (!address) throw new Error("Spark address is required.");
        body = {
          currency: "BTC",
          accountInfo: { accountType: "SPARK_WALLET", address },
        };
      } else {
        const accountNumber = el<HTMLInputElement>(
          "ext-bank-account-number",
        ).value.trim();
        const routingNumber = el<HTMLInputElement>(
          "ext-bank-routing-number",
        ).value.trim();
        const fullName =
          el<HTMLInputElement>("ext-bank-beneficiary-name").value.trim() ||
          "Sandbox Test User";
        if (!accountNumber || !routingNumber)
          throw new Error("Account number and routing number are required.");
        body = {
          currency: "USD",
          accountInfo: {
            accountType: "USD_ACCOUNT",
            countries: ["US"],
            paymentRails: ["ACH", "WIRE", "RTP", "FEDNOW"],
            accountNumber,
            routingNumber,
            beneficiary: {
              beneficiaryType: "INDIVIDUAL",
              fullName,
              birthDate: "1990-01-15",
              nationality: "US",
              address: {
                line1: "100 Test St",
                city: "SF",
                postalCode: "94102",
                country: "US",
              },
            },
          },
        };
      }
      const { data } = await apiPost("/platform/external-accounts", body);
      addLog("Create External Account", data);
      const d = data as Record<string, unknown>;
      if (d.id) quoteDestinationAccountId.value = d.id as string;
      return JSON.stringify(data, null, 2);
    },
  );

  const executeQuoteId = el<HTMLInputElement>("execute-quote-id");
  const executePayloadToSign = el<HTMLTextAreaElement>(
    "execute-payload-to-sign",
  );
  const executeSignature = el<HTMLInputElement>("execute-signature");

  bindClick(
    "btn-create-quote",
    "quote-status",
    "Create Quote",
    "Creating quote...",
    async () => {
      const sourceAccountId = requireAccountId();
      const destinationAccountId = quoteDestinationAccountId.value.trim();
      const lockedAmount = Number(
        el<HTMLInputElement>("quote-locked-amount").value,
      );
      if (!destinationAccountId || !lockedAmount)
        throw new Error("Destination external account and amount are required.");
      const { data } = await apiPost("/quotes", {
        source: { sourceType: "ACCOUNT", accountId: sourceAccountId },
        destination: {
          destinationType: "ACCOUNT",
          accountId: destinationAccountId,
        },
        lockedCurrencySide: el<HTMLSelectElement>("quote-locked-side").value,
        lockedCurrencyAmount: lockedAmount,
      });
      addLog("Create Quote", data);
      const d = data as Record<string, unknown>;
      if (d.id) executeQuoteId.value = d.id as string;
      // Extract `payloadToSign` from the EMBEDDED_WALLET payment instruction
      // (second entry in the example response — find by accountType match).
      const instructions = (d.paymentInstructions ?? []) as Array<
        Record<string, unknown>
      >;
      for (const inst of instructions) {
        const info = inst.accountOrWalletInfo as
          | Record<string, unknown>
          | undefined;
        if (info && info.accountType === "EMBEDDED_WALLET" && info.payloadToSign) {
          executePayloadToSign.value = info.payloadToSign as string;
          break;
        }
      }
      // In sandbox mode, pre-fill the magic signature so the user can hit
      // Execute immediately. In production mode, leave blank — the Sign
      // payload button decrypts the session bundle and stamps it.
      if (getMode() === "sandbox") {
        executeSignature.value = SANDBOX_SIG;
      } else {
        executeSignature.value = "";
      }
      return JSON.stringify(data, null, 2);
    },
  );

  bindClick(
    "btn-sign-payload",
    "execute-status",
    "Sign Payload",
    "Signing...",
    async () => {
      if (getMode() === "sandbox") {
        executeSignature.value = SANDBOX_SIG;
        return `Mode: sandbox — filled magic signature.`;
      }
      const payload = executePayloadToSign.value.trim();
      if (!payload)
        throw new Error(
          "payloadToSign is empty — run Create Quote first or paste it manually.",
        );
      const stamp = await turnkeyStamp(payload);
      executeSignature.value = stamp;
      return `Stamped (${stamp.length} chars).`;
    },
  );

  bindClick(
    "btn-execute-quote",
    "execute-status",
    "Execute Quote",
    "Executing quote...",
    async () => {
      const quoteId = executeQuoteId.value.trim();
      const signature = executeSignature.value.trim();
      if (!quoteId || !signature)
        throw new Error("Quote ID and Grid-Wallet-Signature are required.");
      const { data } = await apiPost(
        `/quotes/${encodeURIComponent(quoteId)}/execute`,
        {},
        { "Grid-Wallet-Signature": signature },
      );
      addLog("Execute Quote", data);
      return JSON.stringify(data, null, 2);
    },
  );
}
