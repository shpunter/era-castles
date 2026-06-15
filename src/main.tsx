import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

// Standalone dev/preview entry. In production the host loads `./App` directly
// via Module Federation, so this file never runs inside the host.
// biome-ignore lint/style/noNonNullAssertion: #root always exists in index.html
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
