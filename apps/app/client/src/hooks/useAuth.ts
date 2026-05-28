import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export interface AuthUserSubscription {
  status: string;
  effectivePlanId: string | null;
  hasAccess: boolean;
  trialEnded: boolean;
  daysLeftInTrial: number | null;
}

export interface AuthUser {
  id: number;
  email: string;
  emailVerified: boolean;
  mustChangePassword: boolean;
  onboardingCompleted: boolean;
  subscription?: AuthUserSubscription;
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.status === 401) return null;
        if (!res.ok) throw new Error("Auth error");
        return res.json();
      } catch {
        return null;
      }
    },
  });

  return { user: user ?? null, isLoading };
}

export function useAuthEnter() {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const res = await fetch("/api/auth/enter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao continuar");
      return data as { status: string; message?: string; email?: string };
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao reenviar");
      return data;
    },
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: async (token: string) => {
      const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Link inválido");
      return data as { ok: boolean; user: AuthUser };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao fazer login");
      return data as AuthUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => {
      const res = await fetch("/api/auth/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao alterar senha");
      return data as { ok: boolean; user: AuthUser };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data.user);
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.clear();
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async ({
      password,
      confirmEmail,
    }: {
      password: string;
      confirmEmail: string;
    }) => {
      const res = await fetch("/api/auth/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password, confirmEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao excluir conta");
      return data as { ok: boolean; message?: string };
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.clear();
    },
  });
}
