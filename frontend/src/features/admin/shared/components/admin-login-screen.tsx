"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthController } from "@/features/auth/controllers/use-auth.controller";

export function AdminLoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { adminLogin, status, errorMessage, reset } = useAuthController();

  useEffect(() => {
    reset();
  }, []);

  const isLoading = status === "loading";
  const hasAccessError = searchParams.get("error") === "forbidden";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await adminLogin({ email, password });

      if (response?.user) {
        router.replace("/admin");
        router.refresh();
      }
    } catch (error) {
      console.error("Admin login error:", error);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#071018] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.28),_transparent_34%),radial-gradient(circle_at_80%_20%,_rgba(148,163,184,0.16),_transparent_28%),linear-gradient(180deg,_#071018_0%,_#0b1620_55%,_#05090d_100%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 md:px-8 lg:flex-row lg:items-stretch lg:py-8">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="flex flex-1 items-end rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:p-10 lg:mr-6"
        >
          <div className="max-w-xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Acesso administrativo
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
                Inove ESG
              </p>
              <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-white md:text-6xl">
                Painel operacional para quem administra a plataforma.
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-300 md:text-lg">
                Entre com sua conta Supabase vinculada ao cadastro de administrador e acesse os
                orçamentos, clientes, fornecedores, evidências e análises.
              </p>
            </div>

            <div className="grid gap-3 border-t border-white/10 pt-6 text-sm text-slate-300 sm:grid-cols-3">
              <div className="space-y-1">
                <p className="font-semibold text-white">Sessão segura</p>
                <p>Token Supabase e validação de admin no backend.</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-white">Rota protegida</p>
                <p>O painel só abre se o usuário existir em `admin_users`.</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-white">Logout direto</p>
                <p>Saída limpa da sessão com retorno para esta tela.</p>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08, ease: "easeOut" }}
          className="flex w-full max-w-xl items-center lg:w-[440px]"
        >
          <div className="w-full rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl md:p-8">
            <div className="mb-8 space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                Login do admin
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Entrar no painel
              </h2>
              <p className="text-sm leading-6 text-slate-400">
                Use o e-mail e a senha cadastrados no Supabase. O acesso será liberado apenas
                para usuários marcados como administradores.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="admin-email" className="text-sm font-medium text-slate-200">
                  E-mail
                </label>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder="admin@empresa.com"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="admin-password" className="text-sm font-medium text-slate-200">
                  Senha
                </label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 pl-11 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
                  />
                </div>
              </div>

              {hasAccessError ? (
                <p className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                  Acesso restrito. Entre com uma conta administrativa válida.
                </p>
              ) : null}

              {errorMessage ? (
                <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  {errorMessage}
                </p>
              ) : null}

              <Button
                type="submit"
                disabled={isLoading || !email || !password}
                className="h-12 w-full rounded-2xl bg-emerald-500 text-slate-950 transition hover:bg-emerald-400"
              >
                {isLoading ? "Autenticando..." : "Entrar no painel"}
              </Button>
            </form>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
