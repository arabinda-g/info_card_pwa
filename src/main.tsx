import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { registerServiceWorker } from "./pwa/registerSW";
import { ThemeProvider } from "./hooks/useTheme";

registerServiceWorker();

const preventZoom = () => {
  const options: AddEventListenerOptions = { passive: false, capture: true };
  const preventGesture: EventListener = (event) => event.preventDefault();
  const preventMultiTouch: EventListener = (event) => {
    const touchEvent = event as TouchEvent;
    if (touchEvent.touches?.length > 1 && event.cancelable) {
      event.preventDefault();
    }
  };
  const preventCtrlWheel: EventListener = (event) => {
    const wheelEvent = event as WheelEvent;
    if (wheelEvent.ctrlKey && event.cancelable) {
      event.preventDefault();
    }
  };

  const gestureEvents = ["gesturestart", "gesturechange", "gestureend"] as const;
  gestureEvents.forEach((type) => {
    document.addEventListener(type, preventGesture, options);
  });

  document.addEventListener("touchstart", preventMultiTouch, options);
  window.addEventListener("touchstart", preventMultiTouch, options);
  document.addEventListener("touchmove", preventMultiTouch, options);
  window.addEventListener("touchmove", preventMultiTouch, options);

  document.addEventListener("wheel", preventCtrlWheel, options);
  window.addEventListener("wheel", preventCtrlWheel, options);
};

preventZoom();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
