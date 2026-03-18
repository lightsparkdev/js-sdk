/**
 * Extract and vendor Central Icons.
 *
 * This script is the single source of truth for which icons Origin uses.
 * It copies icon files from @central-icons-react packages (devDependencies)
 * into src/components/Icon/icons/ and generates icon-registry.ts.
 *
 * Usage:
 *   yarn icons:extract    (requires @central-icons-react packages installed)
 *
 * To add a new icon:
 *   1. Add an entry to SECTIONS below
 *   2. Run: yarn icons:extract
 *   3. Commit the updated icons/ directory and icon-registry.ts
 */

import { existsSync, mkdirSync, cpSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ICONS_DIR = join(ROOT, 'src', 'components', 'Icon', 'icons');
const REGISTRY_PATH = join(ROOT, 'src', 'components', 'Icon', 'icon-registry.ts');

// ── Package mapping ──────────────────────────────────────────

const PACKAGES = {
  outlined: '@central-icons-react/round-outlined-radius-3-stroke-1.5',
  sharp: '@central-icons-react/round-outlined-radius-0-stroke-1.5',
  filled: '@central-icons-react/round-filled-radius-3-stroke-1.5',
};

// ── Icon configuration ───────────────────────────────────────
//
// Each section: { section, icons }
//   - section: Comment label used in the generated registry
//   - icons:   Array of { name, variant?, exportAs? }
//
// Icon fields:
//   - name:     Component name in Central Icons
//   - variant:  'outlined' (default) | 'sharp' | 'filled'
//   - exportAs: Name exported from Origin (defaults to name)

const SECTIONS = [
  {
    section: 'Arrows & Navigation',
    icons: [
      { name: 'IconArrow', variant: 'sharp' },
      { name: 'IconArrowDown', variant: 'sharp' },
      { name: 'IconArrowDownLeft', variant: 'sharp' },
      { name: 'IconArrowDownRight', variant: 'sharp' },
      { name: 'IconArrowLeft', variant: 'sharp' },
      { name: 'IconArrowRight', variant: 'sharp' },
      { name: 'IconArrowUp', variant: 'sharp' },
      { name: 'IconArrowUpLeft', variant: 'sharp' },
      { name: 'IconArrowUpRight', variant: 'sharp' },
      { name: 'IconRedirectArrow', variant: 'sharp' },
      { name: 'IconArrowBoxRight' },
      { name: 'IconArrowDownSquare' },
      { name: 'IconArrowDownWall' },
      { name: 'IconArrowInbox' },
      { name: 'IconArrowLeftSquare' },
      { name: 'IconArrowLoopDownLeft' },
      { name: 'IconArrowOutOfBox' },
      { name: 'IconArrowRightSquare' },
      { name: 'IconArrowUpSquare' },
      { name: 'IconArrowUpWall' },
      { name: 'IconArrowsRepeat' },
      { name: 'IconArrowsRepeatCircle' },
      { name: 'IconRotate360Left' },
      { name: 'IconRotate360Right' },
    ],
  },
  {
    section: 'Chevrons',
    icons: [
      { name: 'IconChevronBottom', variant: 'sharp' },
      { name: 'IconChevronDownSmall', variant: 'sharp' },
      { name: 'IconChevronGrabberVertical', variant: 'sharp' },
      { name: 'IconChevronLeft', variant: 'sharp' },
      { name: 'IconChevronLeftSmall', variant: 'sharp' },
      { name: 'IconChevronRight', variant: 'sharp' },
      { name: 'IconChevronRightSmall', variant: 'sharp' },
      { name: 'IconChevronTop', variant: 'sharp' },
      { name: 'IconChevronTopSmall', variant: 'sharp' },
    ],
  },
  {
    section: 'Actions & UI',
    icons: [
      { name: 'IconAdjustPhoto' },
      { name: 'IconAt' },
      { name: 'IconAutoCrop' },
      { name: 'IconBarsThree2' },
      { name: 'IconBell' },
      { name: 'IconBellOff' },
      { name: 'IconBlackpoint' },
      { name: 'IconBank' },
      { name: 'IconBuildings' },
      { name: 'IconBrackets1' },
      { name: 'IconBrokenHeart' },
      { name: 'IconBrowserTabs' },
      { name: 'IconBubble3' },
      { name: 'IconBubbleWideSparkle' },
      { name: 'IconCalendarDays' },
      { name: 'IconCheckmark2' },
      { name: 'IconCheckmark2Small' },
      { name: 'IconCircleCheck' },
      { name: 'IconCircleCheck', variant: 'filled', exportAs: 'IconCircleCheckFilled' },
      { name: 'IconCircleInfo' },
      { name: 'IconCircleInfo', variant: 'filled', exportAs: 'IconCircleInfoFilled' },
      { name: 'IconCirclePlus' },
      { name: 'IconCircleQuestionmark' },
      { name: 'IconCircleX', variant: 'filled' },
      { name: 'IconClipboard2' },
      { name: 'IconClipboard2Sparkle' },
      { name: 'IconCoinsAdd' },
      { name: 'IconCoinsAdd', variant: 'filled', exportAs: 'IconCoinsAddFilled' },
      { name: 'IconClock' },
      { name: 'IconCmdBox' },
      { name: 'IconConnectors1' },
      { name: 'IconConnectors2' },
      { name: 'IconConsoleSparkle' },
      { name: 'IconCrossLarge' },
      { name: 'IconCrossMedium' },
      { name: 'IconCrossSmall' },
      { name: 'IconCryptoWallet' },
      { name: 'IconDevices', variant: 'filled' },
      { name: 'IconDiamondShine' },
      { name: 'IconDifferenceIgnored' },
      { name: 'IconDifferenceModified' },
      { name: 'IconDiscoBall' },
      { name: 'IconDotGrid1x3Horizontal' },
      { name: 'IconDotGrid1x3HorizontalTight' },
      { name: 'IconDotGrid1x3Vertical' },
      { name: 'IconDotGrid1x3VerticalTight' },
      { name: 'IconDotGrid2x3' },
      { name: 'IconDotGrid3x3' },
      { name: 'IconExclamationTriangle' },
      { name: 'IconExclamationTriangle', variant: 'filled', exportAs: 'IconExclamationTriangleFilled' },
      { name: 'IconEyeOpen' },
      { name: 'IconEyeSlash' },
      { name: 'IconEyeSlash2' },
      { name: 'IconFileArrowLeftIn' },
      { name: 'IconFileArrowLeftOut' },
      { name: 'IconFileArrowRightOut' },
      { name: 'IconFileBend' },
      { name: 'IconFilter2' },
      { name: 'IconFolderAddRight' },
      { name: 'IconFingerPrint1' },
      { name: 'IconFormPyramide' },
      { name: 'IconForYou' },
      { name: 'IconFullScreen' },
      { name: 'IconGlobe2' },
      { name: 'IconHeart2' },
      { name: 'IconHeart2', variant: 'filled', exportAs: 'IconHeart2Filled' },
      { name: 'IconHome' },
      { name: 'IconImport2' },
      { name: 'IconInitiatives' },
      { name: 'IconInvite' },
      { name: 'IconKey2' },
      { name: 'IconLayoutColumn' },
      { name: 'IconLayoutLeft' },
      { name: 'IconLayoutRight' },
      { name: 'IconListSparkle' },
      { name: 'IconLiveActivity' },
      { name: 'IconLiveFull' },
      { name: 'IconLoader' },
      { name: 'IconLock' },
      { name: 'IconMagnifyingGlass2' },
      { name: 'IconMinusLarge' },
      { name: 'IconMinusSmall' },
      { name: 'IconMoon', variant: 'filled' },
      { name: 'IconMouse' },
      { name: 'IconOffline' },
      { name: 'IconOngoing' },
      { name: 'IconOngoing', variant: 'filled', exportAs: 'IconOngoingFilled' },
      { name: 'IconPaperclip1' },
      { name: 'IconPaperPlaneTopRight' },
      { name: 'IconPaperPlaneTopRight', variant: 'filled', exportAs: 'IconPaperPlaneTopRightFilled' },
      { name: 'IconPassport' },
      { name: 'IconPassword' },
      { name: 'IconPasswordStars' },
      { name: 'IconPencil' },
      { name: 'IconPencil2' },
      { name: 'IconPencil3' },
      { name: 'IconPencilAi' },
      { name: 'IconPeople2' },
      { name: 'IconPeople2', variant: 'filled', exportAs: 'IconPeople2Filled' },
      { name: 'IconPeopleAdd' },
      { name: 'IconPeopleAdd', variant: 'filled', exportAs: 'IconPeopleAddFilled' },
      { name: 'IconPeopleCircle' },
      { name: 'IconPeopleIdCard' },
      { name: 'IconPhone' },
      { name: 'IconPhoneDynamicIsland' },
      { name: 'IconPlusLarge' },
      { name: 'IconPlusSmall' },
      { name: 'IconPrompt' },
      { name: 'IconRandom' },
      { name: 'IconRemix' },
      { name: 'IconRemoveKeyframe' },
      { name: 'IconRepeat' },
      { name: 'IconRescueRing' },
      { name: 'IconRunShortcut' },
      { name: 'IconScanCode' },
      { name: 'IconSearchIntelligence' },
      { name: 'IconSearchlinesSparkle' },
      { name: 'IconSecretPhrase' },
      { name: 'IconSettingsGear1' },
      { name: 'IconSettingsGear2' },
      { name: 'IconShield' },
      { name: 'IconShield2' },
      { name: 'IconShieldKeyhole' },
      { name: 'IconSidebarSimpleLeftWide' },
      { name: 'IconSpacebar' },
      { name: 'IconSquareBehindSquare1' },
      { name: 'IconSquareBehindSquare6' },
      { name: 'IconSquareInfo' },
      { name: 'IconSquareArrowTopRight2' },
      { name: 'IconSquarePlus' },
      { name: 'IconSticker' },
      { name: 'IconSun', variant: 'filled' },
      { name: 'IconStop' },
      { name: 'IconStopCircle' },
      { name: 'IconTag' },
      { name: 'IconTarget' },
      { name: 'IconTelescope' },
      { name: 'IconTextToSpeach' },
      { name: 'IconThumbDownCurved' },
      { name: 'IconThumbUpCurved' },
      { name: 'IconTextareaDrag' },
      { name: 'IconTimeFlies' },
      { name: 'IconTimeslot' },
      { name: 'IconToggle' },
      { name: 'IconTrashCanSimple' },
      { name: 'IconTrashRounded' },
      { name: 'IconUnblur' },
      { name: 'IconUsbC' },
      { name: 'IconVariables' },
      { name: 'IconWallet1' },
      { name: 'IconWallet3' },
      { name: 'IconWeb3' },
      { name: 'IconWindowSparkle' },
      { name: 'IconWreathSimple' },
    ],
  },
  {
    section: 'AI & Sparkle',
    icons: [
      { name: 'IconAgenticCoding' },
      { name: 'IconImagineAi' },
      { name: 'IconVibeCoding2' },
      { name: 'IconVisualIntelligence' },
    ],
  },
  {
    section: 'Voice',
    icons: [
      { name: 'IconVoiceHigh' },
      { name: 'IconVoiceLow' },
      { name: 'IconVoiceMid' },
      { name: 'IconVoiceRecord' },
      { name: 'IconVoiceSettings' },
      { name: 'IconVoiceSparkle' },
    ],
  },
  {
    section: 'User & People',
    icons: [
      { name: 'IconPeople' },
      { name: 'IconUserAdded' },
      { name: 'IconUserAddRight' },
      { name: 'IconUserBlock' },
      { name: 'IconUserDuo' },
      { name: 'IconUserEdit' },
      { name: 'IconUserGroup' },
      { name: 'IconUserRemove' },
      { name: 'IconUserRemoveRight' },
      { name: 'IconUserSettings' },
    ],
  },
  {
    section: 'Brands & Logos',
    icons: [
      { name: 'IconAntigravity' },
      { name: 'IconApple' },
      { name: 'IconBitcoinLogo' },
      { name: 'IconClaudeai' },
      { name: 'IconCursor' },
      { name: 'IconEuropeanUnion' },
      { name: 'IconGemini' },
      { name: 'IconGithub' },
      { name: 'IconGrok' },
      { name: 'IconIsoOrg' },
      { name: 'IconLinear' },
      { name: 'IconLinkedin' },
      { name: 'IconNotion' },
      { name: 'IconOpenai' },
      { name: 'IconSlack' },
      { name: 'IconSupabase' },
      { name: 'IconTwitter' },
      { name: 'IconV0' },
      { name: 'IconVercel' },
    ],
  },
];

// Convenience aliases — reference existing icons, not extracted separately
const ALIASES = [
  { alias: 'IconChevronDown', target: 'IconChevronDownSmall', section: 'Chevrons' },
];

// ── Helpers ──────────────────────────────────────────────────

function resolvePackagePath(variant) {
  const pkg = PACKAGES[variant];
  if (!pkg) throw new Error(`Unknown variant: ${variant}`);
  const pkgPath = join(ROOT, 'node_modules', pkg);
  if (!existsSync(pkgPath)) {
    throw new Error(
      `Package ${pkg} not found. Run yarn install with CENTRAL_LICENSE_KEY set.`
    );
  }
  return pkgPath;
}

function copyIconFiles(srcDir, destDir) {
  if (!existsSync(srcDir)) return false;
  mkdirSync(destDir, { recursive: true });
  for (const file of ['index.mjs', 'index.d.ts']) {
    const src = join(srcDir, file);
    if (!existsSync(src)) continue;
    if (file === 'index.mjs') {
      const content = readFileSync(src, 'utf-8').replace(
        /\n\/\/#\s*sourceMappingURL=.*$/m,
        ''
      );
      writeFileSync(join(destDir, file), content);
    } else {
      cpSync(src, join(destDir, file));
    }
  }
  return true;
}

// ── Extract icons from node_modules ──────────────────────────

function extractIcons() {
  console.log('Extracting icons from @central-icons-react...\n');

  const packagePaths = {};
  for (const [variant, pkg] of Object.entries(PACKAGES)) {
    packagePaths[variant] = resolvePackagePath(variant);
    console.log(`  ${variant}: ${packagePaths[variant]}`);
  }

  if (existsSync(ICONS_DIR)) rmSync(ICONS_DIR, { recursive: true });
  mkdirSync(ICONS_DIR, { recursive: true });

  // CentralIconBase is needed for .d.ts type resolution
  const baseSrc = join(packagePaths.outlined, 'CentralIconBase');
  if (copyIconFiles(baseSrc, join(ICONS_DIR, 'CentralIconBase'))) {
    console.log('\n  Copied CentralIconBase');
  }

  let extracted = 0;
  let warnings = 0;

  for (const { icons } of SECTIONS) {
    for (const icon of icons) {
      const variant = icon.variant || 'outlined';
      const exportAs = icon.exportAs || icon.name;
      const srcDir = join(packagePaths[variant], icon.name);
      const destDir = join(ICONS_DIR, exportAs);

      if (copyIconFiles(srcDir, destDir)) {
        extracted++;
      } else {
        console.warn(`  WARN: ${icon.name} not found in ${PACKAGES[variant]}`);
        warnings++;
      }
    }
  }

  console.log(`\n  Extracted ${extracted} icons`);
  if (warnings > 0) console.warn(`  ${warnings} warning(s)`);
  return warnings === 0;
}

// ── Generate icon-registry.ts ────────────────────────────────

function generateRegistry() {
  const lines = [
    '/**',
    ' * Auto-generated by scripts/extract-icons.mjs — do not edit.',
    ' *',
    ' * To add or update icons, edit the SECTIONS config in that script',
    ' * and run: yarn icons:extract',
    ' */',
    '',
  ];

  // Imports — sorted alphabetically by exportAs within each section
  for (const { section, icons } of SECTIONS) {
    lines.push(`// ${section}`);

    const sorted = icons
      .map((icon) => ({
        name: icon.name,
        exportAs: icon.exportAs || icon.name,
      }))
      .sort((a, b) => a.exportAs.localeCompare(b.exportAs));

    for (const { name, exportAs } of sorted) {
      if (name === exportAs) {
        lines.push(`import { ${name} } from './icons/${exportAs}';`);
      } else {
        lines.push(
          `import { ${name} as ${exportAs} } from './icons/${exportAs}';`
        );
      }
    }

    lines.push('');
  }

  // Aliases
  if (ALIASES.length > 0) {
    for (const { alias, target } of ALIASES) {
      lines.push(`const ${alias} = ${target};`);
    }
    lines.push('');
  }

  // ICON_REGISTRY
  lines.push('export const ICON_REGISTRY = {');

  for (const { section, icons } of SECTIONS) {
    const exportNames = icons
      .map((icon) => icon.exportAs || icon.name)
      .concat(
        ALIASES.filter((a) => a.section === section).map((a) => a.alias)
      )
      .sort();

    lines.push(`  // ${section}`);
    for (const name of exportNames) {
      lines.push(`  ${name},`);
    }
    lines.push('');
  }

  // Remove trailing blank line inside the object
  if (lines[lines.length - 1] === '') lines.pop();

  lines.push('} as const;');
  lines.push('');
  lines.push('export type CentralIconName = keyof typeof ICON_REGISTRY;');
  lines.push('');

  writeFileSync(REGISTRY_PATH, lines.join('\n'));
  console.log(`\n  Generated ${REGISTRY_PATH}`);
}

// ── Validate extracted icons ─────────────────────────────────

function validateIcons() {
  let errors = 0;

  for (const { icons } of SECTIONS) {
    for (const icon of icons) {
      const exportAs = icon.exportAs || icon.name;
      const dir = join(ICONS_DIR, exportAs);

      for (const file of ['index.mjs', 'index.d.ts']) {
        if (!existsSync(join(dir, file))) {
          console.error(`  MISSING: ${exportAs}/${file}`);
          errors++;
        }
      }
    }
  }

  if (errors > 0) {
    console.error(`\n  Validation failed: ${errors} missing file(s)`);
  } else {
    console.log('  Validation passed');
  }

  return errors === 0;
}

// ── Main ─────────────────────────────────────────────────────

function main() {
  const ok = extractIcons();
  generateRegistry();
  console.log('');
  const valid = validateIcons();
  console.log('\nDone.');
  if (!ok || !valid) process.exit(1);
}

main();
