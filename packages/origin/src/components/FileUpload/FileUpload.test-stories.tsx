"use client";

import * as React from "react";
import { FileUpload } from "./FileUpload";
import { rejectionMessage } from "./utils";
import { Field } from "../Field";

export function FieldFileUpload({ disabled }: { disabled?: boolean }) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [error, setError] = React.useState("");
  return (
    <div style={{ width: 360 }}>
      <Field.Root invalid={Boolean(error)} disabled={disabled}>
        <Field.Label>Attachments</Field.Label>
        <FileUpload
          multiple
          maxFiles={2}
          accept=".pdf,.png"
          files={files}
          onFilesChange={(next) => {
            setFiles(next);
            setError("");
          }}
          onReject={(rejections) => setError(rejectionMessage(rejections))}
        />
        {error ? (
          <Field.Error>{error}</Field.Error>
        ) : (
          <Field.Description>PDF or PNG.</Field.Description>
        )}
      </Field.Root>
      <span data-testid="count">{files.length}</span>
    </div>
  );
}
