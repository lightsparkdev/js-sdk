// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved
import GlobalErrorBoundary from "@lightsparkdev/private-ui/src/components/GlobalErrorBoundary";
import React from "react";
import ReactDOM from "react-dom/client";
import { Root } from "./Root";

function init() {
  const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement,
  );

  root.render(
    <React.StrictMode>
      <GlobalErrorBoundary>
        <Root />
      </GlobalErrorBoundary>
    </React.StrictMode>,
  );
}

init();
