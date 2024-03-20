import supertest from "supertest";
import settings from "../settings.json" assert { type: "json" };
import { createUmaServer } from "./src/server.js";
import UmaConfig from "./src/UmaConfig.js";
import { AccountTokenAuthProvider, LightsparkClient } from "@lightsparkdev/lightspark-sdk";
import DemoUserService from "./src/demo/DemoUserService.js";
import { InMemoryNonceValidator, InMemoryPublicKeyCache } from "@uma-sdk/core";
import InMemorySendingVaspRequestCache from "./src/demo/InMemorySendingVaspRequestCache.js";
import DemoInternalLedgerService from "./src/demo/DemoInternalLedgerService.js";
import DemoComplianceService from "./src/demo/DemoComplianceService.js";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      LIGHTSPARK_API_TOKEN_CLIENT_ID: string;
      LIGHTSPARK_API_TOKEN_CLIENT_SECRET: string;
      LIGHTSPARK_UMA_NODE_ID: string;
      LIGHTSPARK_UMA_RECEIVER_USER: string;
      LIGHTSPARK_UMA_ENCRYPTION_PUBKEY: string;
      LIGHTSPARK_UMA_ENCRYPTION_PRIVKEY: string;
      LIGHTSPARK_UMA_SIGNING_PUBKEY: string;
      LIGHTSPARK_UMA_SIGNING_PRIVKEY: string;
      LIGHTSPARK_EXAMPLE_BASE_URL: string;
    }
  }
}

const config = UmaConfig.fromEnvironment();
const lightsparkClient = new LightsparkClient(
  new AccountTokenAuthProvider(config.apiClientID, config.apiClientSecret),
  config.clientBaseURL,
);
const userService = new DemoUserService();

const app = createUmaServer(
  config,
  lightsparkClient,
  new InMemoryPublicKeyCache(),
  new InMemorySendingVaspRequestCache(),
  userService,
  new DemoInternalLedgerService(config, userService, lightsparkClient),
  new DemoComplianceService(config, lightsparkClient),
  new InMemoryNonceValidator(Date.now() - 1000 * 60 * 60 * 6),
);

describe("Test server routes", () => {
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
    expect(response.body).toEqual({
      signingPubKey: process.env.LIGHTSPARK_UMA_SIGNING_PUBKEY,
      encryptionPubKey: process.env.LIGHTSPARK_UMA_ENCRYPTION_PUBKEY,
    });
  });
});
