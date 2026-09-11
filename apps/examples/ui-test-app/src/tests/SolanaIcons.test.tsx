import type { ReactElement } from "react";

import { NetworkSolana, TokenSolana } from "@lightsparkdev/ui/icons";
import { render } from "@testing-library/react";

type IconComponent = () => ReactElement;

function extractAttributeValues(markup: string, attributeName: string) {
  return Array.from(
    markup.matchAll(new RegExp(`\\s${attributeName}="([^"]+)"`, "g")),
    (match) => match[1],
  );
}

function extractUrlReference(value: string) {
  const match = value.match(/^url\(#(.+)\)$/);

  expect(match).not.toBeNull();
  return match?.[1] ?? "";
}

function renderSvgInstances(Icon: IconComponent) {
  const { container } = render(
    <>
      <Icon />
      <Icon />
    </>,
  );
  const svgInstances = Array.from(
    container.querySelectorAll("svg"),
    (svg) => svg.outerHTML,
  );

  expect(svgInstances).toHaveLength(2);
  return svgInstances;
}

function expectLocalUrlReferences(svgMarkup: string) {
  const ids = extractAttributeValues(svgMarkup, "id");
  const idSet = new Set(ids);
  const urlReferences = [
    ...extractAttributeValues(svgMarkup, "mask"),
    ...extractAttributeValues(svgMarkup, "fill").filter((value) =>
      value.startsWith("url(#"),
    ),
  ].map(extractUrlReference);

  expect(ids.length).toBeGreaterThan(0);
  expect(urlReferences.length).toBeGreaterThan(0);

  for (const referencedId of urlReferences) {
    expect(idSet.has(referencedId)).toBe(true);
  }

  return ids;
}

describe("Solana icons", () => {
  test.each([
    ["NetworkSolana", NetworkSolana],
    ["TokenSolana", TokenSolana],
  ])("%s keeps generated SVG IDs local and unique", (_name, Icon) => {
    const idsByInstance = renderSvgInstances(Icon).map(
      expectLocalUrlReferences,
    );
    const allIds = idsByInstance.flat();

    expect(new Set(allIds).size).toBe(allIds.length);
  });
});
