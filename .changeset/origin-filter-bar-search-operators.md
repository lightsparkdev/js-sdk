---
"@lightsparkdev/origin": patch
---

FilterBar: add an option search box for `searchable` enum filters (with `keywords`), "is" / "is not" `operators` for enum filters built from `FILTER_OPERATORS`, `addMenuSeparatorBefore` dividers, and an opt-in `discardEmptyFilters` that removes a filter left empty when its editor closes. With it, URL-backed filters also keep empty filters out of the URL until they have a value. Multi-select menus stay open while picking. Chip: `operator` accepts any React node, with `operatorLabel` naming it for screen readers.
