---
name: origin
description: Use when building UI with @lightsparkdev/origin design system components. Covers setup, component APIs, icons, tokens, and patterns.
---

# Origin Design System

Origin is a Figma-first React component library built on Base UI. It ships as raw TypeScript + SCSS source and requires a Next.js consumer with `transpilePackages`.

## Required Setup

### next.config.ts

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@lightsparkdev/origin'],
};

export default nextConfig;
```

### Global styles (layout.tsx or app entry)

```ts
import "@lightsparkdev/origin/styles.css";
```

### Advanced SCSS token imports (optional)

If you need Origin mixins in your own SCSS files, enable Sass package imports:

```ts
import type { NextConfig } from "next";
import * as sass from "sass";

const nextConfig: NextConfig = {
  transpilePackages: ['@lightsparkdev/origin'],
  sassOptions: {
    importers: [new sass.NodePackageImporter()],
  },
};

export default nextConfig;
```

### Webpack alias caveat

If adding a `resolve.alias` for `@lightsparkdev/origin`, always use the exact-match `$` suffix:

```js
config.resolve.alias['@lightsparkdev/origin$'] = '/path/to/src/index.ts';
```

Without `$`, the alias hijacks subpath imports and breaks `@lightsparkdev/origin/styles.css`.

### Fonts

Copy fonts from the package into your app's public directory:

```bash
cp -r node_modules/@lightsparkdev/origin/public/fonts/ public/fonts/
```

The `@font-face` declarations expect fonts served at `/fonts/`. Includes Suisse Intl (Regular 400, Book 450, Medium 500) and Suisse Int'l Mono.

### Dependencies

```
npm install @lightsparkdev/origin sass
```

`sass` is required (not optional) — every component imports SCSS modules.

## Imports

All components are exported from the package root:

```tsx
import { Button, Dialog, CentralIcon, Tabs } from '@lightsparkdev/origin';
```

## Component Patterns

### Compound components (namespace pattern)

These use dot notation for sub-components:

```tsx
<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Backdrop />
    <Dialog.Popup>
      <Dialog.Title>Title</Dialog.Title>
      <Dialog.Description>Body text</Dialog.Description>
      <Dialog.Close>Close</Dialog.Close>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
```

Compound components: Accordion, AlertDialog, Autocomplete, Breadcrumb, Card, Checkbox, Combobox, Command, ContextMenu, Dialog, Field, Fieldset, InputGroup, Menu, Menubar, Meter, NavigationMenu, Pagination, PhoneInput, Popover, Progress, Radio, Select, Sidebar, Table, Tabs, TextareaGroup, Toast, Tooltip.

### Simple components (direct props)

```tsx
<Button variant="filled" size="default" leadingIcon={<CentralIcon name="IconPlusSmall" size={16} />}>
  Create
</Button>
```

Simple components: ActionBar, Alert, Avatar, Badge, Button, ButtonGroup, Chip, ChipFilter, Form, Input, Item, Loader, Logo, Separator, Shortcut, Switch, Textarea, Toggle, ToggleGroup, VisuallyHidden.

### Chart (namespace export)

```tsx
import { Chart } from '@lightsparkdev/origin';

<Chart.Line data={data} series={series} />
<Chart.Bar data={data} series={series} />
<Chart.Pie segments={segments} />
<Chart.Sparkline data={data} />
<Chart.StackedArea data={data} series={series} />
<Chart.Composed data={data} series={series} />
<Chart.Live data={data} />
<Chart.Gauge value={75} />
<Chart.BarList items={items} />
```

## Button API

```tsx
interface ButtonProps {
  variant?: 'filled' | 'secondary' | 'outline' | 'ghost' | 'critical' | 'link';
  size?: 'default' | 'compact' | 'dense';
  loading?: boolean;
  loadingIndicator?: ReactNode;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  iconOnly?: boolean;
}
```

## Icons

Use `CentralIcon` with a `name` prop. All icon names are typed via `CentralIconName`.

```tsx
import { CentralIcon } from '@lightsparkdev/origin';

<CentralIcon name="IconArrowRight" size={24} color="currentColor" />
<CentralIcon name="IconCircleCheckFilled" size={16} />
```

Props: `name` (required), `size` (default 24), `color` (default "currentColor"), `className`, `style`.

Strokes scale proportionally with size (1.5px stroke at 24px becomes ~1px at 16px).

Common icon names by category:

- Arrows: IconArrow, IconArrowRight, IconArrowLeft, IconArrowUp, IconArrowDown, IconArrowBoxRight, IconArrowOutOfBox, IconRedirectArrow
- Chevrons: IconChevronRight, IconChevronLeft, IconChevronBottom, IconChevronTop, IconChevronDownSmall, IconChevronRightSmall
- Actions: IconPlusSmall, IconPlusLarge, IconMinusSmall, IconCrossSmall, IconCrossLarge, IconCheckmark2, IconPencil, IconTrashCanSimple, IconMagnifyingGlass2, IconFilter2
- Status: IconCircleCheck, IconCircleCheckFilled, IconCircleInfo, IconCircleInfoFilled, IconExclamationTriangle, IconExclamationTriangleFilled, IconCircleX
- UI: IconSettingsGear1, IconBell, IconEyeOpen, IconEyeSlash, IconLock, IconHome, IconGlobe2, IconLoader
- People: IconPeople2, IconUserDuo, IconUserGroup, IconUserAdded, IconPeopleCircle
- Brands: IconGithub, IconSlack, IconLinear, IconNotion, IconApple, IconClaudeai

## Design Tokens

Tokens are CSS custom properties defined in `_variables.scss`. Use them via `var()`:

- Spacing: `--spacing-xs` (8px), `--spacing-sm` (12px), `--spacing-md` (16px), `--spacing-lg` (20px), `--spacing-xl` (24px), `--spacing-2xl` (32px)
- Corner radius: `--corner-radius-xs`, `--corner-radius-sm` (6px), `--corner-radius-md`, `--corner-radius-lg`, `--corner-radius-full`
- Colors: `--surface-primary`, `--surface-secondary`, `--surface-hover`, `--text-primary`, `--text-secondary`, `--text-tertiary`, `--border-primary`, `--border-secondary`, `--border-critical`
- Typography: `--font-size-base` (14px), `--font-family-sans`, `--font-weight-book`, `--font-weight-medium`, `--font-weight-bold`

## SCSS Mixins

Available via `@use 'pkg:@lightsparkdev/origin/tokens/mixins' as *;`:

- `@include smooth-corners($radius)` — border-radius with future squircle support
- `@include surface-with-hover($base)` — background with hover overlay
- `@include input-focus` — standard input focus state (border + shadow)
- `@include input-critical` — error state (red border + pink shadow)
- `@include button-reset` — strip default button styles
- `@include visually-hidden` — accessible screen-reader-only content
- `@include text-label` — standard label text style

## Key Conventions

- All components use `'use client'` — they are client components
- Components are built on `@base-ui/react` primitives
- Styles use CSS Modules (`.module.scss` files) with SCSS
- Components accept standard HTML attributes via prop spreading
- Compound components use React context internally — sub-components must be nested under their Root
