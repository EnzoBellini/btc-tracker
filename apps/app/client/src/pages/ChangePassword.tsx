import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useChangePassword, useDeleteAccount } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { KeyRound, Trash2 } from "lucide-react";

export default function ChangePasswordPage() {
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
      toast.error("As senhas não coincidem");
      return;
    }
    try {
      await change.mutateAsync({ currentPassword, newPassword });
      toast.success("Senha alterada com sucesso");
      setCurrent("");
      setNew("");
      setConfirm("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro");
    }
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (deleteConfirmEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
      toast.error("Digite seu e-mail exatamente como na conta");
      return;
    }
    if (!window.confirm("Excluir sua conta permanentemente? Você poderá se cadastrar de novo com o mesmo e-mail.")) {
      return;
    }
    try {
      await deleteAccount.mutateAsync({
        password: deletePassword,
        confirmEmail: deleteConfirmEmail.trim(),
      });
      toast.success("Conta excluída");
      setLocation("/login");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir");
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-10">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <KeyRound className="w-10 h-10 text-primary mx-auto" />
            <h1 className="text-lg font-bold text-foreground">Conta</h1>
            <p className="text-sm text-muted-foreground">
              {user?.email ? (
                <>
                  Logado como <span className="font-mono text-foreground">{user.email}</span>
                </>
              ) : (
                "Altere sua senha ou exclua a conta para testar o cadastro novamente."
              )}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Senha atual</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrent(e.target.value)}
                required
                data-testid="input-current-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Nova senha (mín. 12 caracteres)</Label>
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
              <Label>Confirmar nova senha</Label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                data-testid="input-confirm-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={change.isPending} data-testid="button-change-password">
              {change.isPending ? "Salvando..." : "Salvar nova senha"}
            </Button>
          </form>
        </div>

        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-4">
          <div className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-4 w-4 shrink-0" />
            <h2 className="text-sm font-semibold">Excluir conta</h2>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Remove todos os seus dados e libera o e-mail para um novo cadastro na landing (trial de 14 dias).
            Útil para testes.
          </p>
          <form onSubmit={handleDeleteAccount} className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Confirme seu e-mail</Label>
              <Input
                type="email"
                placeholder={user?.email ?? "seu@email.com"}
                value={deleteConfirmEmail}
                onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                required
                data-testid="input-delete-confirm-email"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Sua senha</Label>
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
              {deleteAccount.isPending ? "Excluindo..." : "Excluir minha conta"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
