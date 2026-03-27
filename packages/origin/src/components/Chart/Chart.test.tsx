import { test, expect } from "@playwright/experimental-ct-react";
import AxeBuilder from "@axe-core/playwright";
import {
  Sparkline,
  SparklineWithColor,
  FullChart,
  LinearCurve,
  WithFadeLeft,
  WithFadeLeftCustom,
  CustomAriaLabel,
  EmptyData,
  SingleDataPoint,
  NoAnimation,
  CustomStrokeWidth,
  WithFormatters,
  SimpleTooltip,
  DetailedTooltipExplicit,
  CustomTooltip,
  ScatterBasic,
  ScatterMultiSeries,
  SplitBasic,
  SplitDetailed,
  BarListRanked,
  WaterfallBasic,
  SankeyBasic,
  FunnelBasic,
  BarBasic,
} from "./Chart.test-stories";

const axeConfig = {
  rules: {
    "landmark-one-main": { enabled: false },
    "page-has-heading-one": { enabled: false },
    region: { enabled: false },
  },
};

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

test.describe("Chart accessibility", () => {
  test("sparkline has no accessibility violations", async ({ mount, page }) => {
    await mount(<Sparkline />);
    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();
    expect(results.violations).toEqual([]);
  });

  test("full chart has no accessibility violations", async ({
    mount,
    page,
  }) => {
    await mount(<FullChart />);
    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();
    expect(results.violations).toEqual([]);
  });

  test('svg has role="img" and aria-label', async ({ mount, page }) => {
    await mount(<Sparkline />);
    const svg = page.locator('[data-testid="chart"] svg');
    await expect(svg).toHaveAttribute("role", "img");
    await expect(svg).toHaveAttribute("aria-label");
  });

  test("custom aria-label overrides auto-generated one", async ({
    mount,
    page,
  }) => {
    await mount(<CustomAriaLabel />);
    const svg = page.locator('[data-testid="chart"] svg');
    await expect(svg).toHaveAttribute("aria-label", "Weekly revenue trend");
  });

  test("svg contains a desc element", async ({ mount, page }) => {
    await mount(<Sparkline />);
    const desc = page.locator('[data-testid="chart"] svg desc');
    await expect(desc).toBeAttached();
    const text = await desc.textContent();
    expect(text).toContain("data points");
  });
});

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

test.describe("Chart rendering", () => {
  test("renders SVG with correct dimensions", async ({ mount, page }) => {
    await mount(<Sparkline />);
    const svg = page.locator('[data-testid="chart"] svg');
    await expect(svg).toBeVisible();
    const height = await svg.getAttribute("height");
    expect(height).toBe("170");
  });

  test("renders path elements for series", async ({ mount, page }) => {
    await mount(<FullChart />);
    const paths = page.locator('[data-testid="chart"] svg path');
    // 2 series with active + inactive paths + area fill paths
    const count = await paths.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test("sparkline renders paths", async ({ mount, page }) => {
    await mount(<Sparkline />);
    const paths = page.locator('[data-testid="chart"] svg path');
    const count = await paths.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("empty data renders container but no SVG paths", async ({
    mount,
    page,
  }) => {
    await mount(<EmptyData />);
    const container = page.locator('[data-testid="chart"]');
    await expect(container).toBeVisible();
    // With no data/width, SVG may not render paths
    const paths = page.locator('[data-testid="chart"] svg path');
    const count = await paths.count();
    expect(count).toBeLessThanOrEqual(0);
  });

  test("single data point renders without errors", async ({ mount, page }) => {
    await mount(<SingleDataPoint />);
    const svg = page.locator('[data-testid="chart"] svg');
    await expect(svg).toBeVisible();
    const paths = page.locator('[data-testid="chart"] svg path');
    const count = await paths.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// Curve types
// ---------------------------------------------------------------------------

test.describe("Chart curve types", () => {
  test("monotone curve produces C commands in path", async ({
    mount,
    page,
  }) => {
    await mount(<Sparkline />);
    const path = page.locator('[data-testid="chart"] svg path').first();
    const d = await path.getAttribute("d");
    expect(d).toContain("C");
  });

  test("linear curve produces only L commands in path", async ({
    mount,
    page,
  }) => {
    await mount(<LinearCurve />);
    const path = page.locator('[data-testid="chart"] svg path').first();
    const d = await path.getAttribute("d");
    expect(d).toContain("L");
    expect(d).not.toContain("C");
  });
});

// ---------------------------------------------------------------------------
// Grid and axis
// ---------------------------------------------------------------------------

test.describe("Chart grid and axis", () => {
  test("grid lines are rendered when grid=true", async ({ mount, page }) => {
    await mount(<FullChart />);
    // Grid lines are <line> elements with the gridLine class
    const lines = page.locator('[data-testid="chart"] svg line');
    const count = await lines.count();
    // Should have grid lines + the cursor line
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test("x-axis labels appear when xKey is set", async ({ mount, page }) => {
    await mount(<FullChart />);
    // X labels are <text> elements containing day names
    const monLabel = page.locator('[data-testid="chart"] svg text', {
      hasText: "Mon",
    });
    await expect(monLabel.first()).toBeVisible();
  });

  test("y-axis labels appear when grid=true", async ({ mount, page }) => {
    await mount(<FullChart />);
    // Y labels are <text> elements with numeric content
    const textEls = page.locator('[data-testid="chart"] svg text');
    const count = await textEls.count();
    // Should have both x and y labels
    expect(count).toBeGreaterThanOrEqual(3);
  });
});

// ---------------------------------------------------------------------------
// Tooltip and hover
// ---------------------------------------------------------------------------

test.describe("Chart tooltip", () => {
  test("tooltip is hidden by default", async ({ mount, page }) => {
    await mount(<FullChart />);
    const tooltip = page.locator('[data-testid="chart"] > div');
    // Tooltip element exists but is display: none via inline style
    await expect(tooltip).toBeAttached();
    await expect(tooltip).toHaveCSS("display", "none");
  });

  test("tooltip appears on hover", async ({ mount, page }) => {
    await mount(<FullChart />);
    const svg = page.locator('[data-testid="chart"] svg');
    const box = await svg.boundingBox();
    if (!box) throw new Error("SVG not visible");

    // Hover in the middle of the chart
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    const tooltip = page.locator('[data-testid="chart"] > div');
    // Wait for tooltip to become visible
    await expect(tooltip).toBeVisible({ timeout: 2000 });
  });

  test("tooltip shows series labels", async ({ mount, page }) => {
    await mount(<FullChart />);
    const svg = page.locator('[data-testid="chart"] svg');
    const box = await svg.boundingBox();
    if (!box) throw new Error("SVG not visible");

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    // Should show both series labels
    const tooltip = page.locator('[data-testid="chart"] > div');
    await expect(tooltip).toBeVisible({ timeout: 2000 });
    await expect(
      tooltip.locator("text=Incoming").or(tooltip.getByText("Incoming")),
    ).toBeVisible();
    await expect(
      tooltip.locator("text=Outgoing").or(tooltip.getByText("Outgoing")),
    ).toBeVisible();
  });

  test("tooltip hides on mouse leave", async ({ mount, page }) => {
    await mount(<FullChart />);
    const svg = page.locator('[data-testid="chart"] svg');
    const box = await svg.boundingBox();
    if (!box) throw new Error("SVG not visible");

    // Hover then leave
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    const tooltip = page.locator('[data-testid="chart"] > div');
    await expect(tooltip).toBeVisible({ timeout: 2000 });

    // Move mouse well below the chart to trigger mouseLeave
    await page.mouse.move(box.x + box.width / 2, box.y + box.height + 100);

    // Tooltip should hide (inline style.display = 'none')
    await expect(tooltip).toHaveCSS("display", "none", { timeout: 2000 });
  });

  test("cursor line appears on hover", async ({ mount, page }) => {
    await mount(<FullChart />);
    const svg = page.locator('[data-testid="chart"] svg');
    const box = await svg.boundingBox();
    if (!box) throw new Error("SVG not visible");

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    // Cursor line should be visible (style.display cleared)
    const lines = page.locator('[data-testid="chart"] svg line');
    const count = await lines.count();
    let hasCursorVisible = false;
    for (let i = 0; i < count; i++) {
      const display = await lines
        .nth(i)
        .evaluate((el) => (el as SVGElement).style.display);
      if (display !== "none") hasCursorVisible = true;
    }
    expect(hasCursorVisible).toBe(true);
  });

  test("hover dots appear on hover", async ({ mount, page }) => {
    await mount(<FullChart />);
    const svg = page.locator('[data-testid="chart"] svg');
    const box = await svg.boundingBox();
    if (!box) throw new Error("SVG not visible");

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    // Active dots (circles) should be visible
    const dots = page.locator('[data-testid="chart"] svg circle');
    const count = await dots.count();
    expect(count).toBe(2); // Two series
    for (let i = 0; i < count; i++) {
      const display = await dots
        .nth(i)
        .evaluate((el) => (el as SVGElement).style.display);
      expect(display).not.toBe("none");
    }
  });

  test("formatValue is applied in tooltip", async ({ mount, page }) => {
    await mount(<WithFormatters />);
    const svg = page.locator('[data-testid="chart"] svg');
    const box = await svg.boundingBox();
    if (!box) throw new Error("SVG not visible");

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    const tooltip = page.locator('[data-testid="chart"] > div');
    await expect(tooltip).toBeVisible({ timeout: 2000 });
    // Values should be formatted with $ prefix
    const text = await tooltip.textContent();
    expect(text).toContain("$");
  });
});

// ---------------------------------------------------------------------------
// Tooltip variants
// ---------------------------------------------------------------------------

test.describe("Chart tooltip variants", () => {
  test('tooltip="simple" shows only x-label, no series rows', async ({
    mount,
    page,
  }) => {
    await mount(<SimpleTooltip />);
    const svg = page.locator('[data-testid="chart"] svg');
    const box = await svg.boundingBox();
    if (!box) throw new Error("SVG not visible");

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    const tooltip = page.locator('[data-testid="chart"] > div');
    await expect(tooltip).toBeVisible({ timeout: 2000 });

    const text = await tooltip.textContent();
    // Should contain a date label (one of the x values)
    expect(text).toBeTruthy();
  });

  test('tooltip="detailed" renders series rows (same as boolean true)', async ({
    mount,
    page,
  }) => {
    await mount(<DetailedTooltipExplicit />);
    const svg = page.locator('[data-testid="chart"] svg');
    const box = await svg.boundingBox();
    if (!box) throw new Error("SVG not visible");

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    const tooltip = page.locator('[data-testid="chart"] > div');
    await expect(tooltip).toBeVisible({ timeout: 2000 });
    await expect(tooltip.getByText("Incoming")).toBeVisible();
    await expect(tooltip.getByText("Outgoing")).toBeVisible();
  });

  test("tooltip render function receives datum and renders custom content", async ({
    mount,
    page,
  }) => {
    await mount(<CustomTooltip />);
    const svg = page.locator('[data-testid="chart"] svg');
    const box = await svg.boundingBox();
    if (!box) throw new Error("SVG not visible");

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    const tooltip = page.locator('[data-testid="chart"] > div');
    await expect(tooltip).toBeVisible({ timeout: 2000 });
    const custom = page.locator('[data-testid="custom-tooltip-content"]');
    await expect(custom).toBeVisible({ timeout: 2000 });
    const text = await custom.textContent();
    expect(text).toContain("Custom:");
  });
});

// ---------------------------------------------------------------------------
// fadeLeft
// ---------------------------------------------------------------------------

test.describe("Chart fadeLeft", () => {
  test("fadeLeft=true adds SVG mask and defs", async ({ mount, page }) => {
    await mount(<WithFadeLeft />);
    const defs = page.locator('[data-testid="chart"] svg defs');
    await expect(defs).toBeAttached();
    const mask = page.locator('[data-testid="chart"] svg mask');
    await expect(mask).toBeAttached();
    const gradient = page.locator('[data-testid="chart"] svg linearGradient');
    await expect(gradient.first()).toBeAttached();
  });

  test("fadeLeft={60} adds SVG mask", async ({ mount, page }) => {
    await mount(<WithFadeLeftCustom />);
    const mask = page.locator('[data-testid="chart"] svg mask');
    await expect(mask).toBeAttached();
  });

  test("no fadeLeft means no mask in SVG", async ({ mount, page }) => {
    await mount(<Sparkline />);
    const mask = page.locator('[data-testid="chart"] svg mask');
    await expect(mask).not.toBeAttached();
  });
});

// ---------------------------------------------------------------------------
// Props: color, strokeWidth, animate
// ---------------------------------------------------------------------------

test.describe("Chart props", () => {
  test("color prop sets stroke color on single-series path", async ({
    mount,
    page,
  }) => {
    await mount(<SparklineWithColor />);
    // Find path with a non-"none" stroke
    const paths = page.locator(
      '[data-testid="chart"] svg path[stroke]:not([stroke="none"])',
    );
    const stroke = await paths.first().getAttribute("stroke");
    expect(stroke).toBe("rgb(0, 0, 255)");
  });

  test("strokeWidth prop sets stroke-width attribute", async ({
    mount,
    page,
  }) => {
    await mount(<CustomStrokeWidth />);
    const paths = page.locator(
      '[data-testid="chart"] svg path[stroke]:not([stroke="none"])',
    );
    const sw = await paths.first().getAttribute("stroke-width");
    expect(sw).toBe("4");
  });

  test("animate=false does not apply animation class", async ({
    mount,
    page,
  }) => {
    await mount(<NoAnimation />);
    const paths = page.locator(
      '[data-testid="chart"] svg path[stroke]:not([stroke="none"])',
    );
    const cls = await paths.first().getAttribute("class");
    expect(cls ?? "").not.toContain("lineAnimate");
  });

  test("animate=true applies animation class by default", async ({
    mount,
    page,
  }) => {
    await mount(<FullChart />);
    const paths = page.locator(
      '[data-testid="chart"] svg path[stroke]:not([stroke="none"])',
    );
    const cls = await paths.first().getAttribute("class");
    expect(cls).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Scatter chart
// ---------------------------------------------------------------------------

test.describe("Scatter chart", () => {
  test("renders circles for data points", async ({ mount, page }) => {
    await mount(<ScatterBasic />);
    const circles = page.locator('[data-testid="scatter-chart"] svg circle');
    const count = await circles.count();
    expect(count).toBe(4);
  });

  test('has role="graphics-document" and aria-roledescription', async ({
    mount,
    page,
  }) => {
    await mount(<ScatterBasic />);
    const svg = page.locator('[data-testid="scatter-chart"] svg');
    await expect(svg).toHaveAttribute("role", "graphics-document document");
    await expect(svg).toHaveAttribute("aria-roledescription", "Scatter chart");
    await expect(svg).toHaveAttribute("aria-label");
  });

  test("renders grid lines when grid=true", async ({ mount, page }) => {
    await mount(<ScatterBasic />);
    const lines = page.locator('[data-testid="scatter-chart"] svg line');
    const count = await lines.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test("multi-series renders legend when legend=true", async ({
    mount,
    page,
  }) => {
    await mount(<ScatterMultiSeries />);
    const legendItems = page
      .locator('[data-testid="scatter-chart"]')
      .locator("..")
      .getByText("Series A", { exact: true });
    await expect(legendItems).toBeVisible();
  });

  test("has no accessibility violations", async ({ mount, page }) => {
    await mount(<ScatterBasic />);
    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();
    expect(results.violations).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Split chart
// ---------------------------------------------------------------------------

test.describe("Split chart", () => {
  test("renders segments for data", async ({ mount, page }) => {
    await mount(<SplitBasic />);
    const root = page.locator('[data-testid="split-chart"]');
    await expect(root).toBeVisible();
    const barWrap = root.locator('[role="graphics-document document"]');
    await expect(barWrap).toBeAttached();
  });

  test("renders legend items", async ({ mount, page }) => {
    await mount(<SplitBasic />);
    const root = page.locator('[data-testid="split-chart"]');
    await expect(root.getByText("Payments")).toBeVisible();
    await expect(root.getByText("Transfers")).toBeVisible();
    await expect(root.getByText("Fees")).toBeVisible();
  });

  test("has no accessibility violations", async ({ mount, page }) => {
    await mount(<SplitBasic />);
    const results = await new AxeBuilder({ page })
      .options({
        ...axeConfig,
        rules: { ...axeConfig.rules, "color-contrast": { enabled: false } },
      })
      .analyze();
    expect(results.violations).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Split detailed variant
// ---------------------------------------------------------------------------

test.describe("Split detailed variant", () => {
  test("renders formatted value per segment", async ({ mount, page }) => {
    await mount(<SplitDetailed />);
    const root = page.locator('[data-testid="split-chart"]');
    await expect(root.getByText("$246.1M")).toBeVisible();
    await expect(root.getByText("$87.8M")).toBeVisible();
    await expect(root.getByText("Incoming")).toBeVisible();
  });

  test("shows percentage with one decimal place", async ({ mount, page }) => {
    await mount(<SplitDetailed />);
    const root = page.locator('[data-testid="split-chart"]');
    const countText = root.locator('[class*="splitDetailedCount"]').first();
    await expect(countText).toContainText("%");
    const text = await countText.textContent();
    expect(text).toMatch(/\d+\.\d%/);
  });

  test("does not render default dot legend", async ({ mount, page }) => {
    await mount(<SplitDetailed />);
    const root = page.locator('[data-testid="split-chart"]');
    const defaultLegend = root.locator('[class*="legendItem"]');
    await expect(defaultLegend).toHaveCount(0);
  });
});

// ---------------------------------------------------------------------------
// BarList ranked variant
// ---------------------------------------------------------------------------

test.describe("BarList ranked variant", () => {
  test("renders ranked rows with rank numbers", async ({ mount, page }) => {
    await mount(<BarListRanked />);
    const root = page.locator('[data-testid="barlist-ranked"]');
    await expect(root).toBeVisible();
    await expect(root.getByText("United States")).toBeVisible();
    await expect(root.getByText("Japan")).toBeVisible();
    await expect(root.getByText("1", { exact: true })).toBeVisible();
  });

  test('has role="list"', async ({ mount, page }) => {
    await mount(<BarListRanked />);
    const root = page.locator('[data-testid="barlist-ranked"]');
    await expect(root).toHaveAttribute("role", "list");
  });

  test("shows change indicators", async ({ mount, page }) => {
    await mount(<BarListRanked />);
    const root = page.locator('[data-testid="barlist-ranked"]');
    const arrows = root.getByText("\u2191");
    await expect(arrows).toBeVisible();
  });

  test("has no accessibility violations", async ({ mount, page }) => {
    await mount(<BarListRanked />);
    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();
    expect(results.violations).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Waterfall chart
// ---------------------------------------------------------------------------

test.describe("Waterfall chart", () => {
  test("renders bars for each segment", async ({ mount, page }) => {
    await mount(<WaterfallBasic />);
    const rects = page.locator(
      '[data-testid="waterfall-chart"] svg rect[fill]',
    );
    const count = await rects.count();
    expect(count).toBeGreaterThanOrEqual(7);
  });

  test("renders connector lines when showConnectors=true", async ({
    mount,
    page,
  }) => {
    await mount(<WaterfallBasic />);
    const connectors = page.locator(
      '[data-testid="waterfall-chart"] svg line[stroke-dasharray="2 2"]',
    );
    const count = await connectors.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('has role="graphics-document" and aria-roledescription', async ({
    mount,
    page,
  }) => {
    await mount(<WaterfallBasic />);
    const svg = page.locator('[data-testid="waterfall-chart"] svg');
    await expect(svg).toHaveAttribute("role", "graphics-document document");
    await expect(svg).toHaveAttribute(
      "aria-roledescription",
      "Waterfall chart",
    );
    await expect(svg).toHaveAttribute("aria-label");
  });

  test("has no accessibility violations", async ({ mount, page }) => {
    await mount(<WaterfallBasic />);
    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();
    expect(results.violations).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Sankey chart
// ---------------------------------------------------------------------------

test.describe("Sankey chart", () => {
  test("renders nodes as rects", async ({ mount, page }) => {
    await mount(<SankeyBasic />);
    const rects = page.locator(
      '[data-testid="sankey-chart"] svg rect[role="graphics-symbol"]',
    );
    const count = await rects.count();
    expect(count).toBe(4);
  });

  test("renders links as paths", async ({ mount, page }) => {
    await mount(<SankeyBasic />);
    const paths = page.locator(
      '[data-testid="sankey-chart"] svg path[role="graphics-symbol"]',
    );
    const count = await paths.count();
    expect(count).toBe(4);
  });

  test('has role="graphics-document" and aria-roledescription', async ({
    mount,
    page,
  }) => {
    await mount(<SankeyBasic />);
    const svg = page.locator('[data-testid="sankey-chart"] svg');
    await expect(svg).toHaveAttribute("role", "graphics-document document");
    await expect(svg).toHaveAttribute("aria-roledescription", "Flow diagram");
  });

  test("renders node labels", async ({ mount, page }) => {
    await mount(<SankeyBasic />);
    const root = page.locator('[data-testid="sankey-chart"]');
    const labels = root.locator("svg text");
    const count = await labels.count();
    expect(count).toBe(4);
  });

  test("has no accessibility violations", async ({ mount, page }) => {
    await mount(<SankeyBasic />);
    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();
    expect(results.violations).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Funnel chart
// ---------------------------------------------------------------------------

test.describe("Funnel chart", () => {
  test("renders a path for each stage", async ({ mount, page }) => {
    await mount(<FunnelBasic />);
    const paths = page.locator(
      '[data-testid="funnel-chart"] svg path[role="graphics-symbol"]',
    );
    const count = await paths.count();
    expect(count).toBe(5);
  });

  test("shows conversion rate in tooltip on hover", async ({ mount, page }) => {
    await mount(<FunnelBasic />);
    const svg = page.locator('[data-testid="funnel-chart"] svg');
    await svg.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    const tooltip = page
      .locator('[data-testid="funnel-chart"] > div[class*="tooltip"]')
      .first();
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText("42%");
  });

  test('has role="graphics-document" and aria-roledescription', async ({
    mount,
    page,
  }) => {
    await mount(<FunnelBasic />);
    const svg = page.locator('[data-testid="funnel-chart"] svg');
    await expect(svg).toHaveAttribute("role", "graphics-document document");
    await expect(svg).toHaveAttribute("aria-roledescription", "Funnel chart");
    await expect(svg).toHaveAttribute("aria-label");
  });

  test("has no accessibility violations", async ({ mount, page }) => {
    await mount(<FunnelBasic />);
    const results = await new AxeBuilder({ page }).options(axeConfig).analyze();
    expect(results.violations).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Keyboard interaction
// ---------------------------------------------------------------------------

test.describe("Keyboard interaction", () => {
  test("Line chart: arrow keys show tooltip, Escape dismisses", async ({
    mount,
    page,
  }) => {
    await mount(<FullChart />);
    const svg = page.locator('[data-testid="chart"] svg');
    await svg.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    const tooltip = page
      .locator('[data-testid="chart"] > div[class*="tooltip"]')
      .first();
    await expect(tooltip).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(tooltip).toBeHidden();
  });

  test("Bar chart: arrow keys show tooltip, Escape dismisses", async ({
    mount,
    page,
  }) => {
    await mount(<BarBasic />);
    const svg = page.locator('[data-testid="bar-chart"] svg');
    await svg.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    const tooltip = page
      .locator('[data-testid="bar-chart"] > div[class*="tooltip"]')
      .first();
    await expect(tooltip).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(tooltip).toBeHidden();
  });

  test("Scatter chart: arrow keys show tooltip, Escape dismisses", async ({
    mount,
    page,
  }) => {
    await mount(<ScatterBasic />);
    const svg = page.locator('[data-testid="scatter-chart"] svg');
    await svg.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    const tooltip = page
      .locator('[data-testid="scatter-chart"] > div[class*="tooltip"]')
      .first();
    await expect(tooltip).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(tooltip).toBeHidden();
  });

  test("Split chart: arrow keys swap legend to active segment", async ({
    mount,
    page,
  }) => {
    await mount(<SplitBasic />);
    const bar = page.locator(
      '[data-testid="split-chart"] [class*="splitBarWrap"]',
    );
    const legend = page
      .locator('[data-testid="split-chart"] [class*="legend"]')
      .first();
    await expect(legend).toContainText("Payments");
    await expect(legend).toContainText("Transfers");
    await bar.focus();
    await page.keyboard.press("ArrowRight");
    await expect(legend).toContainText("Payments");
    await expect(legend).not.toContainText("Transfers");
    await page.keyboard.press("Escape");
    await expect(legend).toContainText("Transfers");
  });

  test("Funnel chart: arrow keys show tooltip, Escape dismisses", async ({
    mount,
    page,
  }) => {
    await mount(<FunnelBasic />);
    const svg = page.locator('[data-testid="funnel-chart"] svg');
    await svg.focus();
    await page.keyboard.press("ArrowRight");
    const tooltip = page
      .locator('[data-testid="funnel-chart"] > div[class*="tooltip"]')
      .first();
    await expect(tooltip).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(tooltip).toBeHidden();
  });

  test("Waterfall chart: arrow keys show tooltip, Escape dismisses", async ({
    mount,
    page,
  }) => {
    await mount(<WaterfallBasic />);
    const svg = page.locator('[data-testid="waterfall-chart"] svg');
    await svg.focus();
    await page.keyboard.press("ArrowRight");
    const tooltip = page
      .locator('[data-testid="waterfall-chart"] > div[class*="tooltip"]')
      .first();
    await expect(tooltip).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(tooltip).toBeHidden();
  });

  test("Sankey chart: arrow keys show tooltip, Escape dismisses", async ({
    mount,
    page,
  }) => {
    await mount(<SankeyBasic />);
    const svg = page.locator('[data-testid="sankey-chart"] svg');
    await svg.focus();
    await page.keyboard.press("ArrowRight");
    const tooltip = page
      .locator('[data-testid="sankey-chart"] > div[class*="tooltip"]')
      .first();
    await expect(tooltip).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(tooltip).toBeHidden();
  });

  test("focus-visible ring appears on SVG charts", async ({ mount, page }) => {
    await mount(<FullChart />);
    const svg = page.locator('[data-testid="chart"] svg');
    await svg.focus();
    const outline = await svg.evaluate(
      (el) => getComputedStyle(el).outlineStyle,
    );
    expect(outline).not.toBe("none");
  });
});
