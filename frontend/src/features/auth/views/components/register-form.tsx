"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Check, X, AlertTriangle, User, Phone, Building2, ShieldCheck, ChevronRight, ChevronLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthController } from "@/features/auth/controllers/use-auth.controller";
import { formatCPF, formatCNPJ, validateCPF, validateCNPJ } from "@/lib/cpfCnpjValidator";
import { City, Country, State } from "country-state-city";

type RegisterFormProps = {
  refCode?: string;
  initialEmail?: string;
  submitButtonText?: string;
  onSuccess?: () => void;
};

const jaPossuiOptions = [
  "Relatório ESG",
  "Política ambiental",
  "Inventário de carbono",
  "Certificações",
  "Indicadores ESG",
  "Comitê ESG",
  "Ações sociais estruturadas",
  "Plano de gestão de resíduos",
  "Metas sustentáveis formalizadas"
];

const interesseOptions = [
  "Certificação de sustentabilidade",
  "Créditos de carbono",
  "Bioeconomia Circular",
  "Inovação sustentável",
  "Captação de investimentos",
  "Adequação ambiental",
  "Relatórios ESG",
  "Indicadores de impacto",
  "Conexão com startups/ICTs",
  "Rastreamento ESG",
  "Capacitação ESG",
  "Exportação sustentável"
];

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

export function RegisterForm({ refCode, initialEmail, submitButtonText = "Criar Conta", onSuccess }: RegisterFormProps) {
  const router = useRouter();
  const { register, status, errorMessage, reset } = useAuthController();

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 1: Respondent Details
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [cargoFuncao, setCargoFuncao] = useState("");
  const [phone, setPhone] = useState("");
  const [grauParticipacao, setGrauParticipacao] = useState("");

  // Step 2: Company Details
  const [companyName, setCompanyName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [addressComplement, setAddressComplement] = useState("");
  const [country, setCountry] = useState("BR");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [site, setSite] = useState("");
  const [redesSociais, setRedesSociais] = useState("");
  const [naturezaJuridica, setNaturezaJuridica] = useState("");
  const [porte, setPorte] = useState("");
  const [size, setSize] = useState("");
  const [tempoOperacao, setTempoOperacao] = useState("");
  const [alcanceMercado, setAlcanceMercado] = useState("");
  const [industrySegment, setIndustrySegment] = useState("");
  const [businessCategoryCode, setBusinessCategoryCode] = useState("");
  const [businessSegmentCode, setBusinessSegmentCode] = useState("");
  const [specificActivity, setSpecificActivity] = useState("");
  const [numberOfSuppliers, setNumberOfSuppliers] = useState("");
  const [annualRevenue, setAnnualRevenue] = useState("");

  // Step 3: Strategic ESG Profile
  const [esgJaPossui, setEsgJaPossui] = useState<string[]>([]);
  const [esgInteresse, setEsgInteresse] = useState<string[]>([]);

  // Step 4: Consent & Access Credentials
  const [email, setEmail] = useState(initialEmail || "");
  const [emailConfirm, setEmailConfirm] = useState(initialEmail || "");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [consentAccepted, setConsentAccepted] = useState(false);

  useEffect(() => {
    reset();
  }, []);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
      setEmailConfirm(initialEmail);
    }
  }, [initialEmail]);

  const isLoading = status === "loading";

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .substring(0, 15);
  };

  const formatCnpj = (value: string) => formatCNPJ(value);
  const formatCpf = (value: string) => formatCPF(value);

  const isValidEmail = (e: string) => /\S+@\S+\.\S+/.test(e);
  const emailValid = isValidEmail(email);
  const emailsMatch = email === emailConfirm && emailConfirm !== "";

  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const passwordValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;
  const passwordsMatch = password === passwordConfirm && passwordConfirm !== "";

  const isCpfValid = cpf.replace(/\D/g, "").length === 11 && validateCPF(cpf);
  const isCnpjValid = cnpj.replace(/\D/g, "").length === 14 && validateCNPJ(cnpj);

  // Validation step logic
  const isStep1Valid = 
    fullName.trim().length >= 2 && 
    isCpfValid &&
    cargoFuncao.trim().length >= 2 &&
    phone.replace(/\D/g, "").length >= 10 &&
    grauParticipacao !== "";

  const isStep2Valid =
    companyName.trim().length >= 2 && 
    tradeName.trim().length >= 2 && 
    isCnpjValid && 
    addressLine1.trim().length >= 2 &&
    addressNumber.trim().length >= 1 &&
    country.trim().length >= 2 &&
    state.trim().length >= 2 &&
    city.trim().length >= 2 &&
    naturezaJuridica !== "" &&
    porte !== "" &&
    size !== "" &&
    tempoOperacao !== "" &&
    alcanceMercado !== "" &&
    businessCategoryCode !== "" &&
    businessSegmentCode !== "" &&
    specificActivity.trim().length >= 2;

  const isStep3Valid = esgJaPossui.length > 0 && esgInteresse.length > 0;

  const isStep4Valid =
    consentAccepted &&
    emailValid && 
    emailsMatch && 
    passwordValid && 
    passwordsMatch;

  const isFormValid = isStep1Valid && isStep2Valid && isStep3Valid && isStep4Valid;

  const handleJaPossuiChange = (val: string) => {
    if (val === "Nenhuma das opções anteriores") {
      setEsgJaPossui(["Nenhuma das opções anteriores"]);
    } else {
      setEsgJaPossui(prev => {
        const filtered = prev.filter(item => item !== "Nenhuma das opções anteriores");
        if (filtered.includes(val)) {
          return filtered.filter(item => item !== val);
        } else {
          return [...filtered, val];
        }
      });
    }
  };

  const handleInteresseChange = (val: string) => {
    setEsgInteresse(prev => {
      if (prev.includes(val)) {
        return prev.filter(item => item !== val);
      } else {
        return [...prev, val];
      }
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    try {
      const response = await register({
        email,
        password,
        fullName,
        phone,
        companyName,
        cnpj,
        industrySegment: industrySegment || undefined,
        businessCategoryCode: businessCategoryCode || undefined,
        businessSegmentCode: businessSegmentCode || undefined,
        specificActivity: specificActivity || undefined,
        size: size || undefined,
        numberOfSuppliers: numberOfSuppliers || undefined,
        annualRevenue: annualRevenue || undefined,
        ref: refCode || undefined,
        cpf,
        cargoFuncao,
        grauParticipacao,
        tradeName,
        addressLine1,
        addressNumber,
        addressComplement: addressComplement.trim() || undefined,
        country,
        state,
        city,
        site: site.trim() || undefined,
        redesSociais: redesSociais || undefined,
        naturezaJuridica,
        porte,
        tempoOperacao,
        alcanceMercado,
        esgJaPossui,
        esgInteresse,
      });
      
      if (response?.user) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/app");
        }
      }
    } catch (err) {
      console.error("Register error:", err);
    }
  };

  const canJumpToStep = (targetStep: number) => {
    if (targetStep === 1) return true;
    if (targetStep === 2) return isStep1Valid;
    if (targetStep === 3) return isStep1Valid && isStep2Valid;
    if (targetStep === 4) return isStep1Valid && isStep2Valid && isStep3Valid;
    return false;
  };

  const steps = [
    { number: 1, label: "Respondente" },
    { number: 2, label: "Empresa" },
    { number: 3, label: "Perfil ESG" },
    { number: 4, label: "Consentimento" }
  ];

  return (
    <div className="space-y-6">
      {/* Horizontal Steps Progress */}
      <div className="relative flex items-start justify-between px-4 mb-8">
        {/* Progress Line Container - starts and ends at the exact center of first and last circles */}
        <div className="absolute left-8 right-8 top-4 -translate-y-1/2 h-0.5">
          {/* Gray Background Line */}
          <div className="w-full h-full bg-slate-100 rounded-full" />
          {/* Green Progress Line */}
          <div 
            className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>
        
        {steps.map((s) => (
          <div key={s.number} className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              disabled={!canJumpToStep(s.number)}
              onClick={() => setStep(s.number)}
              className={cn(
                "relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border",
                step === s.number 
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-105" 
                  : step > s.number 
                    ? "bg-emerald-100 border-emerald-100 text-emerald-700" 
                    : "bg-white border-slate-200 text-slate-400"
              )}
            >
              {step > s.number ? <Check className="size-4 stroke-[3]" /> : s.number}
            </button>
            <span className={cn(
              "text-[9px] sm:text-[10px] font-semibold uppercase tracking-normal sm:tracking-wider transition-colors duration-300 text-center max-w-[64px] sm:max-w-none break-words",
              step === s.number ? "text-emerald-700 font-bold" : step > s.number ? "text-emerald-600" : "text-slate-400"
            )}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <form className="space-y-6" onSubmit={handleRegister} noValidate>
        
        {/* STEP 1: Respondent Info */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <User className="size-4 text-emerald-600" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Identificação do Respondente
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="fullName" className="text-xs font-medium text-slate-700">
                  Nome Completo *
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="cargoFuncao" className="text-xs font-medium text-slate-700">
                  Cargo/Função *
                </label>
                <input
                  id="cargoFuncao"
                  type="text"
                  required
                  value={cargoFuncao}
                  onChange={(e) => setCargoFuncao(e.target.value)}
                  placeholder="Ex: Diretor de Sustentabilidade"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="cpf" className="text-xs font-medium text-slate-700">
                  CPF *
                </label>
                <input
                  id="cpf"
                  type="text"
                  required
                  value={cpf}
                  onChange={(e) => {
                    setCpf(formatCpf(e.target.value));
                    if (errorMessage && errorMessage.toLowerCase().includes("cpf")) {
                      reset();
                    }
                  }}
                  placeholder="000.000.000-00"
                  className={cn(
                    "h-11 w-full rounded-xl border bg-white/50 px-3 text-sm outline-none transition focus:ring-2 focus:ring-emerald-500/20",
                    (errorMessage && errorMessage.toLowerCase().includes("cpf")) || (cpf.replace(/\D/g, "").length === 11 && !isCpfValid)
                      ? "border-red-300 focus:border-red-500"
                      : "border-slate-200 focus:border-emerald-500/50"
                  )}
                />
                {cpf.replace(/\D/g, "").length === 11 && !isCpfValid && (
                  <p className="text-xs text-red-500 font-medium mt-1">CPF inválido (dígitos verificadores incorretos)</p>
                )}
                {errorMessage && errorMessage.toLowerCase().includes("cpf") && (
                  <p className="text-xs text-red-500 font-medium mt-1">{errorMessage}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-xs font-medium text-slate-700">
                  Telefone / WhatsApp *
                </label>
                <input
                  id="phone"
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="(00) 00000-0000"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="grauParticipacao" className="text-xs font-medium text-slate-700">
                Grau de participação na empresa *
              </label>
              <select
                id="grauParticipacao"
                required
                value={grauParticipacao}
                onChange={(e) => setGrauParticipacao(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Selecione...</option>
                <option value="Sócio(a)">Sócio(a)</option>
                <option value="Diretor(a)">Diretor(a)</option>
                <option value="Gerente">Gerente</option>
                <option value="Colaborador(a)">Colaborador(a)</option>
                <option value="Consultor(a)">Consultor(a)</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div className="pt-4">
              <Button
                type="button"
                disabled={!isStep1Valid}
                onClick={() => setStep(2)}
                className="h-11 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center gap-2 font-semibold shadow-md transition duration-200 disabled:bg-slate-200 disabled:text-slate-400"
              >
                <span>Próxima Etapa</span>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Company Info */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Building2 className="size-4 text-emerald-600" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Caracterização da Empresa
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="companyName" className="text-xs font-medium text-slate-700">
                  Razão Social *
                </label>
                <input
                  id="companyName"
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Razão Social da empresa"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="tradeName" className="text-xs font-medium text-slate-700">
                  Nome Fantasia *
                </label>
                <input
                  id="tradeName"
                  type="text"
                  required
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  placeholder="Nome Fantasia da empresa"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="cnpj" className="text-xs font-medium text-slate-700">
                  CNPJ *
                </label>
                <input
                  id="cnpj"
                  type="text"
                  required
                  value={cnpj}
                  onChange={(e) => {
                    setCnpj(formatCnpj(e.target.value));
                    if (errorMessage && errorMessage.toLowerCase().includes("cnpj")) {
                      reset();
                    }
                  }}
                  placeholder="00.000.000/0000-00"
                  className={cn(
                    "h-11 w-full rounded-xl border bg-white/50 px-3 text-sm outline-none transition focus:ring-2 focus:ring-emerald-500/20",
                    (errorMessage && errorMessage.toLowerCase().includes("cnpj")) || (cnpj.replace(/\D/g, "").length === 14 && !isCnpjValid)
                      ? "border-red-300 focus:border-red-500"
                      : "border-slate-200 focus:border-emerald-500/50"
                  )}
                />
                {cnpj.replace(/\D/g, "").length === 14 && !isCnpjValid && (
                  <p className="text-xs text-red-500 font-medium mt-1">CNPJ inválido (dígitos verificadores incorretos)</p>
                )}
                {errorMessage && errorMessage.toLowerCase().includes("cnpj") && (
                  <p className="text-xs text-red-500 font-medium mt-1">{errorMessage}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="addressLine1" className="text-xs font-medium text-slate-700">Endereço *</label>
                <input id="addressLine1" type="text" required value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="Rua, avenida, rodovia..." className="h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="addressNumber" className="text-xs font-medium text-slate-700">Número *</label>
                <input id="addressNumber" type="text" required value={addressNumber} onChange={(e) => setAddressNumber(e.target.value)} placeholder="Ex: 120" className="h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="addressComplement" className="text-xs font-medium text-slate-700">Complemento (opcional)</label>
              <input id="addressComplement" type="text" value={addressComplement} onChange={(e) => setAddressComplement(e.target.value)} placeholder="Sala, bloco, sítio, km..." className="h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="country" className="text-xs font-medium text-slate-700">País *</label>
                <select id="country" required value={country} onChange={(e) => { setCountry(e.target.value); setState(""); setCity(""); }} className="h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20">
                  <option value="">Selecione...</option>
                  {Country.getAllCountries().map((item) => <option key={item.isoCode} value={item.isoCode}>{item.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="state" className="text-xs font-medium text-slate-700">Estado / UF *</label>
                <select id="state" required disabled={!country} value={state} onChange={(e) => { setState(e.target.value); setCity(""); }} className="h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50">
                  <option value="">Selecione...</option>
                  {State.getStatesOfCountry(country).map((item) => <option key={item.isoCode} value={item.isoCode}>{item.name} ({item.isoCode})</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="city" className="text-xs font-medium text-slate-700">Cidade *</label>
                <select id="city" required disabled={!country || !state} value={city} onChange={(e) => setCity(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50">
                  <option value="">Selecione...</option>
                  {City.getCitiesOfState(country, state).map((item) => <option key={`${item.name}-${item.stateCode}`} value={item.name}>{item.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="site" className="text-xs font-medium text-slate-700">Site (opcional)</label>
                <input id="site" type="text" value={site} onChange={(e) => setSite(e.target.value)} placeholder="Ex: www.empresa.com.br" className="h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="redesSociais" className="text-xs font-medium text-slate-700">
                  Redes Sociais (Opcional)
                </label>
                <input
                  id="redesSociais"
                  type="text"
                  value={redesSociais}
                  onChange={(e) => setRedesSociais(e.target.value)}
                  placeholder="Ex: @empresa"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="naturezaJuridica" className="text-xs font-medium text-slate-700">
                  Natureza Jurídica *
                </label>
                <select
                  id="naturezaJuridica"
                  required
                  value={naturezaJuridica}
                  onChange={(e) => setNaturezaJuridica(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Selecione...</option>
                  <option value="MEI">MEI</option>
                  <option value="Empresário Individual">Empresário Individual</option>
                  <option value="LTDA">LTDA</option>
                  <option value="S/A">S/A</option>
                  <option value="Cooperativa">Cooperativa</option>
                  <option value="Associação">Associação</option>
                  <option value="Startup">Startup</option>
                  <option value="Produtor Rural Pessoa Física">Produtor Rural Pessoa Física</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="porte" className="text-xs font-medium text-slate-700">
                  Porte da Empresa *
                </label>
                <select
                  id="porte"
                  required
                  value={porte}
                  onChange={(e) => setPorte(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Selecione...</option>
                  <option value="MEI">MEI</option>
                  <option value="Microempresa">Microempresa</option>
                  <option value="Pequena empresa">Pequena empresa</option>
                  <option value="Média empresa">Média empresa</option>
                  <option value="Grande empresa">Grande empresa</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="size" className="text-xs font-medium text-slate-700">
                  Número de Colaboradores *
                </label>
                <select
                  id="size"
                  required
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Selecione...</option>
                  <option value="1 a 5">1 a 5 colaboradores</option>
                  <option value="6 a 19">6 a 19 colaboradores</option>
                  <option value="20 a 99">20 a 99 colaboradores</option>
                  <option value="100 a 499">100 a 499 colaboradores</option>
                  <option value="500+">Mais de 500 colaboradores</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="tempoOperacao" className="text-xs font-medium text-slate-700">
                  Tempo de Operação *
                </label>
                <select
                  id="tempoOperacao"
                  required
                  value={tempoOperacao}
                  onChange={(e) => setTempoOperacao(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Selecione...</option>
                  <option value="Menos de 1 ano">Menos de 1 ano</option>
                  <option value="1 a 3 anos">1 a 3 anos</option>
                  <option value="4 a 10 anos">4 a 10 anos</option>
                  <option value="Mais de 10 anos">Mais de 10 anos</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="alcanceMercado" className="text-xs font-medium text-slate-700">
                  Alcance de Mercado *
                </label>
                <select
                  id="alcanceMercado"
                  required
                  value={alcanceMercado}
                  onChange={(e) => setAlcanceMercado(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Selecione...</option>
                  <option value="Local">Local</option>
                  <option value="Regional">Regional</option>
                  <option value="Nacional">Nacional</option>
                  <option value="Internacional">Internacional</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="businessCategory" className="text-xs font-medium text-slate-700">
                  Categoria de Negócio *
                </label>
                <select
                  id="businessCategory"
                  required
                  value={businessCategoryCode}
                  onChange={(e) => {
                    const catCode = e.target.value;
                    setBusinessCategoryCode(catCode);
                    setBusinessSegmentCode("");
                    setIndustrySegment("");
                    setSpecificActivity("");
                  }}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Selecione...</option>
                  {BUSINESS_CATEGORIES.map((cat) => (
                    <option key={cat.code} value={cat.code}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="businessSegment" className="text-xs font-medium text-slate-700">
                  Segmento de Atuação *
                </label>
                <select
                  id="businessSegment"
                  required
                  disabled={!businessCategoryCode}
                  value={businessSegmentCode}
                  onChange={(e) => {
                    const segCode = e.target.value;
                    setBusinessSegmentCode(segCode);
                    const segName = BUSINESS_SEGMENTS[businessCategoryCode]?.find((s) => s.code === segCode)?.name || "";
                    setIndustrySegment(segName);
                    setSpecificActivity("");
                  }}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
                >
                  <option value="">Selecione...</option>
                  {businessCategoryCode &&
                    BUSINESS_SEGMENTS[businessCategoryCode]?.map((seg) => (
                      <option key={seg.code} value={seg.code}>{seg.name}</option>
                    ))
                  }
                </select>
              </div>
            </div>

            {businessSegmentCode && (
              <div className="space-y-1.5 animate-fade-in">
                <label htmlFor="specificActivity" className="text-xs font-medium text-slate-700">
                  Atividade Específica *
                </label>
                <input
                  id="specificActivity"
                  type="text"
                  required
                  value={specificActivity}
                  onChange={(e) => setSpecificActivity(e.target.value)}
                  placeholder="Digite a atividade específica"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="numberOfSuppliers" className="text-xs font-medium text-slate-700">
                  Nº Fornecedores na Cadeia
                </label>
                <select
                  id="numberOfSuppliers"
                  value={numberOfSuppliers}
                  onChange={(e) => setNumberOfSuppliers(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Selecione...</option>
                  <option value="Nenhum (Apenas forneço)">Nenhum (Apenas forneço)</option>
                  <option value="1 a 15">1 a 15 fornecedores</option>
                  <option value="16 a 50">16 a 50 fornecedores</option>
                  <option value="51 a 100">51 a 100 fornecedores</option>
                  <option value="Mais de 100">Mais de 100 fornecedores</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="annualRevenue" className="text-xs font-medium text-slate-700">
                  Faturamento Anual
                </label>
                <select
                  id="annualRevenue"
                  value={annualRevenue}
                  onChange={(e) => setAnnualRevenue(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white/50 px-3 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Selecione...</option>
                  <option value="Até R$ 360 mil">Até R$ 360 mil (Microempresa)</option>
                  <option value="De R$ 360 mil a R$ 4,8 milhões">De R$ 360 mil a R$ 4,8 milhões (EPP)</option>
                  <option value="De R$ 4,8 milhões a R$ 20 milhões">De R$ 4,8 milhões a R$ 20 milhões (Médio Porte)</option>
                  <option value="De R$ 20 milhões a R$ 100 milhões">De R$ 20 milhões a R$ 100 milhões (Média-Grande)</option>
                  <option value="Acima de R$ 100 milhões">Acima de R$ 100 milhões (Grande Empresa)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                onClick={() => setStep(1)}
                variant="outline"
                className="h-11 w-1/3 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 font-semibold"
              >
                <ChevronLeft className="size-4" />
                <span>Voltar</span>
              </Button>
              <Button
                type="button"
                disabled={!isStep2Valid}
                onClick={() => setStep(3)}
                className="h-11 w-2/3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center gap-2 font-semibold shadow-md transition duration-200 disabled:bg-slate-200 disabled:text-slate-400"
              >
                <span>Próxima Etapa</span>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Strategic ESG Profile */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <FileText className="size-4 text-emerald-600" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Perfil ESG Estratégico
              </h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 block">
                  A empresa já possui: *
                </label>
                <p className="text-[11px] text-slate-500 mb-2">Selecione todas as opções que se aplicam à sua empresa atualmente.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {jaPossuiOptions.map((opt) => (
                    <label key={opt} className="flex items-start gap-2.5 text-xs text-slate-700 select-none cursor-pointer hover:text-emerald-700 py-1">
                      <input 
                        type="checkbox"
                        checked={esgJaPossui.includes(opt)}
                        onChange={() => handleJaPossuiChange(opt)}
                        className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                  <div className="col-span-1 md:col-span-2 border-t border-slate-100 my-1 pt-2">
                    <label className="flex items-start gap-2.5 text-xs text-slate-700 select-none cursor-pointer hover:text-emerald-700">
                      <input 
                        type="checkbox"
                        checked={esgJaPossui.includes("Nenhuma das opções anteriores")}
                        onChange={() => handleJaPossuiChange("Nenhuma das opções anteriores")}
                        className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20"
                      />
                      <span className="font-medium text-slate-500">Nenhuma das opções anteriores</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-sm font-semibold text-slate-800 block">
                  A empresa possui interesse em: *
                </label>
                <p className="text-[11px] text-slate-500 mb-2">Selecione os temas em que a sua empresa busca evoluir ou se adequar.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {interesseOptions.map((opt) => (
                    <label key={opt} className="flex items-start gap-2.5 text-xs text-slate-700 select-none cursor-pointer hover:text-emerald-700 py-1">
                      <input 
                        type="checkbox"
                        checked={esgInteresse.includes(opt)}
                        onChange={() => handleInteresseChange(opt)}
                        className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                onClick={() => setStep(2)}
                variant="outline"
                className="h-11 w-1/3 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 font-semibold"
              >
                <ChevronLeft className="size-4" />
                <span>Voltar</span>
              </Button>
              <Button
                type="button"
                disabled={!isStep3Valid}
                onClick={() => setStep(4)}
                className="h-11 w-2/3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center gap-2 font-semibold shadow-md transition duration-200 disabled:bg-slate-200 disabled:text-slate-400"
              >
                <span>Próxima Etapa</span>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: Consent & Access Credentials */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <ShieldCheck className="size-4 text-emerald-600" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Termo de Consentimento & Acesso
              </h3>
            </div>

            {/* Termo de Confidencialidade Scroll Container */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Termo de Ciência e Consentimento *
              </label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-[11px] text-slate-600 max-h-40 overflow-y-auto space-y-2.5 leading-relaxed">
                <p className="font-bold text-slate-800">Consentimento, Confidencialidade e LGPD</p>
                <p>
                  A <strong>Inove-ESG</strong> compromete-se com a confidencialidade, integridade e proteção das informações compartilhadas neste diagnóstico, em conformidade com a Autoridade Nacional de Proteção de Dados (ANPD) e a Lei Geral de Proteção de Dados (LGPD).
                </p>
                <p>
                  Os dados coletados serão utilizados exclusivamente para fins de análise técnica, diagnóstico ESG, geração de indicadores, desenvolvimento de estratégias sustentáveis e elaboração de relatórios relacionados aos serviços prestados pela Inove-ESG, não sendo compartilhados com terceiros sem autorização prévia, salvo exigência legal.
                </p>
                <p>Ao prosseguir, o(a) respondente declara que:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Possui autorização ou legitimidade para fornecer as informações apresentadas;</li>
                  <li>Compromete-se com a veracidade e boa-fé das respostas;</li>
                  <li>Compreende que a qualidade da análise depende diretamente da precisão das informações fornecidas;</li>
                  <li>Está ciente de que informações inconsistentes ou inverídicas podem comprometer os resultados do diagnóstico.</li>
                </ol>
              </div>
            </div>

            <div className="bg-emerald-50/30 border border-emerald-100/50 rounded-xl p-3.5">
              <label className="flex items-start gap-2.5 text-xs text-slate-700 font-medium select-none cursor-pointer">
                <input 
                  type="checkbox"
                  checked={consentAccepted}
                  onChange={(e) => setConsentAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20"
                />
                <span>Li e concordo com os termos descritos acima *</span>
              </label>
            </div>

            {/* Email and Password Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-medium text-slate-700">
                  E-mail Corporativo *
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage && (errorMessage.toLowerCase().includes("e-mail") || errorMessage.toLowerCase().includes("email"))) {
                        reset();
                      }
                    }}
                    placeholder="seu@empresa.com"
                    className={cn(
                      "h-11 w-full rounded-xl border bg-white/50 px-3 pr-10 text-sm outline-none transition focus:ring-2 focus:ring-emerald-500/20",
                      errorMessage && (errorMessage.toLowerCase().includes("e-mail") || errorMessage.toLowerCase().includes("email"))
                        ? "border-red-300 focus:border-red-500"
                        : emailValid
                        ? "border-green-500/50 focus:border-emerald-500/50"
                        : email !== ""
                        ? "border-red-400/50 focus:border-emerald-500/50"
                        : "border-slate-200 focus:border-emerald-500/50"
                    )}
                  />
                  {emailValid && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-green-500" />
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="emailConfirm" className="text-xs font-medium text-slate-700">
                  Confirmar E-mail *
                </label>
                <div className="relative">
                  <input
                    id="emailConfirm"
                    type="email"
                    required
                    value={emailConfirm}
                    onChange={(e) => {
                      setEmailConfirm(e.target.value);
                      if (errorMessage && (errorMessage.toLowerCase().includes("e-mail") || errorMessage.toLowerCase().includes("email"))) {
                        reset();
                      }
                    }}
                    placeholder="seu@empresa.com"
                    className={cn(
                      "h-11 w-full rounded-xl border bg-white/50 px-3 pr-10 text-sm outline-none transition focus:ring-2 focus:ring-emerald-500/20",
                      errorMessage && (errorMessage.toLowerCase().includes("e-mail") || errorMessage.toLowerCase().includes("email"))
                        ? "border-red-300 focus:border-red-500"
                        : emailsMatch
                        ? "border-green-500/50 focus:border-emerald-500/50"
                        : emailConfirm !== ""
                        ? "border-red-400/50 focus:border-emerald-500/50"
                        : "border-slate-200 focus:border-emerald-500/50"
                    )}
                  />
                  {emailsMatch && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-green-500" />
                  )}
                </div>
                {email !== emailConfirm && emailConfirm !== "" && (
                  <p className="text-[11px] text-red-500 mt-1">Os e-mails não coincidem</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="password-reg" className="text-xs font-medium text-slate-700">
                  Senha de Acesso *
                </label>
                <div className="relative">
                  <input
                    id="password-reg"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={cn(
                      "h-11 w-full rounded-xl border bg-white/50 px-3 pr-10 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20",
                      passwordValid ? "border-green-500/50" : password !== "" ? "border-yellow-500/50" : "border-slate-200"
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {password !== "" && (
                      passwordValid ? (
                        <Check className="size-4 text-green-500" />
                      ) : (
                        <X className="size-4 text-red-500" />
                      )
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password-confirm-reg" className="text-xs font-medium text-slate-700">
                  Confirmar Senha *
                </label>
                <div className="relative">
                  <input
                    id="password-confirm-reg"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className={cn(
                      "h-11 w-full rounded-xl border bg-white/50 px-3 pr-10 text-sm outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20",
                      passwordsMatch ? "border-green-500/50" : passwordConfirm !== "" ? "border-red-400/50" : "border-slate-200"
                    )}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {passwordsMatch && <Check className="size-4 text-green-500" />}
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                {password !== passwordConfirm && passwordConfirm !== "" && (
                  <p className="text-[11px] text-red-500 mt-1">As senhas não coincidem</p>
                )}
              </div>
            </div>
            {/* Checklist de requisitos de Senha Forte */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] space-y-1.5">
              <p className="font-semibold text-slate-700">A senha deve conter:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                <span className={cn("flex items-center gap-1.5 transition-colors", hasMinLength ? "text-emerald-600 font-medium" : "text-slate-500")}>
                  {hasMinLength ? <Check className="size-3 text-emerald-500 shrink-0" /> : <span className="size-1.5 rounded-full bg-slate-300 ml-1 mr-0.5 shrink-0" />}
                  Mínimo de 8 caracteres
                </span>
                <span className={cn("flex items-center gap-1.5 transition-colors", hasUpper ? "text-emerald-600 font-medium" : "text-slate-500")}>
                  {hasUpper ? <Check className="size-3 text-emerald-500 shrink-0" /> : <span className="size-1.5 rounded-full bg-slate-300 ml-1 mr-0.5 shrink-0" />}
                  Letra maiúscula (A-Z)
                </span>
                <span className={cn("flex items-center gap-1.5 transition-colors", hasLower ? "text-emerald-600 font-medium" : "text-slate-500")}>
                  {hasLower ? <Check className="size-3 text-emerald-500 shrink-0" /> : <span className="size-1.5 rounded-full bg-slate-300 ml-1 mr-0.5 shrink-0" />}
                  Letra minúscula (a-z)
                </span>
                <span className={cn("flex items-center gap-1.5 transition-colors", hasNumber ? "text-emerald-600 font-medium" : "text-slate-500")}>
                  {hasNumber ? <Check className="size-3 text-emerald-500 shrink-0" /> : <span className="size-1.5 rounded-full bg-slate-300 ml-1 mr-0.5 shrink-0" />}
                  Número (0-9)
                </span>
                <span className={cn("flex items-center gap-1.5 transition-colors sm:col-span-2", hasSpecial ? "text-emerald-600 font-medium" : "text-slate-500")}>
                  {hasSpecial ? <Check className="size-3 text-emerald-500 shrink-0" /> : <span className="size-1.5 rounded-full bg-slate-300 ml-1 mr-0.5 shrink-0" />}
                  Caractere especial (!@#$%^&*...)
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-red-600 font-medium">
                <AlertTriangle className="size-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                onClick={() => setStep(3)}
                variant="outline"
                className="h-11 w-1/3 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 font-semibold"
              >
                <ChevronLeft className="size-4" />
                <span>Voltar</span>
              </Button>
              <Button 
                type="submit"
                disabled={isLoading || !isFormValid}
                className="h-11 w-2/3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center gap-2 font-semibold shadow-md transition duration-200 disabled:bg-slate-200 disabled:text-slate-400"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Cadastrando...</span>
                  </>
                ) : (
                  <span>{submitButtonText}</span>
                )}
              </Button>
            </div>
          </div>
        )}

      </form>
    </div>
  );
}
