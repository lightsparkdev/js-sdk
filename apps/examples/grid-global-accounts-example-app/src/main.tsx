import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@lightsparkdev/origin/styles.css";
// App-level dark-mode contrast overrides. MUST come after Origin's styles so
// our token re-definitions win by source order. See theme-overrides.css.
import "./theme-overrides.css";

import { App } from "./App";

const container = document.getElementById("root");
if (!container) throw new Error("#root not found");
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
