import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GlobalStyles } from "@lightsparkdev/ui/styles/global";
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { Root } from "./Root";
import { ThemeProvider } from "@emotion/react";
import { themes } from "@lightsparkdev/ui/styles/themes";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={themes.light}>
      <GlobalStyles />
      <BrowserRouter>
        <App>
          <Root />
        </App>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
