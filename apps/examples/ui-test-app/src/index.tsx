// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved
import React from "react";
import ReactDOM from "react-dom/client";
import { Root } from "./Root";

function init() {
  const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement,
  );

  root.render(
    <React.StrictMode>
      <Root />
    </React.StrictMode>,
  );
}

init();
