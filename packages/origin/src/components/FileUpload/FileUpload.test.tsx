import { test, expect, type Page } from "@playwright/experimental-ct-react";
import { FieldFileUpload } from "./FileUpload.test-stories";

const dropzoneName = /^Attachments Upload files/;

async function dispatchFileDrag(
  page: Page,
  type: "dragenter" | "dragover" | "drop",
  names: string[] = [],
) {
  await page.getByRole("button", { name: dropzoneName }).evaluate(
    (element, { type, names }) => {
      const dataTransfer = new DataTransfer();
      for (const name of names) {
        dataTransfer.items.add(
          new File(["x"], name, {
            type: name.endsWith(".pdf") ? "application/pdf" : "image/png",
          }),
        );
      }
      element.dispatchEvent(
        new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer }),
      );
    },
    { type, names },
  );
}

test.describe("FileUpload", () => {
  test("opens the picker with Enter and Space", async ({ mount, page }) => {
    await mount(<FieldFileUpload />);
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("button", { name: dropzoneName }),
    ).toBeFocused();

    for (const key of ["Enter", " "]) {
      const chooser = page.waitForEvent("filechooser");
      await page.keyboard.press(key);
      await (
        await chooser
      ).setFiles({
        name: `${key === "Enter" ? "enter" : "space"}.pdf`,
        mimeType: "application/pdf",
        buffer: Buffer.from("%PDF"),
      });
    }
    await expect(page.getByTestId("count")).toHaveText("2");
    await expect(page.getByText("enter.pdf")).toBeVisible();
  });

  test("shows a drag-over state and accepts a real drop", async ({
    mount,
    page,
  }) => {
    await mount(<FieldFileUpload />);
    const dropzone = page.getByRole("button", { name: dropzoneName });

    await dispatchFileDrag(page, "dragenter", ["a.pdf"]);
    await expect(dropzone).toHaveAttribute("data-drag-over", "");
    await dispatchFileDrag(page, "drop", ["a.pdf", "b.png"]);
    await expect(dropzone).not.toHaveAttribute("data-drag-over");
    await expect(page.getByTestId("count")).toHaveText("2");
  });

  test("announces a rejected drop through the field error", async ({
    mount,
    page,
  }) => {
    await mount(<FieldFileUpload />);
    await dispatchFileDrag(page, "drop", ["a.pdf", "b.png", "c.pdf"]);
    const dropzone = page.getByRole("button", { name: dropzoneName });
    await expect(dropzone).toHaveAttribute("aria-invalid", "true");
    await expect(dropzone).toHaveAccessibleDescription(
      "You can add up to 2 files.",
    );
  });

  test("removes a file from the keyboard", async ({ mount, page }) => {
    await mount(<FieldFileUpload />);
    await dispatchFileDrag(page, "drop", ["a.pdf", "b.png"]);
    await page.getByRole("button", { name: "Remove a.pdf" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("count")).toHaveText("1");
    await expect(
      page.getByRole("button", { name: "Remove b.png" }),
    ).toBeFocused();
  });

  test("takes disabled from the field", async ({ mount, page }) => {
    await mount(<FieldFileUpload disabled />);
    await expect(
      page.getByRole("button", { name: dropzoneName }),
    ).toBeDisabled();
  });
});
