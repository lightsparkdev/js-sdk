import { ThemeProvider } from "@emotion/react";
import { themes } from "../styles/colors.js";
import { GlobalStyles } from "../styles/global.js";

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
