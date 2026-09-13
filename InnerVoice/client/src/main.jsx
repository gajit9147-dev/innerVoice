import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

// Catch Vite dynamic chunk preload errors when new deployments occur
window.addEventListener("vite:preloadError", (event) => {
  console.warn("[InnerVoice] Dynamic chunk load failure after deployment, refreshing with latest bundle...");
  event.preventDefault();
  window.location.reload();
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Register PWA Service Worker in production with update detection
if ("serviceWorker" in navigator && !window.location.hostname.includes("localhost")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        // Check for service worker updates
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                console.log("[PWA] New version available, activating...");
              }
            });
          }
        });
      })
      .catch((err) => {
        console.warn("[PWA] Service Worker registration failed:", err);
      });
  });
}