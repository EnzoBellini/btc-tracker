import type { Express } from "express";
import {
  createAffiliatePartner,
  getPublicAffiliate,
  listAffiliatesWithStats,
  setAffiliateActive,
} from "./service";
import * as billingStorage from "../billing/storage";

function requireAdminKey(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) {
  const key = process.env.ADMIN_API_KEY;
  if (!key) return res.status(503).json({ error: "ADMIN_API_KEY não configurada" });
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : req.headers["x-admin-key"];
  if (token !== key) return res.status(401).json({ error: "Não autorizado" });
  next();
}

export function registerAffiliateRoutes(app: Express) {
  app.get("/api/affiliates/:slug", async (req, res) => {
    const data = await getPublicAffiliate(req.params.slug);
    if (!data) return res.status(404).json({ error: "Afiliado não encontrado" });
    res.json(data);
  });

  app.use("/api/admin/affiliates", requireAdminKey);

  app.get("/api/admin/affiliates", async (req, res) => {
    const periodDays = parseInt(String(req.query.periodDays ?? "30"), 10);
    const rows = await listAffiliatesWithStats(Number.isFinite(periodDays) ? periodDays : 30);
    res.json({ rows });
  });

  app.post("/api/admin/affiliates", async (req, res) => {
    try {
      const { name, slug, couponCode, discountPct, promoterEmail } = req.body as {
        name?: string;
        slug?: string;
        couponCode?: string;
        discountPct?: number;
        promoterEmail?: string;
      };
      if (!name || !slug || !couponCode) {
        return res.status(400).json({ error: "name, slug e couponCode são obrigatórios" });
      }
      const result = await createAffiliatePartner({
        name,
        slug,
        couponCode,
        discountPct: discountPct ?? 20,
        promoterEmail,
      });
      await billingStorage.insertAdminAudit("affiliate_create", undefined, {
        slug: result.affiliate.slug,
        couponCode: result.affiliate.couponCode,
      });
      res.status(201).json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao criar afiliado";
      res.status(400).json({ error: msg });
    }
  });

  app.patch("/api/admin/affiliates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (!Number.isFinite(id)) return res.status(400).json({ error: "id inválido" });
      const { isActive } = req.body as { isActive?: boolean };
      if (typeof isActive !== "boolean") {
        return res.status(400).json({ error: "isActive é obrigatório" });
      }
      const affiliate = await setAffiliateActive(id, isActive);
      res.json({ affiliate });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro";
      res.status(400).json({ error: msg });
    }
  });
}
