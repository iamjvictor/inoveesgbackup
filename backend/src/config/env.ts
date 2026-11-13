import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
}

const mercadoPagoSandbox = process.env.MERCADOPAGO_SANDBOX === "true";
const mercadoPagoAccessTokenEnv = mercadoPagoSandbox
  ? "MERCADOPAGO_ACESS_TOKEN_SANDBOX"
  : "MERCADOPAGO_ACESS_TOKEN";
const mercadoPagoPublicKeyEnv = mercadoPagoSandbox
  ? "MERCADOPAGO_PUBLIC_KEY_SANDBOX"
  : "MERCADOPAGO_PUBLIC_KEY";
const mercadoPagoWebhookSecretEnv = mercadoPagoSandbox
  ? "MERCADOPAGO_WEBHOOK_SECRET_SANDBOX"
  : "MERCADOPAGO_WEBHOOK_SECRET";

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required("DATABASE_URL"),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000,https://www.inove-esg.com.br,https://inove-esg.com.br,https://*.vercel.app",
  backendUrl: process.env.BACKEND_URL ?? "http://localhost:4000",
  frontendUrl: required("FRONTEND_URL"),
  mercadoPagoAccessToken: required(mercadoPagoAccessTokenEnv),
  mercadoPagoWebhookSecret: process.env[mercadoPagoWebhookSecretEnv] ?? "",
  mercadoPagoPublicKey: required(mercadoPagoPublicKeyEnv),
  mercadoPagoSandbox,
  supabaseUrl: required("SUPABASE_URL"),
  supabaseAnonKey: required("SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  email: {
    enabled: process.env.EMAIL_ENABLED === "true",
    awsRegion: process.env.AWS_REGION ?? "",
    from: process.env.EMAIL_FROM ?? "",
    contactEmail: process.env.EMAIL_CONTACT ?? "inove-esg@inove-esg.com.br",
  },
};
