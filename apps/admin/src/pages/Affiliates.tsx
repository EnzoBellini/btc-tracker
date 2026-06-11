import { useEffect, useState } from "react";
import { adminFetch } from "../lib/api";

type AffiliateRow = {
  id: number;
  name: string;
  slug: string;
  couponCode: string;
  discountPct: number;
  isActive: boolean;
  links: { landing: string; checkout: string };
  stats: {
    clicks: number;
    signups: number;
    conversions: number;
    revenue: number;
    clickToSignupPct: number | null;
    signupToConversionPct: number | null;
  };
};

export default function AffiliatesPage() {
  const [rows, setRows] = useState<AffiliateRow[]>([]);
  const [periodDays, setPeriodDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    couponCode: "",
    discountPct: 20,
  });
  const [lastCreated, setLastCreated] = useState<{ landing: string; checkout: string } | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await adminFetch(`/api/admin/affiliates?periodDays=${periodDays}`)) as {
        rows: AffiliateRow[];
      };
      setRows(data.rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [periodDays]);

  const create = async () => {
    setCreating(true);
    setError(null);
    try {
      const result = (await adminFetch("/api/admin/affiliates", {
        method: "POST",
        body: JSON.stringify(form),
      })) as { links: { landing: string; checkout: string } };
      setLastCreated(result.links);
      setForm({ name: "", slug: "", couponCode: "", discountPct: 20 });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao criar");
    } finally {
      setCreating(false);
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  };

  const toggleActive = async (id: number, isActive: boolean) => {
    await adminFetch(`/api/admin/affiliates/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ isActive: !isActive }),
    });
    await load();
  };

  return (
    <div className="space-y-8">
      <section className="border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Novo afiliado</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <input
            placeholder="Nome (ex: CWF)"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="border border-zinc-700 bg-black px-3 py-2 text-sm"
          />
          <input
            placeholder="Slug (ex: cwf)"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase() }))}
            className="border border-zinc-700 bg-black px-3 py-2 text-sm"
          />
          <input
            placeholder="Cupom (ex: AFL20)"
            value={form.couponCode}
            onChange={(e) => setForm((f) => ({ ...f, couponCode: e.target.value.toUpperCase() }))}
            className="border border-zinc-700 bg-black px-3 py-2 text-sm"
          />
          <input
            type="number"
            min={1}
            max={100}
            placeholder="Desconto %"
            value={form.discountPct}
            onChange={(e) => setForm((f) => ({ ...f, discountPct: Number(e.target.value) }))}
            className="border border-zinc-700 bg-black px-3 py-2 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={create}
          disabled={creating}
          className="mt-4 bg-orange-500 px-4 py-2 text-sm font-bold text-black disabled:opacity-50"
        >
          {creating ? "Criando…" : "Criar link + cupom"}
        </button>
        {lastCreated && (
          <div className="mt-4 space-y-2 text-sm text-zinc-300">
            <p>Link divulgação: <code className="text-orange-300">{lastCreated.landing}</code></p>
            <p>Link checkout: <code className="text-orange-300">{lastCreated.checkout}</code></p>
          </div>
        )}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Afiliados</h2>
        <select
          value={periodDays}
          onChange={(e) => setPeriodDays(Number(e.target.value))}
          className="border border-zinc-700 bg-black px-2 py-1 text-sm"
        >
          <option value={7}>7 dias</option>
          <option value={30}>30 dias</option>
          <option value={90}>90 dias</option>
        </select>
        <button type="button" onClick={load} className="border border-zinc-600 px-3 py-1 text-sm">
          Atualizar
        </button>
        <a
          href="https://firstpromoter.com"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-orange-400 underline"
        >
          Abrir FirstPromoter
        </a>
      </div>

      {error && <p className="text-red-400">{error}</p>}

      {loading ? (
        <p className="text-zinc-500">Carregando…</p>
      ) : (
        <div className="overflow-x-auto border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-3 py-2">Parceiro</th>
                <th className="px-3 py-2">Link</th>
                <th className="px-3 py-2">Cupom</th>
                <th className="px-3 py-2">Cliques</th>
                <th className="px-3 py-2">Signups</th>
                <th className="px-3 py-2">Conversões</th>
                <th className="px-3 py-2">Taxa</th>
                <th className="px-3 py-2">Receita</th>
                <th className="px-3 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-zinc-800">
                  <td className="px-3 py-2">
                    <p className="font-medium">{r.name}</p>
                    <p className="text-xs text-zinc-500">/{r.slug}</p>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      className="text-xs text-orange-400 underline"
                      onClick={() => copy(r.links.landing)}
                    >
                      copiar
                    </button>
                  </td>
                  <td className="px-3 py-2">{r.couponCode}</td>
                  <td className="px-3 py-2">{r.stats.clicks}</td>
                  <td className="px-3 py-2">{r.stats.signups}</td>
                  <td className="px-3 py-2">{r.stats.conversions}</td>
                  <td className="px-3 py-2 text-xs text-zinc-400">
                    {r.stats.clickToSignupPct != null ? `${r.stats.clickToSignupPct}% cl→su` : "—"}
                    <br />
                    {r.stats.signupToConversionPct != null ? `${r.stats.signupToConversionPct}% su→cv` : ""}
                  </td>
                  <td className="px-3 py-2">
                    {(r.stats.revenue / 100).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      className="border border-zinc-600 px-2 py-0.5 text-xs"
                      onClick={() => toggleActive(r.id, r.isActive)}
                    >
                      {r.isActive ? "Desativar" : "Ativar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
