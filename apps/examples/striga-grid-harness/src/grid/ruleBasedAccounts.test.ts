import { describe, expect, it } from "vitest";

import {
  buildRuleBasedCreateBody,
  CreateKeyStore,
  endpointUnavailable,
  gatherPages,
  summarizeRuleBasedAccounts,
  sweepsOf,
} from "./ruleBasedAccounts";

describe("buildRuleBasedCreateBody", () => {
  it("builds a customer rule-based account with an internal destination", () => {
    expect(
      buildRuleBasedCreateBody({
        customerId: "Customer:1",
        currency: "EUR",
        label: "payer-1",
        destinationAccountId: "InternalAccount:dest",
        scaFactor: "SMS_OTP",
      }),
    ).toEqual({
      customerId: "Customer:1",
      type: "RULE_BASED",
      currency: "EUR",
      label: "payer-1",
      sweepRule: { destination: { accountId: "InternalAccount:dest" } },
      scaFactor: "SMS_OTP",
    });
  });

  it("drops blank optional fields and trims what it keeps", () => {
    expect(
      buildRuleBasedCreateBody({
        customerId: "  Customer:1 ",
        currency: " usdc ",
        label: "  ",
        destinationAccountId: " ExternalAccount:x ",
        paymentRail: "",
        scaFactor: "",
      }),
    ).toEqual({
      customerId: "Customer:1",
      type: "RULE_BASED",
      currency: "USDC",
      sweepRule: { destination: { accountId: "ExternalAccount:x" } },
    });
  });

  it("omits customerId for a platform-owned account", () => {
    const body = buildRuleBasedCreateBody({
      customerId: "",
      currency: "USD",
      destinationAccountId: "ExternalAccount:x",
      paymentRail: "ACH",
    });
    expect(body).not.toHaveProperty("customerId");
    expect(body.sweepRule).toEqual({
      destination: { accountId: "ExternalAccount:x", paymentRail: "ACH" },
    });
  });
});

describe("summarizeRuleBasedAccounts", () => {
  const ruleBased = {
    id: "InternalAccount:rb",
    type: "RULE_BASED",
    status: "PENDING_AUTHORIZATION",
    label: "payer-1",
    balance: { amount: 0, currency: { code: "EUR" } },
    sweepRule: { destination: { accountId: "InternalAccount:dest" } },
    scaChallenge: { factor: "SMS_OTP", expiresAt: "2026-11-17T10:00:00Z" },
  };

  it("keeps only RULE_BASED rows from a list response", () => {
    const rows = summarizeRuleBasedAccounts({
      data: [
        { id: "InternalAccount:main", type: "INTERNAL_FIAT", status: "ACTIVE" },
        ruleBased,
      ],
    });
    expect(rows.map((r) => r.id)).toEqual(["InternalAccount:rb"]);
  });

  it("reads one account response and flattens the fields the panel shows", () => {
    expect(summarizeRuleBasedAccounts(ruleBased)).toEqual([
      {
        id: "InternalAccount:rb",
        status: "PENDING_AUTHORIZATION",
        label: "payer-1",
        currency: "EUR",
        destination: "InternalAccount:dest",
        challengeFactor: "SMS_OTP",
      },
    ]);
  });

  it("returns nothing for a response it cannot read", () => {
    expect(summarizeRuleBasedAccounts(null)).toEqual([]);
    expect(summarizeRuleBasedAccounts("<html>")).toEqual([]);
    expect(summarizeRuleBasedAccounts({ data: "x" })).toEqual([]);
  });
});

describe("sweepsOf", () => {
  it("returns the transactions that sweep the given rule-based account", () => {
    const list = {
      data: [
        { id: "Transaction:other", status: "COMPLETED" },
        {
          id: "Transaction:sweep",
          status: "PROCESSING",
          ruleBasedAccountId: "InternalAccount:rb",
        },
        {
          id: "Transaction:elsewhere",
          status: "COMPLETED",
          ruleBasedAccountId: "InternalAccount:other-rb",
        },
        {
          id: "Transaction:failed",
          status: "FAILED",
          failureReason: "SWEEP_AMOUNT_OUT_OF_RANGE",
          ruleBasedAccountId: "InternalAccount:rb",
        },
      ],
    };
    expect(sweepsOf(list, "InternalAccount:rb")).toEqual([
      { id: "Transaction:sweep", status: "PROCESSING" },
      {
        id: "Transaction:failed",
        status: "FAILED",
        failureReason: "SWEEP_AMOUNT_OUT_OF_RANGE",
      },
    ]);
  });

  it("returns nothing without a list", () => {
    expect(sweepsOf(null, "InternalAccount:rb")).toEqual([]);
  });
});

describe("endpointUnavailable", () => {
  it("treats a route the server does not have as unavailable", () => {
    expect(endpointUnavailable({ status: 404, json: null })).toBe(true);
    expect(endpointUnavailable({ status: 405, json: null })).toBe(true);
    expect(endpointUnavailable({ status: 501, json: null })).toBe(true);
  });

  it("does not mistake a 404 for a missing resource as a missing route", () => {
    expect(
      endpointUnavailable({
        status: 404,
        json: { code: "INTERNAL_ACCOUNT_NOT_FOUND", message: "not found" },
      }),
    ).toBe(false);
  });

  it("leaves successes and validation errors alone", () => {
    expect(endpointUnavailable({ status: 201, json: {} })).toBe(false);
    expect(endpointUnavailable({ status: 400, json: { code: "X" } })).toBe(
      false,
    );
    expect(endpointUnavailable({ status: 0, json: null })).toBe(false);
  });
});

describe("gatherPages", () => {
  it("follows nextCursor until hasMore is false and joins the pages", async () => {
    const pages: Record<string, unknown> = {
      "": { data: [{ id: "a" }], hasMore: true, nextCursor: "c1" },
      c1: { data: [{ id: "b" }], hasMore: true, nextCursor: "c2" },
      c2: { data: [{ id: "c" }], hasMore: false },
    };
    const seen: string[] = [];
    const result = await gatherPages(async (cursor) => {
      seen.push(cursor ?? "");
      return { ok: true, status: 200, json: pages[cursor ?? ""] };
    });
    expect(seen).toEqual(["", "c1", "c2"]);
    expect(result).toEqual({
      ok: true,
      status: 200,
      json: { data: [{ id: "a" }, { id: "b" }, { id: "c" }] },
    });
  });

  it("stops at the first failed page and returns that response", async () => {
    const result = await gatherPages(async (cursor) =>
      cursor
        ? { ok: false, status: 500, json: { code: "BOOM" } }
        : {
            ok: true,
            status: 200,
            json: { data: [], hasMore: true, nextCursor: "c1" },
          },
    );
    expect(result).toEqual({ ok: false, status: 500, json: { code: "BOOM" } });
  });

  it("stops when a page claims more but gives no cursor", async () => {
    let calls = 0;
    const result = await gatherPages(async () => {
      calls += 1;
      return {
        ok: true,
        status: 200,
        json: { data: [{ id: "a" }], hasMore: true },
      };
    });
    expect(calls).toBe(1);
    expect(result.json).toEqual({ data: [{ id: "a" }] });
    expect(result.truncated).toBe(true);
  });

  it("reports truncation when the page cap is reached with more to read", async () => {
    let calls = 0;
    const result = await gatherPages(async () => {
      calls += 1;
      return {
        ok: true,
        status: 200,
        json: {
          data: [{ id: String(calls) }],
          hasMore: true,
          nextCursor: `c${calls}`,
        },
      };
    });
    expect(calls).toBe(50);
    expect(result.ok).toBe(true);
    expect(result.truncated).toBe(true);
  });

  it("does not report truncation for a complete read", async () => {
    const result = await gatherPages(async () => ({
      ok: true,
      status: 200,
      json: { data: [], hasMore: false },
    }));
    expect(result.truncated).toBeUndefined();
  });
});

describe("CreateKeyStore", () => {
  const body = buildRuleBasedCreateBody({
    customerId: "Customer:1",
    currency: "EUR",
    destinationAccountId: "InternalAccount:dest",
  });
  const keys = () => {
    let n = 0;
    return new CreateKeyStore(() => `k${++n}`);
  };

  it("reuses the key for a retry of the same create", () => {
    const store = keys();
    expect(store.keyFor("/grid/rc|Customer:1", body)).toBe("k1");
    expect(store.keyFor("/grid/rc|Customer:1", body)).toBe("k1");
  });

  it("issues separate keys per scope and per request", () => {
    const store = keys();
    expect(store.keyFor("/grid/rc|Customer:1", body)).toBe("k1");
    expect(store.keyFor("/grid/rc|Customer:2", body)).toBe("k2");
    expect(
      store.keyFor("/grid/rc|Customer:1", { ...body, label: "payer-2" }),
    ).toBe("k3");
  });

  it("issues a new key once the create succeeds", () => {
    const store = keys();
    const key = store.keyFor("/grid/rc|Customer:1", body);
    store.release("/grid/rc|Customer:1", body, key);
    expect(store.keyFor("/grid/rc|Customer:1", body)).toBe("k2");
  });

  it("keeps a newer key when a late response releases an older one", () => {
    const store = keys();
    const first = store.keyFor("/grid/rc|Customer:1", body);
    store.release("/grid/rc|Customer:1", body, first);
    const second = store.keyFor("/grid/rc|Customer:1", body);
    store.release("/grid/rc|Customer:1", body, first);
    expect(store.keyFor("/grid/rc|Customer:1", body)).toBe(second);
  });
});
