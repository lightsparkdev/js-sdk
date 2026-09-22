import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as sass from "sass";

const variablesPath = resolve(process.cwd(), "src/tokens/_variables.scss");
const darkEffectsPath = resolve(process.cwd(), "src/tokens/_dark-effects.scss");
const generatedVariables = readFileSync(variablesPath, "utf8");
const darkEffects = readFileSync(darkEffectsPath, "utf8");

type TokenMap = Record<string, string>;

function parseBlock(source: string, heading: RegExp): TokenMap {
  const match = heading.exec(source);
  if (!match) {
    return {};
  }

  const open = source.indexOf("{", match.index);
  if (open === -1) {
    return {};
  }

  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === "{") {
      depth += 1;
    } else if (source[index] === "}") {
      depth -= 1;
      if (depth === 0) {
        const block = source.slice(open, index);
        return Object.fromEntries(
          [...block.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)].map((token) => [
            token[1],
            token[2].trim(),
          ]),
        );
      }
    }
  }

  return {};
}

function normalizeColor(value: string): string {
  return value.replace(/\s+/g, "").toLowerCase();
}

const light = parseBlock(generatedVariables, /^:root \{/m);
const dark = parseBlock(generatedVariables, /\[data-theme="dark"\]/);
const system = parseBlock(
  generatedVariables,
  /:root:not\(\[data-theme="light"\]\) \{/,
);

describe("theme contract", () => {
  it("emits dark overrides on the document attribute, class, and system opt-out", () => {
    expect(generatedVariables).toMatch(/\[data-theme="dark"\],\s*\n\.dark \{/);
    expect(generatedVariables).toContain("@media (prefers-color-scheme: dark)");
    expect(generatedVariables).toContain(':root:not([data-theme="light"])');
    expect(generatedVariables).not.toMatch(/\[data-theme="light"\]\s*\{/);
    expect(generatedVariables).toMatch(/:root \{\s*color-scheme: light;/);
    expect(generatedVariables).toMatch(
      /\[data-theme="dark"\],\s*\n\.dark \{\s*color-scheme: dark;/,
    );
  });

  it("keeps the system-dark block identical to the explicit dark block", () => {
    expect(Object.keys(system).sort()).toEqual(Object.keys(dark).sort());
    for (const name of Object.keys(dark)) {
      expect(system[name]).toBe(dark[name]);
    }
  });

  it("keeps new light roles pixel-equal to the roles they replace", () => {
    expect(normalizeColor(light["--surface-page"])).toBe(
      normalizeColor(light["--surface-primary"]),
    );
    expect(normalizeColor(light["--surface-overlay"])).toBe(
      normalizeColor(light["--surface-primary"]),
    );
    expect(normalizeColor(light["--border-control"])).toBe(
      normalizeColor(light["--border-primary"]),
    );
    expect(normalizeColor(light["--border-overlay"])).toBe(
      normalizeColor(light["--border-primary"]),
    );
    expect(normalizeColor(light["--border-keyline"])).toMatch(
      /rgba\(255,255,255,0(?:\.0+)?\)/,
    );
  });

  it("keeps on-color ink theme-invariant while inverse ink flips", () => {
    expect(normalizeColor(light["--text-on-color"])).toBe(
      normalizeColor(dark["--text-on-color"]),
    );
    expect(normalizeColor(light["--icon-on-color"])).toBe(
      normalizeColor(dark["--icon-on-color"]),
    );
    expect(normalizeColor(light["--text-inverse"])).not.toBe(
      normalizeColor(dark["--text-inverse"]),
    );
  });

  it("keeps the validated shell floor while splitting cards and overlays", () => {
    expect(dark["--surface-page"]).toBe(dark["--surface-base"]);
    expect(dark["--surface-primary"]).not.toBe(dark["--surface-page"]);
    expect(dark["--surface-secondary"]).toBe(dark["--surface-page"]);
    expect(dark["--surface-overlay"]).toBe(dark["--surface-panel"]);
    expect(dark["--surface-overlay"]).not.toBe(dark["--surface-page"]);
    expect(dark["--border-control"]).not.toBe(dark["--border-primary"]);
    expect(dark).not.toHaveProperty("--surface-shell");
  });

  it("mirrors the same theme selectors in the hand-maintained dark effects layer", () => {
    expect(darkEffects).toMatch(/\[data-theme="dark"\],\s*\n\.dark \{/);
    expect(darkEffects).toContain(':root:not([data-theme="light"])');
    expect(darkEffects).not.toMatch(/\[data-theme="light"\]\s*\{/);
  });
});

describe("compiled theme boundaries", () => {
  const compiled = sass.compileString(`${generatedVariables}\n${darkEffects}`, {
    syntax: "scss",
  }).css;

  function readTokens(theme: "default" | "dark" | "light") {
    const host = document.createElement("div");
    const style = document.createElement("style");
    style.textContent = compiled;
    document.head.append(style);
    document.body.append(host);

    const previousTheme = document.documentElement.getAttribute("data-theme");
    if (theme === "default") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }

    const styles = getComputedStyle(host);
    const tokens = {
      colorScheme: styles.colorScheme,
      page: styles.getPropertyValue("--surface-page").trim(),
      primary: styles.getPropertyValue("--surface-primary").trim(),
      secondary: styles.getPropertyValue("--surface-secondary").trim(),
      overlay: styles.getPropertyValue("--surface-overlay").trim(),
      onColor: styles.getPropertyValue("--text-on-color").trim(),
      inverse: styles.getPropertyValue("--text-inverse").trim(),
      keyline: styles.getPropertyValue("--border-keyline").trim(),
    };

    if (previousTheme === null) {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", previousTheme);
    }
    style.remove();
    host.remove();
    return tokens;
  }

  it("resolves light values on :root and when data-theme=light is forced", () => {
    const root = readTokens("default");
    const forcedLight = readTokens("light");

    expect(root.page).toBe(forcedLight.page);
    expect(root.primary).toBe(forcedLight.primary);
    expect(forcedLight.colorScheme).toBe("light");
    expect(root.page).toBe(root.primary);
    expect(root.onColor).toBe(root.inverse);
    expect(root.keyline).toMatch(
      /rgba\(\s*255,\s*255,\s*255,\s*0(?:\.0+)?\s*\)/,
    );
  });

  it("resolves the dark page/card split only under data-theme=dark", () => {
    const lightTokens = readTokens("light");
    const darkTokens = readTokens("dark");

    expect(darkTokens.page).not.toBe(lightTokens.page);
    expect(darkTokens.colorScheme).toBe("dark");
    expect(darkTokens.primary).not.toBe(darkTokens.page);
    expect(darkTokens.secondary).toBe(darkTokens.page);
    expect(lightTokens.secondary).not.toBe(lightTokens.page);
    expect(darkTokens.overlay).not.toBe(darkTokens.page);
    expect(darkTokens.onColor).toBe(lightTokens.onColor);
    expect(darkTokens.inverse).not.toBe(lightTokens.inverse);
  });
});
