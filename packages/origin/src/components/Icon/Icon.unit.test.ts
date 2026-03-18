import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ICON_REGISTRY, type CentralIconName } from "./icon-registry";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = join(__dirname, "icons");

const EXPECTED_ICON_COUNT = 227;

const registryKeys = Object.keys(ICON_REGISTRY) as CentralIconName[];

describe("Icon registry", () => {
  it(`exports exactly ${EXPECTED_ICON_COUNT} icons`, () => {
    expect(registryKeys.length).toBe(EXPECTED_ICON_COUNT);
  });

  it("every registry entry is a valid React component", () => {
    for (const key of registryKeys) {
      const component = ICON_REGISTRY[key];
      expect(component, `${key} is not a function`).toBeTypeOf("function");
    }
  });

  it("includes the IconChevronDown alias", () => {
    expect(ICON_REGISTRY).toHaveProperty("IconChevronDown");
    expect(ICON_REGISTRY.IconChevronDown).toBe(
      ICON_REGISTRY.IconChevronDownSmall,
    );
  });
});

describe("Vendored icon files", () => {
  it("CentralIconBase exists with required files", () => {
    const baseDir = join(ICONS_DIR, "CentralIconBase");
    expect(existsSync(join(baseDir, "index.mjs")), "missing index.mjs").toBe(
      true,
    );
    expect(existsSync(join(baseDir, "index.d.ts")), "missing index.d.ts").toBe(
      true,
    );
  });

  const iconsWithOwnFiles = registryKeys.filter((k) => k !== "IconChevronDown");

  it.each(iconsWithOwnFiles)("%s has index.mjs and index.d.ts", (name) => {
    const dir = join(ICONS_DIR, name);
    expect(existsSync(join(dir, "index.mjs")), `${name}/index.mjs`).toBe(true);
    expect(existsSync(join(dir, "index.d.ts")), `${name}/index.d.ts`).toBe(
      true,
    );
  });
});

describe("Filled variant exports", () => {
  const filledPairs: [CentralIconName, CentralIconName][] = [
    ["IconCircleCheck", "IconCircleCheckFilled"],
    ["IconCircleInfo", "IconCircleInfoFilled"],
    ["IconExclamationTriangle", "IconExclamationTriangleFilled"],
    ["IconHeart2", "IconHeart2Filled"],
    ["IconOngoing", "IconOngoingFilled"],
    ["IconPeople2", "IconPeople2Filled"],
  ];

  it.each(filledPairs)(
    "%s and %s are distinct components",
    (outlined, filled) => {
      expect(ICON_REGISTRY[outlined]).toBeTypeOf("function");
      expect(ICON_REGISTRY[filled]).toBeTypeOf("function");
      expect(ICON_REGISTRY[outlined]).not.toBe(ICON_REGISTRY[filled]);
    },
  );
});
