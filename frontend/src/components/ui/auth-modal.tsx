"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthController } from "@/features/auth/controllers/use-auth.controller";
import { RegisterForm } from "@/features/auth/views/components/register-form";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "cadastro";
};

export function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "cadastro">(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, status, errorMessage, reset } = useAuthController();

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isOpen, defaultTab]);

  useEffect(() => {
    reset();
  }, [activeTab]);

  const isLoading = status === "loading";

  const isValidEmail = (e: string) => /\S+@\S+\.\S+/.test(e);
  const emailValid = isValidEmail(email);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid || !password) return;
    try {
      const response = await login({ email, password });
      if (response?.user) {
        if (response.user?.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/app");
        }
        
        onClose();
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Overlay with Liquid Glass Effect */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-md touch-none"
        onClick={onClose}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      />

      {/* Modal Content */}
      <div 
        className="relative w-full max-w-2xl rounded-2xl border border-white/20 bg-white/80 p-6 sm:p-8 shadow-[0_32px_64px_-24px_rgba(0,0,0,0.25)] backdrop-blur-xl max-h-[90vh] overflow-y-auto overscroll-contain"
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-foreground/50 hover:text-foreground transition-colors z-10"
        >
          <X className="size-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600">Inove ESG</p>
          <h2 className="mt-2 text-2xl font-bold font-display tracking-tight text-foreground">
            {activeTab === "login" ? "Entrar na plataforma" : "Criar sua conta"}
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border mb-6">
          <button
            className={cn(
              "flex-1 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === "login" 
                ? "border-emerald-500 text-foreground" 
                : "border-transparent text-foreground/50 hover:text-foreground"
            )}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button
            className={cn(
              "flex-1 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === "cadastro" 
                ? "border-emerald-500 text-foreground" 
                : "border-transparent text-foreground/50 hover:text-foreground"
            )}
            onClick={() => setActiveTab("cadastro")}
          >
            Cadastro
          </button>
        </div>

        {/* Forms */}
        {activeTab === "login" ? (
          <form className="space-y-4" onSubmit={handleLogin} noValidate>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground/80">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@empresa.com"
                className="h-11 w-full rounded-xl border border-input bg-white/50 px-3 text-sm outline-none transition focus:border-emerald-500/45 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground/80">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-xl border border-input bg-white/50 px-3 pr-10 text-sm outline-none transition focus:border-emerald-500/45 focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {errorMessage && activeTab === "login" && (
              <p className="text-xs text-red-500 text-center font-medium">{errorMessage}</p>
            )}

            <Button 
              type="submit"
              disabled={isLoading || !emailValid || !password}
              className="mt-2 h-11 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
            
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push("/recuperar-senha");
                }}
                className="text-sm text-foreground/65 hover:text-emerald-600"
              >
                Esqueci minha senha
              </button>
            </div>
          </form>
        ) : (
          <RegisterForm onSuccess={() => { router.push("/app"); onClose(); }} />
        )}
      </div>
    </div>
  );
}
