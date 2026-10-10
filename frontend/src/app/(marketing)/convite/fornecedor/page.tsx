"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RegisterForm } from "@/features/auth/views/components/register-form";
import { Eye, EyeOff, Building2, CheckCircle2, LogIn, UserPlus } from "lucide-react";
import { authService } from "@/features/auth/services/auth.service";
import { inviteService } from "@/features/company-area/services/invite.service";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

function SupplierInvitePage() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");
  const token = searchParams.get("token");

  const [referringCompanyName, setReferringCompanyName] = useState<string | null>(null);
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [resolvedRef, setResolvedRef] = useState<string | null>(null);
  const [resolvedEmail, setResolvedEmail] = useState<string | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [mode, setMode] = useState<"register" | "login">("register");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (ref) {
      setResolvedRef(ref);
    }
  }, [ref]);

  // Fetch referring company name and invitation info
  useEffect(() => {
    if (!ref && !token) return;

    async function fetchCompany() {
      setLoadingCompany(true);
      setErrorState(null);
      try {
        const query = token ? `token=${token}` : `ref=${ref}`;
        const res = await fetch(`${API_URL}/invite/public-info?${query}`);
        if (res.ok) {
          const data = await res.json();
          setReferringCompanyName(data.name);
          if (data.ref) {
            setResolvedRef(data.ref);
          }
          if (data.email) {
            setResolvedEmail(data.email);
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          setErrorState(errData.message || "Este convite é inválido ou expirou.");
        }
      } catch (err) {
        console.error("Erro ao buscar empresa de indicação:", err);
        setErrorState("Não foi possível carregar as informações do convite no momento.");
      } finally {
        setLoadingCompany(false);
      }
    }

    fetchCompany();
  }, [ref, token]);

  useEffect(() => {
    if (resolvedEmail && !loginEmail) {
      setLoginEmail(resolvedEmail);
    }
  }, [resolvedEmail, loginEmail]);

  const hasInviteContext = ref || token;

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      await authService.login({ email: loginEmail, password: loginPassword });
      setConfirmationOpen(true);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "E-mail ou senha inválidos");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleAcceptInvite() {
    setAcceptLoading(true);
    setLoginError(null);
    try {
      if (!token && !resolvedRef) {
        throw new Error("Este link de convite não possui uma referência válida");
      }
      await inviteService.acceptInvite(token ?? undefined, resolvedRef ?? undefined);
      setConfirmationOpen(false);
      setAccepted(true);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Não foi possível confirmar o vínculo");
    } finally {
      setAcceptLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glass decorative circles */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <div className="text-center mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-600">Portal do Fornecedor</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-800">
            Cadastro de Homologação ESG
          </h2>
          {hasInviteContext && !loadingCompany && referringCompanyName && !errorState && (
            <p className="mt-3 text-sm text-slate-600 max-w-md mx-auto">
              Você foi convidado pela empresa <span className="font-semibold text-emerald-700">{referringCompanyName}</span> para realizar seu diagnóstico e homologação na plataforma.
            </p>
          )}
          {hasInviteContext && loadingCompany && (
            <p className="mt-3 text-xs text-slate-400 animate-pulse">
              Carregando dados do convite...
            </p>
          )}
          {!hasInviteContext && (
            <p className="mt-3 text-sm text-slate-600 max-w-md mx-auto">
              Realize seu cadastro de fornecedor para preencher o diagnóstico ESG solicitado pelo seu cliente.
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <div className="bg-white/80 backdrop-blur-xl border border-white/40 py-8 px-6 shadow-xl rounded-2xl sm:px-10">
          {errorState ? (
            <div className="text-center py-6 space-y-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900">Convite Indisponível</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                {errorState}
              </p>
              <div className="pt-4">
                <Link
                  href="/"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                >
                  Voltar para o site
                </Link>
              </div>
            </div>
          ) : accepted ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
              <h3 className="mt-5 text-xl font-semibold text-slate-900">Vínculo confirmado</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                Sua empresa agora está conectada à empresa âncora e já pode responder ao diagnóstico solicitado.
              </p>
              <a href="/app" className="mt-6 inline-flex rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
                Acessar minha conta
              </a>
            </div>
          ) : (
            <>
              <div className="mb-7 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={`rounded-2xl border p-4 text-left transition ${mode === "register" ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-white hover:border-emerald-200"}`}
                >
                  <UserPlus className="h-5 w-5 text-emerald-600" />
                  <p className="mt-3 font-semibold text-slate-900">Ainda não tenho conta</p>
                  <p className="mt-1 text-xs text-slate-500">Criar cadastro de fornecedor.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`rounded-2xl border p-4 text-left transition ${mode === "login" ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-white hover:border-emerald-200"}`}
                >
                  <LogIn className="h-5 w-5 text-emerald-600" />
                  <p className="mt-3 font-semibold text-slate-900">Já possuo conta</p>
                  <p className="mt-1 text-xs text-slate-500">Entrar e confirmar este vínculo.</p>
                </button>
              </div>

              {mode === "register" ? (
                <RegisterForm
                  refCode={resolvedRef || undefined}
                  initialEmail={resolvedEmail || undefined}
                  submitButtonText="Criar Conta e Iniciar Diagnóstico"
                />
              ) : (
                <form onSubmit={handleLogin} className="mx-auto max-w-md space-y-5">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
                    <div className="flex items-start gap-3"><Building2 className="mt-0.5 h-5 w-5 shrink-0" /><p>Entre com o e-mail que recebeu o convite. Depois você confirmará o vínculo com <strong>{referringCompanyName}</strong>.</p></div>
                  </div>
                  <label className="block text-sm font-medium text-slate-700">E-mail<input value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} type="email" required className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>
                  <label className="block text-sm font-medium text-slate-700">Senha<div className="relative mt-2"><input value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} type={showPassword ? "text" : "password"} required className="h-11 w-full rounded-xl border border-slate-200 px-3 pr-10 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-3 text-slate-400">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div></label>
                  {loginError && <p className="text-sm text-rose-600">{loginError}</p>}
                  <button disabled={loginLoading} className="h-11 w-full rounded-xl bg-emerald-600 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">{loginLoading ? "Entrando..." : "Entrar e continuar"}</button>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      {confirmationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Confirmar vínculo</p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-900">Conectar sua empresa?</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">Você está prestes a vincular sua empresa fornecedora à empresa âncora:</p>
            <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-center font-semibold text-emerald-900">{referringCompanyName}</div>
            <p className="mt-4 text-xs text-slate-500">Esse vínculo permitirá que a empresa acompanhe seu diagnóstico ESG.</p>
            {loginError && <p className="mt-4 text-sm text-rose-600">{loginError}</p>}
            <div className="mt-7 flex gap-3">
              <button type="button" onClick={() => setConfirmationOpen(false)} className="h-11 flex-1 rounded-xl border border-slate-200 font-semibold text-slate-700">Cancelar</button>
              <button type="button" onClick={handleAcceptInvite} disabled={acceptLoading} className="h-11 flex-1 rounded-xl bg-emerald-600 font-semibold text-white disabled:opacity-60">{acceptLoading ? "Confirmando..." : "Confirmar vínculo"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SupplierInvitePageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
      </div>
    }>
      <SupplierInvitePage />
    </Suspense>
  );
}
