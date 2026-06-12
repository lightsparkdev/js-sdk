// Sandbox / production mode: chosen once, persisted to localStorage, and the
// single driver of magic-value seeding + field/button visibility.
//
//   - production: every magic-value field is hidden (nothing fake on screen);
//     real-ceremony (Touch ID) buttons are shown. Values come from real
//     ceremonies or guided flows.
//   - sandbox: magic-value fields are shown, seeded from `SANDBOX_MAGIC`, and
//     labeled with a "magic" pill; real-ceremony buttons are hidden.

import { MODE_STORAGE_KEY, SANDBOX_MAGIC, type Mode } from "./config";
import { el, maybeEl } from "./ui";

function readPersistedMode(): Mode {
  try {
    return localStorage.getItem(MODE_STORAGE_KEY) === "production"
      ? "production"
      : "sandbox";
  } catch {
    return "sandbox";
  }
}

function persistMode(mode: Mode): void {
  try {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  } catch {
    // localStorage unavailable (private mode etc.) — non-fatal, mode just
    // won't survive a reload.
  }
}

// Wrapper for a magic field, so the whole label+input+pill block hides in
// production. Looked up lazily by the field's input id.
function magicWrapper(id: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-magic-for="${id}"]`);
}

function ensurePill(id: string): void {
  const wrapper = magicWrapper(id);
  if (!wrapper || wrapper.querySelector(".magic-pill")) return;
  const label = wrapper.querySelector("label");
  if (!label) return;
  const pill = document.createElement("span");
  pill.className = "magic-pill";
  pill.textContent = "magic";
  pill.title = "Sandbox-only placeholder accepted by the sandbox backend.";
  label.appendChild(pill);
}

function applyMode(mode: Mode): void {
  const sandbox = mode === "sandbox";

  // Magic fields: seed + pill + show in sandbox; clear + hide in production.
  for (const [id, value] of Object.entries(SANDBOX_MAGIC)) {
    const wrapper = magicWrapper(id);
    if (wrapper) wrapper.style.display = sandbox ? "" : "none";
    const field = maybeEl<HTMLInputElement & HTMLTextAreaElement>(id);
    if (!field) continue;
    if (sandbox) {
      // Only seed when empty so we never stomp a value the user typed.
      if (!field.value) field.value = value;
      ensurePill(id);
    } else if (field.value === value) {
      // Drop a leftover magic value when switching to production so nothing
      // fake is submitted; leave any user-entered value untouched.
      field.value = "";
    }
  }

  // Real-ceremony (Touch ID) buttons: only meaningful in production.
  for (const btn of document.querySelectorAll<HTMLElement>("[data-ceremony]")) {
    btn.style.display = sandbox ? "none" : "";
  }

  // Sandbox-only legend (the magic-string list moved out of the mode <option>).
  const legend = maybeEl<HTMLElement>("sandbox-legend");
  if (legend) legend.style.display = sandbox ? "" : "none";
}

export function initMode(): void {
  const modeSelect = el<HTMLSelectElement>("mode-select");
  const initial = readPersistedMode();
  modeSelect.value = initial;
  applyMode(initial);
  modeSelect.addEventListener("change", () => {
    const mode: Mode =
      modeSelect.value === "production" ? "production" : "sandbox";
    persistMode(mode);
    applyMode(mode);
  });
}
