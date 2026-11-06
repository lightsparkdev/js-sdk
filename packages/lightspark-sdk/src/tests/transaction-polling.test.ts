// Copyright ©, 2026-present, Lightspark Group, Inc. - All Rights Reserved

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";
import LightsparkClient from "../client.js";
import CurrencyUnit from "../objects/CurrencyUnit.js";
import type Transaction from "../objects/Transaction.js";
import TransactionStatus from "../objects/TransactionStatus.js";

describe("waitForTransactionComplete", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test.each([1, 60])(
    "polls every 250ms within a %s-second timeout",
    async (timeoutSecs) => {
      const client = new LightsparkClient();
      const getTransaction = jest
        .spyOn(client, "getTransaction")
        .mockResolvedValue(null);
      const outcome = client
        .waitForTransactionComplete("transaction-id", timeoutSecs)
        .catch((error: unknown) => error);

      await jest.advanceTimersByTimeAsync(0);
      expect(getTransaction).toHaveBeenCalledTimes(1);
      expect(getTransaction).toHaveBeenLastCalledWith("transaction-id");

      await jest.advanceTimersByTimeAsync(249);
      expect(getTransaction).toHaveBeenCalledTimes(1);

      await jest.advanceTimersByTimeAsync(1);
      expect(getTransaction).toHaveBeenCalledTimes(2);

      await jest.advanceTimersByTimeAsync(timeoutSecs * 1000 - 250);
      expect(await outcome).toMatchObject({
        code: "Timeout",
        message: "Timeout waiting for transaction to complete.",
      });
      expect(getTransaction).toHaveBeenCalledTimes(timeoutSecs * 4);
      expect(jest.getTimerCount()).toBe(0);
    },
  );

  test.each([
    TransactionStatus.SUCCESS,
    TransactionStatus.CANCELLED,
    TransactionStatus.FAILED,
  ])("returns a transaction with terminal status %s", async (status) => {
    const client = new LightsparkClient();
    const transaction: Transaction = {
      id: "transaction-id",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
      status,
      amount: {
        originalValue: 1,
        originalUnit: CurrencyUnit.SATOSHI,
        preferredCurrencyUnit: CurrencyUnit.SATOSHI,
        preferredCurrencyValueRounded: 1,
        preferredCurrencyValueApprox: 1,
      },
      typename: "Transaction",
    };
    const getTransaction = jest
      .spyOn(client, "getTransaction")
      .mockResolvedValue(transaction);
    const result = client.waitForTransactionComplete(transaction.id, 1);

    await jest.advanceTimersByTimeAsync(250);

    await expect(result).resolves.toBe(transaction);
    expect(getTransaction).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  });

  test("propagates errors without continuing to poll", async () => {
    const client = new LightsparkClient();
    const error = new Error("offline lookup failed");
    const getTransaction = jest
      .spyOn(client, "getTransaction")
      .mockRejectedValue(error);

    await expect(
      client.waitForTransactionComplete("transaction-id", 1),
    ).rejects.toBe(error);
    expect(getTransaction).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  });
});
