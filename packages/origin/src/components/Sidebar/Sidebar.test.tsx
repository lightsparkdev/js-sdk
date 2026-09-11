import { expect, test, type Locator } from "@playwright/experimental-ct-react";
import { Sidebar } from "./";

async function expectActiveSurface(item: Locator) {
  const colors = await item.evaluate((element) => {
    const probe = document.createElement("span");
    probe.style.backgroundColor = "var(--surface-raised)";
    element.append(probe);

    const backgroundColor = getComputedStyle(element).backgroundColor;
    const surfaceRaised = getComputedStyle(probe).backgroundColor;
    probe.remove();

    return { backgroundColor, surfaceRaised };
  });

  expect(colors.backgroundColor).toBe(colors.surfaceRaised);
  expect(colors.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
}

test.describe("Sidebar.TreeItem themes", () => {
  test("applies an explicit data theme on the rendered item itself", async ({
    mount,
    page,
  }) => {
    await mount(
      <Sidebar.Root>
        <Sidebar.Content>
          <Sidebar.Tree label="Files">
            <Sidebar.TreeItem
              active
              label="Source"
              render={
                <a data-theme="dark" data-testid="tree-item" href="/source" />
              }
            />
          </Sidebar.Tree>
        </Sidebar.Content>
      </Sidebar.Root>,
    );

    const item = page.getByTestId("tree-item");
    await expect(item).toHaveAttribute("data-active", "true");
    await expectActiveSurface(item);
  });

  test("applies an explicit dark class on the rendered item itself", async ({
    mount,
    page,
  }) => {
    await mount(
      <Sidebar.Root>
        <Sidebar.Content>
          <Sidebar.Tree label="Files">
            <Sidebar.TreeItem
              active
              label="Source"
              render={
                <a className="dark" data-testid="tree-item" href="/source" />
              }
            />
          </Sidebar.Tree>
        </Sidebar.Content>
      </Sidebar.Root>,
    );

    const item = page.getByTestId("tree-item");
    await expect(item).toHaveClass(/dark/);
    await expectActiveSurface(item);
  });

  test("keeps system dark mode for a directly rendered item", async ({
    mount,
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await mount(
      <Sidebar.Root>
        <Sidebar.Content>
          <Sidebar.Tree label="Files">
            <Sidebar.TreeItem
              active
              label="Source"
              render={<a data-testid="tree-item" href="/source" />}
            />
          </Sidebar.Tree>
        </Sidebar.Content>
      </Sidebar.Root>,
    );

    await expectActiveSurface(page.getByTestId("tree-item"));
  });
});
