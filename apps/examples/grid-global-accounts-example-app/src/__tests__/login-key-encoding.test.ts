import { afterEach, describe, expect, it, vi } from "vitest";

import type { ClientKeyPair } from "../session";
import {
  loginClientPublicKey,
  persistLoginKeyEncoding,
  readLoginKeyEncoding,
} from "../login-key-encoding";

const kp: ClientKeyPair = {
  privateKey: "priv",
  publicKey: "02compressed",
  publicKeyUncompressed: "04uncompressed",
};

function stubStoredEncoding(value: string | null): void {
  vi.stubGlobal("localStorage", {
    getItem: () => value,
    setItem: () => {},
    removeItem: () => {},
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("login key encoding toggle", () => {
  it("sends the compressed (modern) key by default when the toggle is unset", () => {
    stubStoredEncoding(null);
    expect(readLoginKeyEncoding()).toBe("modern");
    expect(loginClientPublicKey(kp)).toBe(kp.publicKey);
  });

  it("sends the uncompressed (legacy) key when the toggle is set to legacy", () => {
    stubStoredEncoding("legacy");
    expect(readLoginKeyEncoding()).toBe("legacy");
    expect(loginClientPublicKey(kp)).toBe(kp.publicKeyUncompressed);
  });

  it("treats any non-legacy stored value as modern", () => {
    stubStoredEncoding("something-else");
    expect(readLoginKeyEncoding()).toBe("modern");
    expect(loginClientPublicKey(kp)).toBe(kp.publicKey);
  });

  it("falls back to modern when localStorage is unavailable", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("localStorage unavailable");
      },
    });
    expect(readLoginKeyEncoding()).toBe("modern");
    expect(loginClientPublicKey(kp)).toBe(kp.publicKey);
  });

  it("persists the toggle choice so the next login (and a reload) keeps it", () => {
    const store: Record<string, string> = {};
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
    });
    persistLoginKeyEncoding("legacy");
    expect(readLoginKeyEncoding()).toBe("legacy");
    expect(loginClientPublicKey(kp)).toBe(kp.publicKeyUncompressed);
    persistLoginKeyEncoding("modern");
    expect(readLoginKeyEncoding()).toBe("modern");
    expect(loginClientPublicKey(kp)).toBe(kp.publicKey);
  });

  it("swallows write failures when localStorage is unavailable", () => {
    vi.stubGlobal("localStorage", {
      setItem: () => {
        throw new Error("localStorage unavailable");
      },
    });
    expect(() => persistLoginKeyEncoding("legacy")).not.toThrow();
  });
});
