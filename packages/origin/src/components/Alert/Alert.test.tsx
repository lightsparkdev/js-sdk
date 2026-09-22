import { test, expect } from "@playwright/experimental-ct-react";
import {
  DefaultAlert,
  CriticalAlert,
  WarningAlert,
  TitleOnlyAlert,
  NoIconAlert,
  CustomIconAlert,
  AlertWithTrailingAction,
  AlertWithNumericTrailing,
} from "./Alert.test-stories";
import { resolveTokenColor } from "@test-utils/resolveTokenColor";

test.describe("Alert", () => {
  test.describe("default variant", () => {
    test('renders with role="alert"', async ({ mount, page }) => {
      await mount(<DefaultAlert />);
      const alert = page.getByRole("alert");
      await expect(alert).toBeVisible();
    });

    test("renders title and description", async ({ mount, page }) => {
      await mount(<DefaultAlert />);
      const alert = page.getByRole("alert");
      await expect(alert).toContainText("Default Title");
      await expect(alert).toContainText("Default description text.");
    });

    test("renders default icon", async ({ mount, page }) => {
      await mount(<DefaultAlert />);
      const icon = page.locator("svg");
      await expect(icon).toBeVisible();
    });
  });

  test.describe("critical variant", () => {
    test('renders with role="alert"', async ({ mount, page }) => {
      await mount(<CriticalAlert />);
      const alert = page.getByRole("alert");
      await expect(alert).toBeVisible();
    });

    test("renders title and description", async ({ mount, page }) => {
      await mount(<CriticalAlert />);
      const alert = page.getByRole("alert");
      await expect(alert).toContainText("Critical Title");
      await expect(alert).toContainText("Critical description text.");
    });
  });

  test.describe("warning variant", () => {
    test('renders with role="alert"', async ({ mount, page }) => {
      await mount(<WarningAlert />);
      const alert = page.getByRole("alert");
      await expect(alert).toBeVisible();
    });

    test("renders title and description", async ({ mount, page }) => {
      await mount(<WarningAlert />);
      const alert = page.getByRole("alert");
      await expect(alert).toContainText("Warning Title");
      await expect(alert).toContainText("Warning description text.");
    });
  });

  test.describe("calm variant treatment", () => {
    test("uses a neutral shell with semantic icon colors", async ({
      mount,
      page,
    }) => {
      await mount(
        <>
          <DefaultAlert />
          <WarningAlert />
          <CriticalAlert />
        </>,
      );

      const alerts = page.getByRole("alert");
      const [surface, border, title, description] = await Promise.all([
        resolveTokenColor(page, "--surface-primary"),
        resolveTokenColor(page, "--border-primary"),
        resolveTokenColor(page, "--text-primary"),
        resolveTokenColor(page, "--text-secondary"),
      ]);
      const iconColors = await Promise.all([
        resolveTokenColor(page, "--icon-primary"),
        resolveTokenColor(page, "--icon-warning"),
        resolveTokenColor(page, "--icon-critical"),
      ]);

      for (let index = 0; index < 3; index += 1) {
        const alert = alerts.nth(index);
        await expect(alert).toHaveCSS("background-color", surface);
        await expect(alert).toHaveCSS("border-color", border);
        await expect(alert.locator("p").nth(0)).toHaveCSS("color", title);
        await expect(alert.locator("p").nth(1)).toHaveCSS("color", description);
        await expect(alert.locator("svg")).toHaveCSS(
          "color",
          iconColors[index]!,
        );
      }
    });

    test("uses a semantic start border only when a semantic icon is absent", async ({
      mount,
      page,
    }) => {
      await mount(
        <>
          <NoIconAlert />
          <NoIconAlert variant="warning" />
          <NoIconAlert variant="critical" />
          <NoIconAlert variant="warning" icon={null} />
          <NoIconAlert variant="critical" icon={null} />
        </>,
      );

      const alerts = page.getByRole("alert");
      const [defaultCue, warningCue, criticalCue] = await Promise.all([
        resolveTokenColor(page, "--border-primary"),
        resolveTokenColor(page, "--text-yellow"),
        resolveTokenColor(page, "--border-critical"),
      ]);
      const [shellStroke, semanticStroke] = await alerts
        .first()
        .evaluate((element) => {
          const styles = getComputedStyle(element);
          return [
            styles.borderTopWidth,
            styles.getPropertyValue("--stroke-lg"),
          ];
        });
      const cueColors = [
        defaultCue,
        warningCue,
        criticalCue,
        warningCue,
        criticalCue,
      ];

      for (let index = 0; index < cueColors.length; index += 1) {
        const alert = alerts.nth(index);
        await expect(alert).toHaveCSS(
          "border-inline-start-color",
          cueColors[index]!,
        );
        await expect(alert).toHaveCSS(
          "border-inline-start-width",
          index === 0 ? shellStroke : semanticStroke,
        );
      }
    });
  });

  test.describe("responsive layout", () => {
    test("caps readable text and keeps a wide trailing action inline", async ({
      mount,
      page,
    }) => {
      await mount(<AlertWithTrailingAction />);

      const alert = page.getByRole("alert");
      const title = alert.getByText(
        "A longer alert title that should remain easy to scan",
        { exact: true },
      );
      const description = alert.getByText(
        "This description is intentionally long enough to show that the alert shell can fill its parent while the text column stays at a readable measure.",
        { exact: true },
      );
      const textMeasure = await alert.evaluate((element) =>
        getComputedStyle(element)
          .getPropertyValue("--alert-text-max-inline-size")
          .trim(),
      );
      const layout = await alert.evaluate((element) => {
        const titleElement = element.querySelector("p");
        const button = element.querySelector("button");
        if (!titleElement || !button) {
          throw new Error("Alert layout test content is missing");
        }
        const alertRect = element.getBoundingClientRect();
        const titleRect = titleElement.getBoundingClientRect();
        const buttonRect = button.getBoundingClientRect();
        const styles = getComputedStyle(element);
        return {
          buttonRight: buttonRect.right,
          buttonTop: buttonRect.top,
          contentRight:
            alertRect.right -
            Number.parseFloat(styles.paddingInlineEnd) -
            Number.parseFloat(styles.borderInlineEndWidth),
          titleBottom: titleRect.bottom,
          titleWidth: titleRect.width,
        };
      });

      expect(textMeasure).toBe("30rem");
      expect(layout.titleWidth).toBeLessThanOrEqual(480);
      expect(layout.buttonTop).toBeLessThan(layout.titleBottom);
      expect(Math.abs(layout.buttonRight - layout.contentRight)).toBeLessThan(
        1,
      );
      await expect(title).toHaveCSS("text-wrap", "pretty");
      await expect(description).toHaveCSS("text-wrap", "pretty");
    });

    test("moves the trailing action below text in a narrow alert", async ({
      mount,
      page,
    }) => {
      await mount(<AlertWithTrailingAction width={320} />);

      const alert = page.getByRole("alert");
      const layout = await alert.evaluate((element) => {
        const description = element.querySelectorAll("p").item(1);
        const button = element.querySelector("button");
        if (!description || !button) {
          throw new Error("Alert layout test content is missing");
        }
        const descriptionRect = description.getBoundingClientRect();
        const buttonRect = button.getBoundingClientRect();
        return {
          buttonLeft: buttonRect.left,
          buttonTop: buttonRect.top,
          descriptionBottom: descriptionRect.bottom,
          descriptionLeft: descriptionRect.left,
          horizontalOverflow: element.scrollWidth - element.clientWidth,
        };
      });

      expect(layout.buttonTop).toBeGreaterThanOrEqual(layout.descriptionBottom);
      expect(Math.abs(layout.buttonLeft - layout.descriptionLeft)).toBeLessThan(
        1,
      );
      expect(layout.horizontalOverflow).toBeLessThanOrEqual(0);
    });
  });

  test.describe("content combinations", () => {
    test("renders with title only", async ({ mount, page }) => {
      await mount(<TitleOnlyAlert />);
      const alert = page.getByRole("alert");
      await expect(alert).toContainText("Title Only");
    });

    test("renders numeric zero in the trailing content", async ({
      mount,
      page,
    }) => {
      await mount(<AlertWithNumericTrailing />);

      await expect(
        page.getByRole("alert").getByText("0", { exact: true }),
      ).toBeVisible();
    });
  });

  test.describe("icon options", () => {
    test("hides icon when icon={false}", async ({ mount, page }) => {
      await mount(<NoIconAlert />);
      const alert = page.getByRole("alert");
      await expect(alert).toBeVisible();
      const icon = page.locator("svg");
      await expect(icon).not.toBeVisible();
    });

    test("renders custom icon", async ({ mount, page }) => {
      await mount(<CustomIconAlert />);
      const alert = page.getByRole("alert");
      const customIcon = page.locator('[data-testid="custom-icon"]');
      const [border, iconColor] = await Promise.all([
        resolveTokenColor(page, "--border-primary"),
        resolveTokenColor(page, "--icon-critical"),
      ]);

      await expect(customIcon).toBeVisible();
      await expect(customIcon).toHaveCSS("color", iconColor);
      await expect(alert).toHaveCSS("border-color", border);
    });
  });
});
