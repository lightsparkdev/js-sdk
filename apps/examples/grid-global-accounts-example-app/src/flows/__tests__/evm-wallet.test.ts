import { generateP256KeyPair } from "@turnkey/crypto";
import {
  generatePrivateKey,
  privateKeyToAccount,
  type PrivateKeyAccount,
} from "viem/accounts";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { recoverMessageAddress, type Hex } from "viem";

import type { ApiAuth } from "../../api-client";
import type { EvmSigner } from "../../evm-wallet";
import { createCollectingReporter } from "../../lib/collecting-reporter";
import {
  clearActiveSession,
  getSessionId,
  resolveSessionKeys,
  setActiveSessionAccount,
  setSessionKeysFromTek,
} from "../../session";
import {
  addEvmAdministrator,
  addEvmWallet,
  createEvmWalletFirstCredential,
  loginEvmWallet,
} from "../evm-wallet";

// Mock only the HTTP boundary; wallets, session keys and stamps are real.
vi.mock("../../api-client", () => ({
  apiPost: vi.fn(),
  apiGet: vi.fn(),
  apiDelete: vi.fn(),
}));
import { apiPost } from "../../api-client";
const mockPost = vi.mocked(apiPost);

const auth: ApiAuth = {
  clientId: "id",
  clientSecret: "secret",
  mode: "production",
};
const ACCOUNT = "InternalAccount:evm";

function signerFor(account: PrivateKeyAccount): EvmSigner {
  return {
    address: account.address,
    signMessage: (message) => account.signMessage({ message }),
  };
}

function challenge(status: number, payloadToSign: string, requestId: string) {
  return { status, data: { payloadToSign, requestId } };
}

const PROCESSING = { status: 200, data: { status: "PROCESSING" } };

function call(i: number) {
  const [, path, body, headers] = mockPost.mock.calls[i];
  return { path, body, headers: headers ?? {} };
}

function stampPublicKey(stamp: string): string {
  const json = atob(stamp.replace(/-/g, "+").replace(/_/g, "/"));
  return (JSON.parse(json) as { publicKey: string }).publicKey;
}

beforeEach(() => {
  mockPost.mockReset();
  setActiveSessionAccount(ACCOUNT);
  clearActiveSession();
});

afterEach(() => {
  setActiveSessionAccount(null);
});

describe("EVM wallet first credential", () => {
  it("proves ownership with the wallet's signature", async () => {
    const wallet = privateKeyToAccount(generatePrivateKey());
    const { reporter } = createCollectingReporter();
    mockPost
      .mockResolvedValueOnce(challenge(202, "link this wallet", "Request:own"))
      .mockResolvedValueOnce({ status: 201, data: { id: "AuthMethod:evm" } });

    const credId = await createEvmWalletFirstCredential(
      reporter,
      auth,
      ACCOUNT,
      signerFor(wallet),
    );

    const body = {
      type: "EVM_WALLET",
      accountId: ACCOUNT,
      address: wallet.address,
    };
    expect(call(0)).toEqual({ path: "/auth/credentials", body, headers: {} });
    const proof = call(1);
    expect(proof.body).toEqual(body);
    expect(proof.headers["Request-Id"]).toBe("Request:own");
    expect(
      await recoverMessageAddress({
        message: "link this wallet",
        signature: proof.headers["Grid-Wallet-Ownership-Signature"] as Hex,
      }),
    ).toBe(wallet.address);
    expect(credId).toBe("AuthMethod:evm");
  });

  it("refuses a 202 proof: the account already has a wallet", async () => {
    const wallet = privateKeyToAccount(generatePrivateKey());
    const { reporter } = createCollectingReporter();
    mockPost
      .mockResolvedValueOnce(challenge(202, "link", "Request:own"))
      .mockResolvedValueOnce(challenge(202, "approve", "Request:approve"));

    await expect(
      createEvmWalletFirstCredential(
        reporter,
        auth,
        ACCOUNT,
        signerFor(wallet),
      ),
    ).rejects.toThrow(/expected HTTP 201, got 202/);
    expect(mockPost).toHaveBeenCalledTimes(2);
  });
});

describe("EVM wallet sign-in", () => {
  // Grid's STAMP_LOGIN body for the key the challenge was sent with, or, with
  // `publicKey`, a substituted one.
  function answerChallenge(publicKey?: string) {
    mockPost.mockImplementationOnce(async (_auth, _path, body) => {
      const { clientPublicKey } = body as { clientPublicKey: string };
      const payloadToSign = JSON.stringify({
        type: "ACTIVITY_TYPE_STAMP_LOGIN",
        timestampMs: "1763400000000",
        organizationId: "suborg-1",
        parameters: {
          publicKey: publicKey ?? clientPublicKey,
          expirationSeconds: "900",
        },
      });
      return challenge(200, payloadToSign, "Request:sess");
    });
  }

  it("registers the challenge's client key as the session key", async () => {
    const wallet = privateKeyToAccount(generatePrivateKey());
    const { reporter } = createCollectingReporter();
    answerChallenge();
    mockPost
      .mockResolvedValueOnce(PROCESSING)
      .mockResolvedValueOnce({ status: 200, data: { id: "Session:1" } });

    const session = await loginEvmWallet(
      reporter,
      auth,
      ACCOUNT,
      "AuthMethod:evm",
      signerFor(wallet),
    );

    expect(session).toEqual({ id: "Session:1" });
    const { clientPublicKey } = call(0).body as { clientPublicKey: string };
    // Grid takes a compressed P-256 key in lowercase hex.
    expect(clientPublicKey).toMatch(/^0[23][0-9a-f]{64}$/);
    expect(resolveSessionKeys()?.apiPublicKey).toBe(clientPublicKey);
    expect(getSessionId()).toBe("Session:1");

    const verify = call(1);
    expect(verify.path).toBe("/auth/credentials/AuthMethod%3Aevm/verify");
    expect(verify.headers).toEqual({ "Request-Id": "Request:sess" });
    const { signature } = verify.body as { signature: Hex };
    expect(
      await recoverMessageAddress({
        message: (await mockPost.mock.results[0].value).data.payloadToSign,
        signature,
      }),
    ).toBe(wallet.address);
    expect(call(2)).toEqual(verify);
  });

  it("refuses to sign a session request for another key", async () => {
    const wallet = privateKeyToAccount(generatePrivateKey());
    const signer = signerFor(wallet);
    const signMessage = vi.spyOn(signer, "signMessage");
    const { reporter } = createCollectingReporter();
    answerChallenge(generateP256KeyPair().publicKey);

    await expect(
      loginEvmWallet(reporter, auth, ACCOUNT, "AuthMethod:evm", signer),
    ).rejects.toThrow(/key other than this browser's/);
    expect(signMessage).not.toHaveBeenCalled();
    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(resolveSessionKeys()).toBeNull();
  });

  it("keeps the session on the customer it started for", async () => {
    const wallet = privateKeyToAccount(generatePrivateKey());
    const { reporter } = createCollectingReporter();
    answerChallenge();
    let finishVerify!: (res: { status: number; data: unknown }) => void;
    mockPost.mockReturnValueOnce(
      new Promise((resolve) => {
        finishVerify = resolve;
      }),
    );

    const login = loginEvmWallet(
      reporter,
      auth,
      ACCOUNT,
      "AuthMethod:evm",
      signerFor(wallet),
    );
    await vi.waitFor(() => expect(mockPost).toHaveBeenCalledTimes(2));
    setActiveSessionAccount("InternalAccount:other");
    finishVerify({ status: 200, data: { id: "Session:1" } });
    await login;

    expect(resolveSessionKeys()).toBeNull();
    expect(getSessionId()).toBe("");
    setActiveSessionAccount(ACCOUNT);
    expect(getSessionId()).toBe("Session:1");
    expect(resolveSessionKeys()?.apiPublicKey).toBe(
      (call(0).body as { clientPublicKey: string }).clientPublicKey,
    );
  });
});

describe("adding EVM credentials from a live session", () => {
  it("approves an EVM wallet add with the session's P-256 key", async () => {
    const sessionKey = generateP256KeyPair();
    setSessionKeysFromTek(sessionKey);
    const wallet = privateKeyToAccount(generatePrivateKey());
    const { reporter } = createCollectingReporter();
    mockPost
      .mockResolvedValueOnce(challenge(202, "link", "Request:own"))
      .mockResolvedValueOnce(challenge(202, "approve add", "Request:approve"))
      .mockResolvedValueOnce(PROCESSING)
      .mockResolvedValueOnce({ status: 201, data: { id: "AuthMethod:evm2" } });

    const added = await addEvmWallet(
      reporter,
      auth,
      ACCOUNT,
      signerFor(wallet),
    );

    expect(added).toEqual({ id: "AuthMethod:evm2" });
    const approval = call(2);
    expect(approval.body).toEqual(call(0).body);
    expect(approval.headers["Request-Id"]).toBe("Request:approve");
    expect(stampPublicKey(approval.headers["Grid-Wallet-Signature"])).toBe(
      sessionKey.publicKey,
    );
    expect(approval.headers["Grid-Wallet-Ownership-Signature"]).toBeUndefined();
    expect(call(3)).toEqual(approval);
  });

  it("adds another owner by the public key recovered from their wallet", async () => {
    const sessionKey = generateP256KeyPair();
    setSessionKeysFromTek(sessionKey);
    const newOwner = privateKeyToAccount(generatePrivateKey());
    const { reporter } = createCollectingReporter();
    mockPost
      .mockResolvedValueOnce(challenge(202, "create user", "Request:user"))
      .mockResolvedValueOnce(challenge(202, "grant", "Request:grant"))
      .mockResolvedValueOnce({
        status: 201,
        data: { id: "AuthMethod:admin", adminReference: "member_x" },
      });

    await addEvmAdministrator(reporter, auth, ACCOUNT, signerFor(newOwner));

    const { body } = call(0);
    const { publicKey, adminReference } = body as {
      publicKey: string;
      adminReference: string;
    };
    expect(call(0).path).toBe("/auth/admin-credentials");
    expect(publicKey.slice(4)).toBe(newOwner.publicKey.slice(4, 68));
    expect(publicKey).toMatch(/^0x0[23]/);
    expect(adminReference).toMatch(/^member_/);
    for (const [i, requestId] of [
      [1, "Request:user"],
      [2, "Request:grant"],
    ] as const) {
      expect(call(i).body).toEqual(body);
      expect(call(i).headers["Request-Id"]).toBe(requestId);
      expect(stampPublicKey(call(i).headers["Grid-Wallet-Signature"])).toBe(
        sessionKey.publicKey,
      );
    }
  });
});
