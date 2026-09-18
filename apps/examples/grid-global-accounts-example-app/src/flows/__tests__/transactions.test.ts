import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ApiAuth } from "../../api-client";
import { createCollectingReporter } from "../../lib/collecting-reporter";
import { listTransactions } from "../transactions";

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

beforeEach(() => {
  mockGet.mockReset();
});

/** The single path argument passed to `apiGet`, split into base + params. */
function calledPath(): { path: string; params: URLSearchParams } {
  const path = mockGet.mock.calls[0][1];
  const query = path.split("?")[1] ?? "";
  return { path, params: new URLSearchParams(query) };
}

describe("listTransactions query string", () => {
  it("always sends customerId, limit (default 20), and sortOrder=desc", async () => {
    const { reporter } = createCollectingReporter();
    mockGet.mockResolvedValueOnce({ data: [], hasMore: false });

    await listTransactions(reporter, auth, { customerId: "Customer:c1" });

    const { path, params } = calledPath();
    expect(path.startsWith("/transactions?")).toBe(true);
    expect(params.get("customerId")).toBe("Customer:c1");
    expect(params.get("limit")).toBe("20");
    expect(params.get("sortOrder")).toBe("desc");
  });

  it("honors an explicit limit", async () => {
    const { reporter } = createCollectingReporter();
    mockGet.mockResolvedValueOnce({ data: [], hasMore: false });

    await listTransactions(reporter, auth, {
      customerId: "Customer:c1",
      limit: 50,
    });

    expect(calledPath().params.get("limit")).toBe("50");
  });

  it("omits `type` for ALL and includes it otherwise", async () => {
    const { reporter } = createCollectingReporter();

    mockGet.mockResolvedValueOnce({ data: [], hasMore: false });
    await listTransactions(reporter, auth, {
      customerId: "Customer:c1",
      type: "ALL",
    });
    expect(calledPath().params.has("type")).toBe(false);

    mockGet.mockReset();
    mockGet.mockResolvedValueOnce({ data: [], hasMore: false });
    await listTransactions(reporter, auth, {
      customerId: "Customer:c1",
      type: "INCOMING",
    });
    expect(calledPath().params.get("type")).toBe("INCOMING");
  });

  it("includes `cursor` only when provided", async () => {
    const { reporter } = createCollectingReporter();

    mockGet.mockResolvedValueOnce({ data: [], hasMore: false });
    await listTransactions(reporter, auth, {
      customerId: "Customer:c1",
      cursor: null,
    });
    expect(calledPath().params.has("cursor")).toBe(false);

    mockGet.mockReset();
    mockGet.mockResolvedValueOnce({ data: [], hasMore: false });
    await listTransactions(reporter, auth, {
      customerId: "Customer:c1",
      cursor: "cursor-uuid",
    });
    expect(calledPath().params.get("cursor")).toBe("cursor-uuid");
  });
});

describe("listTransactions response mapping", () => {
  it("maps the camelCase envelope to a TransactionPage", async () => {
    const { reporter } = createCollectingReporter();
    const raw = {
      data: [
        {
          id: "Transaction:1",
          type: "OUTGOING",
          status: "COMPLETED",
          sentAmount: { amount: 1250, currency: { code: "USD", decimals: 2 } },
          destination: { destinationType: "UMA_ADDRESS", umaAddress: "$bob@x" },
        },
        {
          id: "Transaction:2",
          type: "INCOMING",
          status: "PENDING",
          receivedAmount: {
            amount: 3_000_000,
            currency: { code: "USDB", decimals: 6 },
          },
          source: { sourceType: "ACCOUNT", accountId: "InternalAccount:9" },
        },
      ],
      hasMore: true,
      nextCursor: "next-uuid",
      totalCount: 42,
    };
    mockGet.mockResolvedValueOnce(raw);

    const page = await listTransactions(reporter, auth, {
      customerId: "Customer:c1",
    });

    expect(page.data).toEqual(raw.data);
    expect(page.hasMore).toBe(true);
    expect(page.nextCursor).toBe("next-uuid");
    expect(page.totalCount).toBe(42);
  });

  it("coerces missing data/hasMore/nextCursor/totalCount", async () => {
    const { reporter } = createCollectingReporter();
    mockGet.mockResolvedValueOnce({});

    const page = await listTransactions(reporter, auth, {
      customerId: "Customer:c1",
    });

    expect(page.data).toEqual([]);
    expect(page.hasMore).toBe(false);
    expect(page.nextCursor).toBeNull();
    expect(page.totalCount).toBe(0);
  });
});
