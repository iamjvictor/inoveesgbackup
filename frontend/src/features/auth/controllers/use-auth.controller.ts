"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { LoginInput, RegisterInput } from "../models/auth.types";
import { authService } from "../services/auth.service";

type Status = "idle" | "loading" | "success" | "error";

function sanitizeAuthError(message: string, context: "login" | "adminLogin" | "register"): string {
  if (!message) {
    if (context === "register") return "Ocorreu um erro no cadastro. Tente novamente.";
    if (context === "adminLogin") return "Não foi possível realizar o login administrativo.";
    return "Não foi possível realizar o login. Tente novamente mais tarde.";
  }

  // Tentativa de extrair mensagem específica do Zod em formato JSON
  try {
    if (message.includes("[") && message.includes("message")) {
      const parsed = JSON.parse(message);
      if (Array.isArray(parsed) && parsed[0]?.message) {
        return parsed[0].message;
      }
    }
  } catch (e) {
    /* fallback */
  }

  const lower = message.toLowerCase();

  // 1. Erros de Banco de Dados / Prisma / Código Interno (Vazamento de Schema/Stack Trace)
  if (
    lower.includes("prisma") ||
    lower.includes("findunique") ||
    lower.includes("findfirst") ||
    lower.includes("findmany") ||
    lower.includes("database") ||
    lower.includes("table") ||
    lower.includes("column") ||
    lower.includes("invocation") ||
    lower.includes("internal server error") ||
    lower.includes("unexpected error") ||
    lower.includes("syntaxerror") ||
    lower.includes("typeerror") ||
    lower.includes("uncaught") ||
    lower.includes("sql") ||
    lower.includes(".ts:") ||
    lower.includes(".js:") ||
    lower.includes("/home/") ||
    lower.includes("/app/")
  ) {
    if (context === "register") {
      return "Erro interno ao processar seu cadastro. Tente novamente em alguns instantes.";
    }
    return "Ocorreu um erro interno. Tente novamente em alguns instantes.";
  }

  // 2. Falhas de Rede
  if (lower.includes("fetch failed") || lower.includes("failed to fetch")) {
    return "Não foi possível conectar ao servidor. Tente novamente mais tarde.";
  }

  // 3. Configuração de Chave API
  if (lower.includes("invalid api key")) {
    return "Erro na configuração do serviço de autenticação.";
  }

  // 4. E-mail/CPF/CNPJ já cadastrado (Específico de Cadastro)
  if (context === "register") {
    if (
      lower.includes("user already exists") ||
      lower.includes("already registered") ||
      lower.includes("email address already registered") ||
      lower.includes("já está cadastrado")
    ) {
      return message.includes("já está cadastrado") ? message : "Este e-mail já está cadastrado.";
    }
  }

  // 5. Restrição de Admin
  if (lower.includes("acesso restrito ao painel administrativo")) {
    return "Acesso restrito ao painel administrativo";
  }

  // 6. Credenciais de Login Incorretas
  if (
    lower === "unauthorized" ||
    lower.includes("401") ||
    lower.includes("invalid login credentials") ||
    lower.includes("invalid credentials") ||
    lower.includes("e-mail ou senha incorretos") ||
    lower.includes("usuário não encontrado")
  ) {
    if (context === "adminLogin") {
      return "Acesso restrito ou credenciais incorretas";
    }
    return "E-mail ou senha incorretos";
  }

  // 7. Erros de Validação dos Campos
  if (lower.includes("[") || lower.includes("validation") || lower.includes("code")) {
    if (context === "register") {
      return "Verifique se todos os campos foram preenchidos corretamente";
    }
    return "E-mail ou senha inválidos";
  }

  // 8. Mensagem limpa enviada pelo backend sem código/JSON
  if (
    message.length < 120 &&
    !message.includes("{") &&
    !message.includes("-->") &&
    !message.includes("\n")
  ) {
    return message;
  }

  return context === "register"
    ? "Ocorreu um erro no cadastro. Tente novamente."
    : "Não foi possível realizar o login. Tente novamente mais tarde.";
}

export function useAuthController() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function login(input: LoginInput) {
    try {
      setStatus("loading");
      setErrorMessage(null);
      const response = await authService.login(input);
      setStatus("success");

      return response;
    } catch (error) {
      setStatus("error");
      const message = error instanceof Error ? error.message : "";
      setErrorMessage(sanitizeAuthError(message, "login"));
      throw error;
    }
  }

  async function adminLogin(input: LoginInput) {
    try {
      setStatus("loading");
      setErrorMessage(null);
      const response = await authService.adminLogin(input);
      setStatus("success");

      return response;
    } catch (error) {
      setStatus("error");
      const message = error instanceof Error ? error.message : "";
      setErrorMessage(sanitizeAuthError(message, "adminLogin"));
      throw error;
    }
  }

  async function register(input: RegisterInput) {
    try {
      setStatus("loading");
      setErrorMessage(null);
      const response = await authService.register(input);
      setStatus("success");

      return response;
    } catch (error) {
      setStatus("error");
      const message = error instanceof Error ? error.message : "";
      setErrorMessage(sanitizeAuthError(message, "register"));
      throw error;
    }
  }

  function reset() {
    setStatus("idle");
    setErrorMessage(null);
  }

  const router = useRouter();

  async function logout(redirectTo = "/") {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "/api"}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => undefined);
    router.push(redirectTo);
    router.refresh();
  }

  return {
    status,
    errorMessage,
    login,
    adminLogin,
    register,
    reset,
    logout,
  };
}
