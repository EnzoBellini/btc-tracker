import { Download, Share, Smartphone, X } from "lucide-react";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { useAppLocale } from "@/lib/locale-context";

export function InstallAppBanner() {
  const { t } = useAppLocale();
  const { showPrompt, canInstallNative, isIos, install, dismiss } = usePwaInstall();
  const copy = t.shell.pwaInstall;

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-primary/30 bg-card/95 p-4 shadow-[0_-12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md safe-area-pb">
      <div className="mx-auto flex max-w-lg items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-primary/40 bg-primary/10">
          <Smartphone className="h-5 w-5 text-primary" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{copy.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{copy.subtitle}</p>
          {isIos && !canInstallNative && (
            <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
              <Share className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
              {copy.iosHint}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {canInstallNative && (
              <button
                type="button"
                onClick={() => void install()}
                className="inline-flex items-center gap-2 border border-primary bg-primary px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-primary-foreground transition hover:bg-primary/90"
              >
                <Download className="h-3.5 w-3.5" aria-hidden />
                {copy.action}
              </button>
            )}
            <button
              type="button"
              onClick={dismiss}
              className="inline-flex items-center border border-border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              {copy.dismiss}
            </button>
          </div>
        </div>
        <button
          type="button"
          aria-label={copy.dismiss}
          onClick={dismiss}
          className="shrink-0 p-1 text-muted-foreground transition hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
