import { describe, expect, it, vi } from "vitest";

import type { ApiAuth } from "../../api-client";
import { createCollectingReporter } from "../../lib/collecting-reporter";
import { formatMoney } from "../../lib/format-money";
import { fetchBalance, mapBalanceRow } from "../customer";

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

describe("mapBalanceRow", () => {
  it("pulls amount + currency from `balance` (not the top level)", () => {
    // The Grid internal-account shape: the currency object (with `decimals`)
    // lives INSIDE `balance`, not at the top level.
    const row = {
      id: "InternalAccount:abc",
      balance: { amount: 3_000_000, currency: { code: "USDB", decimals: 6 } },
    };
    expect(mapBalanceRow(row)).toEqual({
      id: "InternalAccount:abc",
      currency: { code: "USDB", decimals: 6 },
      balance: 3_000_000,
    });
  });

  it("renders 3 USDB (3,000,000 minor, 6 decimals) as 3, not 30,000", () => {
    const mapped = mapBalanceRow({
      id: "InternalAccount:abc",
      balance: { amount: 3_000_000, currency: { code: "USDB", decimals: 6 } },
    });
    const out = formatMoney(mapped.balance, mapped.currency);
    expect(out).toBe("3.000000 USDB");
    expect(out).not.toContain("30,000");
  });

  it("tolerates a bare-number balance (no currency block)", () => {
    expect(mapBalanceRow({ id: "InternalAccount:x", balance: 4200 })).toEqual({
      id: "InternalAccount:x",
      currency: undefined,
      balance: 4200,
    });
  });

  it("defaults a missing/odd balance to 0", () => {
    expect(mapBalanceRow({ id: "InternalAccount:y" })).toEqual({
      id: "InternalAccount:y",
      currency: undefined,
      balance: 0,
    });
    expect(
      mapBalanceRow({ id: "InternalAccount:z", balance: { currency: {} } }),
    ).toEqual({ id: "InternalAccount:z", currency: {}, balance: 0 });
  });
});

describe("fetchBalance (api-client boundary)", () => {
  it("maps each account row's amount + currency from `balance`", async () => {
    const { reporter } = createCollectingReporter();
    const raw = {
      data: [
        {
          id: "InternalAccount:1",
          balance: {
            amount: 3_000_000,
            currency: { code: "USDB", decimals: 6 },
          },
        },
      ],
    };
    mockGet.mockResolvedValueOnce(raw);

    const { rows } = await fetchBalance(reporter, auth, "Customer:c1");

    expect(mockGet).toHaveBeenCalledWith(
      auth,
      "/customers/internal-accounts?customerId=Customer%3Ac1",
    );
    expect(rows).toEqual([
      {
        id: "InternalAccount:1",
        currency: { code: "USDB", decimals: 6 },
        balance: 3_000_000,
      },
    ]);
    expect(formatMoney(rows[0].balance, rows[0].currency)).toBe(
      "3.000000 USDB",
    );
  });

  it("throws when the customer id is blank", async () => {
    const { reporter } = createCollectingReporter();
    await expect(fetchBalance(reporter, auth, "  ")).rejects.toThrow(
      "Customer ID is required.",
    );
  });
});
