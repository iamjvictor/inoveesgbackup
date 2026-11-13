"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { LoginInput, RegisterInput } from "../models/auth.types";
import { authService } from "../services/auth.service";
import { sanitizeAuthError } from "./sanitize-auth-error";

export { sanitizeAuthError };

type Status = "idle" | "loading" | "success" | "error";

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
