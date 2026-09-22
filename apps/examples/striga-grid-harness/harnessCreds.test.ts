import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  applyCredsPatch,
  fileCredsStore,
  rejectForeignSave,
  type HarnessCreds,
} from "./harnessCreds";

interface GridStub {
  url: string;
  authHeaders: string[];
  close: () => Promise<void>;
}

// Stands in for the Grid API the endpoint checks credentials against.
async function startGridStub(status: number): Promise<GridStub> {
  const authHeaders: string[] = [];
  const server = createServer((req, res) => {
    authHeaders.push(req.headers.authorization ?? "");
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify(status === 200 ? { data: [] } : { error: "bad token" }),
    );
  });
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  return {
    url: `http://127.0.0.1:${port}/grid/rc`,
    authHeaders,
    close: () =>
      new Promise<void>((resolve) => {
        server.close(() => resolve());
      }),
  };
}

function decodeBasic(header: string | undefined): string {
  return Buffer.from((header ?? "").replace("Basic ", ""), "base64").toString();
}

// Nothing listens on this port, so a request to it fails rather than verifying.
const SEEDED: HarnessCreds = {
  base_url: "http://127.0.0.1:1/grid/rc",
  basic_auth: Buffer.from("seeded-id:seeded-secret").toString("base64"),
  client_id: "seeded-id",
  client_secret: "seeded-secret",
  customer_id: "cust_seeded",
  customer_uma: "$seeded@example.com",
  accounts: { EUR: "acct_seeded" },
  platform_id: "plat_seeded",
};

describe("saving harness credentials", () => {
  let dir: string;
  let credsPath: string;
  let store: ReturnType<typeof fileCredsStore>;
  let stub: GridStub | null;

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "striga-harness-creds-"));
    credsPath = path.join(dir, ".grid-creds.json");
    writeFileSync(credsPath, `${JSON.stringify(SEEDED, null, 2)}\n`, "utf8");
    store = fileCredsStore(credsPath);
    stub = null;
  });

  afterEach(async () => {
    await stub?.close();
    rmSync(dir, { recursive: true, force: true });
  });

  const stored = (): HarnessCreds =>
    JSON.parse(readFileSync(credsPath, "utf8")) as HarnessCreds;

  const seedWith = (overrides: HarnessCreds) => {
    writeFileSync(
      credsPath,
      `${JSON.stringify({ ...SEEDED, ...overrides }, null, 2)}\n`,
      "utf8",
    );
  };

  it("leaves the stored file untouched when the target rejects the credentials", async () => {
    stub = await startGridStub(401);
    const before = readFileSync(credsPath, "utf8");

    const res = await applyCredsPatch(
      {
        base_url: stub.url,
        client_id: "typo-id",
        client_secret: "typo-secret",
      },
      store,
    );

    expect(res.status).toBe(400);
    expect((res.body as { error: string }).error).toContain("401");
    expect(readFileSync(credsPath, "utf8")).toBe(before);
  });

  it("verifies a replaced secret before persisting it", async () => {
    stub = await startGridStub(401);
    // A secret rotation keeps the stored target, so that is what gets checked.
    seedWith({ base_url: stub.url });
    const before = readFileSync(credsPath, "utf8");

    const res = await applyCredsPatch(
      { client_secret: "rotated-secret" },
      store,
    );

    expect(res.status).toBe(400);
    expect(decodeBasic(stub.authHeaders[0])).toBe("seeded-id:rotated-secret");
    expect(readFileSync(credsPath, "utf8")).toBe(before);
  });

  it("persists a verified connection without echoing secrets back", async () => {
    stub = await startGridStub(200);

    const res = await applyCredsPatch(
      { base_url: stub.url, client_id: "new-id", client_secret: "new-secret" },
      store,
    );

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      base_url: stub.url,
      has_credentials: true,
    });
    expect(res.body).not.toHaveProperty("basic_auth");
    expect(res.body).not.toHaveProperty("client_id");
    expect(res.body).not.toHaveProperty("client_secret");
    expect(decodeBasic(`Basic ${stored().basic_auth}`)).toBe(
      "new-id:new-secret",
    );
  });

  it("drops environment-scoped ids when the target changes", async () => {
    stub = await startGridStub(200);

    const res = await applyCredsPatch({ base_url: stub.url }, store);

    expect(res.status).toBe(200);
    expect(res.body).not.toHaveProperty("customer_id");
    const next = stored();
    expect(next.customer_id).toBeUndefined();
    expect(next.customer_uma).toBeUndefined();
    expect(next.accounts).toBeUndefined();
    expect(next.platform_id).toBeUndefined();
    expect(next.basic_auth).toBe(SEEDED.basic_auth);
  });

  it("refuses a save that another origin could have sent", () => {
    const fromHarness = {
      contentType: "application/json",
      origin: "http://localhost:3108",
      host: "localhost:3108",
    };

    expect(rejectForeignSave(fromHarness)).toBeNull();
    // No Origin header at all — curl and the seed script, not a browser page.
    expect(
      rejectForeignSave({ contentType: "application/json; charset=utf-8" }),
    ).toBeNull();
    expect(
      rejectForeignSave({ ...fromHarness, contentType: "text/plain" }),
    ).toMatchObject({ status: 415 });
    expect(
      rejectForeignSave({ ...fromHarness, origin: "https://evil.example" }),
    ).toMatchObject({ status: 403 });
  });

  it("keeps the credentials when saving only a customer", async () => {
    const res = await applyCredsPatch({ customer_id: "cust_new" }, store);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      customer_id: "cust_new",
      has_credentials: true,
    });
    const next = stored();
    expect(next.basic_auth).toBe(SEEDED.basic_auth);
    expect(next.client_secret).toBe("seeded-secret");
    expect(next.customer_uma).toBe(SEEDED.customer_uma);
  });
});
