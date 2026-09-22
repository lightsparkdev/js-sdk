---
"@lightsparkdev/origin": patch
---

Add DataTable and FilterBar with composed cursor pagination, retry, error, and
empty states. DataTable.Root now owns settled-page retention, count/range
semantics, loading skeleton defaults, and the standard pagination footer through
the provider-free `useCursorTablePagination` controller.
Row activation factories now own secure `_blank` opening while consumers retain
typed navigation and href resolution.
DataTable now derives its caption and pagination landmark from one required
Root label and renders `-` for nullish cell results. FilterBar adds singular,
lossless string state, repeated enum URL values with legacy hydration, and a
standard childless composition. Provider-free factories configure URL-backed
filters, updateable external filter-action registration, and row activation.
Origin also exports neutral enum-label and Intl date-time formatters.
DatePicker adds `timeZone` (`"local" | "UTC"`) and controlled partial-range
editing through `rangeDraft` (`DateRangeDraft | null`) and
`onRangeDraftChange` (`(value: DateRangeDraft) => void`).
