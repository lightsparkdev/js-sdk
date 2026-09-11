# Origin Design System

A design system built on **Base UI** with direct **Figma-to-code** styling.

## Philosophy

- **Base UI** handles behavior, accessibility, and keyboard navigation
- **Figma Dev Mode** provides tokenized CSS (copy directly)
- **Minimal transformation** = minimal drift

## Quick Start

```bash
npm install --legacy-peer-deps
npm run dev
```

## Structure

```
src/
├── components/          # React components
│   └── Icon/           # CentralIcon system
├── tokens/             # Generated SCSS variables
└── app/                # Next.js app

tools/
├── base-ui-lint/       # Figma structure validation plugin
└── figma-styles/       # Internal Figma style sync (requires credentials)

tokens/
└── figma/              # Raw Figma token exports
    ├── origin/         # Origin tokens
    └── baseline/       # Baseline tokens
```

## Component Workflow

1. **Design** in Figma with Base UI-compatible frame structure
2. **Validate** with the Base UI Lint Plugin
3. **Copy CSS** from Figma Dev Mode
4. **Implement** with Base UI + SCSS modules

## Figma Lint Plugin

```bash
cd tools/base-ui-lint
npm run build
```

Import in Figma → Plugins → Development → `manifest.json`

Validates component structure against Base UI's expected anatomy.

## Icons

```tsx
import { CentralIcon } from "@/components/Icon";

<CentralIcon name="IconHome" size={24} />;
```

213 vendored icons from Central Icons. Edit `scripts/extract-icons.mjs` to add icons, then run `npm run icons:extract`.

## Tokens

Color and spacing tokens are built from the repository token JSON (`yarn tokens:build`). Typography mixins (`_text-styles.scss`) and shadow variables (`_effects.scss`) are generated from an internal Figma file and committed to the repo — external contributors don't need to regenerate them. Don't edit these generated files by hand.

See [src/tokens/README.md](src/tokens/README.md) for the token role guide — how to pick surface, border, and alpha tokens.

## Scripts

| Command                 | Description                          |
| ----------------------- | ------------------------------------ |
| `npm run dev`           | Start development server             |
| `npm run build`         | Production build                     |
| `npm run storybook`     | Start Storybook                      |
| `yarn tokens:build`     | Build tokens from repository JSON    |
| `npm run icons:extract` | Vendor icons and regenerate registry |
| `npm run test`          | Vitest unit tests                    |
| `npm run test:ct`       | Playwright component tests           |
| `npm run test:unit`     | Vitest unit tests                    |
| `npm run test:all`      | Run both test suites                 |
| `npm run lint`          | Run ESLint                           |

Internal maintainers with Figma credentials also have `figma:styles` and `figma:node` for syncing styles from the design file.

## Using as a Package

### Installation

```bash
npm install @lightsparkdev/origin sass
```

Or for local development:

```json
{ "dependencies": { "@lightsparkdev/origin": "file:../origin" } }
```

### Next.js Configuration

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@lightsparkdev/origin"],
};

export default nextConfig;
```

### Import Styles

```ts
import "@lightsparkdev/origin/styles.css";
```

### Color Theme

Set `data-theme="light"` or `data-theme="dark"` on the document element.
Remove the attribute to follow `prefers-color-scheme`. Keep the theme boundary
on `html` so overlays portaled to `body` inherit the same tokens and browser
color scheme.

```ts
document.documentElement.dataset.theme = "dark";
document.documentElement.removeAttribute("data-theme"); // System preference
```

### Copy Fonts

```bash
cp -r node_modules/@lightsparkdev/origin/public/fonts/ public/fonts/
```

### Usage

```tsx
import { Button, Input, Field } from "@lightsparkdev/origin";
```

### FilterBar Ordering

FilterBar pills use descriptor order by default. Pass
`orderPolicy: "application"` to `useFilters` for insertion order; controlled
consumers pass `appliedFilterIds` and receive the normalized next order as the
second `onStatesChange` argument.

URL-backed integrations opt in once at their shared factory:

```ts
const useProductFilters = createUrlBackedFiltersHook({
  useSearchParamsAdapter,
  history: "push",
  filterOrdering: {
    searchParam: "_filterOrder",
  },
});
```

The consumer-named sidecar stores a JSON array of filter ids. Legacy URLs fall
back to descriptor order; malformed, stale, unknown, and duplicate ids are
ignored, and missing applied ids append in descriptor order.

### Advanced: SCSS Token Imports (Optional)

If you need Origin mixins in your app SCSS files, configure Sass package imports:

```ts
// next.config.ts
import type { NextConfig } from "next";
import * as sass from "sass";

const nextConfig: NextConfig = {
  transpilePackages: ["@lightsparkdev/origin"],
  sassOptions: {
    importers: [new sass.NodePackageImporter()],
  },
};

export default nextConfig;
```

Then use `pkg:` imports:

```scss
@use "pkg:@lightsparkdev/origin/tokens/text-styles" as *;
```

For full setup details, see [Using Origin in Your App](docs/using-origin-in-your-app.md).

## Typography

Suisse Intl ships as a variable font (wght 300-700) split by `unicode-range`
into a core face (`SuisseIntlVF-wght300-700-core.woff2`, Latin-1 plus common
punctuation, currency, and the characters shipped UI text renders — Č/č,
İ/ı, the arrows ←↑→↓↗↙, ≈, ≤/≥ — ~171 KiB) and an ext face
(`SuisseIntlVF-wght300-700-ext.woff2`, everything else). Both faces declare
the identical `font-weight: 300 700` span — see the hard rules in
`_fonts.scss` before touching the declarations. A separate static family,
"Suisse Intl Extended" (the per-weight `SuisseIntl-*.woff2` statics), sits
after "Suisse Intl" in the sans stack so Arabic falls through per character.
Intermediate weights are available for animation
(`font-variation-settings: "wght" ...`).

The font carries centered vertical metrics baked in: hhea and OS/2 typo
ascent/descent are 1870/-420 (2000 UPM; the same proportions as the previous
statics' 935/-210 at 1000 UPM). Descent covers the font's deepest descender
plus browser metric-rounding headroom so tails never clip in truncating
containers, and ascent - cap height = descent, which keeps the cap height
optically centered at any line-height without CSS `ascent-override` hacks.
Win metrics keep the original glyph extents so Windows renderers don't clip
tall accented glyphs, and `USE_TYPO_METRICS` is set.

The single-story "a" is the default glyph at the font level (the `salt`
alternates are baked into the character map), so no
`font-feature-settings: "salt" 1` is needed anywhere.

Consuming apps copy Origin's fonts (see setup); after upgrading Origin,
re-copy `public/fonts/` so the binaries match the `@font-face` rules in
`_fonts.scss`. Without the font, the system falls back to `system-ui`.

## Documentation

- `docs/using-origin-in-your-app.md` — Token/font setup for consuming apps
- `CONTEXT.md` — Full project context and history
- `.cursor/rules/` — Auto-injected context for AI assistants
