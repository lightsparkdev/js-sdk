import { jest } from "@jest/globals";
import { LightsparkClient } from "@lightsparkdev/lightspark-sdk";
import supertest from "supertest";
import settings from "../settings.json" assert { type: "json" };
import { app } from "./src/index.js";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      RK_WEBHOOK_SECRET: string;
      RK_MASTER_SEED_HEX: string;
    }
  }
}

describe("Test server routes", () => {
  let server: ReturnType<typeof app.listen>;
  let request = supertest(app);

  beforeAll((done) => {
    server = app.listen(settings.remoteSigningServer, done);
    request = supertest(server);
  });

  afterAll((done) => {
    server.close(done);
  });

  test("posts successfully to the /lightspark-webhook endpoint", async () => {
    jest
      .spyOn(LightsparkClient.prototype, "executeRawQuery")
      .mockReturnValue(Promise.resolve("mock-query-response"));
    const response = await request
      .post("/lightspark-webhook")
      .set(
        "lightspark-signature",
        "a64c69f1266bc1dc1322c3f40eba7ba2d536c714774a4fc04f0938609482f5d9",
      )
      .send(
        `{"event_type": "REMOTE_SIGNING", "event_id": "5053dbd8c5b0453494f1c14e01da69cd", "timestamp": "2023-09-18T23:50:15.355603+00:00", "entity_id": "node_with_server_signing:018a9635-3673-88df-0000-827f23051b19", "data": {"sub_event_type": "ECDH", "bitcoin_network": "REGTEST", "peer_public_key": "03173d97d0973d596716c8cd14066e20e27f6866ab214fd04d160301615de78f72"}}`,
      );

    expect(response.status).toBe(200);
  });

  test("error reponse from /lightspark-webhook webhook data is invalid", async () => {
    let response: supertest.Response;
    jest
      .spyOn(LightsparkClient.prototype, "executeRawQuery")
      .mockReturnValue(Promise.resolve("mock-query-response"));
    response = await request
      .post("/lightspark-webhook")
      .set(
        "lightspark-signature",
        "a64c69f1266bc1dc1322c3f40eba7ba2d536c714774a4fc04f0938609482f5d9",
      )
      .send("7b226576656e");
    expect(response.status).toBe(500);
  });
});
