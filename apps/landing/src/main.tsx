import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/index.css";

const fpAccountId = import.meta.env.VITE_FIRSTPROMOTER_ACCOUNT_ID as string | undefined;
if (fpAccountId?.trim()) {
  const s = document.createElement("script");
  s.src = "https://cdn.firstpromoter.com/fpr.js";
  s.async = true;
  s.onload = () => {
    const w = window as Window & { fpr?: (cmd: string, opts: { cid: string }) => void };
    w.fpr?.("init", { cid: fpAccountId.trim() });
  };
  document.head.appendChild(s);
}

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Elemento #root não encontrado em index.html");
}
createRoot(rootEl).render(<App />);
