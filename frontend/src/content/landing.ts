import { buildWhatsAppLink } from "@/lib/whatsapp";

const whatsappPhone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "5522996062255";

export const landingContent = {
  brand: {
    name: "Inove ESG",
    tagline: "Rede de impacto para o crescimento empresarial",
  },
  hero: {
    eyebrow: "INOVE-ESG",
    title: "Rastreabilidade e Impacto ESG que o Mercado Exige.",
    subtitle: "",
    body: [
      "Da origem ao produto final, a Inove ESG centraliza processos, fornecedores e indicadores em uma plataforma completa de gestão de cadeia de produção. Rastreabilidade, conformidade e critérios ESG integrados — tudo que sua operação precisa para funcionar bem e ser comprovada quando o mercado exigir. Simples para o dia a dia, sólido para quem precisa crescer com transparência e credibilidade.",
    ],
    ctas: [
      {
        label: "Conheça nossas soluções",
        href: "#pricing",
        variant: "primary" as const,
      },
      {
        label: "Fale com nossos especialistas.",
        href: buildWhatsAppLink({
          phoneE164: whatsappPhone,
          text: "Olá! Gostaria de falar com um especialista da Inove ESG.",
        }),
        variant: "secondary" as const,
      },
    ],
    trust: "Atendimento via WhatsApp • Resposta rápida • Sem compromisso",
  },
  pillars: {
    title: "Transforme Critérios ESG em Vantagem Competitiva Real.",
    items: [
      {
        title: "Diagnóstico preciso",
        description:
          "Entenda sua maturidade ESG e identifique onde há maior potencial de valor — por eixo e por prática.",
      },
      {
        title: "Implementação estratégica",
        description:
          "Ações priorizadas, alinhadas ao negócio e apoiadas por metodologia, evidências e acompanhamento.",
      },
      {
        title: "Resultados mensuráveis",
        description:
          "Rastreabilidade do impacto com dados e indicadores para fortalecer marca, atrair investimentos e abrir mercados.",
      },
    ],
  },
  stats: {
    title: "O Retorno Mensurável do Investimento em ESG.",
    items: [
      { value: "87%", label: "maior atratividade para investimentos" },
      { value: "65%", label: "melhoria na reputação corporativa" },
      { value: "3×", label: "mais oportunidades em licitações" },
      { value: "92%", label: "satisfação de stakeholders" },
    ],
    note:
      "Indicadores apresentados como referência de impacto percebido no mercado; valide metas e benchmarks conforme seu setor.",
  },
  cases: {
    title: "Resultados Práticos: Casos que Inspiram Confiança.",
    subtitle: "Veja como desafios ESG viram crescimento prático.",
    items: [
      {
        name: "Agropaulo",
        meta: "Agroindustrial • Faturamento: R$ 20–30 milhões",
        challenge:
          "Fortalecer sustentabilidade e inovação, conectando desenvolvimento local e formação de talentos.",
        solution:
          "Conexão com universidade (UFCA) para um programa de estágio aplicando conhecimentos em ambiente real.",
        results: [
          "Formação e retenção de talentos",
          "Inovação aplicada no campo",
          "Impacto regional e fortalecimento comunitário",
        ],
      },
      {
        name: "Yapuana",
        meta: "Biotecnologia olfativa • Destaque no Shark Tank Brasil",
        challenge:
          "Escalar um negócio inovador garantindo coerência ESG na produção, no produto e na gestão de impacto.",
        solution:
          "Apoio para integrar e comunicar ESG na estratégia, alinhando operação, narrativa e indicadores.",
        results: [
          "Captação e validação de mercado",
          "Posicionamento premium",
          "Crescimento com governança de impacto",
        ],
      },
    ],
  },
  offers: {
    title: "Mapeie sua Maturidade ESG Sem Custos Agora Mesmo.",
    subtitle:
      "Descubra onde sua empresa está e quais oportunidades ESG podem gerar mais valor.",
    free: {
      label: "Pré-diagnóstico gratuito",
      priceStrike: "R$ 2.500",
      priceToday: "Grátis",
      bullets: [
        "Análise inicial da maturidade ESG",
        "Oportunidades de impacto rápido",
        "Roadmap de implementação priorizado",
        "Sessão de 60 minutos com especialista",
      ],
      cta: {
        label: "Quero o pré-diagnóstico",
        href: buildWhatsAppLink({
          phoneE164: whatsappPhone,
          text: "Quero o Pré-Diagnóstico Gratuito",
        }),
      },
    },
    rastreabilidade: {
      label: "Solução de rastreabilidade ESG",
      bullets: [
        "Diagnóstico completo e plano de implementação",
        "Plataforma BIS para monitoramento contínuo",
        "Conexões estratégicas público–privadas",
        "Suporte por 12 meses",
      ],
      cta: {
        label: "Solicitar proposta",
        href: buildWhatsAppLink({
          phoneE164: whatsappPhone,
          text: "Quero solicitar proposta de Rastreabilidade ESG",
        }),
      },
      scarcity:
        "Vagas limitadas: poucas empresas por mês para atendimento personalizado.",
    },
  },
  plans: {
    title: "Evolução Contínua: Da Estratégia ao Monitoramento.",
    subtitle:
      "Para o SaaS do `PROJECT.md`, as vendas podem combinar diagnóstico, convites e assinatura.",
    items: [
      {
        title: "Diagnóstico (pay-per-use)",
        description:
          "Liberação do questionário por pagamento, com pontuação automática, evidências e relatório.",
      },
      {
        title: "Pacotes de convites",
        description:
          "Convide fornecedores para o diagnóstico e monitore o status da cadeia (conforme saldo).",
      },
      {
        title: "Assinatura (BIS)",
        description:
          "Monitoramento contínuo, acesso completo ao relatório e funcionalidades avançadas.",
      },
    ],
  },
  cost: {
    title: "O Custo Oculto de Ignorar a Agenda ESG.",
    items: [
      {
        title: "Perda de investimentos",
        description:
          "Critérios ESG influenciam decisões de investimento e triagens de fundos e bancos.",
      },
      {
        title: "Exclusão de licitações",
        description:
          "Editais e grandes corporações exigem requisitos de sustentabilidade e conformidade.",
      },
      {
        title: "Reputação em risco",
        description:
          "Consumidores e parceiros cobram transparência; marcas sem compromisso perdem preferência.",
      },
      {
        title: "Multas e regulações",
        description:
          "Normas ambientais e sociais apertam; não conformidade pode virar custo alto e recorrente.",
      },
    ],
    cta: {
      label: "Não quero perder oportunidades",
      href: buildWhatsAppLink({
        phoneE164: whatsappPhone,
        text: "Não quero perder mais oportunidades",
      }),
    },
  },
  differentiators: {
    title: "Por que Escolher a Inove ESG?",
    items: [
      {
        title: "Resultados mensuráveis",
        description: "Impacto rastreável, com dados e indicadores — não só relatório.",
      },
      {
        title: "Conexões estratégicas",
        description:
          "Integra empresas, governo, academia e sociedade para gerar valor compartilhado.",
      },
      {
        title: "Tecnologia de ponta",
        description:
          "Plataforma BIS para monitoramento, rastreabilidade e validação de práticas em tempo real.",
      },
      {
        title: "Expertise comprovada",
        description: "Cases em diferentes setores, portes e níveis de maturidade.",
      },
    ],
  },
  guarantee: {
    title: "Garantia de satisfação total",
    body:
      "Se após o diagnóstico completo você não identificar oportunidades concretas de gerar valor com ESG, a proposta pode incluir devolução integral — sem burocracia.",
  },
  faq: {
    title: "Perguntas frequentes",
    items: [
      {
        q: "Isso serve para PME ou só para grandes empresas?",
        a: "A abordagem funciona para PMEs e grandes empresas. O diagnóstico e a priorização adaptam-se ao seu porte e setor.",
      },
      {
        q: "Quanto tempo leva para ver resultado?",
        a: "Depende do ponto de partida e do foco. Normalmente dá para mapear “quick wins” já no pré-diagnóstico e estruturar um plano por fases.",
      },
      {
        q: "Preciso de equipe interna de sustentabilidade?",
        a: "Não necessariamente. O processo pode começar com responsáveis por áreas-chave e evoluir com governança e rotinas simples.",
      },
    ],
  },
  footer: {
    copyright: `© ${new Date().getFullYear()} Inove ESG. Todos os direitos reservados.`,
    note: "Transformando empresas através de ESG, bioeconomia e impacto positivo.",
  },
} as const;
