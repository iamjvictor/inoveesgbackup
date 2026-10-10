"use client";

import { Container } from "@/components/container";
import { ScrollReveal } from "@/components/scroll-reveal";
import { FeatureCard } from "@/components/ui/feature-card";
import { HeroSectionESG } from "@/components/ui/hero-section-esg";
import { CategoriesSection } from "@/components/ui/categories-section";
import { ClientsSection } from "@/components/ui/testimonial-card";
import { landingContent } from "@/content/landing";
import { AlertTriangle, BarChart3, FileWarning, CircleCheck, X } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { AuthModal } from "@/components/ui/auth-modal";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const painBlocks = [
  {
    icon: FileWarning,
    title: "Falta de rastreamento da cadeia produtiva",
    description:
      "Poucos conseguem medir sua contribuição ambiental, social e de governança. Sem indicadores claros, ESG vira intenção e não resultado.",
  },
  {
    icon: AlertTriangle,
    title: "Falta de comprovação de ESG",
    description:
      "Praticar sustentabilidade só gera valor quando vem acompanhado de comprovação. Muitas empresas já adotam ações sustentáveis, mas esbarram na falta dados organizados, documentos consistentes e uma estrutura confiável. A falta de comprovação faz com que o ESG perca força e assim, deixam de transmitir confiança para o mercado, investidores e auditorias.",
  },
  {
    icon: BarChart3,
    title: "Falta de integração de dados ESG direcionado para o mercado",
    description:
      "Sem integração, não há visão clara nem evidência consistente. E o impacto é direto: contratos deixam de ser fechados por não atender critérios ESG. Grandes compradores, fundos e parceiros estratégicos exigem rastreabilidade e comprovação confiável. Quem não consegue consolidar e apresentar esses dados de forma estruturada, fica de fora.",
  },
] as const;

const featureShots = [
  {
    title: "Rastreabilidade",
    description: "Visibilidade total da cadeia. Acompanhe dados e processos do início ao fim, garantindo transparência em todas as etapas.",
    tags: ["Segurança e integridade", "Pronto para auditorias", "Visibilidade total"],
  },
  {
    title: "Integração de dados ESG",
    description: "Dados centralizados e estruturados. Elimine planilhas dispersas e consolide todas as informações ESG em um único ambiente.",
    tags: ["Adequação aos critérios", "Aumento de competitividade", "Centralização"],
  },
  {
    title: "Comprovação de ESG",
    description: "Evidência confiável e verificável. Relatórios com base em dados estruturados, garantindo credibilidade nas informações apresentadas.",
    tags: ["Redução de risco", "Confiança para investidores", "Credibilidade"],
  },
] as const;

const whyUs = [
  {
    title: "Crie sua conta",
    description: "Acesse a plataforma e inicie sua jornada ESG.",
  },
  {
    title: "Faça seu pré-diagnóstico",
    description: "Responda ao questionário e avalie o nível de maturidade ESG do seu negócio.",
  },
  {
    title: "Receba seu relatório",
    description: "Acesse o painel de desempenho com scores e recomendações estratégicas.",
  },
  {
    title: "Selecione o serviço ideal",
    description: "Escolha o serviço ou consultoria ideal para avançar no seu plano de ação.",
  },
  {
    title: "Receba a proposta e inicie a execução",
    description: "Tire dúvidas com nossa equipe, receba o orçamento e inicie a execução.",
  },
] as const;

function HomeContent() {
  const c = landingContent;
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "cadastro">("login");
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("auth") === "true") {
      const timer = setTimeout(() => {
        setAuthModalTab("login");
        setIsAuthModalOpen(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handlePlanClick = () => {
    setAuthModalTab("cadastro");
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground selection:bg-accent/20 selection:text-foreground">
      <main data-scroll-root className="overflow-x-clip">
        <ScrollReveal />
        <HeroSectionESG
          hero={{
            eyebrow: c.hero.eyebrow,
            title: c.hero.title,
            subtitle: c.hero.subtitle,
            body: c.hero.body[0],
            ctaPrimary: { label: c.hero.ctas[0].label, href: c.hero.ctas[0].href },
            ctaSecondary: { label: c.hero.ctas[1].label, href: c.hero.ctas[1].href },
            trust: c.hero.trust,
          }}
          onLoginClick={() => {
            setAuthModalTab("login");
            setIsAuthModalOpen(true);
          }}
        />

        <CategoriesSection onCardAction={handlePlanClick} />

        <section
          id="problema"
          className="flex items-start border-b border-border bg-gradient-to-b from-white to-accent/15 py-14 lg:min-h-[calc(100svh-4rem)] lg:items-center lg:py-0"
        >
          <Container>
            <div className="mb-10 max-w-2xl reveal reveal-up">
              <h2 className="text-3xl font-bold font-display tracking-tight">Elimine os Gargalos que Travam sua Operação ESG</h2>
              <p className="mt-3 text-sm leading-6 text-foreground/70">
                Entraves comuns que reduzem velocidade e impacto, com o benefício direto de resolver cada um.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {painBlocks.map((item, index) => (
                <FeatureCard
                  key={item.title}
                  icon={<item.icon className="h-12 w-12" />}
                  title={item.title}
                  description={item.description}
                  className={`reveal rounded-3xl bg-surface p-7 ring-1 ring-border ${
                    index % 2 === 0 ? "reveal-left" : "reveal-right"
                  } ${index === 1 ? "reveal-delay-1" : ""} ${index === 2 ? "reveal-delay-2" : ""}`}
                />
              ))}
            </div>
          </Container>
        </section>

        <section
          id="features"
          className="flex items-start border-b border-border bg-gradient-to-b from-accent/15 to-white py-14 lg:min-h-[calc(100svh-4rem)] lg:items-center lg:py-0"
        >
          <Container>
            <div className="mb-10 flex items-end justify-between gap-8">
              <div>
                <h2 className="text-3xl font-bold font-display tracking-tight">Tecnologia Inteligente para Execução ESG</h2>
                <p className="mt-2 text-sm text-foreground/70">
                  Funcionalidades pensadas para transformar estratégia ESG em execução.
                </p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featureShots.map((feature, index) => (
                <article
                  key={feature.title}
                  className={`reveal group rounded-3xl bg-gradient-to-br from-white to-surface p-6 ring-1 ring-border transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_60px_-20px_rgba(184,213,65,0.25)] hover:ring-accent/30 ${
                    index % 2 === 0 ? "reveal-left" : "reveal-right"
                  }`}
                >
                  <div className="rounded-2xl bg-gradient-to-br from-surface-2 to-accent/5 p-4 ring-1 ring-border transition-colors duration-300 group-hover:from-accent/10 group-hover:to-surface">
                    <div className="mb-3 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-accent/50" />
                      <span className="h-2 w-2 rounded-full bg-accent/70" />
                      <span className="h-2 w-2 rounded-full bg-accent" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2.5 w-3/4 rounded-full bg-accent/30" />
                      <div className="h-2.5 w-full rounded-full bg-accent/20" />
                      <div className="h-2.5 w-5/6 rounded-full bg-accent/25" />
                      <div className="mt-4 h-20 rounded-xl bg-white ring-1 ring-border" />
                    </div>
                  </div>
                  <h3 className="mt-5 text-base font-semibold transition-colors duration-200 group-hover:text-accent">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-foreground/75">{feature.description}</p>
                  <ul className="mt-4 space-y-2">
                    {feature.tags.map((tag) => (
                      <li key={tag} className="text-xs text-foreground/65">
                        {tag}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section
          id="prova-social"
          className="border-b border-border bg-gradient-to-b from-white to-accent/15"
        >
          <ClientsSection
            className="py-16 md:py-20"
            tagLabel="Prova social ESG"
            title="Impacto Real e Mensurável: O Mercado Não Mente"
            description="Empresas de diferentes setores usam nossa metodologia para sair do discurso e entrar em execução com governança."
            stats={c.stats.items.slice(0, 3).map((item) => ({
              value: item.value,
              label: item.label,
            }))}
            testimonials={[
              {
                name: c.cases.items[0].name,
                title: c.cases.items[0].meta,
                quote: c.cases.items[0].solution,
                avatarSrc:
                  "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=900&auto=format&fit=crop&q=80",
              },
              {
                name: c.cases.items[1].name,
                title: c.cases.items[1].meta,
                quote: c.cases.items[1].solution,
                avatarSrc:
                  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=900&auto=format&fit=crop&q=80",
              },
            ]}
            secondaryActionLabel="Ver cases"
            primaryActionLabel="Falar com especialista"
            secondaryActionHref="#cases"
            primaryActionHref={c.hero.ctas[1].href}
          />
        </section>

        <section
          id="porque"
          className="flex items-start border-b border-border bg-gradient-to-b from-accent/15 to-white py-14 lg:min-h-[calc(100svh-4rem)] lg:items-center lg:py-0"
        >
          <Container>
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <h2 className="text-3xl font-bold font-display tracking-tight">Direto ao Ponto: Como Funciona</h2>
                <p className="mt-3 text-sm leading-6 text-foreground/70">
                  Fluxo simples e direto para acelerar sua decisão e execução ESG.
                </p>
              </div>
              <div className="lg:col-span-8">
                <ol className="grid gap-5">
                  {whyUs.map((step, index) => (
                    <li
                      key={step.title}
                      className={`reveal group rounded-2xl bg-gradient-to-br from-white to-surface p-6 ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_50px_-20px_rgba(184,213,65,0.2)] hover:ring-accent/30 ${
                        index % 2 === 0 ? "reveal-left" : "reveal-right"
                      }`}
                    >
                      <div className="mb-2 text-xs font-semibold text-accent">PASSO 0{index + 1}</div>
                      <h3 className="text-base font-semibold transition-colors duration-200 group-hover:text-accent/90">{step.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-foreground/75">{step.description}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Container>
        </section>

        <section
          id="pricing"
          className="py-14 border-b border-border bg-gradient-to-b from-white to-accent/15"
        >
          <Container>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold font-display tracking-tight text-foreground">Planos e Serviços</h2>
              <p className="mt-3 text-sm leading-6 text-foreground/70 max-w-2xl mx-auto">
                Compare as soluções e escolha a melhor opção para a maturidade ESG da sua empresa.
              </p>
            </div>

            {/* Mobile View: Planos como Cards (Visível apenas em mobile) */}
            <div className="lg:hidden grid gap-6 mb-8">
              {/* Diagnóstico */}
              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold font-display text-foreground mb-1">Diagnóstico</h3>
                <p className="text-xs text-foreground/70 mb-3">Foco: Diagnóstico Profundo</p>
                <div className="text-xs text-foreground/70 mb-0.5">A partir de</div>
                <div className="text-2xl font-bold text-foreground mb-4">R$ 6.000</div>
                <ul className="space-y-2 mb-6 text-sm text-foreground/80">
                  <li className="flex items-center gap-2"><CircleCheck className="size-4 text-accent flex-shrink-0" /> Autodeclaração</li>
                  <li className="flex items-center gap-2"><CircleCheck className="size-4 text-accent flex-shrink-0" /> Análise de Evidências</li>
                  <li className="flex items-center gap-2"><CircleCheck className="size-4 text-accent flex-shrink-0" /> Validação de Documentos</li>
                  <li className="flex items-center gap-2"><CircleCheck className="size-4 text-accent flex-shrink-0" /> Roadmap Estratégico</li>
                  <li className="flex items-center gap-2"><CircleCheck className="size-4 text-accent flex-shrink-0" /> Relatório com Selo</li>
                </ul>
                <button 
                  onClick={handlePlanClick}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 border-0 font-bold text-sm h-auto py-2.5 px-4 w-full flex justify-center items-center whitespace-nowrap rounded-full"
                >
                  Solicitar
                </button>
              </div>

              {/* Diagnóstico + Consultoria */}
              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold font-display text-foreground mb-1">Consultoria</h3>
                <p className="text-xs text-foreground/70 mb-3">Foco: Diagnóstico + Ação</p>
                <div className="text-xs text-foreground/70 mb-0.5">A partir de</div>
                <div className="text-2xl font-bold text-foreground mb-4">R$ 7.500</div>
                <ul className="space-y-2 mb-6 text-sm text-foreground/80">
                  <li className="flex items-center gap-2"><CircleCheck className="size-4 text-accent flex-shrink-0" /> Autodeclaração</li>
                  <li className="flex items-center gap-2"><CircleCheck className="size-4 text-accent flex-shrink-0" /> Análise de Evidências</li>
                  <li className="flex items-center gap-2"><CircleCheck className="size-4 text-accent flex-shrink-0" /> Validação de Documentos</li>
                  <li className="flex items-center gap-2"><CircleCheck className="size-4 text-accent flex-shrink-0" /> Roadmap Estratégico</li>
                  <li className="flex items-center gap-2"><CircleCheck className="size-4 text-accent flex-shrink-0" /> Relatório com Selo</li>
                  <li className="flex items-center gap-2"><CircleCheck className="size-4 text-accent flex-shrink-0" /> Sessão Estratégica (2h)</li>
                  <li className="flex items-center gap-2"><CircleCheck className="size-4 text-accent flex-shrink-0" /> Apoio à Decisão</li>
                </ul>
                <button 
                  onClick={handlePlanClick}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 border-0 font-bold text-sm h-auto py-2.5 px-4 w-full flex justify-center items-center whitespace-nowrap rounded-full"
                >
                  Solicitar
                </button>
              </div>

              {/* Assessoria */}
              <div className="rounded-2xl border border-accent bg-accent/5 p-6 shadow-sm relative">
                <div className="absolute top-4 right-4 bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded-full">Recomendado</div>
                <h3 className="text-xl font-bold font-display text-foreground mb-1">Assessoria</h3>
                <p className="text-xs text-foreground/70 mb-3">Foco: Gestão Contínua</p>
                <div className="text-2xl font-bold text-foreground mb-4 mt-4">Sob Orçamento</div>
                <ul className="space-y-2 mb-6 text-sm text-foreground/80">
                  <li className="flex items-center gap-2"><CircleCheck className="size-4 text-accent flex-shrink-0" /> Autodeclaração</li>
                  <li className="flex items-center gap-2"><CircleCheck className="size-4 text-accent flex-shrink-0" /> Análise de Evidências</li>
                  <li className="flex items-center gap-2"><CircleCheck className="size-4 text-accent flex-shrink-0" /> Validação de Documentos</li>
                  <li className="flex items-center gap-2"><CircleCheck className="size-4 text-accent flex-shrink-0" /> Roadmap Estratégico</li>
                  <li className="flex items-center gap-2"><CircleCheck className="size-4 text-accent flex-shrink-0" /> Relatório com Selo</li>
                  <li className="flex items-center gap-2"><CircleCheck className="size-4 text-accent flex-shrink-0" /> Rastreabilidade Fornecedores</li>
                  <li className="flex items-center gap-2"><CircleCheck className="size-4 text-accent flex-shrink-0" /> Sessão Estratégica Mensal</li>
                  <li className="flex items-center gap-2"><CircleCheck className="size-4 text-accent flex-shrink-0" /> Apoio à Decisão</li>
                  <li className="flex items-center gap-2"><CircleCheck className="size-4 text-accent flex-shrink-0" /> Acompanhamento Mensal</li>
                </ul>
                <button 
                  onClick={handlePlanClick}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 border-0 font-bold text-sm h-auto py-2.5 px-4 w-full flex justify-center items-center whitespace-nowrap rounded-full"
                >
                  Solicitar
                </button>
              </div>
            </div>

            {/* Grid Layout (Desktop) */}
            <div className="grid gap-8 lg:grid-cols-2 items-start">
              {/* Lado Esquerdo: Tabela - Oculto em Mobile */}
              <div className="hidden lg:block lg:col-span-1">
                <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
                  <table className="w-full text-left border-collapse table-fixed min-w-[450px] pricing-table">
                    <thead>
                      <tr>
                        <th className="w-[34%] p-4 bg-gray-50/50 border-b border-border font-bold text-foreground text-[11px] lg:text-xs xl:text-sm">Recursos</th>
                        <th className="w-[22%] p-4 bg-white border-b border-border text-center font-bold text-foreground text-[11px] lg:text-xs xl:text-sm">Diagnóstico</th>
                        <th className="w-[22%] p-4 bg-white border-b border-border text-center font-bold text-foreground text-[11px] lg:text-xs xl:text-sm">Consultoria</th>
                        <th className="w-[22%] p-4 bg-accent text-accent-foreground border-b border-border text-center font-bold text-[11px] lg:text-xs xl:text-sm">Assessoria</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Foco */}
                      <tr className="border-b border-gray-100">
                        <td className="p-4 font-medium text-foreground bg-gray-50/30 text-xs">Foco</td>
                        <td className="p-4 text-center text-xs text-foreground/70">Profundo</td>
                        <td className="p-4 text-center text-xs text-foreground/70">Ação</td>
                        <td className="p-4 text-center text-xs bg-accent/10 text-foreground font-medium">Gestão</td>
                      </tr>
                      {/* Autodeclaração */}
                      <tr className="border-b border-gray-100">
                        <td className="p-4 font-medium text-foreground bg-gray-50/30 text-xs">Autodeclaração</td>
                        <td className="p-4 text-center"><CircleCheck className="size-4 text-accent mx-auto" /></td>
                        <td className="p-4 text-center"><CircleCheck className="size-4 text-accent mx-auto" /></td>
                        <td className="p-4 text-center bg-accent/10"><CircleCheck className="size-4 text-accent mx-auto" /></td>
                      </tr>
                      {/* Análise de Evidências */}
                      <tr className="border-b border-gray-100">
                        <td className="p-4 font-medium text-foreground bg-gray-50/30 text-xs">Evidências</td>
                        <td className="p-4 text-center"><CircleCheck className="size-4 text-accent mx-auto" /></td>
                        <td className="p-4 text-center"><CircleCheck className="size-4 text-accent mx-auto" /></td>
                        <td className="p-4 text-center bg-accent/10"><CircleCheck className="size-4 text-accent mx-auto" /></td>
                      </tr>
                      {/* Validação de Documentos */}
                      <tr className="border-b border-gray-100">
                        <td className="p-4 font-medium text-foreground bg-gray-50/30 text-xs">Documentos</td>
                        <td className="p-4 text-center"><CircleCheck className="size-4 text-accent mx-auto" /></td>
                        <td className="p-4 text-center"><CircleCheck className="size-4 text-accent mx-auto" /></td>
                        <td className="p-4 text-center bg-accent/10"><CircleCheck className="size-4 text-accent mx-auto" /></td>
                      </tr>
                      {/* Roadmap Estratégico */}
                      <tr className="border-b border-gray-100">
                        <td className="p-4 font-medium text-foreground bg-gray-50/30 text-xs">Roadmap</td>
                        <td className="p-4 text-center"><CircleCheck className="size-4 text-accent mx-auto" /></td>
                        <td className="p-4 text-center"><CircleCheck className="size-4 text-accent mx-auto" /></td>
                        <td className="p-4 text-center bg-accent/10"><CircleCheck className="size-4 text-accent mx-auto" /></td>
                      </tr>
                      {/* Relatório com Selo de Verificação */}
                      <tr className="border-b border-gray-100">
                        <td className="p-4 font-medium text-foreground bg-gray-50/30 text-xs">Selo Verificação</td>
                        <td className="p-4 text-center"><CircleCheck className="size-4 text-accent mx-auto" /></td>
                        <td className="p-4 text-center"><CircleCheck className="size-4 text-accent mx-auto" /></td>
                        <td className="p-4 text-center bg-accent/10"><CircleCheck className="size-4 text-accent mx-auto" /></td>
                      </tr>
                      {/* Rastreabilidade de Fornecedores */}
                      <tr className="border-b border-gray-100">
                        <td className="p-4 font-medium text-foreground bg-gray-50/30 text-xs">Fornecedores</td>
                        <td className="p-4 text-center"><X className="size-4 text-gray-300 mx-auto" /></td>
                        <td className="p-4 text-center"><X className="size-4 text-gray-300 mx-auto" /></td>
                        <td className="p-4 text-center bg-accent/10"><CircleCheck className="size-4 text-accent mx-auto" /></td>
                      </tr>
                      {/* Sessão Estratégica */}
                      <tr className="border-b border-gray-100">
                        <td className="p-4 font-medium text-foreground bg-gray-50/30 text-xs">Sessão Estrat.</td>
                        <td className="p-4 text-center"><X className="size-4 text-gray-300 mx-auto" /></td>
                        <td className="p-4 text-center text-xs font-medium text-foreground">Sim (2h)</td>
                        <td className="p-4 text-center text-xs bg-accent/10 font-medium text-foreground">Mensal</td>
                      </tr>
                      {/* Apoio à Decisão */}
                      <tr className="border-b border-gray-100">
                        <td className="p-4 font-medium text-foreground bg-gray-50/30 text-xs">Apoio Decisão</td>
                        <td className="p-4 text-center"><X className="size-4 text-gray-300 mx-auto" /></td>
                        <td className="p-4 text-center"><CircleCheck className="size-4 text-accent mx-auto" /></td>
                        <td className="p-4 text-center bg-accent/10"><CircleCheck className="size-4 text-accent mx-auto" /></td>
                      </tr>
                      {/* Acompanhamento Mensal */}
                      <tr className="border-b border-border">
                        <td className="p-4 font-medium text-foreground bg-gray-50/30 text-xs">Acomp. Mensal</td>
                        <td className="p-4 text-center"><X className="size-4 text-gray-300 mx-auto" /></td>
                        <td className="p-4 text-center"><X className="size-4 text-gray-300 mx-auto" /></td>
                        <td className="p-4 text-center bg-accent/10"><CircleCheck className="size-4 text-accent mx-auto" /></td>
                      </tr>
                      {/* Preço e Botão */}
                      <tr>
                        <td className="p-4 font-medium text-foreground bg-gray-50/30 text-xs">Investimento</td>
                        <td className="p-4 text-center">
                           <div className="text-xs text-foreground/70 mb-0.5">A partir de</div>
                          <div className="text-base font-bold text-foreground mb-2">R$ 6.000</div>
                          <button 
                            onClick={handlePlanClick}
                            className="bg-accent text-accent-foreground hover:bg-accent/90 border-0 font-bold text-[10px] sm:text-xs h-auto py-1.5 px-2 w-full flex justify-center items-center rounded-full text-center leading-tight"
                          >
                            Solicitar
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          <div className="text-xs text-foreground/70 mb-0.5">A partir de</div>
                          <div className="text-base font-bold text-foreground mb-2">R$ 7.500</div>
                          <button 
                            onClick={handlePlanClick}
                            className="bg-accent text-accent-foreground hover:bg-accent/90 border-0 font-bold text-[10px] sm:text-xs h-auto py-1.5 px-2 w-full flex justify-center items-center rounded-full text-center leading-tight"
                          >
                            Solicitar
                          </button>
                        </td>
                        <td className="p-4 text-center bg-accent/10">
                          <div className="text-base font-bold text-foreground mb-2">Sob Orçamento</div>
                          <button 
                            onClick={handlePlanClick}
                            className="bg-accent text-accent-foreground hover:bg-accent/90 border-0 font-bold text-[10px] sm:text-xs h-auto py-1.5 px-2 w-full flex justify-center items-center rounded-full text-center leading-tight"
                          >
                            Solicitar
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lado Direito: Cards (50%) */}
              <div className="lg:col-span-1 bg-accent/10 p-6 rounded-3xl border border-border">
                <h3 className="text-lg font-bold font-display text-foreground mb-4">Serviços Sob Demanda</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Diagnóstico Autodeclarável */}
                  <div className="rounded-xl border border-border bg-white p-4 flex flex-col justify-between shadow-sm">
                    <div>
                      <h4 className="text-sm font-bold font-display text-foreground mb-1">Diagnóstico Autodeclarável</h4>
                      <p className="text-xs text-foreground/70 mb-2">Diagnóstico rápido de maturidade. Relatório não verificado (baseado em autodeclaração).</p>
                      <ul className="text-xs text-foreground/80 space-y-1 mb-2">
                        <li className="flex items-center gap-1"><CircleCheck className="size-3 text-accent" /> Formulário ESG Autodeclarável</li>
                        <li className="flex items-center gap-1"><CircleCheck className="size-3 text-accent" /> Relatório de Maturidade</li>
                      </ul>
                    </div>
                    <div className="flex justify-between items-center mt-2 border-t border-gray-100 pt-2">
                      <span className="font-bold text-sm text-foreground">R$ 250</span>
                      <button 
                        onClick={handlePlanClick}
                        className="bg-accent text-accent-foreground hover:bg-accent/90 border-0 font-bold text-xs h-auto py-1.5 px-3 flex justify-center items-center whitespace-nowrap rounded-full"
                      >
                        Contratar
                      </button>
                    </div>
                  </div>

                  {/* Diagnóstico Autodeclarável + Consultoria */}
                  <div className="rounded-xl border border-border bg-white p-4 flex flex-col justify-between shadow-sm">
                    <div>
                      <h4 className="text-sm font-bold font-display text-foreground mb-1">Diagnóstico Autodeclarável + Consultoria</h4>
                      <p className="text-xs text-foreground/70 mb-2">Inclui o diagnóstico autodeclarável rápido e 1 hora de consultoria com especialista.</p>
                      <ul className="text-xs text-foreground/80 space-y-1 mb-2">
                        <li className="flex items-center gap-1"><CircleCheck className="size-3 text-accent" /> Diagnóstico Autodeclarável</li>
                        <li className="flex items-center gap-1"><CircleCheck className="size-3 text-accent" /> 1h de Consultoria Direta</li>
                      </ul>
                    </div>
                    <div className="flex justify-between items-center mt-2 border-t border-gray-100 pt-2">
                      <span className="font-bold text-sm text-foreground">R$ 500</span>
                      <button 
                        onClick={handlePlanClick}
                        className="bg-accent text-accent-foreground hover:bg-accent/90 border-0 font-bold text-xs h-auto py-1.5 px-3 flex justify-center items-center whitespace-nowrap rounded-full"
                      >
                        Contratar
                      </button>
                    </div>
                  </div>

                  {/* Avaliação de Fornecedores */}
                  <div className="rounded-xl border border-border bg-white p-4 flex flex-col justify-between shadow-sm">
                    <div>
                      <h4 className="text-sm font-bold font-display text-foreground mb-1">Avaliação de Fornecedores</h4>
                      <p className="text-xs text-foreground/70 mb-2">Rastreie o impacto da sua cadeia de suprimentos.</p>
                      <ul className="text-xs text-foreground/80 space-y-1 mb-2">
                        <li className="flex items-center gap-1"><CircleCheck className="size-3 text-accent" /> Mapeamento de Fornecedores</li>
                        <li className="flex items-center gap-1"><CircleCheck className="size-3 text-accent" /> Análise de Risco ESG</li>
                      </ul>
                    </div>
                    <div className="flex justify-between items-center mt-2 border-t border-gray-100 pt-2">
                      <span className="font-bold text-sm text-foreground">Sob Orçamento</span>
                      <button 
                        onClick={handlePlanClick}
                        className="bg-accent text-accent-foreground hover:bg-accent/90 border-0 font-bold text-xs h-auto py-1.5 px-3 flex justify-center items-center whitespace-nowrap rounded-full"
                      >
                        Orçar
                      </button>
                    </div>
                  </div>

                  {/* Capacitação */}
                  <div className="rounded-xl border border-border bg-white p-4 flex flex-col justify-between shadow-sm">
                    <div>
                      <h4 className="text-sm font-bold font-display text-foreground mb-1">Capacitação ESG</h4>
                      <p className="text-xs text-foreground/70 mb-2">Aula sobre ESG + certificado para sua equipe.</p>
                      <ul className="text-xs text-foreground/80 space-y-1 mb-2">
                        <li className="flex items-center gap-1"><CircleCheck className="size-3 text-accent" /> Aula Exclusiva</li>
                        <li className="flex items-center gap-1"><CircleCheck className="size-3 text-accent" /> Certificado de Capacitação</li>
                      </ul>
                    </div>
                    <div className="flex justify-between items-center mt-2 border-t border-gray-100 pt-2">
                      <span className="font-bold text-sm text-foreground">Sob Orçamento</span>
                      <button 
                        onClick={handlePlanClick}
                        className="bg-accent text-accent-foreground hover:bg-accent/90 border-0 font-bold text-xs h-auto py-1.5 px-3 flex justify-center items-center whitespace-nowrap rounded-full"
                      >
                        Orçar
                      </button>
                    </div>
                  </div>

                  {/* Livro */}
                  <div className="rounded-xl border border-border bg-white p-4 flex flex-col justify-between shadow-sm sm:col-span-2">
                    <div>
                      <h4 className="text-sm font-bold font-display text-foreground mb-1">Livro Bioeconomia & ESG</h4>
                      <p className="text-xs text-foreground/70 mb-2">Adquira o livro físico ou digital.</p>
                      <ul className="text-xs text-foreground/80 space-y-1 mb-2">
                        <li className="flex items-center gap-1"><CircleCheck className="size-3 text-accent" /> Conteúdo Exclusivo</li>
                        <li className="flex items-center gap-1"><CircleCheck className="size-3 text-accent" /> Versão Física ou Digital</li>
                      </ul>
                    </div>
                    <div className="flex justify-between items-center mt-2 border-t border-gray-100 pt-2">
                      <span className="font-bold text-sm text-foreground">R$ 41,90</span>
                      <button 
                        onClick={handlePlanClick}
                        className="bg-accent text-accent-foreground hover:bg-accent/90 border-0 font-bold text-xs h-auto py-1.5 px-3 flex justify-center items-center whitespace-nowrap rounded-full"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section
          id="faq"
          className="flex items-start border-b border-border bg-gradient-to-b from-accent/15 to-white py-14 lg:min-h-[calc(100svh-4rem)] lg:items-center lg:py-0"
        >
          <Container>
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <h2 className="text-3xl font-bold font-display tracking-tight">Respostas Diretas para suas Dúvidas</h2>
                <p className="mt-3 text-sm leading-6 text-foreground/70">
                  Dúvidas que aparecem com mais frequência antes da contratação.
                </p>
              </div>
              <div className="lg:col-span-8">
                <div className="grid gap-4">
                  {c.faq.items.map((item, index) => (
                    <details
                      key={item.q}
                      className={`reveal group rounded-2xl bg-gradient-to-br from-white to-surface p-6 ring-1 ring-border transition-all duration-300 hover:ring-accent/30 hover:shadow-[0_12px_40px_-20px_rgba(184,213,65,0.15)] ${
                        index % 2 === 0 ? "reveal-left" : "reveal-right"
                      }`}
                    >
                      <summary className="cursor-pointer list-none text-sm font-semibold">
                        <span className="mr-2 inline-block align-middle text-accent transition-transform group-open:rotate-90">
                          ▸
                        </span>
                        {item.q}
                      </summary>
                      <p className="mt-3 text-sm leading-6 text-foreground/75">{item.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section
          id="cta-final"
          className="flex items-start bg-gradient-to-br from-accent via-accent to-accent-2/80 py-14 text-accent-foreground lg:min-h-[calc(100svh-4rem)] lg:items-center lg:py-0"
        >
          <Container>
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <h2 className="text-3xl font-bold font-display tracking-tight">Pronto para Transformar ESG em Crescimento Real?</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-accent-foreground/85">
                  Inicie com o pré-diagnóstico gratuito e avance com um plano prático para sua empresa.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <ButtonLink
                    href={c.hero.ctas[0].href}
                    className="!bg-white !text-accent-foreground hover:!bg-white/90"
                    variant="ghost"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {c.hero.ctas[0].label}
                  </ButtonLink>
                  <ButtonLink
                    href={c.hero.ctas[1].href}
                    className="border border-accent-foreground/30 !text-accent-foreground hover:bg-accent-foreground/5"
                    variant="ghost"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {c.hero.ctas[1].label}
                  </ButtonLink>
                </div>
              </div>

              <div className="lg:col-span-5">
                <footer className="grid gap-4 text-sm text-accent-foreground/85">
                  <a href="#features" className="hover:text-white">
                    Produto
                  </a>
                  <a href="#pricing" className="hover:text-white">
                    Preços
                  </a>
                  <a href="#faq" className="hover:text-white">
                    Recursos e suporte
                  </a>
                  <a href="#hero" className="hover:text-white">
                    Empresa
                  </a>
                  <button 
                    onClick={() => {
                      setAuthModalTab("login");
                      setIsAuthModalOpen(true);
                    }} 
                    className="text-left hover:text-white"
                  >
                    Login
                  </button>
                  <p className="pt-6 text-xs text-accent-foreground/70">{c.footer.copyright}</p>
                  <p className="text-xs text-accent-foreground/70">{c.footer.note}</p>
                </footer>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        defaultTab={authModalTab} 
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
