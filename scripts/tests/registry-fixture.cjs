const fs = require("node:fs");

const registry = JSON.parse(
  fs.readFileSync(process.env.REGISTRY_FIXTURE, "utf8"),
);
const calls = new Map();
const realTimeout = global.setTimeout;
let elapsedMs = 0;
global.setTimeout = (callback, milliseconds, ...args) =>
  realTimeout(
    () => {
      elapsedMs += milliseconds;
      callback(...args);
    },
    Math.min(milliseconds, 5),
  );

if (process.env.REGISTRY_CLOCK_FILE) {
  const startedAtMs = Date.now();
  Date.now = () => startedAtMs + elapsedMs;
  process.on("exit", () => {
    fs.writeFileSync(process.env.REGISTRY_CLOCK_FILE, String(elapsedMs));
  });
}

const realAbortTimeout = AbortSignal.timeout;
AbortSignal.timeout = (milliseconds) =>
  realAbortTimeout(Math.min(milliseconds, 5));

global.fetch = async (url, options = {}) => {
  const parsed = new URL(url);
  if (parsed.origin !== "https://registry.npmjs.org") {
    throw new Error(`Unexpected network request: ${url}`);
  }
  const key = decodeURIComponent(parsed.pathname.slice(1));
  const values = registry[key];
  const index = calls.get(key) || 0;
  calls.set(key, index + 1);
  let value = Array.isArray(values)
    ? values[Math.min(index, values.length - 1)]
    : values;
  if (value?.availableAfterMs > elapsedMs) value = { status: 404 };
  if (value?.timeout) {
    if (!options.signal)
      throw new Error("Registry requests must have a timeout signal");
    await new Promise((resolve, reject) => {
      const watchdog = realTimeout(
        () => reject(new Error("Request did not abort")),
        1000,
      );
      options.signal.addEventListener(
        "abort",
        () => {
          clearTimeout(watchdog);
          reject(options.signal.reason);
        },
        { once: true },
      );
    });
  }
  const status = value?.status || (value ? 200 : 404);
  return new Response(JSON.stringify(value?.body || value || {}), { status });
};
