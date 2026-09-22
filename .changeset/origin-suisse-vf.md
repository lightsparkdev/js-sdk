---
"@lightsparkdev/origin": minor
"@lightsparkdev/ui": minor
---

Adopt the Suisse Intl variable font (wght 300-700, baked metrics,
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
