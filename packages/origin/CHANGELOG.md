# Changelog

## 0.15.0

### Minor Changes

- 96aabc1: Adopt the Suisse Intl variable font (wght 300-700, baked metrics,
  single-story "a") as a core + ext `unicode-range` split, with Arabic served
  by a separate static fallback family.

  The "Suisse Intl" family (and the legacy `SuisseIntl` alias) now has two
  faces: `SuisseIntlVF-wght300-700-core.woff2` (Basic Latin, Latin-1, General
  Punctuation, Currency Symbols, TM, minus, plus the characters shipped UI
  text renders — Č/č, İ/ı, the arrows ←↑→↓↗↙, ≈, ≤/≥ — ~171 KiB) and
  `SuisseIntlVF-wght300-700-ext.woff2` (Latin Extended, Cyrillic, Vietnamese
  and the rest — ~194 KiB). The two unicode-range lists partition the charset
  with zero overlap, so every shipped UI page downloads only the core file;
  ext loads only for runtime foreign-script data. Both
  faces declare the identical `font-weight: 300 700` span; never add an
  exact-weight or differently-spanned face to these families (Chromium falls
  back to Arial for the whole family — see the hard-rules block in Origin's
  `_fonts.scss`).

  The per-weight sans statics return as the "Suisse Intl Extended" family (400
  Regular, 450 Book, 500 Medium, 600 Semibold, 700 Bold; plus 300 Light in the
  legacy ui declarations), with no unicode-range. The sans stacks
  (`--font-family-sans` in Origin, the legacy ui typography tokens and global
  styles) list it immediately after "Suisse Intl", so browsers fall through
  per character for Arabic (the VF carries no Arabic glyphs). The statics carry
  the same baked metrics as the VF (hhea and typo 935/-210 at 1000 UPM,
  `USE_TYPO_METRICS`, win metrics kept as clipping bounds), so mixed
  Arabic/Latin lines share identical vertical metrics. Mono statics are
  unchanged.

  The ui theme's `typography` object gains `cssFontFamilies`: `main` expanded
  to the full CSS stack (`SuisseIntl, "Suisse Intl Extended"` on SuisseIntl
  themes) for direct `font-family` emission. `fontFamilies.main` stays the
  bare family key for theme comparisons.

  The VF carries centered vertical metrics baked in: hhea and OS/2 typo
  ascent/descent are 1870/-420 at 2000 UPM — the same 21% descent proportions
  as the rebaked statics this replaces (935/-210 at 1000 UPM) — so line boxes
  are identical to the rebaked statics. The CSS
  `ascent-override`/`descent-override`/`line-gap-override` hacks stay deleted.
  `line-height: normal` is 1.145em (was 1.0 under the old overrides),
  affecting only text with no explicit line-height.

  The single-story "a" is now the default glyph at the font level (the `salt`
  alternates — "a" plus its 22 accented forms — are baked into the character
  map), so `font-feature-settings: "salt" 1` is removed from Origin's reset,
  document styles, and Shortcut. Existing `"salt"` settings in app CSS become
  no-ops against the VF. Weight interpolation is available for animation
  (e.g. Stepper) via `font-variation-settings: "wght" ...`.

  The shared vite `buildConfig` pins `build.cssMinify: "esbuild"`: Lightning
  CSS rewrites unicode-range values (U+0000-00FF becomes U+??), which changes
  which faces match; esbuild preserves them verbatim.

  **Upgrade note:** apps that copy Origin's fonts must re-copy
  `node_modules/@lightsparkdev/origin/public/fonts/` when upgrading: the
  single `SuisseIntlVF.woff2` from the previous head is replaced by the
  core/ext pair, and the per-weight `SuisseIntl-*.woff2` statics are back (now
  serving the Arabic fallback family). Apps on the legacy ui package's
  `SuisseIntl` theme must serve the core/ext pair plus the statics (including
  `SuisseIntl-Light.woff2`) from their `/fonts/` path.

  Coupled fix: the Alert icon's 1px top pad becomes 2px, the geometric center
  for a 16px icon in the 20px title line now that the font no longer rides high.

- c4ca500: - ChipFilter: `value` now accepts ReactNode; new `valueLabel` prop describes non-string values in the dismiss button's accessible label (a dev-mode warning fires when omitted)
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

### Patch Changes

- d4d57aa: Add a `render` prop to `Breadcrumb.Link` via Base UI's `useRender`, so consumers can swap the default anchor for a router-aware link component (e.g. `render={<Link to="/settings" />}`). Props merge per Base UI semantics: classNames join, event handlers compose, refs merge.
- 9a2a02d: FilterBar: add an opt-in pure callback for normalizing Custom date range edits through controlled draft state before Apply.
- bf979f3: FilterBar: close the Add Filter menu after applying an enum option while keeping multi-select pill editors open for consecutive changes.
- 46fd64a: Toast: add separate Default, Compact, and Pill layouts while preserving the semantic variant API. Harden responsive sizing, semantic icons, limited-toast overflow handling, swipe motion, and public Toast type exports.
- 70eed19: Fix `Radio` and `Checkbox` option styling in field compositions: item labels now use regular weight (400) so options read as body text rather than emphasized, and default-variant `Radio.Group` / `Checkbox.Group` containers carry the same horizontal inset as field label/description text so controls align with the legend above them. Card-variant groups keep the full field width so card borders stay aligned with sibling inputs.
- 26c98d7: Add a refined dark theme across Origin tokens and components.
- 72c333e: Add `size` prop to Item (`'default' | 'compact'`), following the `data-size` styling convention Table.Root uses. Compact tightens block padding, inline-start padding, the title/description gap, and drops the title/description one step on the type scale for dense lists such as transaction rows. `ItemSize` is exported alongside `ItemProps`.
- 0d1bfdb: FilterBar: add opt-in application-ordered pills with validated URL-backed order persistence while preserving descriptor order by default.
- 32444a2: Add optional `label` slot to Item, rendered inline after the title per the Figma spec. Accepts any ReactNode (typically a Badge) with a small gap after the title text; description stays on its own line below.
- 45e7aa4: Alert: add optional responsive trailing content and use a calm neutral shell
  across semantic variants while preserving severity through icon treatment.
- 15ff7b4: Keep a multi-select `Combobox` at the standard 36px control height when chips
  are present. A 24px chip plus the default 6px block padding made a one-row
  chip field 38px, so the control grew 2px the moment the first chip was
  selected; the input wrapper now tightens its block padding under `:has(.chips)`.
- c9ff540: Extend `Command` with controlled input, loading and empty states, drill-in
  navigation, cancellable open changes, a `container` prop for custom portal
  parents, and default footer hints. The popup now freezes its rendered
  content (inert to activation) during the exit transition and resets on
  open (notifying `onInputValueChange` when uncontrolled), so closing never
  repaints the palette and a reopen that interrupts the exit shows live,
  clean state. Improve screen-reader support with persistent
  empty/status live regions, explicit dialog and input names (the input
  name is customizable via `inputAriaLabel`, independent of the visual
  placeholder), and a visually hidden close control. Update its responsive presentation and
  add `IconReceiptBill` and `IconArrowCornerDownLeft`.

  `Shortcut` keys now accept React nodes for icon-based key hints.

- 88e2942: PhoneInput: the country Select no longer inherits the surrounding Field's form name. A `Field.Root` wrapped around the whole phone input used to propagate the phone `Input`'s `name` onto the Select's hidden serialization input, submitting a duplicate, earlier-in-DOM entry under the phone field's name (so `FormData.get()` returned the country value). `CountrySelect` now establishes its own field boundary; its hidden input is nameless by default and serializes under its own key only when `name` is passed to `CountrySelect`.
- 5fd06b8: Make DataTable content columns use native automatic sizing while preserving
  explicit pixel width hints for structural columns, and add opt-in bounded
  `Table.CellContent` disclosure for open-ended text. Initial loads now use a
  table-shaped shell with capped loading bars, overflow-safe minimum loading
  columns, canonical column sizing, and a transient one-shot opacity reveal,
  while populated rows remain mounted during warm loading.
- 67d0936: Add DataTable and FilterBar with composed cursor pagination, retry, error, and
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
- f4cd337: Add a noninteractive truncated-cell presentation for DataTable columns that
  retains the shared intrinsic-width cap without adding disclosure controls.
- f9d2662: DatePicker: preserve the opposite range endpoint when a focused date or time input is updated from the calendar.
- a636638: Add consumer-supplied DatePicker presets, explicit mode and granularity props, controlled partial-range previews, and opt-in FilterBar integration. Presets provide isolated typeahead text and optional disabled reasons. Invalid preset or typed drafts participate in form validity, preserve inline errors until replaced, and expose first-invalid focus actions for composed Apply boundaries. Calendar keyboard navigation now skips unavailable dates and preserves one visible roving tab stop. Direct DatePicker consumers configure mode and granularity through Root props, while FilterBar descriptors declare one fixed editor shape without runtime switches. Canonical compositions place the calendar first, date-time input rows let date fields fill while localized time fields stay compact, and UTC date-time inputs show an inline timezone suffix.
- 88ff172: Keep viewport-composed dialogs above their backdrop and long content reachable with a fixed header and footer.
- 01a65c1: Rename the static fallback font family "Suisse Intl Arabic" to
  "Suisse Intl Extended". One-string rename applied consistently to the
  @font-face declarations and every sans stack that references the family;
  no behavior change, glyph coverage unchanged.
- ae768aa: Field: add an optional `size` prop to `Field.Label`. `size="md"` renders the larger 14px/20px label text style; the default (`"sm"`, 12px/16px) is unchanged.
- 125f1a6: FilterBar: add an explicit date descriptor opt-in that presents configured DatePicker presets as Add Filter shortcuts, applies valid presets immediately, and keeps Custom on the full editor flow.
- 6b79cfc: FilterBar: provide Custom date range normalizers with the previous range and edit-time instant.
- 9cfeeee: InputGroup: add an explicit `iconOnly` option to `InputGroup.Button` for compact, accessible icon actions.
- cc3eec3: Style `Field.LabelSuffix` as `body-sm` in `--text-secondary` so a suffix like
  "(optional)" reads as an aside: regular weight and secondary color instead of
  the label's book weight and primary color, matching the treatment of
  `Field.Description`.
- d5b072f: Loader: add a `ring` variant — a circular track (`--border-secondary`) with a rotating quarter-arc indicator (`--stroke-primary`), 2px stroke, round caps, 24x24 reference geometry. Optional `size` prop (ring only) scales the ring for small contexts such as status badges; strokes scale proportionally. Defaults are unchanged: existing consumers keep the 3-dot pulse. The rotation respects `prefers-reduced-motion`.
- 97ab715: Menu: bound long menus to available space and allow vertical scrolling.
- c504ae5: Fix Pagination's useRender calls to pass a single merged props object per Base UI's contract.
- bc56549: PhoneInput: add `PhoneInput.LockedCountry`, a static leading cap rendered in place of `CountrySelect` when the country cannot be changed. It shows the flag and dial code with no chevron and no interaction states — not a select, not focusable, no popup semantics. Matches the trigger's typography, height, and border treatment, with 12px right padding in place of the trigger's chevron slot.
- 3458a11: Quiet placeholder text to `--text-tertiary` in every input component (Input,
  Textarea, InputGroup, TextareaGroup, Combobox, Autocomplete, Command,
  PhoneInput, OTPField, and Select's `[data-placeholder]` state). Placeholders
  previously shared `--text-secondary` with helper text, so sample answers read
  as loudly as real guidance; a placeholder is never content, so every component
  moves down one step with no exceptions. The color now lives in a single
  `input-placeholder` mixin alongside the other input-state mixins.
- 7adc4a3: Stepper: add a vertical progress stepper with numbered markers, nested
  substeps, per-step completion status, and controlled current-step
  selection.
- 0731be3: Set `text-wrap: pretty` as a global typography default, inherited from `body` in both the public and scoped stylesheets. Text across all components wraps with better rag and fewer orphan words. Browsers without support ignore the declaration and keep their default wrapping.
- f5bfc9e: Toast: add top and bottom viewport placement with matching stack and transition direction, add a token-styled `Toast.Link` that composes with router links, and isolate title and description spacing from global element margins.
- 9e2502d: Fix Checkbox, Radio, and Switch being unclickable inside a Drawer. Base UI renders these three controls as a `<span>`, and its swipe-dismiss gesture only skips native interactive elements, so a pointer press on one started a drawer swipe, captured the pointer, and the click never reached the control. All three now set `data-base-ui-swipe-ignore`.
- 5ddc7fd: Add OTPField component wrapping Base UI's OTP Field primitive. Compound parts (Root, Input, Separator) with 6-digit numeric default, configurable length, controlled and uncontrolled value, onValueComplete callback, Field integration for label/error state, and automatic per-slot aria-labels.

## 0.14.3

### Patch Changes

- d1d0682: - Fix form control backgrounds so inputs, textareas, selects, and autocompletes inherit the surrounding surface.
  - Fix Combobox multi-select chip layout so selected chips and the input wrap together with consistent spacing.

## 0.14.2

### Patch Changes

- 5ef5b36: - Add initialWidth prop to Origin charts for SSR support

## 0.14.1

### Patch Changes

- d155a43: - Migrate Origin Design System into the monorepo as `@lightsparkdev/origin`
  - Tighten chart datum typing for stricter type safety

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
