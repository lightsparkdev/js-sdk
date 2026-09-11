import { describe, expect, it, vi } from "vitest";

import type { ApiAuth } from "../../api-client";
import { createCollectingReporter } from "../../lib/collecting-reporter";
import {
  listPlatformFundingAccounts,
  parsePlatformFundingAccount,
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

describe("parsePlatformFundingAccount", () => {
  it("maps an account to {id, amount, currency}", () => {
    const row = {
      id: "InternalAccount:abc",
      balance: { amount: 100_000, currency: { code: "USD", decimals: 2 } },
    };
    expect(parsePlatformFundingAccount(row)).toEqual({
      id: "InternalAccount:abc",
      amount: 100_000,
      currency: { code: "USD", decimals: 2 },
    });
  });

  it("defaults a missing amount to 0 and currency to {}", () => {
    expect(parsePlatformFundingAccount({ id: "InternalAccount:x" })).toEqual({
      id: "InternalAccount:x",
      amount: 0,
      currency: {},
    });
  });

  it("returns null for rows without a usable id", () => {
    expect(parsePlatformFundingAccount({ balance: { amount: 1 } })).toBeNull();
    expect(parsePlatformFundingAccount(null)).toBeNull();
    expect(parsePlatformFundingAccount("nope")).toBeNull();
  });
});

describe("listPlatformFundingAccounts (api-client boundary)", () => {
  it("queries the platform's own internal accounts and parses the envelope", async () => {
    const { reporter } = createCollectingReporter();
    const raw = {
      data: [
        {
          id: "InternalAccount:1",
          balance: { amount: 5000, currency: { code: "USD", decimals: 2 } },
        },
        {
          id: "InternalAccount:2",
          balance: { amount: 0, currency: { code: "EUR", decimals: 2 } },
        },
      ],
    };
    mockGet.mockResolvedValueOnce(raw);

    const out = await listPlatformFundingAccounts(reporter, auth);

    expect(mockGet).toHaveBeenCalledWith(auth, "/platform/internal-accounts");
    expect(out.accounts.map((a) => a.id)).toEqual([
      "InternalAccount:1",
      "InternalAccount:2",
    ]);
    expect(out.raw).toBe(raw);
  });

  it("returns [] for an empty pool so the picker can render an empty state", async () => {
    const { reporter } = createCollectingReporter();
    mockGet.mockResolvedValueOnce({ data: [] });
    const out = await listPlatformFundingAccounts(reporter, auth);
    expect(out.accounts).toEqual([]);
  });

  it("tolerates a bare array (no envelope)", async () => {
    const { reporter } = createCollectingReporter();
    mockGet.mockResolvedValueOnce([{ id: "InternalAccount:9" }]);
    const out = await listPlatformFundingAccounts(reporter, auth);
    expect(out.accounts.map((a) => a.id)).toEqual(["InternalAccount:9"]);
  });

  it("drops rows without an id", async () => {
    const { reporter } = createCollectingReporter();
    mockGet.mockResolvedValueOnce({
      data: [{ id: "InternalAccount:1" }, { balance: { amount: 1 } }],
    });
    const out = await listPlatformFundingAccounts(reporter, auth);
    expect(out.accounts.map((a) => a.id)).toEqual(["InternalAccount:1"]);
  });
});
