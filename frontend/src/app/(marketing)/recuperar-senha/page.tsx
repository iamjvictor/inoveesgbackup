"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authService } from "@/features/auth/services/auth.service";

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    try {
      await authService.recoverPassword(email.trim());
      setStatus("success");
    } catch (requestError) {
      setStatus("error");
      const message = requestError instanceof Error ? requestError.message : "";
      setError(message.includes("Limite de envio")
        ? message
        : "Não foi possível solicitar a recuperação agora. Tente novamente em instantes.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-white to-accent/10 px-4 py-12">
      <section className="w-full max-w-md rounded-3xl bg-white/90 p-7 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.3)] ring-1 ring-border backdrop-blur-xl sm:p-9">
        <Link href="/?auth=true" className="mb-8 inline-flex items-center gap-2 text-sm text-foreground/60 transition hover:text-accent">
          <ArrowLeft className="size-4" /> Voltar ao login
        </Link>

        {status === "success" ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto size-12 text-emerald-600" />
            <h1 className="mt-5 text-2xl font-bold font-display">Confira seu e-mail</h1>
            <p className="mt-3 text-sm leading-6 text-foreground/65">
              Se o endereço estiver cadastrado, enviaremos um link seguro para você criar uma nova senha. Verifique também a pasta de spam.
            </p>
            <Link href="/?auth=true" className="mt-7 inline-block text-sm font-semibold text-emerald-700 hover:text-emerald-800">
              Voltar para o login
            </Link>
          </div>
        ) : (
          <>
            <Mail className="size-10 text-emerald-600" />
            <h1 className="mt-5 text-2xl font-bold font-display">Recupere seu acesso</h1>
            <p className="mt-2 text-sm leading-6 text-foreground/65">
              Informe o e-mail usado no cadastro. Enviaremos as instruções para redefinir sua senha.
            </p>

            <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
              <label className="block text-sm font-medium" htmlFor="recovery-email">E-mail</label>
              <input
                id="recovery-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seu@empresa.com"
                className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm outline-none transition focus:border-emerald-500/45 focus:ring-2 focus:ring-emerald-500/20"
              />
              {error && <p className="text-xs font-medium text-red-600">{error}</p>}
              <Button type="submit" disabled={status === "loading"} className="h-11 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
                {status === "loading" ? "Enviando..." : "Enviar link de recuperação"}
              </Button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
