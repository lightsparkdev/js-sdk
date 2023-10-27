import supertest from "supertest";
import { app } from "./src/index.js";

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

  test("fetches pub keys", async () => {
    const response = await request
      .get("/.well-known/lnurlpubkey")
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      signingPubKey: process.env.LIGHTSPARK_UMA_SIGNING_PUBKEY,
      encryptionPubKey: process.env.LIGHTSPARK_UMA_ENCRYPTION_PUBKEY,
    });
  });
});
