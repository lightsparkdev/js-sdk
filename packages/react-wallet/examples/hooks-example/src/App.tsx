import {
  JwtAuthProvider,
  LightsparkClientProvider,
} from "@lightsparkdev/react-wallet";
import React from "react";
import "./App.css";

function App(props: { children: React.ReactNode }) {
  return (
    <div className="App">
      <LightsparkClientProvider serverUrl="api.dev.dev.sparkinfra.net">
        <JwtAuthProvider useLocalStorage>{props.children}</JwtAuthProvider>
      </LightsparkClientProvider>
    </div>
  );
}

export default App;
