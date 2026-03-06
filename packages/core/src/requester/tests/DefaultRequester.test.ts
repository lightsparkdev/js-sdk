import { beforeEach, jest } from "@jest/globals";

import type { Client as WsClient } from "graphql-ws";
import type AuthProvider from "../../auth/AuthProvider.js";
import type { CryptoInterface } from "../../crypto/crypto.js";
import type NodeKeyCache from "../../crypto/NodeKeyCache.js";
import type { SigningKey } from "../../crypto/SigningKey.js";
import { SigningKeyType } from "../../crypto/types.js";

/* Mocking ESM modules (when running node with --experimental-vm-modules)
   requires unstable_mockModule, see https://bit.ly/433nRV1 */
jest.unstable_mockModule("graphql-ws", () => ({
  __esModule: true,
  createClient: jest.fn(),
}));
/* Since Requester uses graphql-ws we need a dynamic import after the above mock */
const { DefaultRequester } = await import("../DefaultRequester.js");

describe("DefaultRequester", () => {
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

  describe("subscribe", () => {
    it("returns an Observable for a valid subscription", async () => {
      // Mock wsClient and its subscribe method
      const subscribeMock = jest.fn(
        (
          _body,
          handlers: { next?: (data: unknown) => void; complete?: () => void },
        ) => {
          setTimeout(() => {
            handlers.next?.({ data: { foo: "bar" } });
            handlers.complete?.();
          }, 10);
          return jest.fn();
        },
      );
      const wsClient = {
        subscribe: subscribeMock,
      } as unknown as WsClient;

      const { createClient } = await import("graphql-ws");
      (createClient as jest.Mock).mockReturnValue(wsClient);

      const requester = new DefaultRequester(
        nodeKeyCache,
        schemaEndpoint,
        sdkUserAgent,
        authProvider,
        baseUrl,
        cryptoImpl,
        signingKey,
        fetchImpl,
      );

      const observable = requester.subscribe<{ foo: string }>(
        "subscription TestSub { foo }",
      );

      const results: { foo: string }[] = [];
      await new Promise<void>((resolve) => {
        observable.subscribe({
          next: (data: { data: { foo: string } }) => {
            results.push(data.data);
          },
          complete: () => {
            expect(results).toEqual([{ foo: "bar" }]);
            resolve();
          },
        });
      });

      expect(subscribeMock).toHaveBeenCalled();
    });
  });
});
