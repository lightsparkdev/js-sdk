import { mapCurrencyAmount, pollUntil, round } from "@lightsparkdev/core";
import LightsparkClient from "../../client.js";
import { getCredentialsFromEnvOrThrow } from "../../env.js";
import {
  AccountTokenAuthProvider,
  BitcoinNetwork,
  PaymentRequestStatus,
  TransactionStatus,
} from "../../index.js";
import { logger } from "../../logger.js";

const REGTEST_SIGNING_KEY_PASSWORD = "1234!@#$";
const pollIntervalMs = 250;
const pollTimeoutSecs = 20;
const pollMaxTimeouts = (pollTimeoutSecs * 1000) / pollIntervalMs;
const pollIgnoreErrors = false;

const suiteName = "lightspark-sdk client";

function log(msg: string, ...args: unknown[]) {
  logger.info(
    `${expect
      .getState()
      .currentTestName?.replace(
        new RegExp(`^(${suiteName})\\s`, "g"),
        "",
      )}: ${msg}`,
    ...args,
  );
}

describe("lightspark-sdk client", () => {
  const { apiTokenClientId, apiTokenClientSecret, baseUrl } =
    getCredentialsFromEnvOrThrow();
  const accountAuthProvider = new AccountTokenAuthProvider(
    apiTokenClientId,
    apiTokenClientSecret,
  );
  let regtestNodeId: string | undefined;

  function getRegtestNodeId() {
    expect(regtestNodeId).toBeDefined();
    if (!regtestNodeId) {
      throw new Error("regtestNodeId is not set");
    }
    return regtestNodeId as string;
  }

  it("Should get env vars and construct the client successfully", async () => {
    const lightsparkClient = new LightsparkClient(accountAuthProvider, baseUrl);
    expect(lightsparkClient).toBeDefined();
  });

  it("Should successfully get the current account regtest node", async () => {
    const lightsparkClient = new LightsparkClient(accountAuthProvider, baseUrl);

    const account = await lightsparkClient.getCurrentAccount();
    const nodesConnection = await account?.getNodes(lightsparkClient, 1, [
      BitcoinNetwork.REGTEST,
    ]);

    const regtestNode = nodesConnection?.entities[0];
    expect(regtestNode).toBeDefined();
    log("regtestNodeId", regtestNode?.id);
    regtestNodeId = regtestNode?.id;
  });

  it("Should successfully create an uma invoice", async () => {
    const nodeId = getRegtestNodeId();
    const lightsparkClient = new LightsparkClient(accountAuthProvider, baseUrl);

    const metadata = JSON.stringify([
      ["text/plain", "Pay to vasp2.com user $bob"],
      ["text/identifier", "$bob@vasp2.com"],
    ]);

    const umaInvoice = await lightsparkClient.createUmaInvoice(
      nodeId,
      1000,
      metadata,
    );
    expect(umaInvoice?.status).toEqual(PaymentRequestStatus.OPEN);
  }, 10000);

  const satsToFund = 50_000;
  test("Should deposit funds to node with a defined amount of sats", async () => {
    const lightsparkClient = new LightsparkClient(accountAuthProvider, baseUrl);
    const account = await lightsparkClient.getCurrentAccount();

    if (!account) {
      throw new Error("No account");
    }

    const nodesConnection = await account?.getNodes(lightsparkClient, 1, [
      BitcoinNetwork.REGTEST,
    ]);
    let regtestNode = nodesConnection?.entities[0];
    const initialTotalBalance = mapCurrencyAmount(regtestNode?.totalBalance);
    const nodeId = getRegtestNodeId();

    /* Backend will error on fund_node if node balance is greater than 100,000,000 sats, so we should
       adjust to a target balance less than that: */
    const targetBalanceSats = 50_000_000;
    if (initialTotalBalance.sats > targetBalanceSats) {
      const invoiceAmount = initialTotalBalance.sats - targetBalanceSats;

      await lightsparkClient.loadNodeSigningKey(getRegtestNodeId(), {
        password: REGTEST_SIGNING_KEY_PASSWORD,
      });

      const invoice = await lightsparkClient.createTestModeInvoice(
        nodeId,
        round((initialTotalBalance.sats - targetBalanceSats) * 1000), // convert to msats
      );

      if (!invoice) {
        throw new Error("Unable to create invoice for balance adjustment");
      }

      const feeRate = 0.0016;
      const payment = await lightsparkClient.payInvoice(
        nodeId,
        invoice,
        round(invoiceAmount * feeRate),
      );

      if (!payment) {
        throw new Error("Payment undefined for balance adjustment");
      }

      await lightsparkClient.waitForTransactionComplete(
        payment.id,
        pollTimeoutSecs,
      );
    }

    await lightsparkClient.fundNode(nodeId, satsToFund);

    regtestNode = await pollUntil(
      () => {
        return account?.getNodes(lightsparkClient, 1, [BitcoinNetwork.REGTEST]);
      },
      (current, response) => {
        if (
          current &&
          !mapCurrencyAmount(current.entities[0]?.totalBalance).isEqualTo(
            initialTotalBalance,
          )
        ) {
          return {
            stopPolling: true,
            value: current.entities[0],
          };
        }
        return response;
      },
      pollIntervalMs,
      pollMaxTimeouts,
      pollIgnoreErrors,
      () => new Error("Timeout waiting for payment to be received"),
    );

    expect(
      mapCurrencyAmount(regtestNode.totalBalance).isEqualTo(
        initialTotalBalance,
      ),
    ).toBe(false);
  }, 120_000);

  test("Should send test mode payment", async () => {
    const lightsparkClient = new LightsparkClient(accountAuthProvider, baseUrl);
    const account = await lightsparkClient.getCurrentAccount();

    if (!account) {
      throw new Error("No account");
    }

    const nodeId = getRegtestNodeId();

    const invoice = await lightsparkClient.createTestModeInvoice(
      nodeId,
      satsToFund * 1000, // convert to msats
    );

    await lightsparkClient.loadNodeSigningKey(nodeId, {
      password: REGTEST_SIGNING_KEY_PASSWORD,
    });

    if (!invoice) {
      throw new Error("No invoice");
    }

    const payment = await lightsparkClient.payInvoice(nodeId, invoice, 60);
    log("payment.id", payment?.id);

    if (!payment) {
      throw new Error("No payment");
    }

    const transaction = await lightsparkClient.waitForTransactionComplete(
      payment.id,
      pollTimeoutSecs,
    );

    expect(transaction.status).toEqual(TransactionStatus.SUCCESS);
  }, 30_000);
});
