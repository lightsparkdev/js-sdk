/**
 * Token probe for Playwright CT tests.
 *
 * Resolves a CSS custom property (design token) to its computed color by
 * mounting a temporary probe element, so tests can assert token-driven
 * styles without hardcoding rgb values.
 */

import type { Page } from "@playwright/experimental-ct-react";

export type TokenColorProperty = "color" | "backgroundColor" | "outlineColor";

export async function resolveTokenColor(
  page: Page,
  token: string,
  property: TokenColorProperty = "color",
): Promise<string> {
  return page.evaluate(
    ({ token, property }) => {
      const probe = document.createElement("div");
      if (property === "outlineColor") {
        // outline-color alone doesn't compute without an outline
        probe.style.outline = `1px solid var(${token})`;
      } else {
        probe.style[property] = `var(${token})`;
      }
      document.body.appendChild(probe);
      const resolved = getComputedStyle(probe)[property];
      probe.remove();
      return resolved;
    },
    { token, property },
  );
}
