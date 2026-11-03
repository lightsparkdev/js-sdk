export type FileUploadRejectionReason = "type" | "size" | "count";

export interface FileUploadRejection {
  file: File;
  reason: FileUploadRejectionReason;
  /** A ready-to-show message, suitable for `Field.Error`. */
  message: string;
}

const sizeFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

/** Formats bytes with decimal units (1 MB = 1,000,000 bytes), as macOS does. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1000) return `${bytes} B`;
  if (bytes < 1_000_000) return `${Math.round(bytes / 1000)} KB`;
  return `${sizeFormat.format(bytes / 1_000_000)} MB`;
}

/**
 * Matches a file against an `accept` string the way the native picker does:
 * `.pdf` checks the extension, `image/*` the type family, `image/png` the
 * exact type. Dropped files skip the picker's filter, so they need this.
 */
export function matchesAccept(file: File, accept: string | undefined): boolean {
  const tokens = (accept ?? "")
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) return true;

  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return tokens.some((token) => {
    if (token.startsWith(".")) return name.endsWith(token);
    if (token.endsWith("/*")) return type.startsWith(token.slice(0, -1));
    return type === token;
  });
}

/** Joins rejection messages into one line for `Field.Error`, without repeats. */
export function rejectionMessage(rejections: FileUploadRejection[]): string {
  return [...new Set(rejections.map(({ message }) => message))].join(" ");
}

export function isSameFile(a: File, b: File): boolean {
  return (
    a.name === b.name && a.size === b.size && a.lastModified === b.lastModified
  );
}

interface SelectionLimits {
  accept: string | undefined;
  maxSize: number | undefined;
  maxFiles: number;
  multiple: boolean;
}

/**
 * Splits incoming files into the next file list and the files that were
 * turned away. A single-file upload replaces its file instead of rejecting.
 * Files already in the list are skipped silently.
 */
export function selectFiles(
  current: File[],
  incoming: File[],
  { accept, maxSize, maxFiles, multiple }: SelectionLimits,
): { files: File[]; added: number; rejections: FileUploadRejection[] } {
  const kept = multiple ? current : [];
  const alreadyChosen = multiple ? kept : current;
  const added: File[] = [];
  const rejections: FileUploadRejection[] = [];

  for (const file of incoming) {
    if (!matchesAccept(file, accept)) {
      rejections.push({
        file,
        reason: "type",
        message: `${file.name} isn’t an accepted file type.`,
      });
      continue;
    }
    if (maxSize !== undefined && file.size > maxSize) {
      rejections.push({
        file,
        reason: "size",
        message: `${file.name} is larger than ${formatFileSize(maxSize)}.`,
      });
      continue;
    }
    if ([...alreadyChosen, ...added].some((other) => isSameFile(other, file))) {
      continue;
    }
    if (kept.length + added.length >= maxFiles) {
      rejections.push({
        file,
        reason: "count",
        message:
          maxFiles === 1
            ? "You can add only one file."
            : `You can add up to ${maxFiles} files.`,
      });
      continue;
    }
    added.push(file);
  }

  return { files: [...kept, ...added], added: added.length, rejections };
}
