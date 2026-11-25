---
"@lightsparkdev/origin": patch
---

SecretInput: default `autoComplete` to `off` to ask browsers not to autofill or save secrets — best effort, some password managers ignore it (callers can override) — disable auto-correct, auto-capitalize, and spellcheck while the secret is revealed, and remask when a native `fieldset[disabled]` ancestor disables the input.
