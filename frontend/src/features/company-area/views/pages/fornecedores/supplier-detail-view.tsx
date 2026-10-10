"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { inviteService } from "../../../services/invite.service";
import { findSupplierInvite, mapSupplierInviteToDetail, type SupplierDetail } from "../../../controllers/supplier-detail.controller";
import { ProgressMeter } from "../../components/progress-meter";
import { SectionHeading } from "../../components/section-heading";
import { StatusPill } from "../../components/status-pill";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("pt-BR");
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <SectionHeading
        eyebrow="Fornecedores"
        title="Carregando fornecedor"
        description="Buscando os dados reais da cadeia de fornecedores."
      />
      <div className="h-32 animate-pulse rounded-2xl border border-border bg-white/70" />
    </div>
  );
}

export function SupplierDetailView({ supplierId }: { supplierId: string }) {
  const [detail, setDetail] = useState<SupplierDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadSupplier() {
    const token = "cookie-session";
      if (!token) {
        if (active) {
          setError("Sessão expirada. Faça login novamente.");
          setIsLoading(false);
        }
        return;
      }

      try {
        const invites = await inviteService.listInvites(token);
        const invite = findSupplierInvite(invites, supplierId);

        if (active) {
          setDetail(invite ? mapSupplierInviteToDetail(invite) : null);
          setError(invite ? null : "Fornecedor não encontrado na sua cadeia.");
        }
      } catch (loadError) {
        console.error("Failed to load supplier detail:", loadError);
        if (active) setError("Não foi possível carregar os dados do fornecedor.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadSupplier();
    return () => {
      active = false;
    };
  }, [supplierId]);

  if (isLoading) return <LoadingState />;

  if (error || !detail) {
    return (
      <div className="space-y-4">
        <SectionHeading
          eyebrow="Fornecedores"
          title={error === "Fornecedor não encontrado na sua cadeia." ? "Fornecedor não encontrado" : "Não foi possível carregar"}
          description={error ?? "Verifique o link acessado ou retorne para a lista principal."}
        />
        <Button asChild variant="outline">
          <Link href="/app/fornecedores">Voltar para fornecedores</Link>
        </Button>
      </div>
    );
  }

  const hasLimitedAccess = detail.status !== "respondido";
  const overallScore = detail.diagnostic?.score?.overallScore;

  return (
    <div className="space-y-7">
      <SectionHeading
        eyebrow="Fornecedor"
        title={detail.companyName}
        description={`Contato principal: ${detail.contactEmail}`}
        action={
          <Button asChild variant="outline">
            <Link href="/app/fornecedores">Voltar</Link>
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <article className="border border-border bg-white/70 p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-foreground/55">Status</p>
          <div className="mt-2">
            <StatusPill status={detail.status} />
          </div>
        </article>
        <article className="border border-border bg-white/70 p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-foreground/55">Convite enviado em</p>
          <p className="mt-2 text-2xl font-semibold">{formatDate(detail.invitedAt)}</p>
        </article>
        <article className="border border-border bg-white/70 p-4">
          <p className="text-xs uppercase tracking-[0.1em] text-foreground/55">Última atualização</p>
          <p className="mt-2 text-2xl font-semibold">{formatDate(detail.lastUpdate)}</p>
        </article>
      </section>

      <section className="border border-border bg-white/70 p-5">
        <h2 className="text-lg font-semibold tracking-tight">Evolução do preenchimento</h2>
        <div className="mt-3">
          <ProgressMeter value={detail.progress} />
        </div>
        {detail.diagnostic ? (
          <p className="mt-3 text-sm text-foreground/70">
            Diagnóstico: {detail.diagnostic.status === "COMPLETED" ? "concluído" : "em andamento"}.
            {overallScore != null ? ` Score geral: ${Math.round(Number(overallScore))}%.` : " Ainda sem score final."}
          </p>
        ) : (
          <p className="mt-3 text-sm text-foreground/70">O fornecedor ainda não iniciou um diagnóstico.</p>
        )}
      </section>

      <section className="border border-border bg-white/70 p-5">
        <h2 className="text-lg font-semibold tracking-tight">Acesso ao relatório do fornecedor</h2>
        {hasLimitedAccess ? (
          <p className="mt-2 text-sm text-foreground/70">
            O acesso completo do relatório está restrito até o fornecedor concluir o diagnóstico e sua assinatura estar ativa.
          </p>
        ) : (
          <p className="mt-2 text-sm text-foreground/70">
            Fornecedor com resposta finalizada. Relatório detalhado disponível para visualização completa.
          </p>
        )}
      </section>
    </div>
  );
}
