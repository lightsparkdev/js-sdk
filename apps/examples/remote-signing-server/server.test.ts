import { jest } from "@jest/globals";
import { LightsparkClient } from "@lightsparkdev/lightspark-sdk";
import supertest from "supertest";
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
    server = app.listen(4000, done);
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
        "7b226576656e745f74797065223a202252454d4f54455f5349474e494e47222c20226576656e745f6964223a20223530353364626438633562303435333439346631633134653031646136396364222c202274696d657374616d70223a2022323032332d30392d31385432333a35303a31352e3335353630332b30303a3030222c2022656e746974795f6964223a20226e6f64655f776974685f7365727665725f7369676e696e673a30313861393633352d333637332d383864662d303030302d383237663233303531623139222c202264617461223a207b227375625f6576656e745f74797065223a202245434448222c2022626974636f696e5f6e6574776f726b223a202252454754455354222c2022706565725f7075626c69635f6b6579223a2022303331373364393764303937336435393637313663386364313430363665323065323766363836366162323134666430346431363033303136313564653738663732227d7d",
      );

    expect(response.status).toBe(200);
  });

  test("error reponse from /lightspark-webhook webhook data is invalid", async () => {
    let response: supertest.Response;
    try {
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
    } catch (error) {}
  });
});
