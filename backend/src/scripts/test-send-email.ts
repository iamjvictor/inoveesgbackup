import { sendEmail } from "../modules/email/index.js";
import { env } from "../config/env.js";

async function main() {
  const targetEmail = process.argv[2] || env.email.contactEmail;
  console.log(`Disparando e-mail de boas-vindas para: ${targetEmail}`);
  const result = await sendEmail("WELCOME", targetEmail, {
    name: "Usuário Teste InoveESG",
  });
  console.log("Resultado:", result);
}

main().catch(console.error);
