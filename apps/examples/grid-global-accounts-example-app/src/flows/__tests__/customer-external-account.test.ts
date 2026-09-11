import { beforeEach, describe, expect, it, vi } from "vitest";

import { createCollectingReporter } from "../../lib/collecting-reporter";
import type { ApiAuth } from "../../api-client";
import {
  createCustomerExternalAccount,
  listCustomerExternalAccounts,
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

beforeEach(() => {
  mockGet.mockReset();
  mockPost.mockReset();
});

describe("createCustomerExternalAccount", () => {
  it("POSTs /customers/external-accounts with customerId + USD bank body", async () => {
    const { reporter } = createCollectingReporter();
    mockPost.mockResolvedValueOnce({
      status: 200,
      data: { id: "ExternalAccount:ext1" },
    });

    const id = await createCustomerExternalAccount(reporter, auth, {
      customerId: "Customer:c1",
      accountNumber: "000123456789",
      routingNumber: "021000021",
      beneficiaryName: "Ada Lovelace",
    });

    expect(id).toBe("ExternalAccount:ext1");
    expect(mockPost).toHaveBeenCalledTimes(1);
    const [, path, body] = mockPost.mock.calls[0];
    expect(path).toBe("/customers/external-accounts");
    const sent = body as Record<string, unknown>;
    expect(sent.customerId).toBe("Customer:c1");
    expect(sent.currency).toBe("USD");
    const info = sent.accountInfo as Record<string, unknown>;
    expect(info.accountType).toBe("USD_ACCOUNT");
    expect(info.accountNumber).toBe("000123456789");
    expect(info.routingNumber).toBe("021000021");
    expect((info.beneficiary as Record<string, unknown>).fullName).toBe(
      "Ada Lovelace",
    );
  });

  it("trims inputs and requires a customer + bank fields", async () => {
    const { reporter } = createCollectingReporter();
    await expect(
      createCustomerExternalAccount(reporter, auth, {
        customerId: "   ",
        accountNumber: "000123456789",
        routingNumber: "021000021",
      }),
    ).rejects.toThrow(/customer/i);
    await expect(
      createCustomerExternalAccount(reporter, auth, {
        customerId: "Customer:c1",
        accountNumber: " ",
        routingNumber: "021000021",
      }),
    ).rejects.toThrow(/account number/i);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("throws when the create response has no id", async () => {
    const { reporter } = createCollectingReporter();
    mockPost.mockResolvedValueOnce({ status: 200, data: {} });
    await expect(
      createCustomerExternalAccount(reporter, auth, {
        customerId: "Customer:c1",
        accountNumber: "000123456789",
        routingNumber: "021000021",
      }),
    ).rejects.toThrow(/no id/i);
  });
});

describe("listCustomerExternalAccounts", () => {
  it("GETs /customers/external-accounts with customerId + currency and parses labels", async () => {
    const { reporter } = createCollectingReporter();
    mockGet.mockResolvedValueOnce({
      data: [
        {
          id: "ExternalAccount:ext1",
          currency: "USD",
          accountInfo: {
            accountType: "USD_ACCOUNT",
            accountNumber: "123456789",
          },
        },
        {
          id: "ExternalAccount:ext2",
          currency: "USD",
          accountInfo: {
            accountType: "USD_ACCOUNT",
            accountNumber: "987654321",
          },
        },
      ],
      hasMore: false,
    });

    const rows = await listCustomerExternalAccounts(
      reporter,
      auth,
      "Customer:c1",
      "USD",
    );

    expect(mockGet).toHaveBeenCalledTimes(1);
    const [, path] = mockGet.mock.calls[0];
    expect(path).toBe(
      "/customers/external-accounts?customerId=Customer%3Ac1&currency=USD",
    );
    expect(rows).toEqual([
      { id: "ExternalAccount:ext1", label: "USD •••6789" },
      { id: "ExternalAccount:ext2", label: "USD •••4321" },
    ]);
  });

  it("omits the currency query param when not supplied", async () => {
    const { reporter } = createCollectingReporter();
    mockGet.mockResolvedValueOnce({ data: [], hasMore: false });

    await listCustomerExternalAccounts(reporter, auth, "Customer:c1");

    const [, path] = mockGet.mock.calls[0];
    expect(path).toBe("/customers/external-accounts?customerId=Customer%3Ac1");
  });

  it("skips rows without an id and tolerates a null/empty response", async () => {
    const { reporter } = createCollectingReporter();
    mockGet.mockResolvedValueOnce({
      data: [
        { currency: "USD" },
        { id: "ExternalAccount:ok", currency: "USD" },
      ],
      hasMore: false,
    });

    const rows = await listCustomerExternalAccounts(
      reporter,
      auth,
      "Customer:c1",
    );
    expect(rows).toEqual([{ id: "ExternalAccount:ok", label: "USD" }]);

    mockGet.mockResolvedValueOnce(null);
    const empty = await listCustomerExternalAccounts(
      reporter,
      auth,
      "Customer:c1",
    );
    expect(empty).toEqual([]);
  });

  it("requires a customer id", async () => {
    const { reporter } = createCollectingReporter();
    await expect(
      listCustomerExternalAccounts(reporter, auth, "  "),
    ).rejects.toThrow(/customer/i);
    expect(mockGet).not.toHaveBeenCalled();
  });
});
