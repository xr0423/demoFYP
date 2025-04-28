import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthContextProvider } from "./context/authContext";
import { DarkModeContextProvider } from "./context/darkModeContext";
import { ModalProvider } from "./context/ModalContext.js";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <DarkModeContextProvider>
      <AuthContextProvider>
        <ModalProvider>
          <App />
        </ModalProvider>
      </AuthContextProvider>
    </DarkModeContextProvider>
  </React.StrictMode>
);
