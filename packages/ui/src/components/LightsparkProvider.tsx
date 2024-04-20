import { ThemeProvider } from "@emotion/react";
import { GlobalStyles } from "../styles/global.js";
import { themes } from "../styles/themes.js";

type LightsparkProviderProps = {
  children: React.ReactNode;
};

export function LightsparkProvider({ children }: LightsparkProviderProps) {
  return (
    <ThemeProvider theme={themes.light}>
      <GlobalStyles />
      {children}
    </ThemeProvider>
  );
}
