import { ThemeProvider } from "@emotion/react";
import { themes } from "@lightsparkdev/ui/styles/themes";
import { render as tlRender } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

function Providers({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={themes.dark}>{children}</ThemeProvider>;
}

export function render(renderElement: ReactElement) {
  return tlRender(renderElement, {
    wrapper: Providers,
  });
}
