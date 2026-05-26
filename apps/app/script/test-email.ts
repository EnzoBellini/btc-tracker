/**
 * Testa envio via Resend. Uso: npm run test:email --workspace=apps/app
 * Opcional: TEST_EMAIL=seu@email.com
 */
import "dotenv/config";
import { isResendConfigured, sendWelcomeEmail, buildVerifyUrl } from "../server/lib/email";

async function main() {
  const to = process.env.TEST_EMAIL?.trim();
  if (!to) {
    console.error("Defina TEST_EMAIL=seu@email.com");
    process.exit(1);
  }
  if (!isResendConfigured()) {
    console.error("❌ RESEND_API_KEY ausente em apps/app/.env");
    process.exit(1);
  }
  const { sent } = await sendWelcomeEmail({
    to,
    password: "(senha de teste — ignore)",
    verifyUrl: buildVerifyUrl("test-token-only"),
  });
  console.log(sent ? `✅ E-mail enviado para ${to}` : "❌ Não enviado");
  process.exit(sent ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
