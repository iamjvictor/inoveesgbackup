"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/container";
import {
  Sprout,
  Building2,
  Fuel,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export interface CategoryCardData {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  icon: React.ElementType;
  iconBgClass: string;
  iconColorClass: string;
  highlights: string[];
  ctaLabel?: string;
  ctaHref?: string;
  marketDemand: string;
}

const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "5522996062255";

export const CATEGORIES_DATA: CategoryCardData[] = [
  {
    id: "agronegocio",
    title: "Agronegócio",
    subtitle: "Agroindústria e Produção Rural",
    imageUrl: "/assets/agronegocio.webp",
    icon: Sprout,
    iconBgClass: "from-accent/25 via-accent/10 to-transparent",
    iconColorClass: "text-[#5e7706]",
    highlights: [
      "Rastreabilidade de fornecedores e origens agrícolas",
      "Monitoramento contra desmatamento e sobreposição de áreas",
      "Evidências preparadas para auditorias, bancos e certificações",
    ],
    ctaLabel: "Ver soluções para Agro",
    ctaHref: "#pricing",
    marketDemand:
      "Grandes tradings e bancos (CPR Verde, Plano Safra) exigem comprovação socioambiental e conformidade com o Código Florestal.",
  },
  {
    id: "infraestrutura",
    title: "Infraestrutura",
    subtitle: "Obras, Concessões e Engenharia",
    imageUrl: "/assets/infraestrutura.webp",
    icon: Building2,
    iconBgClass: "from-accent-2/25 via-accent-2/10 to-transparent",
    iconColorClass: "text-[#157973]",
    highlights: [
      "Acompanhamento centralizado de licenças e condicionantes",
      "Governança e homologação preventiva de subcontratados",
      "Conformidade exigida em editais, licitações e fundos de investimento",
    ],
    ctaLabel: "Ver soluções para Infraestrutura",
    ctaHref: "#pricing",
    marketDemand:
      "Obras e concessões exigem gestão rigorosa de condicionantes (LP, LI e LO) e controle de riscos em canteiros e parceiros.",
  },
  {
    id: "oleo-e-gas",
    title: "Óleo e Gás",
    subtitle: "Cadeia de Fornecedores, Upstream & Downstream",
    imageUrl: "/assets/oleo-e-gas.webp",
    icon: Fuel,
    iconBgClass: "from-accent/20 via-accent-2/20 to-transparent",
    iconColorClass: "text-foreground",
    highlights: [
      "Inventário e acompanhamento de emissões e transição energética",
      "Mitigação de riscos operacionais e segurança de alta criticidade",
      "Qualificação e comprovação documental perante grandes contratantes",
    ],
    ctaLabel: "Ver soluções para Óleo e Gás",
    ctaHref: "#pricing",
    marketDemand:
      "Grandes operadoras exigem comprovação rigorosa de metas de carbono, governança anticorrupção e altos padrões de SMS.",
  },
];

interface CategoriesSectionProps {
  onCardAction?: (category: CategoryCardData) => void;
  className?: string;
}

export function CategoriesSection({ onCardAction, className }: CategoriesSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryCardData | null>(null);

  const handleSelectCategory = (cat: CategoryCardData) => {
    setSelectedCategory(cat);
    const element = document.getElementById("categorias");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleBackToGrid = () => {
    setSelectedCategory(null);
  };

  return (
    <section
      id="categorias"
      className={cn(
        "relative overflow-hidden border-b border-border w-full transition-colors duration-500",
        selectedCategory ? "bg-neutral-950 py-0" : "bg-gradient-to-b from-surface via-white to-surface py-10 md:py-14 lg:py-16",
        className
      )}
    >
      {/* Detalhes de luz de fundo sutis (apenas no modo grade) */}
      {!selectedCategory && (
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute right-1/4 bottom-0 h-96 w-96 translate-x-1/2 rounded-full bg-accent-2/10 blur-3xl" />
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* MODO 1: GRADE NORMAL (3 cards centralizados) */}
        {!selectedCategory ? (
          <motion.div
            key="grid-view"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <Container>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {CATEGORIES_DATA.map((cat, index) => {
                  const Icon = cat.icon;

                  return (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: index * 0.08, ease: "easeOut" }}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleSelectCategory(cat)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelectCategory(cat);
                        }
                      }}
                      className={cn(
                        "group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border border-border/80 bg-white shadow-xs transition-all duration-300 ease-in-out text-left",
                        "hover:-translate-y-2 hover:border-accent hover:ring-2 hover:ring-accent/30 hover:shadow-[0_24px_50px_-15px_rgba(184,213,65,0.3)]",
                        "focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40"
                      )}
                    >
                      <div>
                        {/* Imagem no topo do Card */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-2/40">
                          <Image
                            src={cat.imageUrl}
                            alt={cat.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                          {/* Título sobreposto ao rodapé da imagem */}
                          <div className="absolute bottom-3.5 left-5 right-5">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
                              Setor Especializado
                            </span>
                            <h3 className="text-2xl font-bold font-display tracking-tight text-white drop-shadow-xs">
                              {cat.title}
                            </h3>
                          </div>
                        </div>

                        {/* Conteúdo do Card */}
                        <div className="p-6 md:p-7">
                          {/* Header com Ícone e Subtítulo */}
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:border-accent/50",
                                cat.iconBgClass,
                                cat.iconColorClass
                              )}
                            >
                              <Icon className="h-5 w-5 stroke-[2.2]" />
                            </div>
                            <p className="text-xs font-semibold text-foreground/80 leading-tight">
                              {cat.subtitle}
                            </p>
                          </div>

                          {/* Destaques / Checklist */}
                          <div className="mt-6 space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-foreground/50">
                              Pilares em Destaque
                            </p>
                            <ul className="space-y-2.5">
                              {cat.highlights.map((item) => (
                                <li key={item} className="flex items-start gap-2.5 text-xs leading-5 text-foreground/80">
                                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Rodapé do Card com Ação */}
                      <div className="px-6 pb-6 md:px-7 md:pb-7 pt-2">
                        <div className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-semibold text-foreground transition-all duration-200 group-hover:border-accent group-hover:bg-accent/15 group-hover:text-foreground">
                          <span>Ver detalhes e soluções</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Container>
          </motion.div>
        ) : (
          /* MODO 2: INTERATIVO ABERTO (Ocupa 100% da tela de ponta a ponta com transição fluida) */
          <motion.div
            key="detail-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full min-h-[620px] lg:min-h-[680px] grid lg:grid-cols-12"
          >
            {/* LADO ESQUERDO: Lista dos setores deslizando da esquerda */}
            <motion.div
              initial={{ opacity: 0, x: -35 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
              className="lg:col-span-4 xl:col-span-4 2xl:col-span-3 p-6 sm:p-8 lg:p-10 xl:p-12 flex flex-col justify-between bg-surface/95 border-b lg:border-b-0 lg:border-r border-border"
            >
              <div>
                {/* Botão de retorno e controle */}
                <div className="mb-6 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleBackToGrid}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-foreground transition-all duration-200 hover:border-accent hover:bg-accent/10 shadow-xs active:scale-95"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 text-accent" />
                    <span>Voltar aos cards</span>
                  </button>

                  <span className="text-[11px] font-medium text-foreground/50">
                    Alternar setor
                  </span>
                </div>

                <p className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-4 px-1">
                  Categorias Atendidas
                </p>

                {/* Lista com os 3 setores */}
                <div className="space-y-3.5">
                  {CATEGORIES_DATA.map((cat) => {
                    const Icon = cat.icon;
                    const isCurrent = cat.id === selectedCategory.id;

                    return (
                      <div
                        key={cat.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedCategory(cat)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedCategory(cat);
                          }
                        }}
                        className={cn(
                          "group relative flex cursor-pointer items-center gap-3.5 rounded-2xl border p-3.5 transition-all duration-200 text-left active:scale-[0.99]",
                          isCurrent
                            ? "border-accent bg-white ring-2 ring-accent/30 shadow-xs"
                            : "border-border/70 bg-white/70 hover:border-accent hover:bg-white hover:ring-2 hover:ring-accent/20"
                        )}
                      >
                        {/* Miniatura */}
                        <div className="relative h-14 w-18 shrink-0 overflow-hidden rounded-xl bg-surface-2/40">
                          <Image
                            src={cat.imageUrl}
                            alt={cat.title}
                            fill
                            sizes="72px"
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Icon className="h-4 w-4 text-white drop-shadow-xs" />
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1.5">
                            <h4
                              className={cn(
                                "truncate text-sm font-bold font-display tracking-tight transition-colors",
                                isCurrent ? "text-accent-2" : "text-foreground group-hover:text-accent-2"
                              )}
                            >
                              {cat.title}
                            </h4>
                            {isCurrent && (
                              <span className="shrink-0 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-[#445802]">
                                Ativo
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 truncate text-[11px] text-foreground/70">
                            {cat.subtitle}
                          </p>
                        </div>

                        <ArrowRight
                          className={cn(
                            "h-4 w-4 shrink-0 transition-transform duration-200",
                            isCurrent
                              ? "translate-x-0.5 text-accent"
                              : "text-foreground/30 group-hover:translate-x-1 group-hover:text-accent"
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 mt-8 border-t border-border/60 text-[11px] text-foreground/60 flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
                <span>Diagnósticos específicos com critérios exigidos pelo mercado.</span>
              </div>
            </motion.div>

            {/* LADO DIREITO: Imagem de fundo cobrindo o quadrante até a borda da tela com transição por setor */}
            <div className="relative lg:col-span-8 xl:col-span-8 2xl:col-span-9 flex flex-col justify-between overflow-hidden p-8 sm:p-10 md:p-12 lg:p-14 xl:p-16 bg-neutral-950 text-white min-h-[520px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCategory.id}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 z-0"
                >
                  <Image
                    src={selectedCategory.imageUrl}
                    alt={selectedCategory.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 75vw"
                    className="object-cover"
                  />
                  {/* Gradiente escuro para legibilidade cristalina */}
                  <div className="absolute inset-0 bg-neutral-950/80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/75 to-neutral-950/45" />
                </motion.div>
              </AnimatePresence>

              {/* Conteúdo sobreposto com animação suave de fade e subida */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedCategory.id + "-content"}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.08 }}
                  className="relative z-10 flex flex-col justify-between h-full space-y-6"
                >
                  <div className="space-y-5">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 shadow-xs text-white">
                        <selectedCategory.icon className="h-6 w-6 stroke-[2.2]" />
                      </div>
                      <div>
                        <span className="inline-block rounded-full bg-accent/20 border border-accent/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                          Setor em Destaque
                        </span>
                        <h3 className="mt-1 text-2xl sm:text-3xl lg:text-4xl font-bold font-display tracking-tight text-white drop-shadow-sm">
                          {selectedCategory.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm sm:text-base font-medium text-white/90 leading-snug">
                      {selectedCategory.subtitle}
                    </p>

                    {/* Destaque da Demanda */}
                    <div className="rounded-2xl border border-white/15 bg-black/45 p-4 sm:p-5 backdrop-blur-xs max-w-4xl">
                      <p className="text-xs sm:text-sm leading-relaxed text-white">
                        <strong className="text-accent font-semibold">Exigência do mercado: </strong>
                        {selectedCategory.marketDemand}
                      </p>
                    </div>

                    {/* Pilares com checklist */}
                    <div className="space-y-3 pt-1 max-w-4xl">
                      <p className="text-xs font-bold uppercase tracking-wider text-white/70">
                        Pilares e Conformidade Integrados:
                      </p>
                      <ul className="space-y-2.5">
                        {selectedCategory.highlights.map((item) => (
                          <li key={item} className="flex items-start gap-2.5 text-xs sm:text-sm text-white">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Rodapé com CTAs */}
                  <div className="pt-6 border-t border-white/15 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5">
                    <a
                      href={buildWhatsAppLink({
                        phoneE164: whatsappPhone,
                        text: `Olá! Gostaria de falar com um especialista sobre a solução da Inove ESG para o setor de ${selectedCategory.title}.`,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-black/45 px-5 py-3 text-xs sm:text-sm font-semibold text-white transition-all duration-200 hover:bg-black/65 hover:border-accent"
                    >
                      <MessageCircle className="h-4 w-4 text-accent" />
                      <span>Falar com especialista</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        if (onCardAction) {
                          onCardAction(selectedCategory);
                        } else {
                          window.location.href = selectedCategory.ctaHref ?? "#pricing";
                        }
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-xs sm:text-sm font-bold text-accent-foreground shadow-sm transition-all duration-200 hover:bg-accent/90 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span>Iniciar Diagnóstico de {selectedCategory.title}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
