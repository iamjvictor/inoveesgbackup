"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { authService } from "@/features/auth/services/auth.service";
import { getRecoveryAccessToken } from "@/lib/recovery-token";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRecoveryToken = () => {
      const token = getRecoveryAccessToken();
      if (!token) {
        setError("Este link é inválido ou expirou. Solicite uma nova recuperação de senha.");
      } else {
        setAccessToken(token);
        setReady(true);
      }
    };

    loadRecoveryToken();
  }, []);

  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isPasswordStrong = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || !accessToken) return;
    if (!isPasswordStrong) {
      setError("A senha não atende a todos os requisitos de senha forte.");
      return;
    }
    if (password !== confirmation) {
      setError("As senhas não coincidem.");
      return;
    }

    setStatus("loading");
    setError("");
    try {
      await authService.completePasswordRecovery(accessToken, password);
    } catch {
      setStatus("error");
      setError("Não foi possível atualizar sua senha. Solicite um novo link e tente novamente.");
      return;
    }

    setStatus("success");
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
            <h1 className="mt-5 text-2xl font-bold font-display">Senha atualizada</h1>
            <p className="mt-3 text-sm leading-6 text-foreground/65">Sua senha foi redefinida com segurança. Agora você já pode entrar na plataforma.</p>
            <Button onClick={() => router.push("/?auth=true")} className="mt-7 h-11 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
              Ir para o login
            </Button>
          </div>
        ) : (
          <>
            <LockKeyhole className="size-10 text-emerald-600" />
            <h1 className="mt-5 text-2xl font-bold font-display">Crie uma nova senha</h1>
            <p className="mt-2 text-sm leading-6 text-foreground/65">Escolha uma senha forte contendo maiúsculas, minúsculas, números e caracteres especiais.</p>

            <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="block text-sm font-medium" htmlFor="new-password">Nova senha</label>
                <input id="new-password" type="password" required autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm outline-none transition focus:border-emerald-500/45 focus:ring-2 focus:ring-emerald-500/20" />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium" htmlFor="confirm-password">Confirmar nova senha</label>
                <input id="confirm-password" type="password" required autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="h-11 w-full rounded-xl border border-input bg-white px-3 text-sm outline-none transition focus:border-emerald-500/45 focus:ring-2 focus:ring-emerald-500/20" />
              </div>

              {/* Checklist de requisitos de Senha Forte */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] space-y-1.5">
                <p className="font-semibold text-slate-700">Requisitos de senha forte:</p>
                <div className="grid grid-cols-1 gap-y-1 text-slate-600">
                  <span className={hasMinLength ? "text-emerald-600 font-medium" : ""}>• Mínimo de 8 caracteres</span>
                  <span className={hasUpper ? "text-emerald-600 font-medium" : ""}>• Pelo menos uma letra maiúscula (A-Z)</span>
                  <span className={hasLower ? "text-emerald-600 font-medium" : ""}>• Pelo menos uma letra minúscula (a-z)</span>
                  <span className={hasNumber ? "text-emerald-600 font-medium" : ""}>• Pelo menos um número (0-9)</span>
                  <span className={hasSpecial ? "text-emerald-600 font-medium" : ""}>• Pelo menos um caractere especial (!@#$%...)</span>
                </div>
              </div>

              {error && <p className="text-xs font-medium text-red-600">{error}</p>}
              <Button type="submit" disabled={!ready || !isPasswordStrong || password !== confirmation || status === "loading"} className="h-11 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400">
                {status === "loading" ? "Atualizando..." : "Salvar nova senha"}
              </Button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
