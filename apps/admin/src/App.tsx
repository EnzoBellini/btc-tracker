import { useEffect, useState } from "react";
import { formatPlanPrice, PLAN_CATALOG } from "@trackion/billing";
import { adminFetch, getAdminKey, setAdminKey } from "./lib/api";
import AffiliatesPage from "./pages/Affiliates";

type SubRow = {
  id: number;
  userId: number;
  email: string;
  planId: string;
  status: string;
  trialEndsAt: string | null;
  updatedAt: string;
};

type Tab = "subscriptions" | "affiliates";

export default function App() {
  const [key, setKey] = useState(getAdminKey);
  const [keyInput, setKeyInput] = useState("");
  const [tab, setTab] = useState<Tab>("subscriptions");
  const [stats, setStats] = useState<{ trialing: number; active: number; expiringIn7d: number } | null>(null);
  const [rows, setRows] = useState<SubRow[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const authed = !!key;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, list] = await Promise.all([
        adminFetch("/api/admin/stats"),
        adminFetch(`/api/admin/subscriptions?q=${encodeURIComponent(q)}&limit=100`),
      ]);
      setStats(s as typeof stats);
      setRows((list as { rows: SubRow[] }).rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed && tab === "subscriptions") load();
  }, [authed, tab]);

  const login = () => {
    setAdminKey(keyInput.trim());
    setKey(keyInput.trim());
  };

  const extendTrial = async (userId: number, days: number) => {
    await adminFetch(`/api/admin/users/${userId}/subscription`, {
      method: "PATCH",
      body: JSON.stringify({ extendTrialDays: days }),
    });
    await load();
  };

  const setPlan = async (userId: number, planId: string, status: string) => {
    await adminFetch(`/api/admin/users/${userId}/subscription`, {
      method: "PATCH",
      body: JSON.stringify({ planId, status }),
    });
    await load();
  };

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="w-full max-w-md border border-zinc-700 bg-zinc-900 p-8">
          <h1 className="text-xl font-bold">Trackion Admin</h1>
          <p className="mt-2 text-sm text-zinc-400">Informe ADMIN_API_KEY do servidor</p>
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            className="mt-4 w-full border border-zinc-600 bg-black px-3 py-2 text-sm"
            placeholder="API key"
          />
          <button
            type="button"
            onClick={login}
            className="mt-4 w-full bg-orange-500 py-2 text-sm font-bold text-black"
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold">Trackion Admin</h1>
          <p className="text-sm text-zinc-500">Assinaturas e afiliados</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("subscriptions")}
            className={`px-3 py-1.5 text-sm ${tab === "subscriptions" ? "bg-orange-500 text-black" : "border border-zinc-600"}`}
          >
            Assinaturas
          </button>
          <button
            type="button"
            onClick={() => setTab("affiliates")}
            className={`px-3 py-1.5 text-sm ${tab === "affiliates" ? "bg-orange-500 text-black" : "border border-zinc-600"}`}
          >
            Afiliados
          </button>
        </div>
      </header>

      {tab === "affiliates" ? (
        <AffiliatesPage />
      ) : (
        <>
          <div className="mb-4 flex gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar e-mail"
              className="border border-zinc-700 bg-black px-3 py-1.5 text-sm"
            />
            <button type="button" onClick={load} className="border border-zinc-600 px-3 py-1.5 text-sm">
              Buscar
            </button>
          </div>

          {error && <p className="mb-4 text-red-400">{error}</p>}

          {stats && (
            <div className="mb-8 grid grid-cols-3 gap-4">
              {[
                ["Trials ativos", stats.trialing],
                ["Assinaturas ativas", stats.active],
                ["Expirando em 7d", stats.expiringIn7d],
              ].map(([label, val]) => (
                <div key={label as string} className="border border-zinc-800 bg-zinc-900 p-4">
                  <p className="text-xs uppercase text-zinc-500">{label}</p>
                  <p className="text-2xl font-bold">{val}</p>
                </div>
              ))}
            </div>
          )}

          <section className="mb-8">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-zinc-500">Catálogo (fixo)</h2>
            <div className="grid gap-3 md:grid-cols-3">
              {Object.values(PLAN_CATALOG).map((p) => (
                <div key={p.id} className="border border-zinc-800 p-3 text-sm">
                  <p className="font-semibold">{p.name}</p>
                  <p>{formatPlanPrice(p)} / mês</p>
                </div>
              ))}
            </div>
          </section>

          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-zinc-500">Usuários</h2>
          {loading ? (
            <p className="text-zinc-500">Carregando…</p>
          ) : (
            <div className="overflow-x-auto border border-zinc-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-900 text-xs uppercase text-zinc-500">
                  <tr>
                    <th className="px-3 py-2">E-mail</th>
                    <th className="px-3 py-2">Plano</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Trial até</th>
                    <th className="px-3 py-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-t border-zinc-800">
                      <td className="px-3 py-2">{r.email}</td>
                      <td className="px-3 py-2">{r.planId}</td>
                      <td className="px-3 py-2">{r.status}</td>
                      <td className="px-3 py-2">
                        {r.trialEndsAt ? new Date(r.trialEndsAt).toLocaleDateString("pt-BR") : "—"}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          <button
                            type="button"
                            className="border border-zinc-600 px-2 py-0.5 text-xs"
                            onClick={() => extendTrial(r.userId, 7)}
                          >
                            +7d trial
                          </button>
                          <button
                            type="button"
                            className="border border-zinc-600 px-2 py-0.5 text-xs"
                            onClick={() => setPlan(r.userId, "pro", "active")}
                          >
                            Pro ativo
                          </button>
                          <button
                            type="button"
                            className="border border-zinc-600 px-2 py-0.5 text-xs"
                            onClick={() => setPlan(r.userId, "elite", "expired")}
                          >
                            Expirar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
