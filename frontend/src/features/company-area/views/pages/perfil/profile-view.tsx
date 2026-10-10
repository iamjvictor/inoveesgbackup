"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { getProfileViewModel } from "../../../controllers/profile.controller";
import { 
  Building2, 
  CreditCard, 
  Mail, 
  MapPin, 
  Phone, 
  Users, 
  ShieldCheck, 
  User, 
  ExternalLink,
  Leaf,
  Globe,
  Briefcase,
  Layers,
  CheckCircle2,
  Sparkles,
  DollarSign,
  Clock,
  Edit3,
  Check,
  TrendingUp,
  FileCheck,
  Camera,
  Loader2
} from "lucide-react";
import { InvitePurchaseModal } from "../../components/invite-purchase-modal";
import { LogoCropModal } from "../../components/logo-crop-modal";
import { useCompany } from "@/features/company-area/context/company-context";

import { inviteService } from "@/features/company-area/services/invite.service";
import { authService } from "@/features/auth/services/auth.service";
import { formatCPF, formatCNPJ, validateCPF, validateCNPJ } from "@/lib/cpfCnpjValidator";
import { cn } from "@/lib/utils";

const BUSINESS_CATEGORIES = [
  { code: "AGRONEGOCIO", name: "Agronegócio" },
  { code: "OLEO_E_GAS", name: "Óleo e Gás" },
  { code: "INFRAESTRUTURA", name: "Infraestrutura" }
];

const BUSINESS_SEGMENTS: Record<string, { code: string; name: string }[]> = {
  AGRONEGOCIO: [
    { code: "AGROINDUSTRIA", name: "Agroindústria" },
    { code: "PRODUCAO", name: "Produção" }
  ],
  OLEO_E_GAS: [
    { code: "OLEO_E_GAS", name: "Óleo e Gás" }
  ],
  INFRAESTRUTURA: [
    { code: "INFRAESTRUTURA", name: "Infraestrutura" }
  ]
};

function displayCNPJ(cnpj?: string | null): string {
  if (!cnpj) return "N/A";
  return formatCNPJ(cnpj);
}

function displayCPF(cpf?: string | null): string {
  if (!cpf) return "N/A";
  return formatCPF(cpf);
}

function formatPhone(phone?: string | null): string {
  if (!phone) return "N/A";
  const clean = phone.replace(/\D/g, "");
  if (clean.length === 11) {
    return clean.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }
  if (clean.length === 10) {
    return clean.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  }
  return phone;
}

type ProfileViewModel = ReturnType<typeof getProfileViewModel>;

export function ProfileView({ model }: { model: ProfileViewModel }) {
  const [activeTab, setActiveTab] = useState<"organization" | "esg" | "respondent" | "supply_chain" | "billing">("organization");
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const { company, user, refreshProfile } = useCompany();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [selectedLogoSrc, setSelectedLogoSrc] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const handleLogoSelect = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("A imagem selecionada deve ter no máximo 10 MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Por favor selecione um arquivo de imagem válido (PNG, JPG, WebP ou SVG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedLogoSrc(reader.result as string);
      setIsCropModalOpen(true);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.onerror = () => {
      alert("Erro ao ler a imagem selecionada.");
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmCroppedLogo = async (croppedBase64: string) => {
    const token = "cookie-session";
    if (!token) return;

    setIsUploadingLogo(true);
    try {
      await authService.uploadCompanyLogo(token, {
        fileName: "company_logo.png",
        mimeType: "image/png",
        base64Data: croppedBase64,
        sizeBytes: Math.round(croppedBase64.length * 0.75),
      });
      await refreshProfile();
      setIsCropModalOpen(false);
      setSelectedLogoSrc(null);
    } catch (err: any) {
      alert(err?.message || "Erro ao fazer upload da logo.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    legalName: "",
    tradeName: "",
    cnpj: "",
    industrySegment: "",
    businessCategoryCode: "",
    businessSegmentCode: "",
    specificActivity: "",
    enderecoCompleto: "",
    municipioEstado: "",
    website: "",
    redesSociais: "",
    naturezaJuridica: "",
    porte: "",
    tempoOperacao: "",
    alcanceMercado: "",
    primaryEmail: "",
  });

  const handleStartEditCompany = () => {
    setCompanyForm({
      legalName: company?.legalName || "",
      tradeName: company?.tradeName || "",
      cnpj: company?.cnpj || "",
      industrySegment: company?.industrySegment || "",
      businessCategoryCode: company?.businessCategory?.code || "",
      businessSegmentCode: company?.businessSegment?.code || "",
      specificActivity: company?.specificActivity || "",
      enderecoCompleto: company?.enderecoCompleto || "",
      municipioEstado: company?.municipioEstado || "",
      website: (company as any)?.website || (company as any)?.site || "",
      redesSociais: company?.redesSociais || "",
      naturezaJuridica: company?.naturezaJuridica || "",
      porte: company?.porte || "",
      tempoOperacao: company?.tempoOperacao || "",
      alcanceMercado: company?.alcanceMercado || "",
      primaryEmail: company?.primaryEmail || "",
    });
    setIsEditingCompany(true);
  };

  const handleSaveCompany = async () => {
    const token = "cookie-session";
    if (!token) return;
    if (companyForm.cnpj && !validateCNPJ(companyForm.cnpj)) {
      alert("CNPJ inválido (dígitos verificadores incorretos). Por favor verifique o número preenchido.");
      return;
    }
    try {
      await authService.updateProfile(token, {
        organization: companyForm,
      });
      await refreshProfile();
      setIsEditingCompany(false);
    } catch (err: any) {
      alert(err?.message || "Erro ao salvar dados da organização");
    }
  };

  const [isEditingRespondent, setIsEditingRespondent] = useState(false);
  const [respondentForm, setRespondentForm] = useState({
    fullName: "",
    phone: "",
    cpf: "",
    cargoFuncao: "",
    grauParticipacao: "",
  });

  const handleStartEditRespondent = () => {
    setRespondentForm({
      fullName: user?.fullName || "",
      phone: user?.phone || "",
      cpf: user?.cpf || "",
      cargoFuncao: user?.cargoFuncao || "",
      grauParticipacao: user?.grauParticipacao || "",
    });
    setIsEditingRespondent(true);
  };

  const handleSaveRespondent = async () => {
    const token = "cookie-session";
    if (!token) return;
    if (respondentForm.cpf && !validateCPF(respondentForm.cpf)) {
      alert("CPF inválido (dígitos verificadores incorretos). Por favor verifique o número preenchido.");
      return;
    }
    try {
      await authService.updateProfile(token, {
        user: respondentForm,
      });
      await refreshProfile();
      setIsEditingRespondent(false);
    } catch (err: any) {
      alert(err?.message || "Erro ao salvar dados do respondente");
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
    const token = "cookie-session";
      if (token) {
        try {
          const res = await inviteService.getStats(token);
          setStats(res);
        } catch (err) {
          console.error("Failed to fetch invite stats", err);
        }
      }
    };
    fetchStats();
  }, []);

  const available = stats?.availableInvites ?? company?.inviteWallet?.balance ?? 0;
  const acquired = Math.max(available, stats?.totalInvitesPurchased ?? company?.orders?.filter(o => o.orderType === "INVITE_PACK" && o.status === "PAID").reduce((acc, o) => acc + (o.items?.[0]?.quantity || 0), 0) ?? 0);
  const used = Math.max(0, acquired - available);

  const billingHistory = company?.orders?.map((order) => {
    const itemName = order.items?.[0]?.product?.name || (order.orderType === "INVITE_PACK" ? "Pacote de Convites" : "Serviço InoveESG");
    const quantity = order.items?.[0]?.quantity;
    const displayName = order.orderType === "INVITE_PACK" 
      ? `${itemName} (${quantity} convites)` 
      : itemName;

    return {
      id: order.id,
      displayName,
      date: order.paidAt 
        ? new Date(order.paidAt).toLocaleDateString("pt-BR") 
        : new Date(order.createdAt).toLocaleDateString("pt-BR"),
      amount: `R$ ${(order.totalCents / 100).toFixed(2).replace(".", ",")}`,
      status: order.status,
    };
  }) || [];

  const userInitials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "US";

  const joinedDate = company?.createdAt
    ? new Date(company.createdAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
    : "-";

  const websiteUrl = (company as any)?.website || (company as any)?.site;

  // Safe checks for arrays from registration
  const esgJaPossuiList: string[] = (company as any)?.esgJaPossui || [];
  const esgInteresseList: string[] = (company as any)?.esgInteresse || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-12">
      
      {/* Clean Corporate Profile Header Card */}
      <div className="relative rounded-2xl bg-white border border-slate-200/80 shadow-sm p-6 md:p-8 animate-in fade-in duration-300">
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/png,image/jpeg,image/webp,image/svg+xml" 
          className="hidden" 
          onChange={handleLogoChange} 
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Avatar + Main Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Logo Avatar */}
            <div 
              className="relative group cursor-pointer flex-shrink-0"
              onClick={handleLogoSelect}
              title="Clique para alterar a logo da empresa"
            >
              {company?.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.tradeName || company.legalName}
                  className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-2 border-slate-100 shadow-md bg-white p-1"
                />
              ) : (
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 flex items-center justify-center text-3xl font-bold font-display shadow-md text-white border-2 border-emerald-500/20">
                  {(company?.tradeName || company?.legalName || "E")[0].toUpperCase()}
                </div>
              )}
              
              {/* Camera Overlay on Hover */}
              <div className="absolute inset-0 bg-slate-900/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all text-white text-xs font-semibold backdrop-blur-[2px]">
                {isUploadingLogo ? (
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                ) : (
                  <>
                    <Camera className="w-5 h-5 mb-1 text-white" />
                    <span>Alterar Logo</span>
                  </>
                )}
              </div>
            </div>

            {/* Info Column */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold font-display text-slate-900 tracking-tight">
                  {company?.tradeName || company?.legalName || "Minha Empresa"}
                </h1>
                
                {/* Status Badges */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Empresa Verificada
                </span>

                {company?.industrySegment && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    <Briefcase className="h-3.5 w-3.5 text-slate-500" />
                    {company.industrySegment}
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-500 font-medium">
                {company?.legalName && company.tradeName && company.legalName !== company.tradeName 
                  ? company.legalName 
                  : "Perfil Corporativo ESG"}
              </p>

              {/* Metadata Pills */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs font-medium text-slate-600">
                {company?.cnpj && (
                  <span className="inline-flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    <span>CNPJ: <strong className="font-mono text-slate-800">{displayCNPJ(company?.cnpj)}</strong></span>
                  </span>
                )}

                <span className="inline-flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Membro desde: <strong className="text-slate-800">{joinedDate}</strong></span>
                </span>

                {company?.municipioEstado && (
                  <span className="inline-flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{company.municipioEstado}</span>
                  </span>
                )}

                {websiteUrl && (
                  <a
                    href={websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80 text-slate-700 transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{websiteUrl.replace(/^https?:\/\//, "")}</span>
                    <ExternalLink className="h-3 w-3 text-slate-400" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Button */}
          <div className="flex items-center gap-3 self-start md:self-center">
            <Button
              onClick={handleLogoSelect}
              disabled={isUploadingLogo}
              variant="outline"
              size="sm"
              className="rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-semibold gap-2 shadow-sm"
            >
              {isUploadingLogo ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 text-emerald-600" />
                  <span>{company?.logoUrl ? "Alterar Logo" : "Upload da Logo"}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("organization")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap",
            activeTab === "organization"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
          )}
        >
          <Building2 className="h-4 w-4" />
          <span>Dados da Organização</span>
        </button>

        <button
          onClick={() => setActiveTab("esg")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap",
            activeTab === "esg"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
          )}
        >
          <Leaf className="h-4 w-4" />
          <span>Maturidade & Perfil ESG</span>
        </button>

        <button
          onClick={() => setActiveTab("respondent")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap",
            activeTab === "respondent"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
          )}
        >
          <User className="h-4 w-4" />
          <span>Representante Legal</span>
        </button>

        <button
          onClick={() => setActiveTab("supply_chain")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap",
            activeTab === "supply_chain"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
          )}
        >
          <Users className="h-4 w-4" />
          <span>Cadeia de Fornecedores</span>
        </button>

        <button
          onClick={() => setActiveTab("billing")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap",
            activeTab === "billing"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
          )}
        >
          <CreditCard className="h-4 w-4" />
          <span>Faturas & Histórico</span>
        </button>
      </div>

      {/* TAB 1: DADOS DA ORGANIZAÇÃO */}
      {activeTab === "organization" && (
        <div className="space-y-6 animate-fade-in">
          {/* Card Header & Controls */}
          <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-display text-slate-800">Informações Cadastrais e Operacionais</h2>
                <p className="text-xs text-slate-500">Dados institucionais da empresa registrados na plataforma</p>
              </div>
            </div>
            <div>
              {!isEditingCompany ? (
                <Button 
                  onClick={handleStartEditCompany}
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold gap-1.5"
                >
                  <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                  Editar Dados
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => setIsEditingCompany(false)}
                    variant="ghost"
                    size="sm"
                    className="rounded-xl text-slate-500 font-semibold hover:bg-slate-100"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSaveCompany}
                    size="sm"
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Salvar Alterações
                  </Button>
                </div>
              )}
            </div>
          </div>


          {isEditingCompany ? (
            /* Editing Form Container */
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
                Editar Cadastro da Organização
              </h3>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Razão Social</label>
                  <input
                    type="text"
                    value={companyForm.legalName}
                    onChange={(e) => setCompanyForm({ ...companyForm, legalName: e.target.value })}
                    className="w-full text-sm font-medium text-slate-800 bg-slate-50/50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Nome Fantasia</label>
                  <input
                    type="text"
                    value={companyForm.tradeName}
                    onChange={(e) => setCompanyForm({ ...companyForm, tradeName: e.target.value })}
                    className="w-full text-sm font-medium text-slate-800 bg-slate-50/50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">CNPJ</label>
                  <input
                    type="text"
                    value={companyForm.cnpj}
                    onChange={(e) => setCompanyForm({ ...companyForm, cnpj: formatCNPJ(e.target.value) })}
                    placeholder="00.000.000/0000-00"
                    className="w-full text-sm font-medium text-slate-800 bg-slate-50/50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Categoria de Negócio</label>
                  <select
                    value={companyForm.businessCategoryCode}
                    onChange={(e) => {
                      const catCode = e.target.value;
                      setCompanyForm({
                        ...companyForm,
                        businessCategoryCode: catCode,
                        businessSegmentCode: "",
                        industrySegment: "",
                        specificActivity: ""
                      });
                    }}
                    className="w-full text-sm font-medium text-slate-800 bg-slate-50/50 border border-slate-200 px-3 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="">Selecione...</option>
                    {BUSINESS_CATEGORIES.map((cat) => (
                      <option key={cat.code} value={cat.code}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Segmento de Atuação</label>
                  <select
                    disabled={!companyForm.businessCategoryCode}
                    value={companyForm.businessSegmentCode}
                    onChange={(e) => {
                      const segCode = e.target.value;
                      const segName = BUSINESS_SEGMENTS[companyForm.businessCategoryCode]?.find((s) => s.code === segCode)?.name || "";
                      setCompanyForm({
                        ...companyForm,
                        businessSegmentCode: segCode,
                        industrySegment: segName,
                        specificActivity: ""
                      });
                    }}
                    className="w-full text-sm font-medium text-slate-800 bg-slate-50/50 border border-slate-200 px-3 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50"
                  >
                    <option value="">Selecione...</option>
                    {companyForm.businessCategoryCode &&
                      BUSINESS_SEGMENTS[companyForm.businessCategoryCode]?.map((seg) => (
                        <option key={seg.code} value={seg.code}>{seg.name}</option>
                      ))
                    }
                  </select>
                </div>
                {companyForm.businessSegmentCode && (
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-600">Atividade Específica</label>
                    <input
                      type="text"
                      value={companyForm.specificActivity}
                      onChange={(e) => setCompanyForm({ ...companyForm, specificActivity: e.target.value })}
                      className="w-full text-sm font-medium text-slate-800 bg-slate-50/50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                )}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600">Endereço Completo</label>
                  <input
                    type="text"
                    value={companyForm.enderecoCompleto}
                    onChange={(e) => setCompanyForm({ ...companyForm, enderecoCompleto: e.target.value })}
                    className="w-full text-sm font-medium text-slate-800 bg-slate-50/50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Município / Estado</label>
                  <input
                    type="text"
                    value={companyForm.municipioEstado}
                    onChange={(e) => setCompanyForm({ ...companyForm, municipioEstado: e.target.value })}
                    className="w-full text-sm font-medium text-slate-800 bg-slate-50/50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Website Oficial</label>
                  <input
                    type="text"
                    value={companyForm.website}
                    onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                    className="w-full text-sm font-medium text-slate-800 bg-slate-50/50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Redes Sociais</label>
                  <input
                    type="text"
                    value={companyForm.redesSociais}
                    onChange={(e) => setCompanyForm({ ...companyForm, redesSociais: e.target.value })}
                    className="w-full text-sm font-medium text-slate-800 bg-slate-50/50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Natureza Jurídica</label>
                  <input
                    type="text"
                    value={companyForm.naturezaJuridica}
                    onChange={(e) => setCompanyForm({ ...companyForm, naturezaJuridica: e.target.value })}
                    className="w-full text-sm font-medium text-slate-800 bg-slate-50/50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Porte da Empresa</label>
                  <input
                    type="text"
                    value={companyForm.porte}
                    onChange={(e) => setCompanyForm({ ...companyForm, porte: e.target.value })}
                    className="w-full text-sm font-medium text-slate-800 bg-slate-50/50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Tempo de Operação</label>
                  <input
                    type="text"
                    value={companyForm.tempoOperacao}
                    onChange={(e) => setCompanyForm({ ...companyForm, tempoOperacao: e.target.value })}
                    className="w-full text-sm font-medium text-slate-800 bg-slate-50/50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Alcance de Mercado</label>
                  <input
                    type="text"
                    value={companyForm.alcanceMercado}
                    onChange={(e) => setCompanyForm({ ...companyForm, alcanceMercado: e.target.value })}
                    className="w-full text-sm font-medium text-slate-800 bg-slate-50/50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">E-mail Principal de Contato</label>
                  <input
                    type="email"
                    value={companyForm.primaryEmail}
                    onChange={(e) => setCompanyForm({ ...companyForm, primaryEmail: e.target.value })}
                    className="w-full text-sm font-medium text-slate-800 bg-slate-50/50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Clean Modern View Cards */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Card 1: Identificação Institucional */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 text-emerald-700 font-bold font-display text-sm pb-2 border-b border-slate-100">
                  <Building2 className="h-4 w-4 text-emerald-600" />
                  <span>Identificação Legal</span>
                </div>
                <div className="space-y-3.5 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-medium block">Razão Social</span>
                    <span className="font-semibold text-slate-800">{company?.legalName || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-medium block">Nome Fantasia</span>
                    <span className="font-semibold text-slate-800">{company?.tradeName || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-medium block">CNPJ</span>
                    <span className="font-semibold font-mono text-slate-800">{displayCNPJ(company?.cnpj)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-medium block">Natureza Jurídica</span>
                    <span className="inline-block mt-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                      {company?.naturezaJuridica || "Não informada"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Localização & Canais */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 text-teal-700 font-bold font-display text-sm pb-2 border-b border-slate-100">
                  <MapPin className="h-4 w-4 text-teal-600" />
                  <span>Localização & Contatos</span>
                </div>
                <div className="space-y-3.5 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-medium block">Endereço Completo</span>
                    <span className="font-semibold text-slate-800">{company?.enderecoCompleto || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-medium block">Município / Estado</span>
                    <span className="font-semibold text-slate-800">{company?.municipioEstado || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-medium block">E-mail Principal</span>
                    <span className="font-semibold text-slate-800 break-all">{company?.primaryEmail || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-medium block">Website</span>
                    {websiteUrl ? (
                      <a 
                        href={websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-semibold underline underline-offset-2 mt-0.5"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        <span>{websiteUrl}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="font-semibold text-slate-800">N/A</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 3: Estrutura & Mercado */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 md:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2.5 text-emerald-700 font-bold font-display text-sm pb-2 border-b border-slate-100">
                  <Briefcase className="h-4 w-4 text-emerald-600" />
                  <span>Porte & Atuação</span>
                </div>
                <div className="space-y-3.5 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-medium block">Setor de Atuação</span>
                    <span className="font-semibold text-slate-800">
                      {company?.businessCategory?.name && company?.businessSegment?.name
                        ? `${company.businessCategory.name} - ${company.businessSegment.name}`
                        : company?.industrySegment || "N/A"}
                    </span>
                  </div>
                  {company?.specificActivity && (
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-medium block">Atividade Específica</span>
                      <span className="font-semibold text-slate-800">{company.specificActivity}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-medium block">Porte</span>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {company?.porte || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 uppercase font-medium block">Alcance</span>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-100">
                        {company?.alcanceMercado || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-medium block">Tempo de Operação</span>
                    <span className="font-semibold text-slate-800">{company?.tempoOperacao || "N/A"}</span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* TAB 2: MATURIDADE & PERFIL ESG */}
      {activeTab === "esg" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-display text-slate-800">Perfil de Sustentabilidade & Integridade ESG</h2>
                <p className="text-xs text-slate-500">Mapeamento de maturidade declarada durante o cadastro da empresa</p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/app/diagnostico")}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl gap-1.5"
            >
              <Sparkles className="h-4 w-4" />
              Ver Diagnóstico ESG
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Práticas já adotadas */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-emerald-800 font-bold font-display text-sm pb-3 border-b border-slate-100">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Iniciativas & Estruturas Já Possuídas</span>
              </div>

              {esgJaPossuiList.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {esgJaPossuiList.map((item, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500 text-xs py-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Nenhuma prática específica cadastrada como concluída até o momento.
                </div>
              )}
            </div>

            {/* Interesses ESG */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-teal-800 font-bold font-display text-sm pb-3 border-b border-slate-100">
                <TrendingUp className="h-4 w-4 text-teal-600" />
                <span>Interesses & Metas de Desenvolvimento</span>
              </div>

              {esgInteresseList.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {esgInteresseList.map((item, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200/60">
                      <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500 text-xs py-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Nenhum interesse prioritário selecionado no cadastro.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: REPRESENTANTE LEGAL */}
      {activeTab === "respondent" && (
        <div className="space-y-6 animate-fade-in max-w-3xl">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-display text-slate-800">Dados do Representante Técnico Legal</h2>
                  <p className="text-xs text-slate-500">Usuário responsável técnico cadastrado para a empresa</p>
                </div>
              </div>
              <div>
                {!isEditingRespondent ? (
                  <Button 
                    onClick={handleStartEditRespondent}
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold gap-1.5"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => setIsEditingRespondent(false)}
                      variant="ghost"
                      size="sm"
                      className="rounded-xl text-slate-500 font-semibold hover:bg-slate-100"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSaveRespondent}
                      size="sm"
                      className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold gap-1.5"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Salvar
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {isEditingRespondent ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Nome Completo</label>
                  <input
                    type="text"
                    value={respondentForm.fullName}
                    onChange={(e) => setRespondentForm({ ...respondentForm, fullName: e.target.value })}
                    className="w-full text-sm font-medium text-slate-800 bg-slate-50/50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Cargo / Função</label>
                  <input
                    type="text"
                    value={respondentForm.cargoFuncao}
                    onChange={(e) => setRespondentForm({ ...respondentForm, cargoFuncao: e.target.value })}
                    className="w-full text-sm font-medium text-slate-800 bg-slate-50/50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">CPF</label>
                  <input
                    type="text"
                    value={respondentForm.cpf}
                    onChange={(e) => setRespondentForm({ ...respondentForm, cpf: formatCPF(e.target.value) })}
                    placeholder="000.000.000-00"
                    className="w-full text-sm font-medium text-slate-800 bg-slate-50/50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">WhatsApp / Telefone</label>
                  <input
                    type="text"
                    value={respondentForm.phone}
                    onChange={(e) => setRespondentForm({ ...respondentForm, phone: e.target.value })}
                    className="w-full text-sm font-medium text-slate-800 bg-slate-50/50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Grau de Participação</label>
                  <input
                    type="text"
                    value={respondentForm.grauParticipacao}
                    onChange={(e) => setRespondentForm({ ...respondentForm, grauParticipacao: e.target.value })}
                    className="w-full text-sm font-medium text-slate-800 bg-slate-50/50 border border-slate-200 px-3.5 py-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4 bg-gradient-to-r from-slate-50 to-emerald-50/30 p-5 rounded-2xl border border-slate-100">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-emerald-600/20">
                    {userInitials}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">{user?.fullName || "N/A"}</h3>
                    <p className="text-xs font-medium text-emerald-700">{user?.cargoFuncao || "Cargo não informado"}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{user?.email || "N/A"}</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-xs text-slate-400 uppercase font-medium block">CPF</span>
                    <span className="font-semibold font-mono text-slate-800">{displayCPF(user?.cpf)}</span>
                  </div>

                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-xs text-slate-400 uppercase font-medium block">WhatsApp</span>
                    <span className="font-semibold text-slate-800">{formatPhone(user?.phone)}</span>
                  </div>

                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-1 sm:col-span-2">
                    <span className="text-xs text-slate-400 uppercase font-medium block">Grau de Participação</span>
                    <span className="font-semibold text-slate-800">{user?.grauParticipacao || "N/A"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CADEIA DE FORNECEDORES */}
      {activeTab === "supply_chain" && (
        <div className="space-y-6 animate-fade-in">
          {/* Convites Card */}
          <article className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-display text-slate-800">Cadeia de Fornecedores</h2>
                  <p className="text-xs text-slate-500">Distribuição e monitoramento de convites de homologação ESG</p>
                </div>
              </div>
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-xl transition-all duration-300 shadow-md shadow-emerald-600/10"
                onClick={() => setIsPurchaseModalOpen(true)}
              >
                Contratar mais convites
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Adquiridos</span>
                <p className="text-3xl font-bold font-display text-slate-800 mt-1">{acquired}</p>
                <p className="text-xs text-slate-500 mt-1">Total de licenças de convites</p>
              </div>
              <div className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Utilizados</span>
                <p className="text-3xl font-bold font-display text-slate-800 mt-1">{used}</p>
                <p className="text-xs text-slate-500 mt-1">Enviados para homologação</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl shadow-sm">
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Disponíveis</span>
                <p className="text-3xl font-bold font-display text-emerald-700 mt-1">{available}</p>
                <p className="text-xs text-emerald-600 mt-1">Prontos para envio</p>
              </div>
            </div>

            <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Uso Geral da Capacidade de Cadeia</span>
                <span>{acquired > 0 ? Math.round((used / acquired) * 100) : 0}%</span>
              </div>
              <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500" 
                  style={{ width: `${acquired > 0 ? (used / acquired) * 100 : 0}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                * Cada convite permite que um fornecedor terceirizado responda ao questionário de integridade ESG do ecossistema.
              </p>
            </div>
          </article>
        </div>
      )}

      {/* TAB 5: FATURAS & HISTÓRICO */}
      {activeTab === "billing" && (
        <div className="space-y-6 animate-fade-in">
          {/* Histórico Financeiro Card */}
          <article className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 bg-slate-100 text-slate-600 border border-slate-200 rounded-xl flex items-center justify-center">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-display text-slate-800">Histórico Financeiro</h2>
                <p className="text-xs text-slate-500">Últimas transações e cobranças processadas</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                {billingHistory.length > 0 ? (
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
                        <th className="p-4">Produto/Serviço</th>
                        <th className="p-4">Data do Pedido</th>
                        <th className="p-4">Valor Total</th>
                        <th className="p-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {billingHistory.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-semibold text-slate-800">{invoice.displayName}</td>
                          <td className="p-4 text-slate-500 text-xs">{invoice.date}</td>
                          <td className="p-4 font-semibold text-slate-800">{invoice.amount}</td>
                          <td className="p-4 text-right">
                            {invoice.status === "PAID" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Pago
                              </span>
                            ) : invoice.status === "PENDING_PAYMENT" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                Pendente
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-700 border border-slate-100">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                {invoice.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    Nenhum pagamento registrado no histórico financeiro da organização.
                  </div>
                )}
              </div>
            </div>
          </article>
        </div>
      )}

      <InvitePurchaseModal 
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
      />

      <LogoCropModal
        isOpen={isCropModalOpen}
        imageSrc={selectedLogoSrc}
        onClose={() => {
          setIsCropModalOpen(false);
          setSelectedLogoSrc(null);
        }}
        onConfirm={handleConfirmCroppedLogo}
        isUploading={isUploadingLogo}
      />
    </div>
  );
}
