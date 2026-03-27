# Origin - Project Context

> **Purpose**: This document provides full context for AI assistants to continue work on this project.

---

## Vision & Approach

Origin is a **complete rewrite** of the Origin Design System, shifting from a complex spec-generation pipeline to a **simpler, designer-first workflow**.

### Core Philosophy

1. **Base UI for Behavior** — Use [Base UI](https://base-ui.com) unstyled components for accessibility and interaction logic
2. **Figma for Visuals** — Extract CSS directly from Figma Dev Mode (already tokenized)
3. **Minimal Transformation** — Reduce pipeline complexity to minimize drift between design and code
4. **Designer-First** — The workflow is optimized for a designer who codes, not an engineer who designs

### The Old Problem (v1)

- Complex MCP spec-generation pipeline with many transformation steps
- Design drift accumulated at each transformation layer
- Heavy engineering overhead for maintaining generators
- Memory/context issues across sessions

### The New Solution (v2)

```
Figma Design → Figma Lint Plugin → Base UI Component + Figma CSS → Done
```

---

## What's Been Built

### 1. Base UI Lint Plugin (`tools/base-ui-lint/`)

A Figma plugin that validates component structures against Base UI's expected anatomy.

**Features:**
- ✅ 37 component rules (100% Base UI coverage)
- ✅ Detects missing required parts
- ✅ Suggests renames for aliased names (e.g., "Content" → "Panel")
- ✅ Auto-fix applies renames across all variants
- ✅ Only matches structural nodes (frames/groups), not text nodes

**Usage:**
1. Select a component in Figma
2. Run the plugin
3. Review issues and click "Fix All" to auto-rename

**Building the plugin:**
```bash
cd tools/base-ui-lint
npm install
npm run build
```
Then import `tools/base-ui-lint/manifest.json` in Figma → Plugins → Development.

**Rule files:** `tools/base-ui-lint/rules/*.json`

### 2. Token System

Tokens are exported natively from Figma Variables in W3C DTCG format.

**Token sources:**
- `tokens/figma/origin/` — Origin design system tokens (Dark, Light, Value)
- `tokens/figma/baseline/` — Baseline/primitive tokens

**Build tokens:**
```bash
npm run tokens:build
```

Outputs to `src/tokens/_variables.scss`.

### 3. Icon System (`src/components/Icon/`)

213 vendored icons from Central Icons. Icons are extracted from `@central-icons-react` packages and committed to the repo, so consumers do not need a `CENTRAL_LICENSE_KEY`.

**Key files:**
- `CentralIcon.tsx` — Main component
- `icon-registry.ts` — Generated registry (do not edit directly)
- `icons/` — Vendored icon `.mjs` and `.d.ts` files
- `scripts/extract-icons.mjs` — Single source of truth for which icons to vendor

**Usage:**
```tsx
import { CentralIcon } from '@/components/Icon';

<CentralIcon name="IconHome" size={24} />
<CentralIcon name="IconChevronDown" size={16} color="var(--text-secondary)" />
```

**Adding/updating icons:**
```bash
npm run icons:extract   # Regenerate vendored files + registry
```

Edit the `SECTIONS` array in `scripts/extract-icons.mjs` to add new icons. The script copies files from `node_modules`, strips sourcemaps, generates `icon-registry.ts`, and validates.

**Packages (devDependencies — only needed for extraction):**
- `@central-icons-react/round-outlined-radius-3-stroke-1.5`
- `@central-icons-react/round-filled-radius-3-stroke-1.5`
- `@central-icons-react/round-outlined-radius-0-stroke-1.5`

### 4. Analytics Context (`src/components/Analytics/`)

Opt-in interaction tracking for all interactive primitives. Products provide a single `AnalyticsHandler` via `AnalyticsProvider`; components emit structured `InteractionInfo` when an `analyticsName` prop is set.

**Shared hooks:**
- `useTrackedCallback` — wraps click, change, submit, select callbacks
- `useTrackedOpenChange` — wraps overlay open/close with duration tracking

**Instrumented components:** Button, Form, Dialog, AlertDialog, Menu, Popover, Command, ContextMenu, Select, Switch, Checkbox.Group, Radio.Group, Tabs, Toggle, ToggleGroup, Combobox, Accordion, Table, NavigationMenu, Sidebar, Pagination, Menu.Item, Command.Item

If no provider or `analyticsName` is present, the hooks are no-ops — zero cost for products that don't use analytics.

---

## Project Structure

```
origin/
├── src/
│   ├── app/                    # Next.js app
│   │   ├── globals.scss        # Global styles + icon stroke CSS
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── Icon/               # CentralIcon system
│   │       ├── icons/          # Vendored icon files (generated)
│   │       └── icon-registry.ts # Icon registry (generated)
│   ├── lib/
│   │   └── dev-warn.ts         # Dev-only warning utility
│   └── tokens/
│       ├── _variables.scss     # Generated from Figma tokens
│       └── _mixins.scss        # SCSS mixins
├── tokens/
│   └── figma/
│       ├── origin/             # Origin tokens (Dark, Light, Value)
│       └── baseline/           # Baseline tokens
├── tools/
│   └── base-ui-lint/           # Figma lint plugin
│       ├── rules/              # 37 component rule files
│       ├── src/                # Plugin source
│       └── dist/               # Built plugin
├── scripts/
│   ├── build-tokens.js         # Token transformation script
│   └── extract-icons.mjs       # Icon vendoring + registry generation
└── CONTEXT.md                  # This file
```

---

## Key Decisions Made

### 1. Base UI Over Custom Implementation

Base UI provides:
- Accessibility built-in
- Keyboard navigation
- ARIA attributes
- Focus management
- Compound component patterns

We style Base UI components with Figma-extracted CSS.

### 2. Vendored Icon Registry

Icons are vendored from `@central-icons-react` into the repo:
- Consumers do not need a `CENTRAL_LICENSE_KEY` to install Origin
- `scripts/extract-icons.mjs` is the single source of truth for which icons to include
- `icon-registry.ts` and `icons/` are generated — do not edit directly
- Tree-shaking still removes unused icons from bundle

### 3. Figma Structure = Base UI Structure

The lint plugin ensures Figma components match Base UI's anatomy:
- `Accordion.Item` in Figma → `Accordion.Item` in code
- `Panel` frame in Figma → `Accordion.Panel` in code

This makes the Figma-to-code translation trivial.

### 4. Separate AlertDialog from Dialog

Base UI has distinct `Dialog` and `AlertDialog` components with different requirements:
- Dialog: Description optional
- AlertDialog: Description required (for accessibility)

### 5. Structural Nodes Only

The lint plugin only matches frames/groups/components, not text nodes. This prevents false positives from Figma's auto-naming of text layers.

---

## Workflow

### For Each Component

1. **Design in Figma** with proper frame structure
2. **Run Base UI Lint Plugin** to validate/fix structure
3. **Copy CSS** from Figma Dev Mode (already tokenized)
4. **Create React component** using Base UI + copied CSS
5. **Done** — no generation step, no spec files

### Example: Accordion

**Figma structure after linting:**
```
Accordion / Item
├── Header
│   └── Trigger
│       ├── Title (text)
│       └── Icon
└── Panel
    └── Content (text)
```

**React component:**
```tsx
import { Accordion } from '@base-ui-components/react/accordion';
import styles from './Accordion.module.scss';

<Accordion.Root>
  <Accordion.Item className={styles.Item}>
    <Accordion.Header>
      <Accordion.Trigger className={styles.Trigger}>
        <span className={styles.Title}>{title}</span>
        <CentralIcon name="IconChevronDown" />
      </Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Panel className={styles.Panel}>
      {content}
    </Accordion.Panel>
  </Accordion.Item>
</Accordion.Root>
```

---

## Pending / Next Steps

1. **Build first component end-to-end** — Use the lint plugin + Base UI + Figma CSS workflow
2. **Test the full flow** — Validate that the approach works in practice
3. **Add Storybook stories** — For component documentation
4. **CI/CD setup** — Token validation, type checking
5. **CI/CD setup** — `CENTRAL_LICENSE_KEY` in secrets for icon extraction if needed

---

## Commands

```bash
# Development
npm run dev           # Start Next.js dev server
npm run storybook     # Start Storybook

# Build
npm run build         # Build Next.js
npm run tokens:build  # Transform Figma tokens to SCSS
npm run icons:extract # Vendor icons + regenerate registry

# Lint plugin
cd tools/base-ui-lint
npm run build         # Build the Figma plugin
```

---

## Important Notes

### Central Icons License

The `@central-icons-react` packages are `devDependencies` used only for icon extraction (`npm run icons:extract`). Developers running extraction need `CENTRAL_LICENSE_KEY` set for `npm install`. Consumers of `@lightsparkdev/origin` do not need the key — icons are vendored into the repo.

### Base UI Package Rename

Base UI was recently renamed:
- Old: `@base-ui-components/react`
- New: `@base-ui/react`

We're currently using the old package name. Consider updating when stable.

### TypeScript

The `tools/` directory is excluded from the main tsconfig since it has Figma-specific types.

---

## Related Files

- **Figma Design System**: Set `FIGMA_FILE_KEY` in `.env.local` — see `.env.example`
- **Base UI Docs**: https://base-ui.com/react/components

---

## Session History

This project was set up in a conversation that:

1. Analyzed origin v1's complexity and identified pain points
2. Proposed Base UI + Figma CSS as a simpler approach
3. Built the Base UI lint plugin with 100% component coverage
4. Set up the token system (origin + baseline)
5. Ported the complete icon system
6. Fixed several plugin bugs (variant handling, text node matching)

The project is ready for building the first real component using the new workflow.
