---
"@lightsparkdev/origin": minor
---

- ChipFilter: `value` now accepts ReactNode; new `valueLabel` prop describes non-string values in the dismiss button's accessible label (a dev-mode warning fires when omitted)
- ChipFilter: interactive value triggers must opt in to receive the segment-takeover styling (hover/focus affordances, padding). Buttons nested in `value` without opting in are no longer restyled
- New `ChipFilter.Trigger` compound part (also exported as `ChipFilterTrigger`) is the recommended way to opt in — it renders a button carrying the `data-chip-trigger` attribute and composes with menu/popover triggers via its `render` prop. It inherits the parent `ChipFilter`'s `disabled` state, rendering a truly disabled button (removed from the tab order, not just visually dimmed). Setting the `data-chip-trigger` attribute directly keeps working
- ChipFilter: numeric `value` (number/bigint) now reads into the dismiss button's accessible label without needing `valueLabel`; an explicit empty `valueLabel` no longer warns or leaves a trailing space in the label
- Dev-mode warnings (ChipFilter missing `valueLabel`, unknown CentralIcon name) now fire once per distinct message instead of on every render
- New `Field.LabelSuffix` compound part for trailing label content such as "(optional)"; spacing lives on the suffix slot
- Field label, description, and error slots now lay out as block text instead of flex — compositions that relied on the label's 4px flex gap should use `Field.LabelSuffix` (or explicit whitespace)
- Chip/ChipFilter dismiss icon renders at 16px (was 10px sm / 12px md)
- CentralIcon no longer emits an inline `color: currentColor` style by default, so stylesheet rules can reach icon svgs
- Token alignment sweep across Breadcrumb, Card, Chart, Chip, Combobox, DatePicker, Dialog, Menu, NavigationMenu, and Shortcut: icon-only and hairline elements now use `icon-*`/`border-*`/`surface-*` tokens (visible dark-mode deltas on icon-only controls)
- Chart grid and cursor lines now use alpha-carrying border tokens; `--chart-grid-opacity` and `--chart-cursor-opacity` default to 1 and multiply the token's built-in alpha — consumers who set these variables should re-check their values to avoid double-dimming
- Table now uses `border-collapse: separate` (with `border-spacing: 0`) instead of `collapse`. Chromium snaps collapsed-model borders to whole device pixels, so the 0.5px hairline header/row borders painted at double weight; under the separate model they render at the token width, and borders stay attached to header cells consumers pin with `position: sticky`. All Table borders are bottom-only so no edges double. Consumers who layered borders on Table cells or rows expecting adjacent edges to merge, or who set `border` on `tr`/`thead`/`tbody` (which only paints in the collapsed model), should re-check those styles; forced `border-collapse: separate` overrides on Table wrappers are now redundant
