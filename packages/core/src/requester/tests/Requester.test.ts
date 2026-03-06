import { beforeEach, jest } from "@jest/globals";

import type AuthProvider from "../../auth/AuthProvider.js";
import type { CryptoInterface } from "../../crypto/crypto.js";
import type NodeKeyCache from "../../crypto/NodeKeyCache.js";
import type { SigningKey } from "../../crypto/SigningKey.js";
import { SigningKeyType } from "../../crypto/types.js";
import LightsparkException from "../../LightsparkException.js";
import type Query from "../Query.js";

/* Mocking ESM modules (when running node with --experimental-vm-modules)
   requires unstable_mockModule, see https://bit.ly/433nRV1 */
jest.unstable_mockModule("graphql-ws", () => ({
  __esModule: true,
  createClient: jest.fn(),
}));
/* Since Requester uses graphql-ws we need a dynamic import after the above mock */
const { default: Requester } = await import("../Requester.js");

describe("Requester", () => {
  const schemaEndpoint = "graphql";
  const sdkUserAgent = "test-agent";
  const baseUrl = "https://api.example.com";

  let nodeKeyCache: NodeKeyCache;
  let authProvider: AuthProvider;
  let signingKey: SigningKey;
  let cryptoImpl: CryptoInterface;
  let fetchImpl: typeof fetch;

  beforeEach(() => {
    nodeKeyCache = {
      getKey: jest.fn(),
      hasKey: jest.fn(),
    } as unknown as NodeKeyCache;

    authProvider = {
      addAuthHeaders: jest.fn((headers: Record<string, string>) =>
        Promise.resolve({
          ...headers,
          "X-Test": "1",
        }),
      ),
      isAuthorized: jest.fn(() => Promise.resolve(true)),
      addWsConnectionParams: jest.fn((params: Record<string, unknown>) =>
        Promise.resolve({
          ...params,
          ws: true,
        }),
      ),
    } satisfies AuthProvider;

    signingKey = {
      type: SigningKeyType.RSASigningKey,
      sign: jest.fn((_data: Uint8Array) =>
        Promise.resolve(new Uint8Array([1, 2, 3])),
      ),
    } satisfies SigningKey;

    cryptoImpl = {
      decryptSecretWithNodePassword: jest.fn(() =>
        Promise.resolve(new ArrayBuffer(0)),
      ),
      generateSigningKeyPair: jest.fn(() =>
        Promise.resolve({
          publicKey: "",
          privateKey: "",
        }),
      ),
      serializeSigningKey: jest.fn(() => Promise.resolve(new ArrayBuffer(0))),
      getNonce: jest.fn(() => Promise.resolve(123)),
      sign: jest.fn(() => Promise.resolve(new ArrayBuffer(0))),
      importPrivateSigningKey: jest.fn(() => Promise.resolve("")),
    } satisfies CryptoInterface;

    fetchImpl = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ data: { foo: "bar" }, errors: undefined }),
        statusText: "OK",
      } as Response),
    );
  });

  it("constructs without error", () => {
    expect(
      () =>
        new Requester(
          nodeKeyCache,
          schemaEndpoint,
          sdkUserAgent,
          authProvider,
          baseUrl,
          cryptoImpl,
          signingKey,
          fetchImpl,
        ),
    ).not.toThrow();
  });

  describe("executeQuery", () => {
    it("calls makeRawRequest and returns constructed object", async () => {
      const requester = new Requester(
        nodeKeyCache,
        schemaEndpoint,
        sdkUserAgent,
        authProvider,
        baseUrl,
        cryptoImpl,
        signingKey,
        fetchImpl,
      );
      const query: Query<{ foo: string }> = {
        queryPayload: "query TestQuery { foo }",
        variables: { a: 1 },
        constructObject: (rawData) => ({
          foo: (rawData as { foo: string }).foo,
        }),
      };
      jest.spyOn(requester, "makeRawRequest").mockResolvedValue({ foo: "bar" });
      const result = await requester.executeQuery(query);
      expect(result).toEqual({ foo: "bar" });
    });
  });

  describe("makeRawRequest", () => {
    it("makes a successful request and returns data", async () => {
      const requester = new Requester(
        nodeKeyCache,
        schemaEndpoint,
        sdkUserAgent,
        authProvider,
        baseUrl,
        cryptoImpl,
        signingKey,
        fetchImpl,
      );
      expect(
        await requester.makeRawRequest("query TestQuery { foo }", { a: 1 }),
      ).toEqual({ foo: "bar" });
      expect(fetchImpl).toHaveBeenCalled();
    });

    it("throws on invalid query", async () => {
      const requester = new Requester(
        nodeKeyCache,
        schemaEndpoint,
        sdkUserAgent,
        authProvider,
        baseUrl,
        cryptoImpl,
        signingKey,
        fetchImpl,
      );
      await expect(requester.makeRawRequest("invalid", {})).rejects.toThrow(
        LightsparkException,
      );
    });

    it("throws on subscription query", async () => {
      const requester = new Requester(
        nodeKeyCache,
        schemaEndpoint,
        sdkUserAgent,
        authProvider,
        baseUrl,
        cryptoImpl,
        signingKey,
        fetchImpl,
      );
      await expect(
        requester.makeRawRequest("subscription TestSub { foo }", {}),
      ).rejects.toThrow(LightsparkException);
    });

    it("throws on failed response", async () => {
      fetchImpl = jest.fn(() =>
        Promise.resolve({
          ok: false,
          statusText: "Bad Request",
          json: () =>
            Promise.resolve({
              errors: [
                { message: "fail", extensions: { error_name: "TestError" } },
              ],
            }),
        } as Response),
      );
      const requester = new Requester(
        nodeKeyCache,
        schemaEndpoint,
        sdkUserAgent,
        authProvider,
        baseUrl,
        cryptoImpl,
        signingKey,
        fetchImpl,
      );
      await expect(
        requester.makeRawRequest("query TestQuery { foo }", {}),
      ).rejects.toThrow(LightsparkException);
    });

    it("throws if response has no data and errors", async () => {
      fetchImpl = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: undefined,
              errors: [
                { message: "fail", extensions: { error_name: "TestError" } },
              ],
            }),
          statusText: "OK",
        } as Response),
      );
      const requester = new Requester(
        nodeKeyCache,
        schemaEndpoint,
        sdkUserAgent,
        authProvider,
        baseUrl,
        cryptoImpl,
        signingKey,
        fetchImpl,
      );
      await expect(
        requester.makeRawRequest("query TestQuery { foo }", {}),
      ).rejects.toThrow(LightsparkException);
    });
  });

  describe("subscribe", () => {
    it("throws on mutation query", () => {
      const requester = new Requester(
        nodeKeyCache,
        schemaEndpoint,
        sdkUserAgent,
        authProvider,
        baseUrl,
        cryptoImpl,
        signingKey,
        fetchImpl,
      );
      expect(() =>
        requester.subscribe("mutation TestMutation { foo }"),
      ).toThrow(LightsparkException);
    });

    it("throws on invalid query", () => {
      const requester = new Requester(
        nodeKeyCache,
        schemaEndpoint,
        sdkUserAgent,
        authProvider,
        baseUrl,
        cryptoImpl,
        signingKey,
        fetchImpl,
      );
      expect(() => requester.subscribe("invalid")).toThrow(LightsparkException);
    });

    it("emits error when wsClient is not initialized", async () => {
      const requester = new Requester(
        nodeKeyCache,
        schemaEndpoint,
        sdkUserAgent,
        authProvider,
        baseUrl,
        cryptoImpl,
        signingKey,
        fetchImpl,
      );
      // Resolve internal wsClient promise to null so the observable emits an error.
      (
        requester as unknown as {
          resolveWsClient: ((v: unknown) => void) | null;
        }
      ).resolveWsClient?.(null);

      const observable = requester.subscribe("subscription TestSub { foo }");

      await new Promise<void>((resolve) => {
        observable.subscribe({
          next: () => {
            throw new Error(
              "Should not emit next when wsClient is uninitialized",
            );
          },
          error: (err) => {
            expect(err).toBeInstanceOf(LightsparkException);
            expect(String((err as Error).message)).toMatch(
              /WebSocket client is not initialized/,
            );
            resolve();
          },
          complete: () => {
            throw new Error(
              "Should not complete when wsClient is uninitialized",
            );
          },
        });
      });
    });
  });

  describe("signing logic", () => {
    it("adds signing headers if signingNodeId is provided", async () => {
      (nodeKeyCache.getKey as jest.Mock).mockReturnValue(signingKey);
      const requester = new Requester(
        nodeKeyCache,
        schemaEndpoint,
        sdkUserAgent,
        authProvider,
        baseUrl,
        cryptoImpl,
        undefined,
        fetchImpl,
      );
      const spy = jest.spyOn(signingKey, "sign");
      await requester.makeRawRequest("query TestQuery { foo }", {}, "node123");
      expect(spy).toHaveBeenCalled();
    });

    it("throws if signingKey is missing", async () => {
      (nodeKeyCache.getKey as jest.Mock).mockReturnValue(undefined);
      const requester = new Requester(
        nodeKeyCache,
        schemaEndpoint,
        sdkUserAgent,
        authProvider,
        baseUrl,
        cryptoImpl,
        undefined,
        fetchImpl,
      );
      await expect(
        requester.makeRawRequest("query TestQuery { foo }", {}, "node123"),
      ).rejects.toThrow();
    });
  });
});
