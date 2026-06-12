// DOM + logging + click-binding helpers.

import { generateClientKeyPair } from "./turnkey";

// ----- DOM helpers -----

export function el<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Missing element #${id}`);
  return found as T;
}

export function maybeEl<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

// ----- Logging -----

let logContainer: HTMLDivElement | null = null;

function getLogContainer(): HTMLDivElement {
  if (!logContainer) logContainer = el<HTMLDivElement>("log");
  return logContainer;
}

function timestamp(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

export function addLog(label: string, data: unknown): void {
  const entry = document.createElement("div");
  entry.className = "log-entry";
  const ts = document.createElement("span");
  ts.className = "log-ts";
  ts.textContent = timestamp();
  const lbl = document.createElement("span");
  lbl.className = "log-label";
  lbl.textContent = `[${label}]`;
  const body = document.createTextNode(`\n${JSON.stringify(data, null, 2)}`);
  entry.append(ts, " ", lbl, body);
  getLogContainer().prepend(entry);
}

export function showStatus(
  statusEl: HTMLDivElement,
  ok: boolean,
  text: string,
): void {
  statusEl.className = `status ${ok ? "ok" : "err"}`;
  statusEl.textContent = text;
}

// ----- Generic click wrapper -----

export function bindClick(
  btnId: string,
  statusId: string,
  label: string,
  runningText: string,
  handler: () => Promise<string>,
): void {
  const btn = maybeEl<HTMLButtonElement>(btnId);
  const statusEl = maybeEl<HTMLDivElement>(statusId);
  if (!btn || !statusEl) {
    console.warn(`bindClick: missing btn=${btnId} or status=${statusId}`);
    return;
  }
  btn.addEventListener("click", async () => {
    btn.disabled = true;
    showStatus(statusEl, true, runningText);
    try {
      const responseText = await handler();
      showStatus(statusEl, true, responseText);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`${label} Error`, { error: msg });
      showStatus(statusEl, false, msg);
    } finally {
      btn.disabled = false;
    }
  });
}

// ----- Key generation helper -----
//
// All "Generate P-256 Key" buttons share the same module-level
// `clientKeyPair` so a session decrypted under one keypair stays valid
// across tabs. The button writes the uncompressed public key into the
// target field — that's what Grid's `clientPublicKey` API expects.

export function wireGenKeyButton(btnId: string, targetInputId: string): void {
  const btn = maybeEl<HTMLButtonElement>(btnId);
  const target = maybeEl<HTMLInputElement>(targetInputId);
  if (!btn || !target) return;
  btn.addEventListener("click", () => {
    btn.disabled = true;
    try {
      const kp = generateClientKeyPair();
      target.value = kp.publicKeyUncompressed;
      addLog("Key Generated", {
        publicKeyUncompressed: kp.publicKeyUncompressed,
      });
    } catch (err) {
      addLog("Key Generation Error", { error: String(err) });
    } finally {
      btn.disabled = false;
    }
  });
}

// ----- Session-gated buttons -----
//
// Disable a button with an explanatory tooltip when it can't run yet (e.g. a
// signed retry that needs a live session in production), instead of letting the
// click throw a cryptic error. `evaluate()` returns null when enabled, or the
// tooltip/disabled reason when it should be blocked.

export function wireGatedButton(
  btnId: string,
  evaluate: () => string | null,
): () => void {
  const btn = maybeEl<HTMLButtonElement>(btnId);
  if (!btn) return () => {};
  return () => {
    const reason = evaluate();
    btn.disabled = reason !== null;
    if (reason) {
      btn.title = reason;
    } else {
      btn.removeAttribute("title");
    }
  };
}

// ----- Tab switching -----

export function wireTabs(): void {
  for (const tabBtn of document.querySelectorAll<HTMLButtonElement>(".tab")) {
    tabBtn.addEventListener("click", () => {
      const name = tabBtn.dataset.tab!;
      document
        .querySelectorAll<HTMLButtonElement>(".tab")
        .forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
      document
        .querySelectorAll<HTMLDivElement>(".tab-panel")
        .forEach((p) => p.classList.toggle("active", p.dataset.panel === name));
    });
  }
}
