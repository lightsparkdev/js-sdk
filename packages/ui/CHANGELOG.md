# @lightsparkdev/ui

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
  - Remove generic typography arguments, using simpler/better inference via TypographyPropsWithoutContent type
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
