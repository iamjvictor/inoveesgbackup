"use client";

import React, { useEffect, useState } from "react";

import { inviteService, type InviteStats } from "../../services/invite.service";
import { Users, Mail, Award, Loader2, CheckCircle2 } from "lucide-react";

interface SupplierStatsSummaryProps {
  className?: string;
  refreshTrigger?: number;
}

export function SupplierStatsSummary({ className = "", refreshTrigger = 0 }: SupplierStatsSummaryProps) {
  const [stats, setStats] = useState<InviteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
    const token = "cookie-session";
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setError(null);
        const data = await inviteService.getStats(token);
        setStats(data);
      } catch (err: any) {
        console.error("Failed to load invite stats:", err);
        setError("Erro ao carregar dados reais.");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse border border-slate-200 bg-white/70 p-5 rounded-2xl shadow-sm h-28 flex flex-col justify-between">
            <div className="h-3 bg-slate-200 rounded w-1/2" />
            <div className="h-8 bg-slate-200 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    // Fallback gracefully to custom styled placeholders or default values
    return (
      <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-center text-xs text-red-600">
        Não foi possível conectar com o banco de dados. Exibindo dados offline.
      </div>
    );
  }

  return (
    <div className={`grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {/* 1. Convites Respondidos */}
      <div className="relative overflow-hidden border border-slate-200 bg-white/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
        <div className="flex justify-between items-start">
          <p className="text-xs uppercase tracking-[0.08em] text-slate-500 font-medium">Convites Respondidos</p>
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-semibold text-emerald-600 font-mono">
            {stats.answeredCount}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Diagnósticos concluídos</p>
        </div>
        <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* 2. Fornecedores Cadastrados */}
      <div className="relative overflow-hidden border border-slate-200 bg-white/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
        <div className="flex justify-between items-start">
          <p className="text-xs uppercase tracking-[0.08em] text-slate-500 font-medium">Fornecedores Cadastrados</p>
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-semibold text-blue-600 font-mono">
            {stats.connectedSuppliersCount}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Vinculados na plataforma</p>
        </div>
        <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* 3. Fornecedores que Não Responderam */}
      <div className="relative overflow-hidden border border-slate-200 bg-white/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
        <div className="flex justify-between items-start">
          <p className="text-xs uppercase tracking-[0.08em] text-slate-500 font-medium">Não Responderam</p>
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
            <Mail className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-semibold text-amber-600 font-mono">
            {stats.notAnsweredCount}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Pendentes de preenchimento</p>
        </div>
        <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* 4. Saldo de Convites */}
      <div className="relative overflow-hidden border border-slate-200 bg-white/80 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
        <div className="flex justify-between items-start">
          <p className="text-xs uppercase tracking-[0.08em] text-slate-500 font-medium">Convites Disponíveis</p>
          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 group-hover:scale-110 transition-transform">
            <Award className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-semibold text-slate-800 font-mono">
            {stats.availableInvites}
          </p>
          <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
            <span>Consumidos: <strong className="text-slate-700">{stats.consumedInvites}</strong></span>
            <span>Total: <strong className="text-slate-700">{stats.totalInvitesPurchased}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
