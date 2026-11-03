import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { FileUpload, type FileUploadProps } from "./FileUpload";
import { rejectionMessage } from "./utils";
import { Field } from "@/components/Field";

const ACCEPT = ".pdf,.jpg,.jpeg,.png";

function sampleFile(name: string, type: string) {
  return new File(["sample"], name, { type, lastModified: 1 });
}

const SAMPLE_FILES = [
  sampleFile("bank-statement-september-2026.pdf", "application/pdf"),
  sampleFile("invoice-1042.png", "image/png"),
  sampleFile("passport-scan.jpg", "image/jpeg"),
];

function simulateDragOver(dropzone: HTMLElement) {
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(SAMPLE_FILES[0]);
  dropzone.dispatchEvent(
    new DragEvent("dragenter", { bubbles: true, dataTransfer }),
  );
}

interface AttachmentsFieldProps extends FileUploadProps {
  optional?: boolean;
  initialError?: string;
}

function AttachmentsField({
  optional = false,
  initialError = "",
  defaultFiles = [],
  disabled,
  ...props
}: AttachmentsFieldProps) {
  const [files, setFiles] = useState(defaultFiles);
  const [error, setError] = useState(initialError);

  return (
    <div style={{ width: "360px" }}>
      <Field.Root invalid={Boolean(error)} disabled={disabled}>
        <Field.Label>
          Attachments
          {optional && <Field.LabelSuffix>(optional)</Field.LabelSuffix>}
        </Field.Label>
        <FileUpload
          {...props}
          files={files}
          onFilesChange={(next) => {
            setFiles(next);
            setError("");
          }}
          onReject={(rejections) => setError(rejectionMessage(rejections))}
        />
        {error ? <Field.Error>{error}</Field.Error> : null}
      </Field.Root>
    </div>
  );
}

const meta: Meta<typeof FileUpload> = {
  title: "Components/FileUpload",
  component: FileUpload,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    multiple: { control: "boolean" },
    disabled: { control: "boolean" },
    accept: { control: "text" },
    maxFiles: { control: "number" },
    maxSize: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof FileUpload>;

export const Default: Story = {
  args: {
    multiple: true,
    accept: ACCEPT,
    maxFiles: 5,
    maxSize: 10_000_000,
    disabled: false,
  },
  render: (args) => <AttachmentsField {...args} optional />,
  parameters: {
    docs: {
      description: {
        story:
          "Rejected files show their messages in `Field.Error`. Adding or removing a file clears the error.",
      },
    },
  },
};

export const SingleFile: Story = {
  render: () => (
    <AttachmentsField
      optional
      accept={ACCEPT}
      maxSize={10_000_000}
      defaultFiles={SAMPLE_FILES.slice(2)}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Without `multiple`, a new file replaces the chosen one.",
      },
    },
  },
};

export const SeveralFiles: Story = {
  render: () => (
    <AttachmentsField
      optional
      multiple
      accept={ACCEPT}
      maxFiles={5}
      maxSize={10_000_000}
      defaultFiles={SAMPLE_FILES}
    />
  ),
};

export const DragOver: Story = {
  render: () => (
    <AttachmentsField
      optional
      multiple
      accept={ACCEPT}
      maxFiles={5}
      maxSize={10_000_000}
    />
  ),
  play: async ({ canvas }) => {
    simulateDragOver(canvas.getByRole("button", { name: /upload files/i }));
  },
  parameters: {
    docs: {
      description: {
        story:
          "A file dragged over the drop area. The state holds until the pointer leaves.",
      },
      story: { autoplay: true },
    },
  },
};

export const WithError: Story = {
  name: "Error",
  render: () => (
    <AttachmentsField
      optional
      multiple
      accept={ACCEPT}
      maxFiles={5}
      maxSize={10_000_000}
      initialError="Upload a PDF, JPEG, or PNG file."
    />
  ),
};

export const Disabled: Story = {
  render: () => (
    <AttachmentsField
      optional
      multiple
      accept={ACCEPT}
      maxFiles={5}
      maxSize={10_000_000}
      defaultFiles={SAMPLE_FILES.slice(0, 1)}
      disabled
    />
  ),
};
