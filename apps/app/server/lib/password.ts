import crypto from "crypto";

const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";

export function generateSecurePassword(length = 16): string {
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes, (b) => CHARSET[b % CHARSET.length]).join("");
}

export function validateNewPassword(password: string): string | null {
  if (password.length < 12) return "Senha deve ter no mínimo 12 caracteres";
  if (!/[a-z]/.test(password)) return "Senha deve conter letra minúscula";
  if (!/[A-Z]/.test(password)) return "Senha deve conter letra maiúscula";
  if (!/[0-9]/.test(password)) return "Senha deve conter número";
  if (!/[!@#$%&*]/.test(password)) return "Senha deve conter caractere especial (!@#$%&*)";
  return null;
}
