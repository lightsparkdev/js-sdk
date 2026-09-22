---
"@lightsparkdev/origin": patch
---

Make DataTable content columns use native automatic sizing while preserving
explicit pixel width hints for structural columns, and add opt-in bounded
`Table.CellContent` disclosure for open-ended text. Initial loads now use a
table-shaped shell with capped loading bars, overflow-safe minimum loading
columns, canonical column sizing, and a transient one-shot opacity reveal,
while populated rows remain mounted during warm loading.
