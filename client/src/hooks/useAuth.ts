import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";

export interface AuthUser {
  id: number;
  email: string;
}

// ── Current user ──────────────────────────────────────────────────────────────
export function useAuth() {
  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 5 * 60 * 1000,
    // If 401, return null instead of throwing
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

// ── Login ─────────────────────────────────────────────────────────────────────
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
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/me"], user);
      // Não invalidar aqui — evita refetch antes do cookie ser salvo no navegador
    },
  });
}

// ── Register ──────────────────────────────────────────────────────────────────
export function useRegister() {
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao criar conta");
      return data as AuthUser;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/me"], user);
      // Não invalidar aqui — evita refetch antes do cookie ser salvo no navegador
    },
  });
}

// ── Logout ────────────────────────────────────────────────────────────────────
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
