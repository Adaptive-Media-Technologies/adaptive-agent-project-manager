import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

// Drop the pre-boot canonical/og:url so Helmet is the single source of truth.
document.querySelectorAll("[data-early-canonical]").forEach((el) => el.remove());

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
