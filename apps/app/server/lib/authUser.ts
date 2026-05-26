import type { User } from "@shared/schema";

export interface AuthUserSubscription {
  status: string;
  effectivePlanId: string | null;
  hasAccess: boolean;
  trialEnded: boolean;
  daysLeftInTrial: number | null;
}

export interface AuthUserPayload {
  id: number;
  email: string;
  emailVerified: boolean;
  mustChangePassword: boolean;
  onboardingCompleted: boolean;
  subscription?: AuthUserSubscription;
}

export function toAuthUserPayload(user: User): AuthUserPayload {
  return {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    mustChangePassword: user.mustChangePassword,
    onboardingCompleted: user.onboardingCompleted,
  };
}
