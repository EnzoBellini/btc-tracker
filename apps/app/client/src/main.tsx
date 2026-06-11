import { createRoot } from "react-dom/client";
import App from "./App";
import { LocaleProvider } from "@/lib/locale-context";
import "./index.css";

if (!window.location.hash) {
  window.location.hash = "#/";
}

createRoot(document.getElementById("root")!).render(
  <LocaleProvider>
    <App />
  </LocaleProvider>,
);
