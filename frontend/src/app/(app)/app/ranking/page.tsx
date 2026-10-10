"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Search, 
  Filter, 
  Leaf, 
  Heart, 
  Scale, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight,
  Recycle,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Users,
  X,
  Mail,
  Phone,
  MapPin,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { inviteService } from '@/features/company-area/services/invite.service';

interface RankedSupplier {
  rank: number;
  name: string;
  tradeName: string;
  sector: string;
  overallScore: number;
  environmentalScore: number;
  bioeconomyScore: number;
  socialScore: number;
  governanceScore: number;
  declaredOverallScore: number;
  declaredEnvironmentalScore: number;
  declaredBioeconomyScore: number;
  declaredSocialScore: number;
  declaredGovernanceScore: number;
  provenOverallScore: number | null;
  provenEnvironmentalScore: number | null;
  provenBioeconomyScore: number | null;
  provenSocialScore: number | null;
  provenGovernanceScore: number | null;
  status: "verified" | "declared";
  maturityLevel: string;
  primaryEmail?: string | null;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  businessCategory?: string | null;
  businessSegment?: string | null;
  isConnected?: boolean;
}

function formatPhone(phone?: string | null) {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 13 && cleaned.startsWith("55")) {
    const sub = cleaned.slice(2);
    return `+55 (${sub.slice(0, 2)}) ${sub.slice(2, 7)}-${sub.slice(7)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith("55")) {
    const sub = cleaned.slice(2);
    return `+55 (${sub.slice(0, 2)}) ${sub.slice(2, 6)}-${sub.slice(6)}`;
  }
  return phone;
}

function getMaturityLabel(level?: string | null) {
  if (!level) return "Nível 1 — Elementar";
  switch (level.toUpperCase()) {
    case "NASCENT":
      return "Nível 1 — Elementar";
    case "DEVELOPING":
      return "Nível 2 — Não Integrado";
    case "ESTABLISHED":
      return "Nível 3 — Gerencial";
    case "MANAGED":
      return "Nível 4 — Estratégico";
    case "OPTIMIZED":
      return "Nível 5 — Transformador";
    default:
      if (level.includes(" — ")) return level;
      return `Nível 1 — ${level}`;
  }
}

function getStarsValue(score: number) {
  const rawStars = score / 20;
  const integerPart = Math.floor(rawStars);
  const decimalPart = rawStars - integerPart;
  
  let roundedDecimal = 0;
  if (decimalPart > 0.25 && decimalPart <= 0.75) {
    roundedDecimal = 0.5;
  } else if (decimalPart > 0.75) {
    roundedDecimal = 1.0;
  }
  
  return integerPart + roundedDecimal;
}

function getMaturityLabelFromStars(stars: number) {
  if (stars >= 4.5) return "Nível 5 — Transformador";
  if (stars >= 4.0) return "Nível 4 — Estratégico";
  if (stars >= 3.0) return "Nível 3 — Gerencial";
  if (stars >= 2.0) return "Nível 2 — Não Integrado";
  return "Nível 1 — Elementar";
}

export default function RankingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'declared'>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'overall' | 'environmental' | 'social' | 'governance'>('overall');

  const [suppliers, setSuppliers] = useState<RankedSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for the details modal & invite check
  const [selectedSupplier, setSelectedSupplier] = useState<RankedSupplier | null>(null);
  const [availableInvites, setAvailableInvites] = useState<number | null>(null);
  const [showInviteError, setShowInviteError] = useState(false);
  const inviteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
    const token = "cookie-session";
        if (!token) {
          setError("Usuário não autenticado");
          setLoading(false);
          return;
        }

        const [rankingSuppliers, stats] = await Promise.all([
          inviteService.getRanking(token),
          inviteService.getStats(token).catch(err => {
            console.error("Erro ao carregar estatísticas:", err);
            return { availableInvites: 0 } as any;
          })
        ]);

        if (stats) {
          setAvailableInvites(stats.availableInvites);
        }
        
        const mapped: RankedSupplier[] = rankingSuppliers.map(supplier => {
          const completedDiag = supplier.completedDiagnostic;
          const scoreObj = completedDiag?.score;
          
          const isVerified = scoreObj ? (scoreObj.provenOverallScore != null && Number(scoreObj.provenOverallScore) > 0) : false;
          
          const declaredOverallScore = scoreObj ? Math.round(Number(scoreObj.overallScore ?? 0)) : 0;
          const declaredEnvironmentalScore = scoreObj ? Math.round(Number(scoreObj.environmentalScore ?? 0)) : 0;
          const declaredBioeconomyScore = scoreObj ? Math.round(Number(scoreObj.bioeconomyCircularScore ?? 0)) : 0;
          const declaredSocialScore = scoreObj ? Math.round(Number(scoreObj.socialScore ?? 0)) : 0;
          const declaredGovernanceScore = scoreObj ? Math.round(Number(scoreObj.governanceScore ?? 0)) : 0;

          const provenOverallScore = scoreObj?.provenOverallScore != null ? Math.round(Number(scoreObj.provenOverallScore)) : null;
          const provenEnvironmentalScore = scoreObj?.provenEnvironmentalScore != null ? Math.round(Number(scoreObj.provenEnvironmentalScore)) : null;
          const provenBioeconomyScore = scoreObj?.provenBioeconomyCircularScore != null ? Math.round(Number(scoreObj.provenBioeconomyCircularScore)) : null;
          const provenSocialScore = scoreObj?.provenSocialScore != null ? Math.round(Number(scoreObj.provenSocialScore)) : null;
          const provenGovernanceScore = scoreObj?.provenGovernanceScore != null ? Math.round(Number(scoreObj.provenGovernanceScore)) : null;

          const overall = isVerified ? (provenOverallScore ?? declaredOverallScore) : declaredOverallScore;
          const env = isVerified ? (provenEnvironmentalScore ?? declaredEnvironmentalScore) : declaredEnvironmentalScore;
          const bio = isVerified ? (provenBioeconomyScore ?? declaredBioeconomyScore) : declaredBioeconomyScore;
          const soc = isVerified ? (provenSocialScore ?? declaredSocialScore) : declaredSocialScore;
          const gov = isVerified ? (provenGovernanceScore ?? declaredGovernanceScore) : declaredGovernanceScore;

          let maturity = "Nível 1 — Elementar";
          if (scoreObj?.maturityLevel) {
            maturity = getMaturityLabel(scoreObj.maturityLevel);
          } else {
            const stars = getStarsValue(overall);
            maturity = getMaturityLabelFromStars(stars);
          }

          return {
            rank: 0,
            name: supplier.legalName || supplier.tradeName || "",
            tradeName: supplier.tradeName || supplier.legalName || "",
            sector: supplier.industrySegment || "Outros",
            overallScore: overall,
            environmentalScore: env,
            bioeconomyScore: bio,
            socialScore: soc,
            governanceScore: gov,
            declaredOverallScore,
            declaredEnvironmentalScore,
            declaredBioeconomyScore,
            declaredSocialScore,
            declaredGovernanceScore,
            provenOverallScore,
            provenEnvironmentalScore,
            provenBioeconomyScore,
            provenSocialScore,
            provenGovernanceScore,
            status: isVerified ? "verified" : "declared",
            maturityLevel: maturity,
            primaryEmail: supplier.primaryEmail,
            phone: supplier.phone,
            city: supplier.city,
            state: supplier.state,
            businessCategory: supplier.businessCategory?.name,
            businessSegment: supplier.businessSegment?.name,
            isConnected: supplier.isConnected,
          } as RankedSupplier;
        });

        const sorted = mapped.sort((a, b) => b.overallScore - a.overallScore);
        const withRanks = sorted.map((s, idx) => ({
          ...s,
          rank: idx + 1,
        }));

        setSuppliers(withRanks);
      } catch (err) {
        console.error("Erro ao carregar ranking:", err);
        setError("Erro ao carregar dados do ranking. Por favor, tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const sectors = useMemo(() => {
    const list = new Set(suppliers.map(s => s.sector));
    return Array.from(list);
  }, [suppliers]);

  const filteredSuppliers = useMemo(() => {
    return suppliers
      .filter(supplier => {
        const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            supplier.tradeName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
        const matchesSector = sectorFilter === 'all' || supplier.sector === sectorFilter;
        return matchesSearch && matchesStatus && matchesSector;
      })
      .sort((a, b) => {
        if (sortBy === 'environmental') return b.environmentalScore - a.environmentalScore;
        if (sortBy === 'social') return b.socialScore - a.socialScore;
        if (sortBy === 'governance') return b.governanceScore - a.governanceScore;
        return b.overallScore - a.overallScore;
      });
  }, [suppliers, searchTerm, statusFilter, sectorFilter, sortBy]);

  const topThree = useMemo(() => {
    const sortedBase = [...suppliers].sort((a, b) => b.overallScore - a.overallScore);
    return {
      first: sortedBase[0],
      second: sortedBase[1],
      third: sortedBase[2],
    };
  }, [suppliers]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        <p className="text-sm font-medium text-slate-500">Carregando ranking de fornecedores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-slate-50 border border-slate-200 rounded-2xl max-w-xl mx-auto my-8">
        <AlertTriangle className="h-12 w-12 text-rose-500 mb-4" />
        <h3 className="text-lg font-bold text-slate-800">Ocorreu um erro</h3>
        <p className="text-sm text-slate-500 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold tracking-wider uppercase mb-1">
            <Trophy className="h-4.5 w-4.5" />
            <span>Cadeia de Fornecedores</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Ranking de Fornecedores ESG</h1>
          <p className="text-sm text-slate-500 mt-1">
            Acompanhe e compare o desempenho de sustentabilidade e conformidade da sua cadeia de valor.
          </p>
        </div>
      </div>

      {suppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 py-16 space-y-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-full shrink-0">
            <Trophy className="h-8 w-8" />
          </div>
          <div className="space-y-2 max-w-lg">
            <h4 className="text-base font-bold text-slate-800">Nenhum fornecedor no ranking</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Seus fornecedores convidados ainda não concluíram a avaliação de maturidade ESG. 
              Assim que eles completarem o questionário, suas pontuações e classificações serão listadas aqui em tempo real.
            </p>
          </div>
          <div className="pt-2">
            <Button asChild className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 text-xs shadow-md shadow-emerald-100 cursor-pointer">
              <Link href="/app/fornecedores" className="flex items-center gap-1.5">
                Convidar Fornecedores
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Podium Section */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Destaques da Cadeia (Top 3)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* 2nd Place */}
              {topThree.second && (
                <div className="bg-gradient-to-b from-slate-50 to-white border border-slate-200 rounded-xl p-5 shadow-sm relative flex flex-col justify-between order-2 md:order-1 pt-8 border-t-slate-300 border-t-4">
                  <div className="absolute top-0 right-5 transform -translate-y-1/2 bg-slate-300 text-slate-800 text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-md">
                    2º
                  </div>
                  <div>
                    <span className="text-[10px] bg-slate-200/60 text-slate-700 font-bold px-2 py-0.5 rounded-full uppercase">
                      {topThree.second.sector}
                    </span>
                    <h3 className="text-lg font-bold text-slate-800 mt-2 line-clamp-1">{topThree.second.tradeName}</h3>
                    <p className="text-xs text-slate-400">{topThree.second.maturityLevel}</p>
                    
                    <div className="flex items-baseline gap-1 mt-4">
                      <span className="text-3xl font-extrabold text-slate-800">{topThree.second.overallScore}%</span>
                      <span className="text-xs text-slate-400">Score ESG</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs text-slate-500">
                    <div>
                      <div className="font-semibold text-emerald-600 flex items-center justify-center gap-0.5"><Leaf className="w-3 h-3" /> {topThree.second.environmentalScore}%</div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-400">Amb</div>
                    </div>
                    <div>
                      <div className="font-semibold text-blue-600 flex items-center justify-center gap-0.5"><Heart className="w-3 h-3" /> {topThree.second.socialScore}%</div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-400">Soc</div>
                    </div>
                    <div>
                      <div className="font-semibold text-violet-600 flex items-center justify-center gap-0.5"><Scale className="w-3 h-3" /> {topThree.second.governanceScore}%</div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-400">Gov</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {topThree.first && (
                <div className="bg-gradient-to-b from-amber-50/40 to-white border border-amber-200 rounded-xl p-5 shadow-md relative flex flex-col justify-between order-1 md:order-2 pt-9 md:-translate-y-2 border-t-amber-400 border-t-4">
                  <div className="absolute top-0 right-5 transform -translate-y-1/2 bg-amber-400 text-white text-xs font-bold w-9 h-9 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    👑 1º
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase">
                        {topThree.first.sector}
                      </span>
                      {topThree.first.status === 'verified' && (
                        <span className="flex items-center gap-0.5 text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3" /> Verificado
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mt-2 line-clamp-1">{topThree.first.tradeName}</h3>
                    <p className="text-xs text-amber-700/80 font-medium">{topThree.first.maturityLevel}</p>
                    
                    <div className="flex items-baseline gap-1 mt-4">
                      <span className="text-4xl font-black text-slate-800">{topThree.first.overallScore}%</span>
                      <span className="text-xs text-slate-400">Score ESG</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-amber-100/50 grid grid-cols-3 gap-2 text-center text-xs text-slate-500">
                    <div>
                      <div className="font-semibold text-emerald-600 flex items-center justify-center gap-0.5"><Leaf className="w-3 h-3" /> {topThree.first.environmentalScore}%</div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-400">Amb</div>
                    </div>
                    <div>
                      <div className="font-semibold text-blue-600 flex items-center justify-center gap-0.5"><Heart className="w-3 h-3" /> {topThree.first.socialScore}%</div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-400">Soc</div>
                    </div>
                    <div>
                      <div className="font-semibold text-violet-600 flex items-center justify-center gap-0.5"><Scale className="w-3 h-3" /> {topThree.first.governanceScore}%</div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-400">Gov</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree.third && (
                <div className="bg-gradient-to-b from-orange-50/20 to-white border border-slate-200 rounded-xl p-5 shadow-sm relative flex flex-col justify-between order-3 md:order-3 pt-8 border-t-amber-600 border-t-4">
                  <div className="absolute top-0 right-5 transform -translate-y-1/2 bg-amber-600 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-md">
                    3º
                  </div>
                  <div>
                    <span className="text-[10px] bg-amber-100/40 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase">
                      {topThree.third.sector}
                    </span>
                    <h3 className="text-lg font-bold text-slate-800 mt-2 line-clamp-1">{topThree.third.tradeName}</h3>
                    <p className="text-xs text-slate-400">{topThree.third.maturityLevel}</p>
                    
                    <div className="flex items-baseline gap-1 mt-4">
                      <span className="text-3xl font-extrabold text-slate-800">{topThree.third.overallScore}%</span>
                      <span className="text-xs text-slate-400">Score ESG</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs text-slate-500">
                    <div>
                      <div className="font-semibold text-emerald-600 flex items-center justify-center gap-0.5"><Leaf className="w-3 h-3" /> {topThree.third.environmentalScore}%</div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-400">Amb</div>
                    </div>
                    <div>
                      <div className="font-semibold text-blue-600 flex items-center justify-center gap-0.5"><Heart className="w-3 h-3" /> {topThree.third.socialScore}%</div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-400">Soc</div>
                    </div>
                    <div>
                      <div className="font-semibold text-violet-600 flex items-center justify-center gap-0.5"><Scale className="w-3 h-3" /> {topThree.third.governanceScore}%</div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-400">Gov</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard Table & Filters */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Filters Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50/50 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Tabela de Classificação</h3>
                
                {/* Sorting Tabs */}
                <div className="flex bg-slate-200/60 p-1 rounded-lg text-xs gap-1 self-start">
                  <button 
                    onClick={() => setSortBy('overall')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${sortBy === 'overall' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Geral
                  </button>
                  <button 
                    onClick={() => setSortBy('environmental')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${sortBy === 'environmental' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Ambiental
                  </button>
                  <button 
                    onClick={() => setSortBy('social')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${sortBy === 'social' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Social
                  </button>
                  <button 
                    onClick={() => setSortBy('governance')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${sortBy === 'governance' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Governança
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Buscar fornecedor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                {/* Status Select */}
                <div className="relative">
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none"
                  >
                    <option value="all">Todos os Status</option>
                    <option value="verified">Verificado</option>
                    <option value="declared">Declarado</option>
                  </select>
                  <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>

                {/* Sector Select */}
                <div className="relative">
                  <select 
                    value={sectorFilter}
                    onChange={(e) => setSectorFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none"
                  >
                    <option value="all">Todos os Setores</option>
                    {sectors.map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                  <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-4 md:px-6 py-3.5 text-center w-12 md:w-16">Pos</th>
                    <th className="px-4 md:px-6 py-3.5">Fornecedor</th>
                    <th className="hidden sm:table-cell px-4 md:px-6 py-3.5">Setor</th>
                    <th className="px-4 md:px-6 py-3.5 text-center">Score Geral</th>
                    <th className="hidden md:table-cell px-4 md:px-6 py-3.5 text-center">Ambiental (E)</th>
                    <th className="hidden md:table-cell px-4 md:px-6 py-3.5 text-center">Social (S)</th>
                    <th className="hidden md:table-cell px-4 md:px-6 py-3.5 text-center">Governança (G)</th>
                    <th className="px-4 md:px-6 py-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredSuppliers.length > 0 ? (
                    filteredSuppliers.map((supplier, idx) => {
                      const displayRank = idx + 1;
                      const isTopThree = displayRank <= 3;
                      
                      return (
                        <tr 
                          key={supplier.name}
                          className="hover:bg-slate-50/50 transition-colors duration-150 group"
                        >
                          <td className="px-4 md:px-6 py-4 text-center font-bold">
                            {isTopThree ? (
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs
                                ${displayRank === 1 ? "bg-amber-100 text-amber-800" : ""}
                                ${displayRank === 2 ? "bg-slate-100 text-slate-800" : ""}
                                ${displayRank === 3 ? "bg-amber-50 text-amber-700" : ""}
                              `}>
                                {displayRank}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium">{displayRank}</span>
                            )}
                          </td>
                          <td className="px-4 md:px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors text-xs md:text-sm">
                                {supplier.tradeName}
                              </span>
                              <span className="text-[10px] md:text-xs text-slate-400 line-clamp-1">{supplier.name}</span>
                            </div>
                          </td>
                          <td className="hidden sm:table-cell px-4 md:px-6 py-4">
                            <span className="text-[10px] md:text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                              {supplier.sector}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-4">
                            <div className="flex flex-col items-center justify-center">
                              <div className="flex items-center gap-1 md:gap-2">
                                <span className="font-bold text-slate-800 text-xs md:text-sm">{supplier.overallScore}%</span>
                                {supplier.status === 'verified' ? (
                                  <span title="Pontuação Homologada e Auditada">
                                    <ShieldCheck className="h-3.5 w-3.5 md:h-4 md:w-4 text-emerald-600" />
                                  </span>
                                ) : (
                                  <span title="Informações Declaradas pela Empresa">
                                    <CheckCircle2 className="h-3 w-3 md:h-3.5 md:w-3.5 text-slate-400" />
                                  </span>
                                )}
                              </div>
                              <div className="w-12 md:w-16 h-1 bg-slate-100 rounded-full overflow-hidden mt-1">
                                <div 
                                  className={`h-full rounded-full ${supplier.status === 'verified' ? 'bg-emerald-500' : 'bg-slate-400'}`} 
                                  style={{ width: `${supplier.overallScore}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="hidden md:table-cell px-4 md:px-6 py-4 text-center">
                            <span className="font-semibold text-emerald-600">{supplier.environmentalScore}%</span>
                          </td>
                          <td className="hidden md:table-cell px-4 md:px-6 py-4 text-center">
                            <span className="font-semibold text-blue-600">{supplier.socialScore}%</span>
                          </td>
                          <td className="hidden md:table-cell px-4 md:px-6 py-4 text-center">
                            <span className="font-semibold text-violet-600">{supplier.governanceScore}%</span>
                          </td>
                          <td className="px-4 md:px-6 py-4 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg px-3 h-8 flex items-center gap-0.5 ml-auto cursor-pointer"
                              onClick={() => setSelectedSupplier(supplier)}
                            >
                              <span>Detalhes</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-slate-400">
                        Nenhum fornecedor encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Supplier ESG Details & Invites Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh] rounded-2xl border border-white/20 bg-white shadow-2xl">
            {/* Liquid Glass Background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 to-white/10 -z-10" />
            
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full uppercase border border-emerald-100">
                    {selectedSupplier.sector}
                  </span>
                  {selectedSupplier.businessCategory && 
                   selectedSupplier.businessCategory.toLowerCase() !== selectedSupplier.sector.toLowerCase() && (
                    <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded-full uppercase border border-blue-100">
                      {selectedSupplier.businessCategory}
                    </span>
                  )}
                  {selectedSupplier.businessSegment && 
                   selectedSupplier.businessSegment.toLowerCase() !== selectedSupplier.sector.toLowerCase() && 
                   (!selectedSupplier.businessCategory || selectedSupplier.businessSegment.toLowerCase() !== selectedSupplier.businessCategory.toLowerCase()) && (
                    <span className="text-[10px] bg-violet-50 text-violet-700 font-bold px-2.5 py-0.5 rounded-full uppercase border border-violet-100">
                      {selectedSupplier.businessSegment}
                    </span>
                  )}
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-800 mt-2">{selectedSupplier.tradeName}</h3>
                <p className="text-xs md:text-sm text-slate-400">{selectedSupplier.name}</p>

                {/* Contact and Location information */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {selectedSupplier.primaryEmail && (
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 rounded-full px-3 py-1 text-slate-600 transition-all hover:bg-slate-100/60 group">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="text-xs font-medium select-all">{selectedSupplier.primaryEmail}</span>
                      <button
                        onClick={() => handleCopy(selectedSupplier.primaryEmail!, 'email')}
                        className="text-slate-400 hover:text-slate-600 transition-colors ml-1 p-0.5 rounded-full hover:bg-white shadow-sm border border-transparent hover:border-slate-200 cursor-pointer flex items-center justify-center"
                        title="Copiar E-mail"
                      >
                        {copiedField === 'email' ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  )}
                  {selectedSupplier.phone && (
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 rounded-full px-3 py-1 text-slate-600 transition-all hover:bg-slate-100/60 group">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="text-xs font-medium select-all">{formatPhone(selectedSupplier.phone)}</span>
                      <button
                        onClick={() => handleCopy(selectedSupplier.phone!, 'phone')}
                        className="text-slate-400 hover:text-slate-600 transition-colors ml-1 p-0.5 rounded-full hover:bg-white shadow-sm border border-transparent hover:border-slate-200 cursor-pointer flex items-center justify-center"
                        title="Copiar Celular"
                      >
                        {copiedField === 'phone' ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  )}
                  {(selectedSupplier.city || selectedSupplier.state) && (
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/60 rounded-full px-3 py-1 text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="text-xs font-medium">
                        {[selectedSupplier.city, selectedSupplier.state].filter(Boolean).join(" - ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={() => {
                  setSelectedSupplier(null);
                  setShowInviteError(false);
                  if (inviteTimeoutRef.current) {
                    clearTimeout(inviteTimeoutRef.current);
                  }
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Score Metrics section */}
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Pontuações Declaradas vs. Comprovadas
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Geral */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between sm:col-span-2">
                    <span className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-amber-500" /> Score Geral
                    </span>
                    <div className="flex items-baseline gap-4 mt-3">
                      <div>
                        <div className="text-2xl font-extrabold text-slate-800">{selectedSupplier.declaredOverallScore}%</div>
                        <div className="text-[10px] text-slate-400 font-medium">Declarado</div>
                      </div>
                      <div className="border-l border-slate-200 pl-4">
                        {selectedSupplier.provenOverallScore !== null ? (
                          <>
                            <div className="text-2xl font-extrabold text-amber-600 flex items-center gap-0.5">
                              {selectedSupplier.provenOverallScore}%
                              <ShieldCheck className="h-4.5 w-4.5 text-amber-600 shrink-0" />
                            </div>
                            <div className="text-[10px] text-amber-600 font-bold">Comprovado</div>
                          </>
                        ) : (
                          <div className="text-xs font-semibold text-slate-400">Não comprovada</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ambiental */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
                    <span className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1.5">
                      <Leaf className="w-4 h-4 text-emerald-500" /> Ambiental (E)
                    </span>
                    <div className="flex items-baseline gap-4 mt-3">
                      <div>
                        <div className="text-lg font-bold text-slate-800">{selectedSupplier.declaredEnvironmentalScore}%</div>
                        <div className="text-[10px] text-slate-400 font-medium">Declarado</div>
                      </div>
                      <div className="border-l border-slate-200 pl-4">
                        {selectedSupplier.provenEnvironmentalScore !== null ? (
                          <>
                            <div className="text-lg font-bold text-emerald-600">{selectedSupplier.provenEnvironmentalScore}%</div>
                            <div className="text-[10px] text-emerald-600 font-bold">Comprovado</div>
                          </>
                        ) : <div className="text-xs font-semibold text-slate-400">Não comprovada</div>}
                      </div>
                    </div>
                  </div>

                  {/* Bioeconomia */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
                    <span className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1.5">
                      <Recycle className="w-4 h-4 text-teal-500" /> Bioeconomia Circular
                    </span>
                    <div className="flex items-baseline gap-4 mt-3">
                      <div>
                        <div className="text-lg font-bold text-slate-800">{selectedSupplier.declaredBioeconomyScore}%</div>
                        <div className="text-[10px] text-slate-400 font-medium">Declarado</div>
                      </div>
                      <div className="border-l border-slate-200 pl-4">
                        {selectedSupplier.provenBioeconomyScore !== null ? (
                          <>
                            <div className="text-lg font-bold text-teal-600">{selectedSupplier.provenBioeconomyScore}%</div>
                            <div className="text-[10px] text-teal-600 font-bold">Comprovado</div>
                          </>
                        ) : <div className="text-xs font-semibold text-slate-400">Não comprovada</div>}
                      </div>
                    </div>
                  </div>

                  {/* Social */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
                    <span className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-rose-500" /> Social (S)
                    </span>
                    <div className="flex items-baseline gap-4 mt-3">
                      <div>
                        <div className="text-lg font-bold text-slate-800">{selectedSupplier.declaredSocialScore}%</div>
                        <div className="text-[10px] text-slate-400 font-medium">Declarado</div>
                      </div>
                      <div className="border-l border-slate-200 pl-4">
                        {selectedSupplier.provenSocialScore !== null ? (
                          <>
                            <div className="text-lg font-bold text-rose-600">{selectedSupplier.provenSocialScore}%</div>
                            <div className="text-[10px] text-rose-600 font-bold">Comprovado</div>
                          </>
                        ) : <div className="text-xs font-semibold text-slate-400">Não comprovada</div>}
                      </div>
                    </div>
                  </div>

                  {/* Governança */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-between">
                    <span className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-violet-500" /> Governança (G)
                    </span>
                    <div className="flex items-baseline gap-4 mt-3">
                      <div>
                        <div className="text-lg font-bold text-slate-800">{selectedSupplier.declaredGovernanceScore}%</div>
                        <div className="text-[10px] text-slate-400 font-medium">Declarado</div>
                      </div>
                      <div className="border-l border-slate-200 pl-4">
                        {selectedSupplier.provenGovernanceScore !== null ? (
                          <>
                            <div className="text-lg font-bold text-violet-600">{selectedSupplier.provenGovernanceScore}%</div>
                            <div className="text-[10px] text-violet-600 font-bold">Comprovado</div>
                          </>
                        ) : <div className="text-xs font-semibold text-slate-400">Não comprovada</div>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invite action section */}
              {selectedSupplier.isConnected ? (
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-emerald-800 text-xs font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      Este fornecedor já está conectado à sua organização e homologado na sua lista.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="space-y-1">
                      <h5 className="text-sm font-semibold text-slate-800">Conectar Fornecedor</h5>
                      <p className="text-xs text-slate-500">
                        Envie um convite para integrar esta empresa diretamente à sua lista homologada.
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1.5">
                      <Button 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg px-4 py-2 text-xs flex items-center gap-2 cursor-pointer w-full sm:w-auto"
                        onClick={() => {
                          if (availableInvites !== null && availableInvites > 0) {
                            const messageText = `Olá! Gostaríamos de convidar a empresa *${selectedSupplier.tradeName}* para se conectar como nossa fornecedora na plataforma Inove ESG. Acompanhamos o seu desempenho e gostaríamos de estreitar nossa parceria comercial.`;
                            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(messageText)}`;
                            window.open(whatsappUrl, "_blank");
                          } else {
                            setShowInviteError(true);
                            if (inviteTimeoutRef.current) {
                              clearTimeout(inviteTimeoutRef.current);
                            }
                            inviteTimeoutRef.current = setTimeout(() => {
                              setShowInviteError(false);
                            }, 5000);
                          }
                        }}
                      >
                        <Users className="w-4 h-4" />
                        Convidar como fornecedora
                      </Button>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Saldo disponível: {availableInvites ?? 0} {availableInvites === 1 ? 'convite' : 'convites'}
                      </span>
                    </div>
                  </div>

                  {showInviteError && (
                    <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Saldo de convites insuficiente.</span> Adquira mais convites na tela de Gestão de Fornecedores para convidar novas empresas.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
