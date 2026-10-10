"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "../../components/section-heading";
import { StatusPill } from "../../components/status-pill";
import { ChevronDown, ChevronUp, CheckCircle2, X, Loader2, Users, MoreVertical, Leaf, Recycle, Heart, Scale } from "lucide-react";
import { SupplierStatsSummary } from "../../components/supplier-stats-summary";
import { InvitePurchaseModal } from "../../components/invite-purchase-modal";

import { inviteService, type SupplierInvite } from "../../../services/invite.service";
import { useCompany } from "../../../context/company-context";

export function SuppliersView() {
  const { company } = useCompany();
  const [invites, setInvites] = useState<SupplierInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [availableInvites, setAvailableInvites] = useState<number | null>(null);
  const [hasLoadedInviteBalance, setHasLoadedInviteBalance] = useState(false);

  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [isTerminating, setIsTerminating] = useState<string | null>(null);
  const [isReactivating, setIsReactivating] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

  const handleTerminate = async (supplierOrganizationId: string) => {
    const reason = prompt("Por favor, informe o motivo do encerramento do vínculo (opcional):");
    if (reason === null) return; // User canceled

    const token = "cookie-session";
    if (!token) return;

    setIsTerminating(supplierOrganizationId);
    try {
      await inviteService.terminateRelationship(token, supplierOrganizationId, reason || "Encerrado pelo comprador");
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Error terminating relationship:", err);
      const errMsg = err instanceof Error ? err.message : "Erro ao encerrar relacionamento";
      alert(errMsg);
    } finally {
      setIsTerminating(null);
    }
  };

  const handleReactivate = async (supplierOrganizationId: string) => {
    const token = "cookie-session";
    if (!token) return;

    setIsReactivating(supplierOrganizationId);
    try {
      await inviteService.reactivateRelationship(token, supplierOrganizationId);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Error reactivating relationship:", err);
      const errMsg = err instanceof Error ? err.message : "Erro ao reativar relacionamento";
      alert(errMsg);
    } finally {
      setIsReactivating(null);
    }
  };

  // Dynamic invitation links
  const frontendUrl =
    process.env.NEXT_PUBLIC_FRONTEND_URL?.replace(/\/+$/, "") ??
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  const inviteUrl = `${frontendUrl}/convite/fornecedor?ref=${company?.id || ""}`;

  const readyMessage = `Prezado parceiro,

Para avançarmos em nossa jornada de sustentabilidade e conformidade ESG, convidamos sua empresa a preencher nosso diagnóstico na plataforma InoveESG.

Acesse o link exclusivo abaixo para responder ao questionário e anexar as evidências solicitadas:
${inviteUrl}

Agradecemos a parceria de sempre!`;

  useEffect(() => {
    async function loadInvites() {
    const token = "cookie-session";
      if (!token) {
        setIsLoading(false);
        setHasLoadedInviteBalance(true);
        return;
      }
      setIsLoading(true);
      setHasLoadedInviteBalance(false);
      try {
        const data = await inviteService.listInvites(token);
        setInvites(data);

        const statsData = await inviteService.getStats(token);
        setAvailableInvites(statsData.availableInvites);
      } catch (err) {
        console.error("Error loading invites:", err);
      } finally {
        setIsLoading(false);
        setHasLoadedInviteBalance(true);
      }
    }
    loadInvites();
  }, [refreshTrigger]);


  const toggleCard = (id: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  function getSupplierStatus(invite: SupplierInvite): "respondido" | "em_andamento" | "convidado" | "expirado" | "pendente" {
    const diagnostic = invite.requestedDiagnostics[0];

    if (diagnostic?.status === "COMPLETED") {
      return "respondido";
    }
    if (diagnostic?.status === "DRAFT") {
      return "em_andamento";
    }
    if (invite.status === "ACCEPTED") {
      return "convidado";
    }
    if (invite.status === "SENT") {
      return "convidado";
    }
    if (invite.status === "EXPIRED") {
      return "expirado";
    }
    return "pendente";
  }

  const canInviteSupplier = hasLoadedInviteBalance && (availableInvites ?? 0) > 0;

  return (
    <div className="space-y-7">
      <SectionHeading
        eyebrow="Cadeia de fornecedores"
        title="Monitoramento de convites e respostas"
        description="Acompanhe status por fornecedor e avance nas cobranças de preenchimento ESG."
        action={
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 rounded-full font-bold"
              onClick={() => setIsPurchaseModalOpen(true)}
            >
              Comprar convites
            </Button>
            {canInviteSupplier && (
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold"
                onClick={() => setIsInviteModalOpen(true)}
              >
                Convidar fornecedor
              </Button>
            )}
          </div>
        }
      />

      <SupplierStatsSummary refreshTrigger={refreshTrigger} />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/40 backdrop-blur-sm rounded-xl border border-slate-200">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-2" />
          <p className="text-sm text-slate-500">Carregando cadeia de fornecedores...</p>
        </div>
      ) : (
        <div className="overflow-hidden border border-slate-200 rounded-2xl bg-white shadow-sm mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="px-5 py-3">Fornecedor</th>
                  <th className="px-5 py-3">Segmento</th>
                  <th className="px-5 py-3">Status do Convite</th>
                  <th className="px-5 py-3 text-center">Amb. (E)</th>
                  <th className="px-5 py-3 text-center">Bio. (B)</th>
                  <th className="px-5 py-3 text-center">Soc. (S)</th>
                  <th className="px-5 py-3 text-center">Gov. (G)</th>
                  <th className="px-5 py-3 text-right">Nota Geral</th>
                  <th className="px-5 py-3 text-center">Histórico</th>
                  <th className="px-5 py-3 text-center w-10">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                {invites.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center justify-center max-w-md mx-auto py-6">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-sm border border-emerald-100/50">
                          <Users className="h-6 w-6" />
                        </div>
                        <p className="font-semibold text-slate-700 text-sm">Nenhum fornecedor conectado</p>
                        <p className="text-slate-500 text-xs mt-1 mb-5 leading-relaxed">
                          Sua cadeia de fornecedores está vazia. Adquira convites para enviar diagnósticos e monitorar a conformidade ESG.
                        </p>
                        <Button 
                          onClick={() => setIsPurchaseModalOpen(true)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-xs h-8 px-5"
                        >
                          Comprar convites
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  invites.map((invite) => {
                    const isExpanded = expandedCards[invite.id];
                  
                  // Encontrar o diagnóstico completed mais recente para a linha principal
                  const completedDiag = invite.requestedDiagnostics.find((d) => d.status === "COMPLETED");
                  
                  const score = completedDiag?.score;
                  const eScore = score?.environmentalScore != null ? Math.round(Number(score.environmentalScore)) : null;
                  const bScore = score?.bioeconomyCircularScore != null ? Math.round(Number(score.bioeconomyCircularScore)) : null;
                  const sScore = score?.socialScore != null ? Math.round(Number(score.socialScore)) : null;
                  const gScore = score?.governanceScore != null ? Math.round(Number(score.governanceScore)) : null;
                  const overallScore = score?.overallScore != null ? Math.round(Number(score.overallScore)) : null;

                  let scoreColorClass = "text-slate-400 font-medium";
                  if (overallScore !== null) {
                    if (overallScore >= 80) {
                      scoreColorClass = "text-emerald-600 font-extrabold";
                    } else if (overallScore < 50) {
                      scoreColorClass = "text-rose-600 font-extrabold";
                    } else {
                      scoreColorClass = "text-amber-500 font-extrabold";
                    }
                  }

                  const supplierName = invite.supplierOrganization?.tradeName 
                    || invite.supplierOrganization?.legalName 
                    || `Pendente (${invite.supplierEmail})`;

                  const isInactive = invite.relationship?.status === "INACTIVE";

                  return (
                    <React.Fragment key={invite.id}>
                      <tr className="hover:bg-slate-50/50 transition-colors duration-150">
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-800">{supplierName}</span>
                              {isInactive && (
                                <span className="bg-rose-50 text-rose-600 border border-rose-100 text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase">
                                  Inativo
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">{invite.supplierEmail}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-500 font-medium">
                          {invite.supplierOrganization?.industrySegment || "—"}
                        </td>
                        <td className="px-5 py-4">
                          <StatusPill status={getSupplierStatus(invite)} />
                        </td>
                        <td className="px-5 py-4 text-center font-semibold text-slate-600">
                          {eScore !== null ? `${eScore}%` : "—"}
                        </td>
                        <td className="px-5 py-4 text-center font-semibold text-slate-600">
                          {bScore !== null ? `${bScore}%` : "—"}
                        </td>
                        <td className="px-5 py-4 text-center font-semibold text-slate-600">
                          {sScore !== null ? `${sScore}%` : "—"}
                        </td>
                        <td className="px-5 py-4 text-center font-semibold text-slate-600">
                          {gScore !== null ? `${gScore}%` : "—"}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className={scoreColorClass}>
                            {overallScore !== null ? `${overallScore}%` : "—"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleCard(invite.id)}
                            className="h-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200 rounded-full px-3 text-xs font-semibold"
                          >
                            {isExpanded ? (
                              <>Ocultar <ChevronUp className="ml-1 h-3.5 w-3.5" /></>
                            ) : (
                              <>Ver Histórico <ChevronDown className="ml-1 h-3.5 w-3.5" /></>
                            )}
                          </Button>
                        </td>
                        <td className="px-5 py-4 text-center">
                          {invite.supplierOrganizationId ? (
                            <div className="relative inline-block text-left">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (openMenuId === invite.id) {
                                    setOpenMenuId(null);
                                    setMenuPosition(null);
                                  } else {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setOpenMenuId(invite.id);
                                    setMenuPosition({
                                      top: rect.bottom + 4,
                                      left: rect.right - 192, // w-48 is 192px
                                    });
                                  }
                                }}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                              {openMenuId === invite.id && menuPosition && (
                                <>
                                  <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenMenuId(null);
                                      setMenuPosition(null);
                                    }}
                                  />
                                  <div 
                                    style={{
                                      position: "fixed",
                                      top: `${menuPosition.top}px`,
                                      left: `${menuPosition.left}px`,
                                    }}
                                    className="w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in duration-100"
                                  >
                                    {isInactive ? (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleReactivate(invite.supplierOrganizationId!);
                                          setOpenMenuId(null);
                                          setMenuPosition(null);
                                        }}
                                        disabled={isReactivating === invite.supplierOrganizationId}
                                        className="w-full text-left px-4 py-2 text-xs font-semibold text-emerald-600 hover:bg-slate-50 flex items-center gap-1.5"
                                      >
                                        {isReactivating === invite.supplierOrganizationId ? (
                                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                          <CheckCircle2 className="h-3.5 w-3.5" />
                                        )}
                                        Reativar Relacionamento
                                      </button>
                                    ) : (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleTerminate(invite.supplierOrganizationId!);
                                          setOpenMenuId(null);
                                          setMenuPosition(null);
                                        }}
                                        disabled={isTerminating === invite.supplierOrganizationId}
                                        className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-slate-50 flex items-center gap-1.5"
                                      >
                                        {isTerminating === invite.supplierOrganizationId ? (
                                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                          <X className="h-3.5 w-3.5" />
                                        )}
                                        Inativar Relacionamento
                                      </button>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50/40">
                          <td colSpan={10} className="px-5 py-4 border-t border-slate-100">
                            <div className="space-y-4">
                              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Histórico de Diagnósticos ESG</h4>
                              {invite.requestedDiagnostics.length > 0 ? (
                                <div className="space-y-3">
                                  {invite.requestedDiagnostics.map((diag) => {
                                    const diagScore = diag.score;
                                    const diagEnv = diagScore?.environmentalScore != null ? Math.round(Number(diagScore.environmentalScore)) : null;
                                    const diagBio = diagScore?.bioeconomyCircularScore != null ? Math.round(Number(diagScore.bioeconomyCircularScore)) : null;
                                    const diagSoc = diagScore?.socialScore != null ? Math.round(Number(diagScore.socialScore)) : null;
                                    const diagGov = diagScore?.governanceScore != null ? Math.round(Number(diagScore.governanceScore)) : null;
                                    const diagOverall = diagScore?.overallScore != null ? Math.round(Number(diagScore.overallScore)) : null;

                                    let diagOverallColorClass = "text-slate-800";
                                    if (diagOverall !== null) {
                                      if (diagOverall >= 80) {
                                        diagOverallColorClass = "text-emerald-600 font-extrabold";
                                      } else if (diagOverall < 50) {
                                        diagOverallColorClass = "text-rose-600 font-extrabold";
                                      } else {
                                        diagOverallColorClass = "text-amber-500 font-extrabold";
                                      }
                                    }

                                    const completionDate = diag.completedAt || diag.updatedAt || diag.createdAt || new Date().toISOString();

                                    return (
                                      <div key={diag.id} className="flex flex-wrap items-center justify-between gap-4 p-3 bg-white border border-slate-100 rounded-xl shadow-xs">
                                        <div className="flex flex-col">
                                          <span className="text-xs font-semibold text-slate-700">
                                            Diagnóstico ({diag.kind === "FULL_DIAGNOSTIC" ? "Completo" : diag.kind === "PRE_DIAGNOSTIC" ? "Pré-Diagnóstico" : "Fornecedor"})
                                          </span>
                                          <span className="text-[10px] text-slate-400">
                                            {diag.status === "COMPLETED" 
                                              ? `Concluído em ${new Date(completionDate).toLocaleDateString("pt-BR")}` 
                                              : `Em andamento (${diag.percentageCompletion}% preenchido)`}
                                          </span>
                                        </div>
                                        {diag.status === "COMPLETED" && (
                                          <div className="flex gap-4 text-xs">
                                            <span className="flex items-center gap-1 font-semibold text-emerald-600">
                                              <Leaf className="w-3.5 h-3.5" /> E: {diagEnv !== null ? `${diagEnv}%` : "—"}
                                            </span>
                                            <span className="flex items-center gap-1 font-semibold text-amber-600">
                                              <Recycle className="w-3.5 h-3.5" /> B: {diagBio !== null ? `${diagBio}%` : "—"}
                                            </span>
                                            <span className="flex items-center gap-1 font-semibold text-blue-600">
                                              <Heart className="w-3.5 h-3.5" /> S: {diagSoc !== null ? `${diagSoc}%` : "—"}
                                            </span>
                                            <span className="flex items-center gap-1 font-semibold text-indigo-600">
                                              <Scale className="w-3.5 h-3.5" /> G: {diagGov !== null ? `${diagGov}%` : "—"}
                                            </span>
                                            <span className={`font-extrabold ${diagOverallColorClass}`}>
                                              Geral: {diagOverall !== null ? `${diagOverall}%` : "—"}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="text-slate-500 text-xs py-2">
                                  Nenhum histórico de pontuações disponível para este fornecedor.
                                </div>
                              )}
                              
                              <div className="pt-2 border-t border-slate-200/60 text-xs flex justify-between items-center">
                                <div>
                                  <span className="font-semibold text-slate-700">Status do Relacionamento:</span>{" "}
                                  {isInactive ? (
                                    <span className="text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                                      Inativo (Fim: {new Date(invite.relationship?.endedAt || Date.now()).toLocaleDateString("pt-BR")} - {invite.relationship?.endedReason || "Sem justificativa"})
                                    </span>
                                  ) : (
                                    <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                      Ativo (Início: {invite.relationship?.startedAt || invite.acceptedAt ? new Date(invite.relationship?.startedAt || invite.acceptedAt!).toLocaleDateString("pt-BR") : new Date(invite.createdAt).toLocaleDateString("pt-BR")})
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
               )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-5xl p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto rounded-2xl border border-white/20 bg-white/95 backdrop-blur-xl shadow-2xl my-auto">
            {/* Liquid Glass Background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-white/10 -z-10" />
            
            <div className="flex justify-between items-start gap-4 mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-slate-800">Convidar Fornecedor</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">Gerencie o convite e envie as instruções para sua cadeia.</p>
              </div>
              <button 
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-500 hover:text-slate-700 transition-colors p-2 hover:bg-slate-100 rounded-full shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Left Column: Instructions + Link */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Instruções de Uso</h4>
                  
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Copie o link único</p>
                        <p className="text-xs text-slate-500 mt-0.5">Este link é exclusivo para a sua empresa e identifica os seus fornecedores.</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Envie para seus fornecedores</p>
                        <p className="text-xs text-slate-500 mt-0.5">Envie da melhor forma para seu fornecedor</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Acompanhe o progresso</p>
                        <p className="text-xs text-slate-500 mt-0.5">Assim que ele começar, você verá o status &quot;Em andamento&quot; nesta tela.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/80 rounded-xl border border-slate-100 shadow-sm">
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Link de Convite</h4>
                  <p className="text-xs text-slate-500 mb-4">Compartilhe este link com os fornecedores que deseja homologar.</p>
                  
                  <div className="relative flex flex-col sm:block">
                    <input 
                      type="text" 
                      readOnly 
                      value={inviteUrl}
                      className="w-full text-xs p-3 pr-20 bg-emerald-600 border border-emerald-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white font-mono font-bold shadow-inner"
                    />
                    <button 
                      className="mt-2 sm:mt-0 sm:absolute sm:right-2 sm:top-1/2 sm:-translate-y-1/2 bg-white hover:bg-slate-100 text-emerald-700 text-xs px-3 py-2 sm:py-1.5 rounded-md transition-colors font-bold shadow-sm"
                      onClick={() => {
                        navigator.clipboard.writeText(inviteUrl);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 5000);
                      }}
                    >
                      Copiar
                    </button>
                  </div>
                  {copiedLink && (
                    <p className="text-xs text-emerald-600 mt-2 font-medium">
                      ✓ Link copiado!
                    </p>
                  )}
                </div>
              </div>
              
              {/* Right Column: Pre-written Message */}
              <div className="p-4 bg-white/80 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Mensagem Pronta para Envio</h4>
                  <p className="text-xs text-slate-500 mb-4">Copie o texto completo abaixo e envie por e-mail ou WhatsApp para facilitar a abordagem.</p>
                  
                  <textarea 
                    readOnly 
                    rows={8}
                    value={readyMessage}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-600 resize-none"
                  />
                </div>
                
                <div className="mt-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50/50 p-2 rounded-md">
                    <span className="flex-shrink-0 w-1.5 h-1.5 bg-amber-500 rounded-full" />
                    O link já está incluso na mensagem.
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
                    <div>
                      {copiedMessage && (
                        <p className="text-xs text-emerald-600 font-medium">
                          ✓ Mensagem copiada!
                        </p>
                      )}
                    </div>
                    <Button 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs whitespace-nowrap"
                      onClick={() => {
                        navigator.clipboard.writeText(readyMessage);
                        setCopiedMessage(true);
                        setTimeout(() => setCopiedMessage(false), 5000);
                      }}
                    >
                      Copiar Mensagem
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsInviteModalOpen(false)}
                className="text-slate-600 border-slate-200 w-full sm:w-auto"
              >
                Fechar
              </Button>
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                onClick={() => {
                  navigator.clipboard.writeText(inviteUrl);
                  setIsInviteModalOpen(false);
                }}
              >
                Copiar Link e Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      <InvitePurchaseModal 
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
      />
    </div>
  );
}
