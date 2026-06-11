import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useChangePassword, useDeleteAccount } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { KeyRound, Trash2 } from "lucide-react";
import { useAppLocale } from "@/lib/locale-context";

export default function ChangePasswordPage() {
  const { t } = useAppLocale();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");
  const change = useChangePassword();
  const deleteAccount = useDeleteAccount();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirm) {
      toast.error(t.changePassword.passwordsMismatch);
      return;
    }
    try {
      await change.mutateAsync({ currentPassword, newPassword });
      toast.success(t.changePassword.success);
      setCurrent("");
      setNew("");
      setConfirm("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t.changePassword.error);
    }
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (deleteConfirmEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
      toast.error(t.changePassword.emailMismatch);
      return;
    }
    if (!window.confirm(t.changePassword.deleteConfirm)) {
      return;
    }
    try {
      await deleteAccount.mutateAsync({
        password: deletePassword,
        confirmEmail: deleteConfirmEmail.trim(),
      });
      toast.success(t.changePassword.accountDeleted);
      setLocation("/login");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t.changePassword.deleteError);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-10">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <KeyRound className="w-10 h-10 text-primary mx-auto" />
            <h1 className="text-lg font-bold text-foreground">{t.changePassword.title}</h1>
            <p className="text-sm text-muted-foreground">
              {user?.email ? (
                <>
                  {t.changePassword.loggedAs}{" "}
                  <span className="font-mono text-foreground">{user.email}</span>
                </>
              ) : (
                t.changePassword.subtitle
              )}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t.changePassword.currentPassword}</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrent(e.target.value)}
                required
                data-testid="input-current-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t.changePassword.newPassword}</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNew(e.target.value)}
                required
                minLength={12}
                data-testid="input-new-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t.changePassword.confirmPassword}</Label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                data-testid="input-confirm-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={change.isPending} data-testid="button-change-password">
              {change.isPending ? t.changePassword.saving : t.changePassword.save}
            </Button>
          </form>
        </div>

        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-4">
          <div className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-4 w-4 shrink-0" />
            <h2 className="text-sm font-semibold">{t.changePassword.deleteTitle}</h2>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t.changePassword.deleteDesc}
          </p>
          <form onSubmit={handleDeleteAccount} className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">{t.changePassword.confirmEmail}</Label>
              <Input
                type="email"
                placeholder={user?.email ?? t.login.emailPlaceholder}
                value={deleteConfirmEmail}
                onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                required
                data-testid="input-delete-confirm-email"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t.changePassword.yourPassword}</Label>
              <Input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                required
                data-testid="input-delete-password"
              />
            </div>
            <Button
              type="submit"
              variant="destructive"
              className="w-full"
              disabled={deleteAccount.isPending}
              data-testid="button-delete-account"
            >
              {deleteAccount.isPending ? t.changePassword.deleting : t.changePassword.delete}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
