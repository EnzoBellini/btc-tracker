import LandingPage from "./LandingPage";

/** URL do app (login/dashboard). Em produção: https://app.trackion.app */
const APP_URL = (import.meta.env.VITE_APP_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export default function App() {
  const goToApp = () => {
    if (APP_URL) {
      window.location.href = APP_URL;
      return;
    }
    window.location.href = "/";
  };

  return <LandingPage onStartClick={goToApp} />;
}
