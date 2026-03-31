# Changelog

## 0.13.6 → 0.14.0 (2026-03-05)

- Added new chart components to the design system
- Added new Drawer component
- Introduced new design tokens
- Added Skeleton component for loading states


## 0.13.5 → 0.13.6 (2026-02-27)

- Chart grid lines are now more visible (opacity 0.06 → 0.18)
- All chart axis padding is now measurement-based — labels adapt to formatted content instead of using a fixed 48px
- Y-axis tick count scales dynamically with chart height
- X-axis label thinning applied consistently across all chart types
- Horizontal BarChart value axis uses canvas-measured label widths for spacing
- ComposedChart dual-axis right padding is now dynamic
- Uptime: new `label` prop for an always-visible resting label (replaces `tooltip`)
- Uptime: hover indicator changed from opacity dimming to subtle height increase
- **Breaking:** `Chart.Uptime` `tooltip` prop removed, replaced by `label` and `labelStatus`


## 0.13.4 → 0.13.5 (2026-02-27)

- Internal maintenance release (no user-facing changes)
