import { beforeEach, describe, expect, it, vi } from "vitest";

import { createCollectingReporter } from "../../lib/collecting-reporter";
import type { ApiAuth } from "../../api-client";
import {
  groupCustomerWallets,
  listAllInternalAccounts,
  parseInternalAccount,
  type ParsedInternalAccount,
} from "../customer";

const auth: ApiAuth = {
  clientId: "id",
  clientSecret: "secret",
  mode: "sandbox",
};

// Mock at the api-client boundary so no real API is hit.
vi.mock("../../api-client", () => ({
  apiGet: vi.fn(),
}));
import { apiGet } from "../../api-client";
const mockGet = vi.mocked(apiGet);

// Reset call history + queued resolutions between tests so the multi-page tests
// (which assert exact call counts) don't see earlier tests' calls or leftovers.
beforeEach(() => {
  mockGet.mockReset();
});

/** Convenience builder for a parsed account in grouping tests. */
function acct(
  over: Partial<ParsedInternalAccount> & { customerId: string },
): ParsedInternalAccount {
  return {
    id: `InternalAccount:${Math.random().toString(36).slice(2)}`,
    type: "INTERNAL_FIAT",
    status: "ACTIVE",
    amount: 0,
    currency: { code: "USD", decimals: 2 },
    ...over,
  };
}

describe("parseInternalAccount", () => {
  it("maps id, customerId, type, status, and balance", () => {
    const row = {
      id: "InternalAccount:1",
      customerId: "Customer:abc",
      type: "EMBEDDED_WALLET",
      status: "ACTIVE",
      balance: { amount: 123456, currency: { code: "USDB", decimals: 6 } },
    };
    expect(parseInternalAccount(row)).toEqual({
      id: "InternalAccount:1",
      customerId: "Customer:abc",
      type: "EMBEDDED_WALLET",
      status: "ACTIVE",
      amount: 123456,
      currency: { code: "USDB", decimals: 6 },
    });
  });

  it("treats a missing customerId as platform-owned (empty string)", () => {
    const out = parseInternalAccount({
      id: "InternalAccount:2",
      type: "INTERNAL_FIAT",
      balance: { amount: 1, currency: { code: "USD" } },
    });
    expect(out?.customerId).toBe("");
  });

  it("defaults a missing amount to 0 and currency to {}", () => {
    expect(parseInternalAccount({ id: "InternalAccount:3" })).toEqual({
      id: "InternalAccount:3",
      customerId: "",
      type: "",
      status: "",
      amount: 0,
      currency: {},
    });
  });

  it("returns null for rows without a usable id", () => {
    expect(parseInternalAccount({ balance: { amount: 1 } })).toBeNull();
    expect(parseInternalAccount(null)).toBeNull();
    expect(parseInternalAccount("nope")).toBeNull();
  });
});

describe("groupCustomerWallets", () => {
  it("groups by customerId into one wallet row each", () => {
    const out = groupCustomerWallets([
      acct({ customerId: "Customer:1", type: "EMBEDDED_WALLET", amount: 100 }),
      acct({ customerId: "Customer:2", type: "EMBEDDED_WALLET", amount: 200 }),
    ]);
    expect(out.map((w) => w.customerId).sort()).toEqual([
      "Customer:1",
      "Customer:2",
    ]);
  });

  it("drops platform-owned accounts (empty customerId)", () => {
    const out = groupCustomerWallets([
      acct({ customerId: "", type: "INTERNAL_FIAT", amount: 999 }),
      acct({ customerId: "Customer:1", type: "EMBEDDED_WALLET", amount: 50 }),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].customerId).toBe("Customer:1");
  });

  it("keeps a USDB account as a customer wallet even without the embedded type", () => {
    const out = groupCustomerWallets([
      acct({
        customerId: "Customer:1",
        type: "INTERNAL_CRYPTO",
        currency: { code: "USDB", decimals: 6 },
        amount: 7,
      }),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].amount).toBe(7);
  });

  it("omits a customer with no wallet account (only non-USDB fiat)", () => {
    const out = groupCustomerWallets([
      acct({
        customerId: "Customer:1",
        type: "INTERNAL_FIAT",
        currency: { code: "EUR", decimals: 2 },
      }),
    ]);
    expect(out).toEqual([]);
  });

  it("picks the embedded-wallet account when a customer has several candidates", () => {
    const out = groupCustomerWallets([
      acct({
        id: "InternalAccount:usdb",
        customerId: "Customer:1",
        type: "INTERNAL_CRYPTO",
        currency: { code: "USDB", decimals: 6 },
        amount: 1,
      }),
      acct({
        id: "InternalAccount:wallet",
        customerId: "Customer:1",
        type: "EMBEDDED_WALLET",
        currency: { code: "USDB", decimals: 6 },
        amount: 500,
      }),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].accountId).toBe("InternalAccount:wallet");
    expect(out[0].amount).toBe(500);
  });

  it("projects the wallet's accountId, currency, and amount onto the row", () => {
    const out = groupCustomerWallets([
      acct({
        id: "InternalAccount:w",
        customerId: "Customer:9",
        type: "EMBEDDED_WALLET",
        currency: { code: "USDB", decimals: 6 },
        amount: 4242,
      }),
    ]);
    expect(out[0]).toEqual({
      customerId: "Customer:9",
      accountId: "InternalAccount:w",
      currency: { code: "USDB", decimals: 6 },
      amount: 4242,
    });
  });
});

describe("listAllInternalAccounts (api-client boundary)", () => {
  it("fetches a single page with no customerId filter and parses accounts", async () => {
    const { reporter } = createCollectingReporter();
    mockGet.mockResolvedValueOnce({
      data: [
        {
          id: "InternalAccount:1",
          customerId: "Customer:1",
          type: "EMBEDDED_WALLET",
          status: "ACTIVE",
          balance: { amount: 10, currency: { code: "USDB", decimals: 6 } },
        },
      ],
      hasMore: false,
    });

    const out = await listAllInternalAccounts(reporter, auth);

    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith(
      auth,
      "/customers/internal-accounts?limit=100",
    );
    expect(out.accounts.map((a) => a.id)).toEqual(["InternalAccount:1"]);
    expect(out.truncated).toBe(false);
  });

  it("follows hasMore/nextCursor across pages and concatenates accounts", async () => {
    const { reporter } = createCollectingReporter();
    mockGet
      .mockResolvedValueOnce({
        data: [{ id: "InternalAccount:1", customerId: "Customer:1" }],
        hasMore: true,
        nextCursor: "cursor-2",
      })
      .mockResolvedValueOnce({
        data: [{ id: "InternalAccount:2", customerId: "Customer:2" }],
        hasMore: false,
      });

    const out = await listAllInternalAccounts(reporter, auth);

    expect(mockGet).toHaveBeenCalledTimes(2);
    expect(mockGet).toHaveBeenNthCalledWith(
      1,
      auth,
      "/customers/internal-accounts?limit=100",
    );
    expect(mockGet).toHaveBeenNthCalledWith(
      2,
      auth,
      "/customers/internal-accounts?limit=100&cursor=cursor-2",
    );
    expect(out.accounts.map((a) => a.id)).toEqual([
      "InternalAccount:1",
      "InternalAccount:2",
    ]);
    expect(out.truncated).toBe(false);
  });

  it("stops at the page cap and flags truncation when the API keeps reporting more", async () => {
    const { reporter } = createCollectingReporter();
    // Always claim there's another page, so the cap (10) is what stops us.
    mockGet.mockResolvedValue({
      data: [{ id: "InternalAccount:x", customerId: "Customer:x" }],
      hasMore: true,
      nextCursor: "next",
    });

    const out = await listAllInternalAccounts(reporter, auth);

    expect(mockGet).toHaveBeenCalledTimes(10);
    expect(out.truncated).toBe(true);
  });

  it("tolerates a bare array (no envelope)", async () => {
    const { reporter } = createCollectingReporter();
    mockGet.mockResolvedValueOnce([
      { id: "InternalAccount:1", customerId: "Customer:1" },
    ]);
    const out = await listAllInternalAccounts(reporter, auth);
    expect(out.accounts.map((a) => a.id)).toEqual(["InternalAccount:1"]);
  });

  it("returns [] for an empty payload", async () => {
    const { reporter } = createCollectingReporter();
    mockGet.mockResolvedValueOnce({ data: [] });
    const out = await listAllInternalAccounts(reporter, auth);
    expect(out.accounts).toEqual([]);
    expect(out.truncated).toBe(false);
  });
});
