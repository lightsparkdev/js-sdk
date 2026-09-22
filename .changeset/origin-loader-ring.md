---
"@lightsparkdev/origin": patch
---

Loader: add a `ring` variant — a circular track (`--border-secondary`) with a rotating quarter-arc indicator (`--stroke-primary`), 2px stroke, round caps, 24x24 reference geometry. Optional `size` prop (ring only) scales the ring for small contexts such as status badges; strokes scale proportionally. Defaults are unchanged: existing consumers keep the 3-dot pulse. The rotation respects `prefers-reduced-motion`.
