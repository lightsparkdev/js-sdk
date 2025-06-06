import { SparkWallet } from "@buildonspark/spark-sdk";
import {
  InMemoryNonceValidator,
  InMemoryPublicKeyCache,
  getPubKeyResponse,
} from "@uma-sdk/core";
import supertest from "supertest";
import settings from "../settings.json" assert { type: "json" };
import DemoUserService from "./src/demo/DemoUserService.js";
import InMemorySendingVaspRequestCache from "./src/demo/InMemorySendingVaspRequestCache.js";
import { createUmaServer } from "./src/server.js";
import UmaConfig from "./src/UmaConfig.js";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      LIGHTSPARK_UMA_RECEIVER_USER: string;
      LIGHTSPARK_UMA_ENCRYPTION_CERT_CHAIN: string;
      LIGHTSPARK_UMA_ENCRYPTION_PUBKEY: string;
      LIGHTSPARK_UMA_ENCRYPTION_PRIVKEY: string;
      LIGHTSPARK_UMA_SIGNING_CERT_CHAIN: string;
      LIGHTSPARK_UMA_SIGNING_PUBKEY: string;
      LIGHTSPARK_UMA_SIGNING_PRIVKEY: string;
      LIGHTSPARK_EXAMPLE_BASE_URL: string;
    }
  }
}

const createApp = async () => {
  const config = UmaConfig.fromEnvironment();
  const { wallet: sparkWallet, mnemonic } = await SparkWallet.initialize({
    options: {
      network: "REGTEST",
    },
  });
  const userService = new DemoUserService();

  return createUmaServer(
    config,
    sparkWallet,
    new InMemoryPublicKeyCache(),
    new InMemorySendingVaspRequestCache(),
    userService,
    new InMemoryNonceValidator(Date.now() - 1000 * 60 * 60 * 6),
  );
};

describe("Test server routes", async () => {
  let app = await createApp();
  let server: ReturnType<typeof app.listen>;
  let request = supertest(app);

  beforeAll((done) => {
    server = app.listen(settings.umaVasp.port, done);
    request = supertest(server);
  });

  afterAll((done) => {
    server.close(done);
  });

  test("fetches pub keys", async () => {
    const response = await request.get("/.well-known/lnurlpubkey").send();

    expect(response.status).toBe(200);
    expect(response.text).toEqual(
      getPubKeyResponse({
        signingCertChainPem: process.env.LIGHTSPARK_UMA_SIGNING_CERT_CHAIN,
        encryptionCertChainPem:
          process.env.LIGHTSPARK_UMA_ENCRYPTION_CERT_CHAIN,
      }).toJsonString(),
    );
  });
});
