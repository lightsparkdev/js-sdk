import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { createServer, mergeConfig } from "vite";
import { buildConfig } from "./index.js";

const htmlMarker = "vite-proxy-boundary";

function restoreEnvAfter(t, name) {
  const original = process.env[name];
  t.after(() => {
    if (original === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = original;
    }
  });
}

async function startVite(t, { base = "/", proxyTarget, additionalProxy } = {}) {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), "lightspark-vite-test-"),
  );
  await fs.writeFile(
    path.join(root, "index.html"),
    `<html><body>${htmlMarker}</body></html>`,
  );

  const config = mergeConfig(
    buildConfig({
      port: 0,
      base,
      dirname: root,
      ...(proxyTarget ? { proxyTarget } : {}),
    }),
    {
      root,
      logLevel: "silent",
      server: {
        port: 0,
        strictPort: true,
        ...(additionalProxy ? { proxy: additionalProxy } : {}),
      },
    },
  );
  const server = await createServer(config);
  await server.listen();

  t.after(async () => {
    await server.close();
    await fs.rm(root, { recursive: true, force: true });
  });

  const address = server.httpServer.address();
  assert(address && typeof address !== "string");
  return address.port;
}

function request(port, requestPath, host, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port,
        path: requestPath,
        headers: { host, ...headers },
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () =>
          resolve({
            statusCode: res.statusCode,
            body: Buffer.concat(chunks).toString("utf8"),
          }),
        );
      },
    );
    req.on("error", reject);
    req.end();
  });
}

function runBoltClientRoutingScript(html, pageURL) {
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  const script = scripts.find(([, contents]) =>
    contents.includes("const isAlreadyPrefixed"),
  )?.[1];
  assert(script, "expected Bolt client routing bootstrap in HTML");

  const fetchCalls = [];
  const xhrCalls = [];
  const webSocketCalls = [];
  class FakeXMLHttpRequest {
    open(...args) {
      xhrCalls.push(args);
    }
  }
  class FakeWebSocket {
    constructor(...args) {
      webSocketCalls.push(args);
    }
  }
  const window = {
    location: new URL(pageURL),
    fetch: async (...args) => {
      fetchCalls.push(args);
    },
    WebSocket: FakeWebSocket,
  };
  vm.runInNewContext(script, {
    Request,
    URL,
    XMLHttpRequest: FakeXMLHttpRequest,
    window,
  });
  return { fetchCalls, xhrCalls, webSocketCalls, window, FakeXMLHttpRequest };
}

function upgradeToHmr(port, requestPath, host, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: "127.0.0.1",
      port,
      path: requestPath,
      headers: {
        host,
        connection: "Upgrade",
        upgrade: "websocket",
        "sec-websocket-key": "dGhlIHNhbXBsZSBub25jZQ==",
        "sec-websocket-protocol": "vite-hmr",
        "sec-websocket-version": "13",
        ...headers,
      },
    });
    req.on("upgrade", (res, socket) => {
      socket.destroy();
      resolve(res.statusCode);
    });
    req.on("response", (res) => {
      res.resume();
      reject(
        new Error(`Expected WebSocket upgrade, received ${res.statusCode}`),
      );
    });
    req.on("error", reject);
    req.setTimeout(2_000, () => {
      req.destroy(new Error("Timed out waiting for Vite HMR upgrade"));
    });
    req.end();
  });
}

test("keeps Vite's default host protection outside Bolt", async (t) => {
  restoreEnvAfter(t, "BOLT_ZEUS_BASE_URL");
  delete process.env.BOLT_ZEUS_BASE_URL;
  const port = await startVite(t);

  const blocked = await request(port, "/", "zeus.example.test");
  assert.equal(blocked.statusCode, 403);

  const local = await request(port, "/", "localhost");
  assert.equal(local.statusCode, 200);
  assert.match(local.body, new RegExp(htmlMarker));
  assert.doesNotMatch(local.body, /const isAlreadyPrefixed/);
});

test("serves a Bolt frontend through Zeus's host and path prefix", async (t) => {
  restoreEnvAfter(t, "BOLT_ZEUS_BASE_URL");
  process.env.BOLT_ZEUS_BASE_URL = "https://zeus.example.test";
  const prefix = "/agent/test-job:3000";
  const port = await startVite(t, { base: `${prefix}/` });

  const response = await request(port, "/", "zeus.example.test", {
    "x-forwarded-prefix": prefix,
  });
  assert.equal(response.statusCode, 200);
  assert.match(response.body, new RegExp(htmlMarker));
  assert.match(response.body, /const isAlreadyPrefixed/);
  assert.ok(
    response.body.indexOf("const isAlreadyPrefixed") <
      response.body.indexOf(htmlMarker),
    "client routing bootstrap should run before application content",
  );

  const blocked = await request(port, "/", "attacker.example.test", {
    "x-forwarded-prefix": prefix,
  });
  assert.equal(blocked.statusCode, 403);
});

test("routes browser HTTP and WebSocket clients through the Bolt prefix", async (t) => {
  restoreEnvAfter(t, "BOLT_ZEUS_BASE_URL");
  process.env.BOLT_ZEUS_BASE_URL = "https://zeus.example.test";
  const prefix = "/agent/test-job:3000";
  const port = await startVite(t, { base: `${prefix}/` });
  const response = await request(port, "/", "zeus.example.test", {
    "x-forwarded-prefix": prefix,
  });
  const runtime = runBoltClientRoutingScript(
    response.body,
    `https://zeus.example.test${prefix}/login`,
  );

  await runtime.window.fetch("/graphql/frontend?n=LoginWithPassword");
  await runtime.window.fetch(
    new Request("https://zeus.example.test/graphql/internal", {
      method: "POST",
    }),
  );
  await runtime.window.fetch(
    `https://zeus.example.test${prefix}/grid-dashboard-api/accounts`,
  );
  await runtime.window.fetch("https://api.example.test/external");
  const xhr = new runtime.FakeXMLHttpRequest();
  xhr.open("POST", "/ui/logs");
  new runtime.window.WebSocket(
    "wss://zeus.example.test/graphql/frontend",
    "graphql-transport-ws",
  );

  assert.equal(
    runtime.fetchCalls[0][0].toString(),
    `https://zeus.example.test${prefix}/graphql/frontend?n=LoginWithPassword`,
  );
  assert.equal(
    runtime.fetchCalls[1][0].url,
    `https://zeus.example.test${prefix}/graphql/internal`,
  );
  assert.equal(runtime.fetchCalls[1][0].method, "POST");
  assert.equal(
    runtime.fetchCalls[2][0].toString(),
    `https://zeus.example.test${prefix}/grid-dashboard-api/accounts`,
  );
  assert.equal(
    runtime.fetchCalls[3][0].toString(),
    "https://api.example.test/external",
  );
  assert.equal(
    runtime.xhrCalls[0][1].toString(),
    `https://zeus.example.test${prefix}/ui/logs`,
  );
  assert.equal(
    runtime.webSocketCalls[0][0].toString(),
    `wss://zeus.example.test${prefix}/graphql/frontend`,
  );
  assert.equal(runtime.webSocketCalls[0][1], "graphql-transport-ws");
});

test("restores the Bolt path prefix for Vite HMR upgrades", async (t) => {
  restoreEnvAfter(t, "BOLT_ZEUS_BASE_URL");
  process.env.BOLT_ZEUS_BASE_URL = "https://zeus.example.test";
  const prefix = "/agent/test-job:3000";
  const port = await startVite(t, { base: `${prefix}/` });

  const statusCode = await upgradeToHmr(port, "/", "zeus.example.test", {
    "x-forwarded-prefix": prefix,
  });

  assert.equal(statusCode, 101);
});

test("leaves API paths bare for Vite's backend proxy", async (t) => {
  restoreEnvAfter(t, "BOLT_ZEUS_BASE_URL");
  process.env.BOLT_ZEUS_BASE_URL = "https://zeus.example.test";

  let upstreamPath;
  const upstream = http.createServer((req, res) => {
    upstreamPath = req.url;
    res.end("proxied");
  });
  await new Promise((resolve) => upstream.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => upstream.close(resolve)));
  const upstreamAddress = upstream.address();
  assert(upstreamAddress && typeof upstreamAddress !== "string");

  const prefix = "/agent/test-job:3000";
  const port = await startVite(t, {
    base: `${prefix}/`,
    proxyTarget: `http://127.0.0.1:${upstreamAddress.port}`,
  });
  const html = await request(port, "/", "zeus.example.test", {
    "x-forwarded-prefix": prefix,
  });
  const runtime = runBoltClientRoutingScript(
    html.body,
    `https://zeus.example.test${prefix}/login`,
  );
  await runtime.window.fetch("/graphql/frontend?operation=viewer");
  const browserURL = new URL(runtime.fetchCalls[0][0]);
  const zeusStrippedPath =
    browserURL.pathname.slice(prefix.length) + browserURL.search;
  const response = await request(port, zeusStrippedPath, "zeus.example.test", {
    "x-forwarded-prefix": prefix,
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body, "proxied");
  assert.equal(upstreamPath, "/graphql/frontend?operation=viewer");
});

test("leaves consumer-added proxy paths bare", async (t) => {
  restoreEnvAfter(t, "BOLT_ZEUS_BASE_URL");
  process.env.BOLT_ZEUS_BASE_URL = "https://zeus.example.test";

  let upstreamPath;
  const upstream = http.createServer((req, res) => {
    upstreamPath = req.url;
    res.end("consumer-proxied");
  });
  await new Promise((resolve) => upstream.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => upstream.close(resolve)));
  const upstreamAddress = upstream.address();
  assert(upstreamAddress && typeof upstreamAddress !== "string");

  const prefix = "/agent/test-job:3000";
  const port = await startVite(t, {
    base: `${prefix}/`,
    additionalProxy: {
      "/graphql/signing": {
        target: `http://127.0.0.1:${upstreamAddress.port}`,
      },
    },
  });
  const response = await request(
    port,
    "/graphql/signing?operation=sign",
    "zeus.example.test",
    { "x-forwarded-prefix": prefix },
  );

  assert.equal(response.statusCode, 200);
  assert.equal(response.body, "consumer-proxied");
  assert.equal(upstreamPath, "/graphql/signing?operation=sign");
});
