import {
  type CompanyProfile,
  type DashboardKpi,
  type DiagnosticQuestion,
  type DiagnosticSection,
  type EvidenceItem,
  type ImprovementAction,
  type InviteBalance,
  type InvitePackage,
  type ReportSummary,
  type ScoreAxis,
  type Supplier,
  type WorkspaceStage,
  type WorkspaceTask,
} from "./types";

export const companyProfile: CompanyProfile = {
  name: "Inove Alimentos S.A.",
  sector: "Indústria de alimentos",
  cycle: "2026.1",
  plan: "Growth ESG",
  diagnosticStatus: "contratado",
  roles: ["avaliada", "assinante"],
};

export const dashboardKpis: DashboardKpi[] = [
  {
    id: "diag-progress",
    label: "Progresso do diagnóstico",
    value: "68%",
    detail: "34 de 50 respostas concluídas",
  },
  {
    id: "evidence-pending",
    label: "Evidências pendentes",
    value: "7",
    detail: "Itens sem documento anexado",
  },
  {
    id: "supplier-response",
    label: "Fornecedores respondidos",
    value: "11/18",
    detail: "61% da base convidada",
  },
  {
    id: "current-score",
    label: "Score ESG parcial",
    value: "72",
    detail: "Atualizado com base nas respostas atuais",
  },
];

export const diagnosticSections: DiagnosticSection[] = [
  {
    id: "environmental-governance",
    title: "Gestão ambiental e emissões",
    axis: "E",
    status: "em_andamento",
    answered: 8,
    total: 12,
    updatedAt: "15 abr 2026",
  },
  {
    id: "bioeconomy-circular",
    title: "Bioeconomia circular e cadeia de valor",
    axis: "B",
    status: "em_andamento",
    answered: 6,
    total: 12,
    updatedAt: "14 abr 2026",
  },
  {
    id: "social-people",
    title: "Capital humano e impacto social",
    axis: "S",
    status: "concluido",
    answered: 14,
    total: 14,
    updatedAt: "13 abr 2026",
  },
  {
    id: "governance-compliance",
    title: "Governança, ética e conformidade",
    axis: "G",
    status: "nao_iniciado",
    answered: 0,
    total: 10,
    updatedAt: "-",
  },
];

export const diagnosticQuestions: DiagnosticQuestion[] = [
  {
    id: "q1",
    sectionId: "environmental-governance",
    axis: "E",
    category: "Ambiental",
    prompt: "A empresa monitora consumo energético mensal por unidade?",
    hint: "Informe se existe medição sistemática e periodicidade.",
    answer: "Monitora mensalmente com relatório consolidado por unidade.",
    hasEvidence: true,
    options: [
      "Não monitora o consumo energético.",
      "Monitora esporadicamente sem registro formal.",
      "Monitora mensalmente, mas não consolida os dados.",
      "Monitora mensalmente com relatório consolidado por unidade.",
      "Monitora em tempo real com metas de redução atreladas."
    ]
  },
  {
    id: "q2",
    sectionId: "environmental-governance",
    axis: "E",
    category: "Ambiental",
    prompt: "Existe meta formal de redução de emissões para os próximos 24 meses?",
    hint: "Descreva meta, baseline e indicador de acompanhamento.",
    answer: "Meta em validação pelo comitê, ainda sem baseline fechado.",
    hasEvidence: false,
    options: [
      "Não possui metas de redução de emissões.",
      "Possui intenção de reduzir, mas sem metas formais.",
      "Meta em validação pelo comitê, ainda sem baseline fechado.",
      "Possui meta formal aprovada, mas sem acompanhamento público.",
      "Possui meta formal e publica relatórios de acompanhamento."
    ]
  },
  {
    id: "q3",
    sectionId: "social-people",
    axis: "S",
    category: "Social",
    prompt: "A empresa possui política ativa de segurança e saúde ocupacional?",
    hint: "Cite treinamentos, indicadores e responsáveis.",
    answer: "Política aprovada e treinamentos trimestrais implementados.",
    hasEvidence: true,
    options: [
      "Não possui política de segurança e saúde.",
      "Possui apenas as normas básicas obrigatórias por lei.",
      "Possui política interna, mas sem treinamentos regulares.",
      "Política aprovada e treinamentos trimestrais implementados.",
      "Política integrada com certificação internacional (ex: ISO 45001)."
    ]
  },
  {
    id: "q4",
    sectionId: "governance-compliance",
    axis: "G",
    category: "Governança",
    prompt: "Há canal de denúncias com tratamento formal e SLA definido?",
    hint: "Indique governança de tratamento e monitoramento.",
    answer: "",
    hasEvidence: false,
    options: [
      "Não possui canal de denúncias.",
      "Possui canal (ex: e-mail), mas sem processo formal de apuração.",
      "Possui canal estruturado, mas sem SLA definido.",
      "Possui canal com tratamento formal e SLA definido.",
      "Possui canal independente (terceirizado) com auditoria dos casos."
    ]
  },
];

// Eixos e Questionários Específicos por Segmento
export const civilSections: DiagnosticSection[] = [
  {
    id: "environmental-civil",
    title: "Gestão de Resíduos e Recursos Hídricos",
    axis: "E",
    status: "nao_iniciado",
    answered: 0,
    total: 2,
    updatedAt: "-",
  },
  {
    id: "social-civil",
    title: "Saúde e Segurança Ocupacional (NRs)",
    axis: "S",
    status: "nao_iniciado",
    answered: 0,
    total: 1,
    updatedAt: "-",
  },
  {
    id: "governance-civil",
    title: "Homologação de Cadeia e Conformidade",
    axis: "G",
    status: "nao_iniciado",
    answered: 0,
    total: 1,
    updatedAt: "-",
  },
];

export const civilQuestions: DiagnosticQuestion[] = [
  {
    id: "q-civil-1",
    sectionId: "environmental-civil",
    axis: "E",
    category: "Ambiental",
    prompt: "A empresa possui um Plano de Gerenciamento de Resíduos da Construção Civil (PGRCC) ativo?",
    hint: "Informe se há PGRCC nos canteiros com destinação adequada de rejeitos.",
    answer: "",
    hasEvidence: false,
    options: [
      "Não possui PGRCC.",
      "Possui PGRCC apenas em formato de rascunho.",
      "Possui PGRCC implementado e atende às exigências básicas da legislação.",
      "Possui PGRCC implementado e recicla/reutiliza mais de 50% dos resíduos gerados.",
      "PGRCC avançado com certificação de descarte zero de rejeitos e rastreabilidade total."
    ]
  },
  {
    id: "q-civil-2",
    sectionId: "environmental-civil",
    axis: "E",
    category: "Ambiental",
    prompt: "Como é controlado e otimizado o consumo de água nos canteiros de obras?",
    hint: "Informe a presença de sistemas de medição e captação/reuso.",
    answer: "",
    hasEvidence: false,
    options: [
      "Não monitora o consumo de água nos canteiros.",
      "Medição simples por fatura mensal de concessionária, sem controle interno.",
      "Monitoramento mensal detalhado com plano básico de redução por m².",
      "Metas formais de consumo por m² e uso de redutores de vazão/tecnologias economizadoras.",
      "100% de captação e reuso de água da chuva/processos industriais nas obras."
    ]
  },
  {
    id: "q-civil-3",
    sectionId: "social-civil",
    axis: "S",
    category: "Social",
    prompt: "Como a empresa garante a saúde e a segurança do trabalho frente às normas regulamentadoras (ex: NR-18 e NR-35)?",
    hint: "Descreva auditorias, equipamentos de proteção e gestão de riscos operacionais.",
    answer: "",
    hasEvidence: false,
    options: [
      "Cumpre apenas o mínimo obrigatório de fornecimento de EPIs básico.",
      "Possui equipe interna e promove treinamentos eventuais de segurança.",
      "Auditorias mensais e controle diário de EPI/EPC integrados nos canteiros.",
      "Programa de acidentes zero com metas auditadas externamente e bonificação atrelada.",
      "Certificação internacional ativa (ex: ISO 45001) estendida a todos os terceiros."
    ]
  },
  {
    id: "q-civil-4",
    sectionId: "governance-civil",
    axis: "G",
    category: "Governança",
    prompt: "Há auditoria e seleção de subempreiteiros baseada em conformidade trabalhista?",
    hint: "Aponte como a empresa evita riscos de precarização trabalhista e corrupção na cadeia.",
    answer: "",
    hasEvidence: false,
    options: [
      "Não possui controle sobre as práticas trabalhistas de subcontratados.",
      "Exige apenas certidões negativas básicas no momento da contratação.",
      "Auditorias periódicas e acompanhamento mensal das guias de recolhimento de terceiros.",
      "SLA com monitoramento contínuo em tempo real e bloqueio automático de parceiros irregulares.",
      "Canal de compliance integrado com monitoramento completo e homologação automatizada da cadeia."
    ]
  }
];

export const agroSections: DiagnosticSection[] = [
  {
    id: "environmental-agro",
    title: "Gestão do Solo, Carbono e Rastreabilidade",
    axis: "E",
    status: "nao_iniciado",
    answered: 0,
    total: 2,
    updatedAt: "-",
  },
  {
    id: "social-agro",
    title: "Condições do Trabalho no Campo",
    axis: "S",
    status: "nao_iniciado",
    answered: 0,
    total: 1,
    updatedAt: "-",
  },
  {
    id: "governance-agro",
    title: "Homologação de Cadeias Agrícolas",
    axis: "G",
    status: "nao_iniciado",
    answered: 0,
    total: 1,
    updatedAt: "-",
  },
];

export const agroQuestions: DiagnosticQuestion[] = [
  {
    id: "q-agro-1",
    sectionId: "environmental-agro",
    axis: "E",
    category: "Ambiental",
    prompt: "Como é feita a gestão do uso da terra e o controle do desmatamento (tanto legal quanto ilegal)?",
    hint: "Informe o uso de georreferenciamento e o Cadastro Ambiental Rural (CAR).",
    answer: "",
    hasEvidence: false,
    options: [
      "Não monitora o desmatamento ou a conformidade ambiental das terras.",
      "Possui apenas registro básico no CAR, sem monitoramento regular.",
      "CAR ativo e monitoramento periódico de imagens de satélite nas áreas de produção.",
      "Monitoramento contínuo por satélite de desmatamento zero, inclusive em áreas legais permitidas.",
      "Certificação de Carbono Neutro ativa e conservação de reservas além do mínimo exigido por lei."
    ]
  },
  {
    id: "q-agro-2",
    sectionId: "environmental-agro",
    axis: "E",
    category: "Ambiental",
    prompt: "Qual o nível de adoção de insumos e defensivos agrícolas biológicos versus químicos na produção?",
    hint: "Descreva o manejo integrado de pragas e práticas de agricultura regenerativa.",
    answer: "",
    hasEvidence: false,
    options: [
      "Uso intensivo de defensivos químicos sintéticos sem metas ou controle de redução.",
      "Uso de defensivos com orientação agronômica básica, buscando evitar excessos.",
      "Manejo Integrado de Pragas (MIP) ativo com medição e redução anual de químicos.",
      "Priorização do uso de biológicos, aplicação direcionada por drones e agricultura de precisão.",
      "Manejo 100% biológico e regenerativo certificado com comprovação de enriquecimento do solo."
    ]
  },
  {
    id: "q-agro-3",
    sectionId: "social-agro",
    axis: "S",
    category: "Social",
    prompt: "Como a empresa monitora e assegura condições dignas de trabalho aos trabalhadores temporários e sazonais no campo?",
    hint: "Explicite o controle de alojamentos, EPIs rurais e jornada de trabalho no campo.",
    answer: "",
    hasEvidence: false,
    options: [
      "Sem monitoramento diferenciado para trabalhadores sazonais ou de safra.",
      "Exige contratos formais e de acordo com a legislação trabalhista, sem auditorias práticas.",
      "Fiscalização interna mensal de alojamentos, transporte e fornecimento obrigatório de EPIs.",
      "Auditorias externas frequentes, programas de capacitação e inclusão social dos temporários.",
      "Selo ou certificação de comércio justo (Fair Trade) atestando direitos humanos de alto padrão no campo."
    ]
  },
  {
    id: "q-agro-4",
    sectionId: "governance-agro",
    axis: "G",
    category: "Governança",
    prompt: "Como é estruturada a rastreabilidade socioambiental da cadeia de suprimentos de grãos ou insumos agrícolas?",
    hint: "Indique como a empresa evita comprar de terras desmatadas ilegalmente ou em áreas indígenas.",
    answer: "",
    hasEvidence: false,
    options: [
      "Não possui controle sobre a procedência socioambiental das matérias-primas e grãos comprados.",
      "Rastreamento parcial baseado apenas em notas fiscais e declarações simples de produtores.",
      "Rastreamento completo de todos os fornecedores diretos até a fazenda produtora de origem.",
      "Rastreamento em tempo real auditado por terceiros contra embargos ambientais e terras indígenas.",
      "Rastreabilidade automatizada via Blockchain integrada a bancos de dados públicos de infrações socioambientais."
    ]
  }
];

export const segmentQuestionsMap: Record<string, DiagnosticQuestion[]> = {
  "Construção Civil": civilQuestions,
  "Agronegócio": agroQuestions,
};

export const segmentSectionsMap: Record<string, DiagnosticSection[]> = {
  "Construção Civil": civilSections,
  "Agronegócio": agroSections,
};


export const evidences: EvidenceItem[] = [
  {
    id: "ev-1",
    questionId: "q1",
    title: "Relatório de consumo energético",
    fileName: "energia_q1_2026.pdf",
    axis: "E",
    uploadedAt: "15 abr 2026",
    owner: "Ana Pires",
    status: "validado",
  },
  {
    id: "ev-2",
    questionId: "q3",
    title: "Política de SST",
    fileName: "politica_sst_v3.pdf",
    axis: "S",
    uploadedAt: "13 abr 2026",
    owner: "Carlos Mota",
    status: "validado",
  },
  {
    id: "ev-3",
    questionId: "q2",
    title: "Plano preliminar de emissões",
    fileName: "plano_emissoes_draft.docx",
    axis: "E",
    uploadedAt: "14 abr 2026",
    owner: "Ana Pires",
    status: "pendente",
  },
];

export const scoreByAxis: ScoreAxis[] = [
  {
    axis: "E",
    score: 69,
    interpretation: "Estrutura inicial sólida, faltam metas formais de longo prazo.",
  },
  {
    axis: "B",
    score: 74,
    interpretation: "Bioeconomia circular em evolução, com práticas já adotadas na cadeia e espaço para escalonamento.",
  },
  {
    axis: "S",
    score: 81,
    interpretation: "Boas práticas já consolidadas em saúde e desenvolvimento humano.",
  },
  {
    axis: "G",
    score: 58,
    interpretation: "Governança em estágio inicial, com oportunidades em compliance.",
  },
];

export const priorityActions: ImprovementAction[] = [
  {
    id: "a1",
    title: "Definir meta de redução de emissões com baseline aprovado",
    owner: "Operações + Sustentabilidade",
    priority: "alta",
    dueDate: "30 mai 2026",
  },
  {
    id: "a2",
    title: "Formalizar SLA e comitê de tratamento para canal de denúncias",
    owner: "Jurídico e Compliance",
    priority: "alta",
    dueDate: "20 jun 2026",
  },
  {
    id: "a3",
    title: "Padronizar evidências por pergunta para auditoria futura",
    owner: "PMO ESG",
    priority: "media",
    dueDate: "10 jun 2026",
  },
];

export const suppliers: Supplier[] = [
  {
    id: "sup-1",
    companyName: "EcoPack Embalagens Ltda",
    contactEmail: "contato@ecopack.com.br",
    status: "respondido",
    progress: 100,
    invitedAt: "02 abr 2026",
    lastUpdate: "11 abr 2026",
  },
  {
    id: "sup-2",
    companyName: "TransLog Verde",
    contactEmail: "esg@translogverde.com",
    status: "em_andamento",
    progress: 64,
    invitedAt: "05 abr 2026",
    lastUpdate: "14 abr 2026",
  },
  {
    id: "sup-3",
    companyName: "BioInsumos Nordeste",
    contactEmail: "time@bioinsumos.com",
    status: "pendente",
    progress: 0,
    invitedAt: "09 abr 2026",
    lastUpdate: "09 abr 2026",
  },
  {
    id: "sup-4",
    companyName: "Químicos Delta",
    contactEmail: "compliance@deltaq.com",
    status: "expirado",
    progress: 0,
    invitedAt: "20 mar 2026",
    lastUpdate: "03 abr 2026",
  },
];

export const inviteBalance: InviteBalance = {
  acquired: 30,
  used: 24,
  available: 6,
};

export const workspaceStages: WorkspaceStage[] = [
  {
    id: "diagnostic",
    title: "Diagnóstico ESG",
    description: "Responder o formulário, fechar pendências e preparar envio do ciclo atual.",
    status: "em_andamento",
    metric: "34 de 50 respostas concluídas",
    href: "/app/diagnostico",
  },
  {
    id: "evidences",
    title: "Evidências e documentos",
    description: "Garantir comprovação das respostas para auditoria, clientes e investidores.",
    status: "critico",
    metric: "7 pendências sem documento anexado",
    href: "/app/evidencias",
  },
  {
    id: "suppliers",
    title: "Cadeia de fornecedores",
    description: "Acompanhar adesão da rede convidada e cobrar preenchimentos em atraso.",
    status: "em_andamento",
    metric: "11 de 18 fornecedores responderam",
    href: "/app/fornecedores",
  },
  {
    id: "monetization",
    title: "Convites e monetização",
    description: "Controlar saldo de convites e manter a operação da cadeia sem bloqueio.",
    status: "bloqueado",
    metric: "Saldo de 6 convites antes da próxima compra",
    href: "/app/convites/comprar",
  },
];

export const workspaceTasks: WorkspaceTask[] = [
  {
    id: "task-evidence",
    title: "Anexar evidências das respostas já preenchidas",
    description: "Existem perguntas respondidas sem comprovação documental, o que reduz rastreabilidade e confiança no score.",
    href: "/app/evidencias",
    tone: "warning",
  },
  {
    id: "task-governance",
    title: "Iniciar o eixo de governança e compliance",
    description: "O eixo G ainda não começou e tende a limitar maturidade e leitura executiva do diagnóstico.",
    href: "/app/diagnostico/preencher",
    tone: "default",
  },
  {
    id: "task-suppliers",
    title: "Retomar fornecedores pendentes ou expirados",
    description: "Sua cadeia já tem adesão inicial, mas ainda há fornecedores sem resposta ou com convite vencido.",
    href: "/app/fornecedores",
    tone: "default",
  },
  {
    id: "task-invites",
    title: "Reforçar o saldo de convites para não travar expansão",
    description: "O volume disponível está perto do limite operacional para novas ondas de convite.",
    href: "/app/convites/comprar",
    tone: "warning",
  },
];

export const invitePackages: InvitePackage[] = [
  {
    id: "pkg-15-30",
    name: "Pacote Bronze",
    minInvites: 15,
    maxInvites: 30,
    pricePerInvite: 50,
  },
  {
    id: "pkg-31-50",
    name: "Pacote Prata",
    minInvites: 31,
    maxInvites: 50,
    pricePerInvite: 50,
    highlight: true,
  },
  {
    id: "pkg-51-70",
    name: "Pacote Ouro",
    minInvites: 51,
    maxInvites: 70,
    pricePerInvite: 50,
  },
  {
    id: "pkg-71-90",
    name: "Pacote Platina",
    minInvites: 71,
    maxInvites: 90,
    pricePerInvite: 50,
  },
  {
    id: "pkg-100",
    name: "Pacote Diamante",
    minInvites: 100,
    maxInvites: 100,
    pricePerInvite: 50,
  },
];

export const reportSummary: ReportSummary = {
  generatedAt: "15 abr 2026",
  maturity: "Nível 3 - Estruturado",
  strengths: [
    "Governança de saúde e segurança com rituais trimestrais",
    "Monitoramento de consumo energético por unidade operacional",
    "Iniciativas de bioeconomia circular com reaproveitamento de insumos",
    "Engajamento inicial da cadeia de fornecedores acima de 60%",
  ],
  gaps: [
    "Ausência de meta formal e aprovada de emissões",
    "Formalização insuficiente do pilar de bioeconomia circular",
    "Canal de denúncias sem SLA público",
    "Padronização incompleta de evidências por resposta",
  ],
  nextCycleDate: "15 ago 2026",
};
