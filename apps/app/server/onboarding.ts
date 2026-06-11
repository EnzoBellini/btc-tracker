import type { Express, Request, Response } from "express";
import { requireAuth } from "./auth";
import { storage } from "./storage";
import { applyPersonalization, type QuizAnswers } from "./services/personalizationEngine";
import { toAuthUserPayload } from "./lib/authUser";

function uid(req: Request): number {
  return req.session.userId as number;
}

export function registerOnboardingRoutes(app: Express) {
  app.get("/api/onboarding/progress", requireAuth, async (req, res) => {
    const user = await storage.getUserById(uid(req));
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    const answers = await storage.getOnboardingAnswers(uid(req));
    res.json({
      step: user.onboardingStep,
      answers: answers ?? {},
      completed: user.onboardingCompleted,
    });
  });

  app.patch("/api/onboarding/progress", requireAuth, async (req, res) => {
    const { step, answers } = req.body as { step?: number; answers?: QuizAnswers };
    if (typeof step !== "number" || !answers) {
      return res.status(400).json({ error: "step e answers são obrigatórios" });
    }
    await storage.saveOnboardingProgress(uid(req), step, answers);
    res.json({ ok: true, step });
  });

  app.post("/api/onboarding/complete", requireAuth, async (req, res) => {
    const body = req.body as QuizAnswers & { locale?: string };
    const locale = body.locale === "en" ? "en" : "pt";
    const answers = { ...body };
    delete answers.locale;
    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ error: "Respostas do quiz obrigatórias" });
    }

    const userId = uid(req);
    const result = applyPersonalization(answers, locale);

    await storage.updateSettings(userId, result.settings);
    await storage.replaceUserRules(userId, result.rules);

    const existingGoals = await storage.getGoals(userId);
    for (const g of existingGoals) {
      if (g.notes?.includes("onboarding")) await storage.deleteGoal(userId, g.id);
    }
    for (const goal of result.goals) {
      await storage.createGoal(userId, goal);
    }

    await storage.replaceRoadmapItems(userId, result.roadmap);
    await storage.completeOnboarding(userId, answers, result.scores as unknown as Record<string, unknown>);

    const user = await storage.getUserById(userId);
    res.json({
      ok: true,
      profile: result.scores,
      user: user ? toAuthUserPayload(user) : null,
    });
  });

  app.get("/api/user-rules", requireAuth, async (req, res) => {
    const rules = await storage.getUserRules(uid(req));
    res.json(
      rules.map((r) => ({
        ...r,
        items: JSON.parse(r.items) as string[],
      })),
    );
  });

  app.get("/api/roadmap", requireAuth, async (req, res) => {
    const items = await storage.getRoadmapItems(uid(req));
    res.json(
      items.map((i) => ({
        ...i,
        checklist: JSON.parse(i.checklist) as { task: string; done: boolean }[],
      })),
    );
  });
}
