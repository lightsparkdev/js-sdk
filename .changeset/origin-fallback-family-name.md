---
"@lightsparkdev/origin": patch
"@lightsparkdev/ui": patch
---

Rename the static fallback font family "Suisse Intl Arabic" to
"Suisse Intl Extended". One-string rename applied consistently to the
@font-face declarations and every sans stack that references the family;
no behavior change, glyph coverage unchanged.
