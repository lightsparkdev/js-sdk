import { beforeEach, describe, expect, it, vi } from "vitest";

import { createCollectingReporter } from "../../lib/collecting-reporter";
import type { ApiAuth } from "../../api-client";
import { exportWallet } from "../manage";

// Mock the api-client boundary so no real API is hit. `apiPost` is called twice
// by the guided flow: the 202 issue leg, then the signed retry leg.
vi.mock("../../api-client", () => ({
  apiPost: vi.fn(),
  apiGet: vi.fn(),
  apiDelete: vi.fn(),
}));
import { apiPost } from "../../api-client";
const mockPost = vi.mocked(apiPost);

// Production signs the retry with a live session stamp; stub it so the test can
// reach the decrypt path without standing up a real session.
vi.mock("../../turnkey", () => ({
  turnkeyStamp: vi.fn().mockResolvedValue("stamped-sig"),
}));

// Mock the crypto: a fixed keypair, and decrypt helpers that yield a known
// mnemonic, so the test asserts the wiring (bundle → decrypt → mnemonic)
// without any real enclave material.
const decryptExportBundle = vi.fn();
const hpkeDecrypt = vi.fn();
vi.mock("@turnkey/crypto", () => ({
  generateP256KeyPair: () => ({
    privateKey: "priv-hex",
    publicKey: "pub-hex",
    publicKeyUncompressed: "04-uncompressed-hex",
  }),
  decryptExportBundle: (...args: unknown[]) => decryptExportBundle(...args),
  hpkeDecrypt: (...args: unknown[]) => hpkeDecrypt(...args),
}));

const MNEMONIC = "legal winner thank year wave sausage worth useful legal";

// Build an export bundle whose `data` blob hex-decodes to the signed-data JSON
// (encappedPublic / ciphertext / organizationId), matching the real shape.
function makeBundle(data: {
  encappedPublic: string;
  ciphertext: string;
  organizationId: string;
}): string {
  const hex = Array.from(new TextEncoder().encode(JSON.stringify(data)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return JSON.stringify({
    version: "v1.0.0",
    data: hex,
    dataSignature: "",
    enclaveQuorumPublic: "",
  });
}

function queueGuidedExport(bundle: string) {
  mockPost
    // Issue leg → 202 challenge.
    .mockResolvedValueOnce({
      status: 202,
      data: { requestId: "Request:abc", payloadToSign: "payload" },
    })
    // Signed retry → 200 with the sealed bundle.
    .mockResolvedValueOnce({
      status: 200,
      data: { id: "InternalAccount:1", encryptedWalletCredentials: bundle },
    });
}

beforeEach(() => {
  mockPost.mockReset();
  decryptExportBundle.mockReset();
  hpkeDecrypt.mockReset();
});

describe("exportWallet", () => {
  it("sandbox: HPKE-decrypts the bundle and returns the mnemonic", async () => {
    const { reporter } = createCollectingReporter();
    const auth: ApiAuth = {
      clientId: "id",
      clientSecret: "secret",
      mode: "sandbox",
    };
    const bundle = makeBundle({
      encappedPublic: "0a0b",
      ciphertext: "0c0d",
      organizationId: "org-123",
    });
    queueGuidedExport(bundle);
    hpkeDecrypt.mockReturnValue(new TextEncoder().encode(MNEMONIC));

    const out = await exportWallet(reporter, auth, "InternalAccount:1");

    // Sandbox bypasses enclave attestation: hpkeDecrypt, not decryptExportBundle.
    expect(decryptExportBundle).not.toHaveBeenCalled();
    expect(hpkeDecrypt).toHaveBeenCalledWith(
      expect.objectContaining({ receiverPriv: "priv-hex" }),
    );
    expect(out.mnemonic).toBe(MNEMONIC);
    // Raw guided result is preserved for the debug log.
    expect(out.retried).toMatchObject({ encryptedWalletCredentials: bundle });
  });

  it("production: verifies via decryptExportBundle with the org id from the bundle", async () => {
    const { reporter } = createCollectingReporter();
    const auth: ApiAuth = {
      clientId: "id",
      clientSecret: "secret",
      mode: "production",
    };
    const bundle = makeBundle({
      encappedPublic: "0a0b",
      ciphertext: "0c0d",
      organizationId: "org-xyz",
    });
    queueGuidedExport(bundle);
    decryptExportBundle.mockResolvedValue(MNEMONIC);

    const out = await exportWallet(reporter, auth, "InternalAccount:1");

    expect(hpkeDecrypt).not.toHaveBeenCalled();
    expect(decryptExportBundle).toHaveBeenCalledWith({
      exportBundle: bundle,
      embeddedKey: "priv-hex",
      organizationId: "org-xyz",
      returnMnemonic: true,
    });
    expect(out.mnemonic).toBe(MNEMONIC);
  });

  it("throws when the export response has no sealed bundle", async () => {
    const { reporter } = createCollectingReporter();
    const auth: ApiAuth = {
      clientId: "id",
      clientSecret: "secret",
      mode: "sandbox",
    };
    mockPost
      .mockResolvedValueOnce({
        status: 202,
        data: { requestId: "Request:abc", payloadToSign: "payload" },
      })
      .mockResolvedValueOnce({
        status: 200,
        data: { id: "InternalAccount:1" },
      });

    await expect(
      exportWallet(reporter, auth, "InternalAccount:1"),
    ).rejects.toThrow(/encryptedWalletCredentials/);
  });
});
