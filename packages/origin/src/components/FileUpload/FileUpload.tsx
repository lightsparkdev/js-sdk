"use client";

import * as React from "react";
import { Field as BaseField } from "@base-ui/react/field";
import { mergeProps } from "@base-ui/react/merge-props";
import clsx from "clsx";
import { Avatar } from "../Avatar";
import { Button } from "../Button";
import { CentralIcon } from "../Icon";
import {
  rejectionMessage,
  selectFiles,
  type FileUploadRejection,
} from "./utils";
import styles from "./FileUpload.module.scss";

export interface FileUploadProps
  extends Omit<
    React.ComponentPropsWithoutRef<"button">,
    "children" | "defaultValue" | "name" | "onChange" | "type" | "value"
  > {
  /** Chosen files. Pair with `onFilesChange` to control the list. */
  files?: File[];
  /** Initial files when uncontrolled. */
  defaultFiles?: File[];
  /** Called with the next file list after files are added or removed. */
  onFilesChange?: (files: File[]) => void;
  /**
   * Called with files that were turned away for type, size, or count.
   * Fires after `onFilesChange` when a selection is partly accepted.
   */
  onReject?: (rejections: FileUploadRejection[]) => void;
  /** File types to allow, in the native `accept` format (`.pdf,image/*`). */
  accept?: string;
  /** Allow more than one file. A single-file upload replaces its file. */
  multiple?: boolean;
  /** Most files the list can hold when `multiple`. */
  maxFiles?: number;
  /** Largest allowed file, in bytes. */
  maxSize?: number;
  /** Overrides the drop area text. */
  prompt?: React.ReactNode;
}

export const FileUpload = React.forwardRef<HTMLButtonElement, FileUploadProps>(
  function FileUpload(props, ref) {
    const {
      files: filesProp,
      defaultFiles,
      onFilesChange,
      onReject,
      accept,
      multiple = false,
      maxFiles,
      maxSize,
      prompt,
      disabled: disabledProp = false,
      className,
      style,
      id,
      ...buttonProps
    } = props;

    const [uncontrolledFiles, setUncontrolledFiles] = React.useState<File[]>(
      defaultFiles ?? [],
    );
    const files = filesProp ?? uncontrolledFiles;
    const inputRef = React.useRef<HTMLInputElement>(null);
    const dropzoneRef = React.useRef<HTMLButtonElement | null>(null);
    const listRef = React.useRef<HTMLUListElement>(null);
    const focusAfterRemove = React.useRef<number | null>(null);
    const [dragOver, setDragOver] = React.useState(false);
    const [announcement, setAnnouncement] = React.useState("");
    const promptId = React.useId();

    const mergedRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        dropzoneRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    // Screen readers only announce a status when its text changes, so a
    // repeated message gets a trailing no-break space.
    const announce = (message: string) => {
      if (!message) return;
      setAnnouncement((previous) =>
        previous === message ? `${message}\u00A0` : message,
      );
    };

    const commit = (next: File[]) => {
      if (filesProp === undefined) setUncontrolledFiles(next);
      onFilesChange?.(next);
    };

    const addFiles = (incoming: File[]) => {
      if (incoming.length === 0) return;
      focusAfterRemove.current = null;
      const result = selectFiles(files, incoming, {
        accept,
        maxSize,
        maxFiles: multiple ? maxFiles ?? Infinity : 1,
        multiple,
      });
      if (result.added > 0) commit(result.files);
      if (result.rejections.length > 0) onReject?.(result.rejections);
      announce(
        [
          result.added > 0 &&
            `${result.added} ${result.added === 1 ? "file" : "files"} added.`,
          rejectionMessage(result.rejections),
        ]
          .filter(Boolean)
          .join(" "),
      );
    };

    const removeFile = (index: number) => {
      focusAfterRemove.current = index;
      announce(`Removed ${files[index]?.name}.`);
      commit(files.filter((_, i) => i !== index));
    };

    // Removing a row unmounts the focused button, so focus moves to the row
    // that took its place, or back to the drop area once the list is empty.
    React.useEffect(() => {
      const index = focusAfterRemove.current;
      if (index === null) return;
      focusAfterRemove.current = null;
      const removeButtons =
        listRef.current?.querySelectorAll<HTMLButtonElement>(
          "[data-file-upload-remove]",
        ) ?? [];
      const next = removeButtons[Math.min(index, removeButtons.length - 1)];
      (next ?? dropzoneRef.current)?.focus();
    }, [files]);

    return (
      <BaseField.Control
        ref={mergedRef}
        id={id}
        disabled={disabledProp}
        {...(buttonProps as BaseField.Control.Props)}
        render={(controlProps, state) => {
          const disabled = state.disabled;
          const labelledBy = controlProps["aria-labelledby"];
          const isFileDrag = (event: React.DragEvent) =>
            event.dataTransfer.types.includes("Files");

          return (
            <div
              className={clsx(styles.root, className)}
              style={style}
              data-disabled={disabled ? "" : undefined}
            >
              <button
                {...(mergeProps<"button">(
                  controlProps as React.ComponentPropsWithRef<"button">,
                  {
                    type: "button",
                    className: styles.dropzone,
                    "aria-labelledby": labelledBy
                      ? `${labelledBy} ${promptId}`
                      : undefined,
                    "data-drag-over": dragOver ? "" : undefined,
                    onClick() {
                      if (!disabled) inputRef.current?.click();
                    },
                    onDragEnter(event) {
                      if (!isFileDrag(event)) return;
                      event.preventDefault();
                      if (!disabled) setDragOver(true);
                    },
                    onDragOver(event) {
                      if (!isFileDrag(event)) return;
                      // Without preventDefault the browser opens the file instead.
                      event.preventDefault();
                      event.dataTransfer.dropEffect = disabled
                        ? "none"
                        : "copy";
                    },
                    onDragLeave() {
                      setDragOver(false);
                    },
                    onDrop(event) {
                      if (!isFileDrag(event)) return;
                      event.preventDefault();
                      setDragOver(false);
                      if (!disabled) {
                        addFiles(Array.from(event.dataTransfer.files));
                      }
                    },
                  } as React.ComponentPropsWithRef<"button">,
                ) as React.ComponentPropsWithRef<"button">)}
              >
                <Avatar.Root
                  size="32"
                  color="gray"
                  variant="squircle"
                  className={styles.iconAvatar}
                  aria-hidden
                >
                  <Avatar.Fallback>
                    <CentralIcon
                      name="IconShareOs"
                      size={16}
                      className={styles.icon}
                    />
                  </Avatar.Fallback>
                </Avatar.Root>
                <span id={promptId} className={styles.prompt}>
                  {prompt ?? (
                    <>
                      <span className={styles.promptTitle}>
                        {multiple ? "Upload files" : "Upload a file"}
                      </span>{" "}
                      <span className={styles.promptHint}>
                        Drag or click to upload
                      </span>
                    </>
                  )}
                </span>
              </button>
              <input
                ref={inputRef}
                type="file"
                className={styles.input}
                accept={accept}
                multiple={multiple}
                disabled={disabled}
                tabIndex={-1}
                aria-hidden
                onChange={(event) => {
                  addFiles(Array.from(event.currentTarget.files ?? []));
                  // Clearing lets the same file be chosen again after removal.
                  event.currentTarget.value = "";
                }}
              />
              <span role="status" className={styles.status}>
                {announcement}
              </span>
              {files.length > 0 && (
                <ul ref={listRef} className={styles.list}>
                  {files.map((file, index) => (
                    <li
                      key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                      className={styles.item}
                    >
                      <CentralIcon
                        name="IconFileBend"
                        size={16}
                        className={styles.itemIcon}
                      />
                      <span className={styles.itemName} title={file.name}>
                        {file.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="compact"
                        iconOnly
                        className={styles.remove}
                        aria-label={`Remove ${file.name}`}
                        leadingIcon={
                          <CentralIcon name="IconCrossSmall" size={16} />
                        }
                        disabled={disabled}
                        data-file-upload-remove=""
                        onClick={() => removeFile(index)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        }}
      />
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  FileUpload.displayName = "FileUpload";
}

export default FileUpload;
