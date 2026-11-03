/**
 * FileUpload Unit Tests (Vitest + @testing-library/react)
 *
 * Covers selection, drop, limits, removal, and Field wiring in JSDOM.
 * Keyboard activation and real drag events run in FileUpload.test.tsx.
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { FileUpload, type FileUploadProps } from "./FileUpload";
import { formatFileSize, matchesAccept, rejectionMessage } from "./utils";
import { Field } from "../Field";

function makeFile(name: string, type: string, size = 1200) {
  const file = new File(["x"], name, { type, lastModified: 1 });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

const pdf = makeFile("statement.pdf", "application/pdf");
const png = makeFile("receipt.png", "image/png");
const jpg = makeFile("passport.jpg", "image/jpeg");

function Controlled(props: Omit<FileUploadProps, "files">) {
  const [files, setFiles] = React.useState<File[]>([]);
  return (
    <FileUpload
      {...props}
      files={files}
      onFilesChange={(next) => {
        setFiles(next);
        props.onFilesChange?.(next);
      }}
    />
  );
}

function getDropzone() {
  return screen.getByRole("button", { name: /Upload (files|a file)/ });
}

function getInput(container: HTMLElement) {
  return container.querySelector<HTMLInputElement>('input[type="file"]')!;
}

function choose(container: HTMLElement, files: File[]) {
  fireEvent.change(getInput(container), { target: { files } });
}

function drop(target: HTMLElement, files: File[]) {
  fireEvent.drop(target, { dataTransfer: { files, types: ["Files"] } });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("FileUpload", () => {
  it("renders a native button with the single-file prompt by default", () => {
    render(<FileUpload />);
    const dropzone = getDropzone();
    expect(dropzone.tagName).toBe("BUTTON");
    expect(dropzone).toHaveAttribute("type", "button");
    expect(dropzone).toHaveTextContent("Upload a file Drag or click to upload");
  });

  it("uses the plural prompt when multiple", () => {
    render(<FileUpload multiple />);
    expect(getDropzone()).toHaveTextContent(
      "Upload files Drag or click to upload",
    );
  });

  it("opens the native picker on click", () => {
    const { container } = render(<FileUpload accept=".pdf" multiple />);
    const click = vi.spyOn(getInput(container), "click");
    fireEvent.click(getDropzone());
    expect(click).toHaveBeenCalledTimes(1);
    expect(getInput(container)).toHaveAttribute("accept", ".pdf");
    expect(getInput(container)).toHaveAttribute("multiple");
    expect(getInput(container)).toHaveAttribute("tabindex", "-1");
  });

  it("passes chosen files to onFilesChange and lists them", () => {
    const onFilesChange = vi.fn();
    const { container } = render(
      <Controlled multiple onFilesChange={onFilesChange} />,
    );
    choose(container, [pdf, png]);
    expect(onFilesChange).toHaveBeenCalledWith([pdf, png]);
    expect(screen.getByText("statement.pdf")).toBeInTheDocument();
    expect(screen.getByText("receipt.png")).toBeInTheDocument();
    expect(screen.queryByText("1 KB")).toBeNull();
  });

  it("clears the native input so the same file can be chosen again", () => {
    const { container } = render(<Controlled multiple />);
    const input = getInput(container);
    choose(container, [pdf]);
    expect(input.value).toBe("");
  });

  it("adds dropped files and shows a drag-over state", () => {
    const onFilesChange = vi.fn();
    render(<Controlled multiple onFilesChange={onFilesChange} />);
    const dropzone = getDropzone();

    fireEvent.dragEnter(dropzone, { dataTransfer: { types: ["Files"] } });
    expect(dropzone).toHaveAttribute("data-drag-over");
    fireEvent.dragLeave(dropzone);
    expect(dropzone).not.toHaveAttribute("data-drag-over");

    fireEvent.dragEnter(dropzone, { dataTransfer: { types: ["Files"] } });
    drop(dropzone, [jpg]);
    expect(dropzone).not.toHaveAttribute("data-drag-over");
    expect(onFilesChange).toHaveBeenCalledWith([jpg]);
    expect(screen.getByText("passport.jpg")).toBeInTheDocument();
  });

  it("ignores drags that carry no files", () => {
    render(<Controlled multiple />);
    const dropzone = getDropzone();
    fireEvent.dragEnter(dropzone, { dataTransfer: { types: ["text/plain"] } });
    expect(dropzone).not.toHaveAttribute("data-drag-over");
  });

  it("rejects a file of the wrong type, including dropped ones", () => {
    const onReject = vi.fn();
    const onFilesChange = vi.fn();
    render(
      <Controlled
        accept=".pdf,image/*"
        onReject={onReject}
        onFilesChange={onFilesChange}
      />,
    );
    const doc = makeFile("notes.docx", "application/msword");
    drop(getDropzone(), [doc]);
    expect(onFilesChange).not.toHaveBeenCalled();
    expect(onReject).toHaveBeenCalledWith([
      {
        file: doc,
        reason: "type",
        message: "notes.docx isn’t an accepted file type.",
      },
    ]);
  });

  it("rejects a file over maxSize", () => {
    const onReject = vi.fn();
    const { container } = render(
      <Controlled maxSize={10_000_000} onReject={onReject} />,
    );
    const big = makeFile("scan.png", "image/png", 10_000_001);
    choose(container, [big]);
    expect(onReject).toHaveBeenCalledWith([
      { file: big, reason: "size", message: "scan.png is larger than 10 MB." },
    ]);
    expect(screen.queryByText("scan.png")).not.toBeInTheDocument();
  });

  it("keeps files up to maxFiles and rejects the rest", () => {
    const onReject = vi.fn();
    const onFilesChange = vi.fn();
    const { container } = render(
      <Controlled
        multiple
        maxFiles={2}
        onReject={onReject}
        onFilesChange={onFilesChange}
      />,
    );
    choose(container, [pdf, png, jpg]);
    expect(onFilesChange).toHaveBeenCalledWith([pdf, png]);
    expect(onReject).toHaveBeenCalledWith([
      { file: jpg, reason: "count", message: "You can add up to 2 files." },
    ]);
    expect(onFilesChange.mock.invocationCallOrder[0]).toBeLessThan(
      onReject.mock.invocationCallOrder[0],
    );
  });

  it("skips a file that is already in the list", () => {
    const onFilesChange = vi.fn();
    const { container } = render(
      <Controlled multiple onFilesChange={onFilesChange} />,
    );
    choose(container, [pdf]);
    choose(container, [pdf]);
    expect(onFilesChange).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText("statement.pdf")).toHaveLength(1);
  });

  it("replaces the file when single", () => {
    const onReject = vi.fn();
    const { container } = render(<Controlled onReject={onReject} />);
    choose(container, [pdf]);
    choose(container, [png]);
    expect(screen.queryByText("statement.pdf")).not.toBeInTheDocument();
    expect(screen.getByText("receipt.png")).toBeInTheDocument();

    drop(getDropzone(), [pdf, jpg]);
    expect(screen.getByText("statement.pdf")).toBeInTheDocument();
    expect(onReject).toHaveBeenCalledWith([
      { file: jpg, reason: "count", message: "You can add only one file." },
    ]);
  });

  it("removes a file and moves focus to the next row", () => {
    const onFilesChange = vi.fn();
    const { container } = render(
      <Controlled multiple onFilesChange={onFilesChange} />,
    );
    choose(container, [pdf, png]);

    fireEvent.click(
      screen.getByRole("button", { name: "Remove statement.pdf" }),
    );
    expect(onFilesChange).toHaveBeenLastCalledWith([png]);
    expect(screen.queryByText("statement.pdf")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove receipt.png" }),
    ).toHaveFocus();

    fireEvent.click(screen.getByRole("button", { name: "Remove receipt.png" }));
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(getDropzone()).toHaveFocus();
  });

  it("announces added, rejected, and removed files", () => {
    const { container } = render(<Controlled multiple accept=".pdf" />);
    const doc = makeFile("notes.docx", "application/msword");
    choose(container, [pdf, doc]);
    expect(screen.getByRole("status")).toHaveTextContent(
      "1 file added. notes.docx isn’t an accepted file type.",
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Remove statement.pdf" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Removed statement.pdf.",
    );
  });

  it("skips choosing the current file again when single", () => {
    const onFilesChange = vi.fn();
    const { container } = render(<Controlled onFilesChange={onFilesChange} />);
    choose(container, [pdf]);
    choose(container, [pdf]);
    expect(onFilesChange).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText("statement.pdf")).toHaveLength(1);
  });

  it("changes the announcement for each repeated event", () => {
    const { container } = render(<Controlled multiple />);
    choose(container, [pdf]);
    const first = screen.getByRole("status").textContent;
    choose(container, [png]);
    const second = screen.getByRole("status").textContent;
    expect(second).not.toBe(first);
    expect(screen.getByRole("status")).toHaveTextContent("1 file added.");
  });

  it("doesn't move focus on add after a removal the parent ignored", () => {
    function KeepsFiles() {
      const [files, setFiles] = React.useState([pdf]);
      return (
        <FileUpload
          multiple
          files={files}
          onFilesChange={(next) => {
            if (next.length > files.length) setFiles(next);
          }}
        />
      );
    }
    const { container } = render(<KeepsFiles />);
    fireEvent.click(
      screen.getByRole("button", { name: "Remove statement.pdf" }),
    );
    choose(container, [png]);
    for (const remove of screen.getAllByRole("button", { name: /^Remove / })) {
      expect(remove).not.toHaveFocus();
    }
  });

  it("works uncontrolled from defaultFiles", () => {
    render(<FileUpload multiple defaultFiles={[pdf]} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Remove statement.pdf" }),
    );
    expect(screen.queryByText("statement.pdf")).not.toBeInTheDocument();
  });

  it("ignores clicks, choices, and drops when disabled", () => {
    const onFilesChange = vi.fn();
    const { container } = render(
      <FileUpload
        disabled
        multiple
        defaultFiles={[pdf]}
        onFilesChange={onFilesChange}
      />,
    );
    const click = vi.spyOn(getInput(container), "click");
    const dropzone = getDropzone();
    expect(dropzone).toBeDisabled();
    expect(getInput(container)).toBeDisabled();

    fireEvent.click(dropzone);
    fireEvent.dragEnter(dropzone, { dataTransfer: { types: ["Files"] } });
    drop(dropzone, [png]);
    expect(click).not.toHaveBeenCalled();
    expect(dropzone).not.toHaveAttribute("data-drag-over");
    expect(onFilesChange).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Remove statement.pdf" }),
    ).toBeDisabled();
  });

  it("forwards its ref to the drop area button", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<FileUpload ref={ref} />);
    expect(ref.current).toBe(getDropzone());
  });
});

describe("FileUpload in Field", () => {
  it("is named by the label and prompt, and described by the hint", () => {
    render(
      <Field.Root>
        <Field.Label>Attachments</Field.Label>
        <FileUpload multiple />
        <Field.Description>PDF up to 10 MB.</Field.Description>
      </Field.Root>,
    );
    const dropzone = screen.getByRole("button", {
      name: "Attachments Upload files Drag or click to upload",
    });
    expect(dropzone).toHaveAccessibleDescription("PDF up to 10 MB.");
  });

  it("opens the picker when the label is clicked", () => {
    const { container } = render(
      <Field.Root>
        <Field.Label>Attachments</Field.Label>
        <FileUpload />
      </Field.Root>,
    );
    const click = vi.spyOn(getInput(container), "click");
    fireEvent.click(screen.getByText("Attachments"));
    expect(click).toHaveBeenCalledTimes(1);
  });

  it("shows the field's error state", () => {
    render(
      <Field.Root invalid>
        <Field.Label>Attachments</Field.Label>
        <FileUpload />
        <Field.Error>Add a file.</Field.Error>
      </Field.Root>,
    );
    const dropzone = screen.getByRole("button", { name: /^Attachments/ });
    expect(dropzone).toHaveAttribute("aria-invalid", "true");
    expect(dropzone).toHaveAttribute("data-invalid");
    expect(dropzone).toHaveAccessibleDescription("Add a file.");
  });

  it("takes disabled from the field", () => {
    render(
      <Field.Root disabled>
        <Field.Label>Attachments</Field.Label>
        <FileUpload />
      </Field.Root>,
    );
    expect(screen.getByRole("button", { name: /^Attachments/ })).toBeDisabled();
  });
});

describe("formatFileSize", () => {
  it.each([
    [512, "512 B"],
    [1200, "1 KB"],
    [999_499, "999 KB"],
    [2_450_000, "2.5 MB"],
    [10_000_000, "10 MB"],
  ])("formats %d bytes as %s", (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected);
  });
});

describe("rejectionMessage", () => {
  it("joins messages and drops repeats", () => {
    const one = makeFile("a.png", "image/png");
    const two = makeFile("b.png", "image/png");
    expect(
      rejectionMessage([
        { file: one, reason: "count", message: "You can add up to 2 files." },
        { file: two, reason: "count", message: "You can add up to 2 files." },
        { file: two, reason: "size", message: "b.png is larger than 10 MB." },
      ]),
    ).toBe("You can add up to 2 files. b.png is larger than 10 MB.");
  });
});

describe("matchesAccept", () => {
  it.each([
    [".pdf,.png", "Scan.PDF", "", true],
    ["image/*", "photo.heic", "image/heic", true],
    ["image/png", "photo.png", "image/png", true],
    ["image/png", "photo.jpg", "image/jpeg", false],
    [".pdf", "notes.docx", "application/msword", false],
    [undefined, "anything.bin", "", true],
  ])("accept=%s, %s → %s", (accept, name, type, expected) => {
    expect(matchesAccept(new File(["x"], name, { type }), accept)).toBe(
      expected,
    );
  });
});
