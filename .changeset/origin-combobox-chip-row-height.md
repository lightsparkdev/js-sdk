---
"@lightsparkdev/origin": patch
---

Keep a multi-select `Combobox` at the standard 36px control height when chips
are present. A 24px chip plus the default 6px block padding made a one-row
chip field 38px, so the control grew 2px the moment the first chip was
selected; the input wrapper now tightens its block padding under `:has(.chips)`.
