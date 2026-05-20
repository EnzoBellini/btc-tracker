import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChangePassword } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { KeyRound } from "lucide-react";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const change = useChangePassword();

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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <KeyRound className="w-10 h-10 text-primary mx-auto" />
          <h1 className="text-lg font-bold text-foreground">Defina sua senha</h1>
          <p className="text-sm text-muted-foreground">
            Por segurança, substitua a senha temporária enviada por e-mail.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Senha atual (temporária)</Label>
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
    </div>
  );
}
