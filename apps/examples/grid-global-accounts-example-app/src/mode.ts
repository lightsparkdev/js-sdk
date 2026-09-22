// Sandbox / production mode: the chosen mode is persisted to localStorage and
// drives magic-value seeding + field visibility.
//
//   - production: every magic-value field is hidden (nothing fake on screen);
//     real-ceremony (Touch ID) buttons are shown. Values come from real
//     ceremonies or guided flows.
//   - sandbox: magic-value fields are shown, seeded from `SANDBOX_MAGIC`;
//     real-ceremony buttons are hidden.
//
// DOM-free: this module owns the *mode value* (persistence + magic-value
// lookups) only. The React layer decides what to show/seed based on the mode it
// reads here — no input elements are touched.

import { MODE_STORAGE_KEY, SANDBOX_MAGIC, type Mode } from "./config";

export function readPersistedMode(): Mode {
  try {
    return localStorage.getItem(MODE_STORAGE_KEY) === "production"
      ? "production"
      : "sandbox";
  } catch {
    return "sandbox";
  }
}

export function persistMode(mode: Mode): void {
  try {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  } catch {
    // localStorage unavailable (private mode etc.) — non-fatal, mode just
    // won't survive a reload.
  }
}

// The sandbox magic value seeded into a given field, if any. In sandbox mode
// the React layer pre-fills empty magic fields with this; in production these
// fields are hidden so nothing fake is ever submitted.
export function sandboxMagicFor(fieldId: string): string | undefined {
  return SANDBOX_MAGIC[fieldId];
}
