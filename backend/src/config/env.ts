import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required("DATABASE_URL"),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000,https://www.inove-esg.com.br,https://inove-esg.com.br,https://*.vercel.app",
  backendUrl: process.env.BACKEND_URL ?? "http://localhost:4000",
  frontendUrl: required("FRONTEND_URL"),
  mercadoPagoAccessToken: required("MERCADOPAGO_ACESS_TOKEN"),
  mercadoPagoPublicKey: required("MERCADOPAGO_PUBLIC_KEY"),
  mercadoPagoSandbox: process.env.MERCADOPAGO_SANDBOX === "true" || (process.env.MERCADOPAGO_ACESS_TOKEN ?? "").startsWith("TEST-"),
  supabaseUrl: required("SUPABASE_URL"),
  supabaseAnonKey: required("SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
};
