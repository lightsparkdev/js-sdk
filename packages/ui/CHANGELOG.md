# @lightsparkdev/ui

## 1.1.8

### Patch Changes

- f5247b0: Adding additional nage dashboard designs and components

## 1.1.7

### Patch Changes

- 56d34fb: Adding new base nage design system and theming

## 1.1.6

### Patch Changes

- e9152bc: - Theme, typography updates
- Updated dependencies [e9152bc]
  - @lightsparkdev/core@1.4.3

## 1.1.5

### Patch Changes

- 7a1f6cc: - Theme updates

## 1.1.4

### Patch Changes

- 52a274f: - Updates to Button, CardForm, IconWithCircleBackground
  - Updates to colors, theme defaults
- Updated dependencies [52a274f]
  - @lightsparkdev/core@1.4.2

## 1.1.3

### Patch Changes

- 7ae2525: - Updates to BirthdayInput
  - Add icons
- Updated dependencies [7ae2525]
  - @lightsparkdev/core@1.4.1

## 1.1.2

### Patch Changes

- 5cfff96: - **BirthdayInput**
  - Dropped internal validity state; added `formatDateToText` hint formatter and “must be before today” validation.
  - **TextInput**
    - Introduced `success` & `contentError` props, `hideNonErrorsIfBlurred`, configurable `iconOffsets`, `iconStrokeWidths`.
  - **PhoneInput**
    - Added `onFocus` callback.
  - **QRCode**
    - Swapped in new `LogoMark` asset (vs. `FramedLogoOnCircle`), adjusted image sizing.
  - **Drawer & Modal**
    - Added `alignBottom` and `disableTouchMove` flags to support bottom-aligned, non-dismissable drawers.
  - **Button & Checkbox**
    - New kinds: `green37`, `gray99`, `white21`.
    - Added margin props (`mb`, `ml`, `mr`) for fine-grained spacing.
  - **CardForm**
    - Major refactor: dozens of new props (`aboveHeaderContent`, `graphicHeader`, `centeredContent`, `paddingX`, `contentMarginTop`, `formButtonTopMargin`, `selectMarginTop`, `smDontAdjustWidth`, etc.).
    - Extracted `CardFormHeadline`/`CenteredHeader`, wrapped forms in a `Flex` when using graphic headers.
  - **InputSubtext**
    - Now supports rich React-node `content`, distinguishes error vs. success styling, and respects “hide if blurred” logic.
  - **Toasts**
    - Added optional `type` (`error` | `success` | `info`) to color toast backgrounds.
  - **Hooks**
    - **`useFields`**: validator signature now `(value, fields?)`; added `matchesField` and `clabe` validators; smarter merge to prevent unnecessary rerenders.
    - **`useQueryParamBooleans`**: new hook for parsing multiple boolean query parameters at once.
  - **Icons**
    - Introduced dozens of new icons (e.g. `LogoMark`, `LightningBoltOutline`, `NonagonCheckmark`, `NubankLogo`) plus a full “central” icon set under `icons/central/`.
    - Standardized on a `PathProps` interface for configurable strokes.
  - **Styles & Theme**
    - **Colors**: added `gray35`, `gray7`, `white21`, `green37`, `blue32`, `linkLight`.
    - **Layout helper**: `buildStandardContentInset` gains an `smDontAdjustWidth` opt-out.
    - Tweaked `smHeaderLogoMarginLeft` (30px → 20px).
    - **Button themes**: added `white21`, `linkLight`, and `tertiary` kinds.
    - **CardForm theme**: now allows zero padding for new layout options.
- Updated dependencies [5cfff96]
  - @lightsparkdev/core@1.4.0

## 1.1.1

### Patch Changes

- b21b85e: \* Surface error name when the requester hits a graphQL error.
  - Update Turbo
  - Several small UI package improvements.
- Updated dependencies [b21b85e]
  - @lightsparkdev/core@1.3.1

## 1.1.0

### Minor Changes

- b1f160b: - New UI components & toggles

  - Introduced a new `MultiToggle` component (replaces or supplements the old `IconToggle`).
  - Extended the `Button` component to support new `gray`/`grayGradient` kinds and updated `forwardRef` usage for better integration.
  - CJS + ESM updates

    - Updated `package.json` with separate `index.cjs`/`index.js` exports and refined `"exports"` to define sub‐paths for ES/cjs usage.
    - Added a `.attw.json` and a `"package-types"` script (similar to `core`) for checking type correctness.

  - Additional icons & styling

    - Added a wide set of “central” icons (e.g. `CentralArrowLeft`, `CentralLoader`, `CentralTrashCan`, etc.).
    - Enhanced existing icons like `Satoshi` and `BitcoinB` with an optional `square` parameter.
    - Modified styling for `ButtonRow`, `DataManagerTable`, and `CardForm` to polish layout and filter UI.

  - `Link` refactor

    - Converted internal `LinkBase` to use `forwardRef`, allowing direct refs and improved usage.
    - Added a `blue` prop for quick color overrides, plus other small accessibility improvements.

  - Other tweaks
    - The `PhoneInput` component now supports `onBlur` and `error` props.
    - `Table` now accepts a `minHeight` prop.
    - `DataManagerTable` got a mobile-friendly filter UI (e.g., new modals for filter application and clearing).

### Patch Changes

- Updated dependencies [b1f160b]
  - @lightsparkdev/core@1.3.0

## 1.0.17

### Patch Changes

- a0aed49: - Testing release workflow

## 1.0.16

### Patch Changes

- 47733a2: - New icon, minor update to Flex component
- Updated dependencies [47733a2]
  - @lightsparkdev/core@1.2.8

## 1.0.15

### Patch Changes

- 56d359b: - Replaced Comma‑Separated Input with New NumberInput:
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

- Updated dependencies [56d359b]
  - @lightsparkdev/core@1.2.7

## 1.0.14

### Patch Changes

- 80c16c1: - Fix alignment of empty QR code
  - Fix fonts for some projects
  - Fix button themes and add quaternary button kind
- Updated dependencies [80c16c1]
  - @lightsparkdev/core@1.2.6

## 1.0.13

### Patch Changes

- e75da7c: - fix button backgrounds
  - fix secondary button theme
  - update button paddingYs
- e75da7c: - Allow any icon width with default set in Button
  - Allow "auto" as Button margin value
  - Add topLeftIcon prop to Modal
  - Update Modal to use setDefaultReactNodesTypography
  - Add onClick prop to typography components
  - Fix issue where onClick was always added to text nodes
  - Add CardFormNearButtonColumn for alternative close Button spacing in CardForm

## 1.0.12

### Patch Changes

- f148f37: - update ClipboardTextField
  - Fix line height typography
  - Enable single defaultTypography argument for setDefaultTypography
  - Move CardForm description typography to theme
  - Add typed iconProps to Icon
  - add padding and outline props to TextInput
  - add button active and hover colors
  - add Inter font for uma auth sdk themes
  - add floating Drawer kind and adjust closeButton size
  - add path props to most icons
  - add new icons
  - add icon object prop instead of icon name to Button
- Updated dependencies [f148f37]
  - @lightsparkdev/core@1.2.5

## 1.0.11

### Patch Changes

- 1a063b6: - PendingValue improvements
  - Fix circular dep issue with typography and toReactNodes utils
  - Add theming for CardForm
- Updated dependencies [1a063b6]
- Updated dependencies [1a063b6]
  - @lightsparkdev/core@1.2.4

## 1.0.10

### Patch Changes

- d61a209: - Rename some icons
- Updated dependencies [d61a209]
  - @lightsparkdev/core@1.2.3

## 1.0.9

### Patch Changes

- 07900ac: - Add several components and hooks
  - Upgrade Typescript to 5.6.2
  - Remove remaining generic type arguments for Routes - replaced with interface extension in downstream apps via NewRoutesType
  - Remove generic typography arguments, using simpler/better inference via TypographyPropsWithoutChildren type
  - Improve and simplify toReactNodes
  - Add CurrencyAmount as an available toReactNodes node
- Updated dependencies [07900ac]
  - @lightsparkdev/core@1.2.2

## 1.0.8

### Patch Changes

- 8f5673d: - add borderRadius to TextInput
  - allow any Modal width
  - add themes for UMA Auth SDK
  - consolidate typography props and styles
  - add tertiary Button kind and theme prop
  - fix missing Headline typography styles

## 1.0.7

### Patch Changes

- 9d2f78a: - Add onClick option for textNodes
  - Unify externalLink and filename props
- 9d2f78a: [ui]
  - remove gql and graphql-tag dependencies
  - add appendToElement prop to Modal
  - enable cjs code splitting to reduce package size
  - unify externalLink and filename props
- 9d2f78a: - Explicitly turn on experimental splitting support for CJS to reduce size of package from 25MB to 5MB

## 1.0.6

### Patch Changes

- Updated dependencies [b43609d]
  - @lightsparkdev/core@1.2.1

## 1.0.5

### Patch Changes

- c17a851: - Update colors
- Updated dependencies [c17a851]
  - @lightsparkdev/core@1.2.0

## 1.0.4

### Patch Changes

- 1028e1c: Adds numbers to Spacing in addition to px values, setDefaultReactNodesTypography

## 1.0.3

### Patch Changes

- e647962: Updates to Button, CodeInput, Drawer, Icon, Modal, Video

## 1.0.2

### Patch Changes

- 5b0016e: - Make default typography themeable for Button
- 5b0016e: - Add useDocumentTitle effect

## 1.0.1

### Patch Changes

- b855251: - Make Drawer fixed position

## 1.0.0

### Major Changes

- fda487d: - Move PageSectionNav to new UI component (#9971)
  - Move all PageSection components and Dropdown to public UI (#9979)
  - Allow Modal submit to be a link (#10066)
  - Move themes to own file. Simplify colors (#10167)
  - Move typography and tokens (#10172)
  - Improve theme typography tokens and add bridge tokens (#10189)
  - Move typography to components (#10178)
  - Update dependencies

### Patch Changes

- fda487d: - Remove unused icons (#10179)
  - Preload icons (#10182)
  - Fix invalid color string (#10231)
  - Add ChevronLeft icon (#10198)
  - Add InfoIconTooltip component and improve Tooltip (#10236)
  - Add Radio component (#10350)
  - Typography and theme improvements (#10331)
  - Add Banner component (#10262)
  - Consolidate specifying full precision for currencies (#1095)
  - Add NextLink as a ToReactNode type (#10432)
  - Button improvements (#10507)
  - Update to latest typography tokens (#10536)
  - Add transformGQLName (#10592)
  - ToReactNodes improvements and tests (#10562)
  - Add icons (#10572)
  - Provide icon color inversion when color is specified (#10630)
  - Add PhoneInput component (#10702)
  - Add useDebounce hook (#10741)
  - Add common Drawer component, optionally use in Modal (#10819)
- Updated dependencies [fda487d]
  - @lightsparkdev/core@1.1.0

## 0.0.13

### Patch Changes

- baeccd9: - Add StatusIndicator
- 9b3896a: - Remove types/utils. Use equivalent imports from @lightsparkdev/core instead
- Updated dependencies [baeccd9]
  - @lightsparkdev/core@1.0.22

## 0.0.12

### Patch Changes

- 15d0720: - Add CodeBlock
- 15d0720: - Consolidate type utils from ui to core
- Updated dependencies [15d0720]
- Updated dependencies [15d0720]
  - @lightsparkdev/core@1.0.21

## 0.0.11

### Patch Changes

- Updated dependencies [b47bc60]
  - @lightsparkdev/core@1.0.20

## 0.0.10

### Patch Changes

- Updated dependencies [330f913]
  - @lightsparkdev/core@1.0.19

## 0.0.9

### Patch Changes

- 79f9f9f: - Fix ButtonRow inset
  - Add CardPage
  - Add GradientCardHeader
  - Default cancelText value for Modal and simplify inset refs
- 062bf8a: - Add active prop to textInputStyle for indicating active style in response to external factors
- 062bf8a: [js] Add engines field to all packages to indicate supported NodeJS versions
- Updated dependencies [062bf8a]
  - @lightsparkdev/core@1.0.18

## 0.0.8

### Patch Changes

- df7bd3f: - Updates to Tooltip
- 20fb70b: - Add Badge, FileInput, Tooltip, Pill
  - Single character Button should be round
  - Allow "divider" in ButtonRow
- Updated dependencies [20fb70b]
  - @lightsparkdev/core@1.0.17

## 0.0.7

### Patch Changes

- Updated dependencies [cb28f0e]
  - @lightsparkdev/core@1.0.16

## 0.0.6

### Patch Changes

- 66e76d3: - Avoid requiring babel transform to process selectors - convert selectors to strings instead with new select util.
  - withTheme util
  - standardBorderRadius util
  - Fix issue where ProgressBar state is not properly reset
  - scroll-behavior: smooth applied globally
- Updated dependencies [66e76d3]
  - @lightsparkdev/core@1.0.15

## 0.0.5

### Patch Changes

- Updated dependencies [b9dd0c2]
  - @lightsparkdev/core@1.0.14

## 0.0.4

### Patch Changes

- Updated dependencies [da1e0b2]
  - @lightsparkdev/core@1.0.13

## 0.0.3

### Patch Changes

- e77aa92: - Add spacing tokens for every component in Article
  - Fix modal focus on previous focused element when closed

## 0.0.2

### Patch Changes

- 35513da: Upgrade dependencies
- 35513da: [ui] Fix getHeadlineText return
- Updated dependencies [35513da]
  - @lightsparkdev/core@1.0.12

## 0.0.1

### Patch Changes

- 43dc882: Upgrade to Typescript 5, lint config changes
- Updated dependencies [43dc882]
  - @lightsparkdev/core@1.0.11
