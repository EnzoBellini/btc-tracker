import { Button } from "@/components/ui/button";

import { useAppLocale } from "@/lib/locale-context";

import { LayoutDashboard, Plug, Sparkles } from "lucide-react";



export function getOnboardingWelcomeArchetype(): string | null {

  try {

    return sessionStorage.getItem("trackion_onboarding_welcome");

  } catch {

    return null;

  }

}



export function setOnboardingWelcomeArchetype(archetype: string) {

  try {

    sessionStorage.setItem("trackion_onboarding_welcome", archetype);

  } catch {

    /* ignore */

  }

}



export function clearOnboardingWelcome() {

  try {

    sessionStorage.removeItem("trackion_onboarding_welcome");

  } catch {

    /* ignore */

  }

}



type OnboardingWelcomeProps = {

  onNavigate: (path: string) => void;

};



export default function OnboardingWelcome({ onNavigate }: OnboardingWelcomeProps) {

  const { t } = useAppLocale();

  const q = t.onboarding;

  const archetype = getOnboardingWelcomeArchetype() ?? q.configuredDefault;



  function goTo(path: string) {

    clearOnboardingWelcome();

    onNavigate(path);

  }



  return (

    <div className="min-h-screen bg-background flex items-center justify-center p-6">

      <div className="w-full max-w-lg space-y-6 border border-border bg-card rounded-lg p-8 text-center">

        <Sparkles className="w-8 h-8 text-primary mx-auto" />

        <h1 className="text-xl font-bold">{q.welcomeTitle}</h1>

        <p className="text-sm text-muted-foreground">{q.welcomeSubtitle}</p>

        <p className="text-sm font-medium text-primary">{q.welcomeArchetype(archetype)}</p>

        <div className="flex flex-col gap-3 pt-2">

          <Button type="button" onClick={() => goTo("/api-settings")}>

            <Plug className="w-4 h-4 mr-2" /> {q.connectExchange}

          </Button>

          <Button type="button" variant="outline" onClick={() => goTo("/")}>

            <LayoutDashboard className="w-4 h-4 mr-2" /> {q.exploreDashboard}

          </Button>

        </div>

      </div>

    </div>

  );

}

