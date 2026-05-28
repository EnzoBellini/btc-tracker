/**
 * Exclui um usuário pelo e-mail (útil para testar trial/signup de novo).
 *
 * Uso: npm run delete-user --workspace=apps/app -- seu@email.com
 */
import "dotenv/config";
import { storage } from "../server/storage";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    console.error("Uso: npm run delete-user --workspace=apps/app -- seu@email.com");
    process.exit(1);
  }

  const user = await storage.getUserByEmail(email);
  if (!user) {
    console.log(`Nenhum usuário com e-mail ${email}`);
    process.exit(0);
  }

  const ok = await storage.deleteUser(user.id);
  if (!ok) {
    console.error("Falha ao excluir usuário");
    process.exit(1);
  }

  console.log(`✅ Conta ${email} (id ${user.id}) excluída. Pode cadastrar de novo na landing.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
