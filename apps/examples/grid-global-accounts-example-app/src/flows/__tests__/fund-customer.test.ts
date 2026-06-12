import { beforeEach, describe, expect, it, vi } from "vitest";

import { createCollectingReporter } from "../../lib/collecting-reporter";
import type { ApiAuth } from "../../api-client";
import {
  fundCustomerFromPlatform,
  pollTransaction,
  type Sleep,
} from "../money";

const auth: ApiAuth = {
  clientId: "id",
  clientSecret: "secret",
  mode: "sandbox",
};

// Mock at the api-client boundary so no real API is hit.
vi.mock("../../api-client", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));
import { apiGet, apiPost } from "../../api-client";
const mockGet = vi.mocked(apiGet);
const mockPost = vi.mocked(apiPost);

// A sleep that never actually waits — keeps the poll loop synchronous in tests.
const noSleep: Sleep = () => Promise.resolve();

beforeEach(() => {
  mockGet.mockReset();
  mockPost.mockReset();
});

describe("fundCustomerFromPlatform — request shaping", () => {
  it("builds the RECEIVING-locked quote body with platform source + customer destination", async () => {
    const { reporter } = createCollectingReporter();
    mockPost
      .mockResolvedValueOnce({ status: 200, data: { id: "Quote:q1" } }) // quote
      .mockResolvedValueOnce({
        status: 200,
        data: { transactionId: "Transaction:t1" },
      }); // execute
    mockGet.mockResolvedValueOnce({
      id: "Transaction:t1",
      status: "COMPLETED",
    });

    await fundCustomerFromPlatform(
      reporter,
      auth,
      {
        fundingAccountId: "InternalAccount:fund",
        destinationAccountId: "InternalAccount:cust",
        amountMinor: 2500,
      },
      { poll: { sleep: noSleep } },
    );

    // First POST is the quote with the exact reference shape.
    expect(mockPost).toHaveBeenNthCalledWith(1, auth, "/quotes", {
      source: { sourceType: "ACCOUNT", accountId: "InternalAccount:fund" },
      destination: {
        destinationType: "ACCOUNT",
        accountId: "InternalAccount:cust",
      },
      lockedCurrencySide: "RECEIVING",
      lockedCurrencyAmount: 2500,
    });
  });

  it("executes with an EMPTY body and NO Grid-Wallet-Signature header", async () => {
    const { reporter } = createCollectingReporter();
    mockPost
      .mockResolvedValueOnce({ status: 200, data: { id: "Quote:q1" } })
      .mockResolvedValueOnce({
        status: 200,
        data: { transactionId: "Transaction:t1" },
      });
    mockGet.mockResolvedValueOnce({ status: "COMPLETED" });

    await fundCustomerFromPlatform(
      reporter,
      auth,
      {
        fundingAccountId: "InternalAccount:fund",
        destinationAccountId: "InternalAccount:cust",
        amountMinor: 100,
      },
      { poll: { sleep: noSleep } },
    );

    // Second POST is the execute: path includes the quote id, body is {} and
    // there is NO fourth (extraHeaders) argument — i.e. no signature header.
    const executeCall = mockPost.mock.calls[1];
    expect(executeCall[1]).toBe("/quotes/Quote%3Aq1/execute");
    expect(executeCall[2]).toEqual({});
    expect(executeCall[3]).toBeUndefined();
  });

  it("trims ids and rejects a non-positive amount before calling the API", async () => {
    const { reporter } = createCollectingReporter();
    await expect(
      fundCustomerFromPlatform(reporter, auth, {
        fundingAccountId: "InternalAccount:fund",
        destinationAccountId: "InternalAccount:cust",
        amountMinor: 0,
      }),
    ).rejects.toThrow(/amount/i);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("requires a funding account and a customer account", async () => {
    const { reporter } = createCollectingReporter();
    await expect(
      fundCustomerFromPlatform(reporter, auth, {
        fundingAccountId: "  ",
        destinationAccountId: "InternalAccount:cust",
        amountMinor: 100,
      }),
    ).rejects.toThrow(/funding account/i);
    await expect(
      fundCustomerFromPlatform(reporter, auth, {
        fundingAccountId: "InternalAccount:fund",
        destinationAccountId: "",
        amountMinor: 100,
      }),
    ).rejects.toThrow(/internal account/i);
    expect(mockPost).not.toHaveBeenCalled();
  });
});

describe("fundCustomerFromPlatform — orchestration result", () => {
  it("returns quoteId, transactionId, and the terminal COMPLETED status", async () => {
    const { reporter } = createCollectingReporter();
    mockPost
      .mockResolvedValueOnce({ status: 200, data: { id: "Quote:q9" } })
      .mockResolvedValueOnce({
        status: 200,
        data: { transactionId: "Transaction:t9" },
      });
    mockGet.mockResolvedValueOnce({
      id: "Transaction:t9",
      status: "COMPLETED",
    });

    const out = await fundCustomerFromPlatform(
      reporter,
      auth,
      {
        fundingAccountId: "InternalAccount:fund",
        destinationAccountId: "InternalAccount:cust",
        amountMinor: 500,
      },
      { poll: { sleep: noSleep } },
    );

    expect(out.quoteId).toBe("Quote:q9");
    expect(out.transactionId).toBe("Transaction:t9");
    expect(out.status).toBe("COMPLETED");
  });

  it("surfaces a FAILED terminal status without throwing", async () => {
    const { reporter } = createCollectingReporter();
    mockPost
      .mockResolvedValueOnce({ status: 200, data: { id: "Quote:q1" } })
      .mockResolvedValueOnce({
        status: 200,
        data: { transactionId: "Transaction:t1" },
      });
    mockGet.mockResolvedValueOnce({ status: "FAILED" });

    const out = await fundCustomerFromPlatform(
      reporter,
      auth,
      {
        fundingAccountId: "InternalAccount:fund",
        destinationAccountId: "InternalAccount:cust",
        amountMinor: 500,
      },
      { poll: { sleep: noSleep } },
    );

    expect(out.status).toBe("FAILED");
  });

  it("throws when execute returns no transactionId", async () => {
    const { reporter } = createCollectingReporter();
    mockPost
      .mockResolvedValueOnce({ status: 200, data: { id: "Quote:q1" } })
      .mockResolvedValueOnce({ status: 200, data: {} });

    await expect(
      fundCustomerFromPlatform(
        reporter,
        auth,
        {
          fundingAccountId: "InternalAccount:fund",
          destinationAccountId: "InternalAccount:cust",
          amountMinor: 500,
        },
        { poll: { sleep: noSleep } },
      ),
    ).rejects.toThrow(/transactionId/i);
  });
});

describe("fundCustomerFromPlatform — onStage sequence", () => {
  const baseParams = {
    fundingAccountId: "InternalAccount:fund",
    destinationAccountId: "InternalAccount:cust",
    amountMinor: 500,
  };

  it("fires quoting → executing → processing → completed on a COMPLETED txn", async () => {
    const { reporter } = createCollectingReporter();
    mockPost
      .mockResolvedValueOnce({ status: 200, data: { id: "Quote:q1" } })
      .mockResolvedValueOnce({
        status: 200,
        data: { transactionId: "Transaction:t1" },
      });
    mockGet.mockResolvedValueOnce({ status: "COMPLETED" });

    const stages: string[] = [];
    await fundCustomerFromPlatform(reporter, auth, baseParams, {
      poll: { sleep: noSleep },
      onStage: (s) => stages.push(s),
    });

    expect(stages).toEqual(["quoting", "executing", "processing", "completed"]);
  });

  it("ends with failed on a FAILED txn", async () => {
    const { reporter } = createCollectingReporter();
    mockPost
      .mockResolvedValueOnce({ status: 200, data: { id: "Quote:q1" } })
      .mockResolvedValueOnce({
        status: 200,
        data: { transactionId: "Transaction:t1" },
      });
    mockGet.mockResolvedValueOnce({ status: "FAILED" });

    const stages: string[] = [];
    await fundCustomerFromPlatform(reporter, auth, baseParams, {
      poll: { sleep: noSleep },
      onStage: (s) => stages.push(s),
    });

    expect(stages).toEqual(["quoting", "executing", "processing", "failed"]);
  });

  it("stays at processing (no terminal stage) when the poll times out", async () => {
    const { reporter } = createCollectingReporter();
    mockPost
      .mockResolvedValueOnce({ status: 200, data: { id: "Quote:q1" } })
      .mockResolvedValueOnce({
        status: 200,
        data: { transactionId: "Transaction:t1" },
      });
    mockGet.mockResolvedValue({ status: "PROCESSING" });

    const stages: string[] = [];
    await fundCustomerFromPlatform(reporter, auth, baseParams, {
      poll: { sleep: noSleep, intervalMs: 10, timeoutMs: 25 },
      onStage: (s) => stages.push(s),
    });

    expect(stages).toEqual(["quoting", "executing", "processing"]);
  });
});

describe("pollTransaction", () => {
  it("polls GET /transactions/{id} and resolves on the first COMPLETED", async () => {
    const { reporter } = createCollectingReporter();
    mockGet.mockResolvedValueOnce({ status: "COMPLETED" });

    const out = await pollTransaction(reporter, auth, "Transaction:abc", {
      sleep: noSleep,
    });

    expect(mockGet).toHaveBeenCalledWith(
      auth,
      "/transactions/Transaction%3Aabc",
    );
    expect(out.status).toBe("COMPLETED");
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it("keeps polling through PENDING/PROCESSING until a terminal status", async () => {
    const { reporter } = createCollectingReporter();
    mockGet
      .mockResolvedValueOnce({ status: "PENDING" })
      .mockResolvedValueOnce({ status: "PROCESSING" })
      .mockResolvedValueOnce({ status: "COMPLETED" });

    const out = await pollTransaction(reporter, auth, "Transaction:abc", {
      sleep: noSleep,
      intervalMs: 1,
      timeoutMs: 1000,
    });

    expect(mockGet).toHaveBeenCalledTimes(3);
    expect(out.status).toBe("COMPLETED");
  });

  it("returns the last-seen status when the timeout elapses (non-terminal)", async () => {
    const { reporter } = createCollectingReporter();
    mockGet.mockResolvedValue({ status: "PROCESSING" });

    const out = await pollTransaction(reporter, auth, "Transaction:abc", {
      sleep: noSleep,
      intervalMs: 10,
      timeoutMs: 25,
    });

    // Polls at t=0, 10, 20 (next would exceed 25), then gives up.
    expect(out.status).toBe("PROCESSING");
  });
});
