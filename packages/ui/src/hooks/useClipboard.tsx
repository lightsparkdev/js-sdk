import { useCallback, useMemo, useState } from "react";

type UseClipboardArgs =
  | {
      onWriteEmptyText?: () => void | undefined;
      onWriteError?: () => void | undefined;
      onWrite?: () => void | undefined;
      onReadError?: () => void | undefined;
    }
  | undefined;

export function useClipboard(clipboardArgs: UseClipboardArgs) {
  const { onWriteEmptyText, onWriteError, onWrite, onReadError } = useMemo(
    () => ({
      onWriteEmptyText: clipboardArgs?.onWriteEmptyText,
      onWriteError: clipboardArgs?.onWriteError,
      onWrite: clipboardArgs?.onWrite,
      onReadError: clipboardArgs?.onReadError,
    }),
    [clipboardArgs],
  );

  const [canReadFromClipboard, setCanReadFromClipboard] = useState(
    typeof navigator.clipboard?.readText !== "undefined",
  );
  const [canWriteToClipboard, setCanWriteToClipboard] = useState(
    typeof navigator.clipboard?.writeText !== "undefined",
  );

  const writeTextToClipboard = useCallback(
    async (text: string) => {
      try {
        if (!text.trim()) {
          if (onWriteEmptyText) {
            onWriteEmptyText();
          }
        } else {
          await navigator.clipboard.writeText(text);
          if (onWrite) {
            onWrite();
          }
        }
      } catch (error) {
        if (onWriteError) {
          onWriteError();
        }
        setCanWriteToClipboard(false);
      }
    },
    [onWrite, onWriteEmptyText, onWriteError],
  );

  const readTextFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      return text;
    } catch (error) {
      if (onReadError) {
        onReadError();
      }
      setCanReadFromClipboard(false);
      return null;
    }
  }, [onReadError]);

  const clipboard = useMemo(
    () => ({
      canReadFromClipboard,
      canWriteToClipboard,
      readTextFromClipboard,
      writeTextToClipboard,
    }),
    [
      canReadFromClipboard,
      canWriteToClipboard,
      readTextFromClipboard,
      writeTextToClipboard,
    ],
  );

  return clipboard;
}
