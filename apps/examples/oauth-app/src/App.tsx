import React from "react";
import "./App.css";
import AuthProvider from "./auth/AuthProvider";
import LightsparkClientProvider from "./lightsparkclient/LightsparkClientProvider";

function App(props: { children: React.ReactNode }) {
  return (
    <div className="App">
      <LightsparkClientProvider>
        <AuthProvider>{props.children}</AuthProvider>
      </LightsparkClientProvider>
    </div>
  );
}

export default App;
