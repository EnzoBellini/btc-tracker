import type { User } from "@shared/schema";

export interface AuthUserPayload {
  id: number;
  email: string;
  emailVerified: boolean;
  mustChangePassword: boolean;
  onboardingCompleted: boolean;
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
