import { generateP256KeyPair } from "@turnkey/crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ApiAuth } from "../../api-client";
import { createCollectingReporter } from "../../lib/collecting-reporter";
import { setActiveSessionAccount, setSessionKeysFromTek } from "../../session";
import { deleteAdministrator } from "../manage";

vi.mock("../../api-client", () => ({
  apiPost: vi.fn(),
  apiGet: vi.fn(),
  apiDelete: vi.fn(),
}));
import { apiDelete } from "../../api-client";
const mockDelete = vi.mocked(apiDelete);

const auth: ApiAuth = {
  clientId: "id",
  clientSecret: "secret",
  mode: "production",
};
const ACCOUNT = "InternalAccount:evm";

beforeEach(() => {
  mockDelete.mockReset();
  setActiveSessionAccount(ACCOUNT);
});

afterEach(() => {
  setActiveSessionAccount(null);
});

describe("deleteAdministrator", () => {
  it("removes the administrator by reference, approved by the session key", async () => {
    const sessionKey = generateP256KeyPair();
    setSessionKeysFromTek(sessionKey);
    const { reporter } = createCollectingReporter();
    mockDelete
      .mockResolvedValueOnce({
        status: 202,
        data: { payloadToSign: "delete users", requestId: "Request:del" },
      })
      .mockResolvedValueOnce({ status: 204, data: null });

    await deleteAdministrator(reporter, auth, ACCOUNT, "member_2c7536e3");

    const path =
      "/auth/admin-credentials/member_2c7536e3?accountId=InternalAccount%3Aevm";
    expect(mockDelete.mock.calls[0]).toEqual([auth, path]);
    const [, retryPath, headers] = mockDelete.mock.calls[1];
    expect(retryPath).toBe(path);
    expect(headers?.["Request-Id"]).toBe("Request:del");
    const stamp = JSON.parse(
      atob(
        (headers?.["Grid-Wallet-Signature"] ?? "")
          .replace(/-/g, "+")
          .replace(/_/g, "/"),
      ),
    ) as { publicKey: string };
    expect(stamp.publicKey).toBe(sessionKey.publicKey);
  });
});
