---
"@lightsparkdev/ui": patch
---

- Replaced Comma‑Separated Input with New NumberInput:
  – The legacy CommaNumberInput component was removed and replaced by a more robust NumberInput component (see new file packages/ui/src/components/NumberInput.tsx). Associated test files and component references have been updated accordingly.

- Badge Component Enhancement:
  – In packages/ui/src/components/Badge.tsx, the allowed badge kinds were expanded to include a new "success" variant. The default typography color logic was modified so that a badge of kind "success" now renders with white text, while preserving existing behavior for "danger" and "default".

- New BirthdayInput Component:
  – A new component (packages/ui/src/components/BirthdayInput.tsx) has been added to support formatted birthday input with validation and on‑blur formatting using dayjs.

- Button Component Updates:
  – The Button component (in packages/ui/src/components/Button.tsx) was refactored to detect when a button is a single‑character or icon‑only button. Two new variants—roundSingleChar and roundIcon—were introduced, with adjustments to padding (using new paddingX values) and forced high border‑radius (set to 999 or 100% in some cases) for a circular appearance.

- ButtonRow and CardForm Refinements:
  – In packages/ui/src/components/ButtonRow.tsx, a new prop bottomBorder was added so that a divider can be conditionally rendered.
  – The CardForm component’s spacing was updated (now using theme spacing tokens instead of hardcoded pixel values).

- CurrencyAmount Component Improvements:
  – In packages/ui/src/components/CurrencyAmount.tsx, the logic for determining the display unit was refined so that if no explicit display unit is provided, the component falls back to the unit on the underlying currency amount. Conditional rendering of the currency icon has also been improved.

- DataManagerTable & Filter Enhancements:
  – A new CurrencyFilter component was added (packages/ui/src/components/DataManagerTable/CurrencyFilter.tsx) to allow filtering by currency amounts.
  – Several DataManagerTable components (such as DateWidget and Popover) were updated to include properties like a minimum date and, for Popover on small screens, to display via a Modal.

- Expanded Icon Library & Styling Updates:
  – Many new icons have been added or updated (for example, ArrowCircleCutout, ArrowLeftCircleCutout, CloudUpload, Contrast, EmailPlus, EnvelopePlus, FlagUSA, Globe, LogoIssuance, MessageBubble, Messenger, Moon, PaperPlaneRounder, PersonPlus, ReceiptCheck, SettingsSlider, ShieldCheckLite, Snowflake, Spark, Sun, UmaPaymentLoadingSpinner, Wallet, WhatsApp, and ZapLite).
  – Package dependencies were updated in packages/ui/package.json (e.g. adding @tanstack/react-table and bumping @uma-sdk/core to ^1.2.3).
  – Several style and theme files were updated, including new theme defaults for buttons (to support the new round button variants) and refinements in global typography and colors.

- Miscellaneous Refactoring:
  – Utility functions (such as in packages/ui/src/utils/strings.tsx) were enhanced (adding functions like removeNonDigit and addCommasToVariableDecimal).
  – The Flex component (packages/ui/src/components/Flex.tsx) now accepts additional margin/padding props for more granular layout control.
  – Updates to the router and type guard utilities (e.g. adding an isReactNode helper) have improved robustness.
