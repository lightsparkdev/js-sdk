import { ThemeProvider } from "@emotion/react";
import { themes } from "@lightsparkdev/ui/styles/themes";
import { GlobalStyles } from "@lightsparkdev/ui/styles/global";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes as RRoutes } from "react-router-dom";
import App from "./App";
import "./index.css";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import reportWebVitals from "./reportWebVitals";
import { Routes } from "./routes";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={themes.light}>
      <GlobalStyles />
      <BrowserRouter basename={"/"}>
        <App>
          <RRoutes>
            <Route path={Routes.Dashboard} element={<DashboardPage />} />
            <Route path={Routes.Login} element={<LoginPage />} />
          </RRoutes>
        </App>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
