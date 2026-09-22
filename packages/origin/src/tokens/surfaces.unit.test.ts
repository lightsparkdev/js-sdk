import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import darkTokens from "../../tokens/figma/origin/Dark.tokens.json";
import lightTokens from "../../tokens/figma/origin/Light.tokens.json";

const generatedVariables = readFileSync(
  resolve(process.cwd(), "src/tokens/_variables.scss"),
  "utf8",
);

describe("surface tokens", () => {
  it("preserves legacy light surfaces while aligning dark overlays", () => {
    expect(lightTokens.surface.panel.$value.hex).toBe("#FAFAF9");
    expect(lightTokens.surface.overlay.$value.hex).toBe("#F8F8F7");
    expect(lightTokens.surface.track.$value).toMatchObject({
      components: [0, 0, 0],
      alpha: 0.05999999865889549,
    });
    expect(darkTokens.surface.panel.$value.hex).toBe("#1A1A1A");
    expect(darkTokens.surface.overlay.$value.hex).toBe("#1A1A1A");
    expect(darkTokens.surface.secondary.$value.hex).toBe("#0A0A0A");
    expect(
      darkTokens.surface.secondary.$extensions["com.figma.aliasData"]
        .targetVariableName,
    ).toBe("color/gray/990");
    expect(lightTokens.surface).not.toHaveProperty("shell");
    expect(darkTokens.surface).not.toHaveProperty("shell");
  });

  it("keeps the subtle neutral surface distinct from the strong neutral fill", () => {
    const lightSubtle = lightTokens.surface["neutral-subtle"];
    const darkSubtle = darkTokens.surface["neutral-subtle"];

    expect(lightSubtle).toBeDefined();
    expect(darkSubtle).toBeDefined();
    expect(lightTokens.surface).not.toHaveProperty("gray");
    expect(darkTokens.surface).not.toHaveProperty("gray");
    expect(lightSubtle.$value.hex).toBe("#F0F0EE");
    expect(lightSubtle.$value.alpha).toBe(1);
    expect(darkSubtle.$value.hex).toBe("#F3F3F5");
    expect(darkSubtle.$value.alpha).toBeCloseTo(0.04);
    expect(lightTokens.surface.neutral.$value).not.toEqual(lightSubtle.$value);
    expect(darkTokens.surface.neutral.$value).not.toEqual(darkSubtle.$value);
  });

  it("does not retain aliases for the unreleased surface name", () => {
    expect(JSON.stringify(lightTokens.surface)).not.toContain("surface/gray");
    expect(JSON.stringify(darkTokens.surface)).not.toContain("surface/gray");
  });

  it("generates the canonical subtle neutral surface variable", () => {
    expect(generatedVariables).toContain("--surface-neutral-subtle: #f0f0ee;");
    expect(generatedVariables).toContain(
      "--surface-neutral-subtle: rgba(243, 243, 245, 0.04);",
    );
    expect(generatedVariables).not.toContain("--surface-gray:");
    expect(generatedVariables).not.toContain("--surface-shell:");
  });
});
