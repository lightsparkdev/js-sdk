import { useEffect } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect.js";

export const useDocumentTitle = (defaultPrefix: string, title: string) => {
  useIsomorphicLayoutEffect(() => {
    // Sets the new document title
    window.document.title = `${defaultPrefix} - ${title}`;
  }, [title, defaultPrefix]);

  useEffect(() => {
    return () => {
      window.document.title = defaultPrefix;
    };
  }, [defaultPrefix]);
};
