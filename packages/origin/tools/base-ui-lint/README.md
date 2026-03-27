# Base UI Lint — Figma Plugin

Lints Figma component structures against Base UI anatomy and auto-fixes frame names.

## Quick Start

```bash
cd tools/base-ui-lint
npm install
npm run build
```

## Loading the Plugin in Figma

1. Open Figma Desktop
2. Go to **Plugins** > **Development** > **Import plugin from manifest...**
3. Select `/tools/base-ui-lint/manifest.json`
4. The plugin will appear under **Plugins** > **Development** > **Base UI Lint**

## Usage

1. Select a component in Figma (e.g., "Accordion / Item")
2. Run the plugin
3. Review the lint results:
   - ✓ **Correct** — Frame name matches Base UI
   - ! **Rename** — Frame found but needs renaming (auto-fixable)
   - ✗ **Missing** — Required frame not found
4. Click **Fix All** to auto-rename frames

## Development

```bash
npm run watch   # Auto-rebuild on changes
```

Then reload the plugin in Figma after each build.

## Adding New Component Rules

1. Create a new rule file in `rules/` (e.g., `rules/select.json`)
2. Import and add it to `src/rules.ts`
3. Rebuild the plugin

### Rule Format

```json
{
  "component": "ComponentName",
  "matches": ["ComponentName", "Component / SubComponent"],
  "parts": {
    "PartName": {
      "required": true,
      "parent": null,
      "aliases": ["AlternateName", "OtherName"]
    },
    "ChildPart": {
      "required": true,
      "parent": "PartName"
    }
  },
  "ignored": ["FramesToIgnore", "HelperFrames"]
}
```

- **component**: Display name for the Base UI component
- **matches**: Figma component names that trigger these rules
- **parts**: Expected frame names with parent relationships
- **ignored**: Frame names to skip during linting (icons, text, helpers)

## Supported Components (22 total)

| Component | Component | Component |
|-----------|-----------|-----------|
| Accordion | Avatar | Checkbox |
| Collapsible | Dialog | Field |
| Menu | Meter | NumberField |
| Popover | Progress | Radio |
| ScrollArea | Select | Slider |
| Switch | Tabs | Toast |
| Toggle | ToggleGroup | Toolbar |
| Tooltip | | |

