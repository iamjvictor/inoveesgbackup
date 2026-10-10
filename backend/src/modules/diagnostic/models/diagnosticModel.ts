import { Axis } from "@prisma/client";
export { infrastructureDiagnosticQuestions } from "./infrastructureDiagnosticQuestions.js";

export interface DiagnosticOption {
  value: number;
  text: string;
}

export interface DiagnosticQuestion {
  number: number;
  prompt: string;
  axis: Axis;
  category: string;
  weight?: number;
  type?: DiagnosticQuestionPriority;
  options: DiagnosticOption[];
}

export interface DiagnosticStartQuestion {
  number: number;
  prompt: string;
  axis: Axis;
  category: string;
  weight?: number;
  type?: DiagnosticQuestionPriority;
  options: DiagnosticOption[];
}

export type DiagnosticQuestionPriority =
  | "ESSENTIAL"
  | "STRATEGIC"
  | "DIFFERENTIAL"
  | "COMPLEMENTARY";

export interface DiagnosticStartPayload {
  diagnosticId: string;
  industrySegment: string;
  questions: DiagnosticStartQuestion[];
}

export const AgroQuestions: Record<number, DiagnosticQuestion> = {
  1: {
    number: 1,
    prompt: "A empresa possui licenças ambientais válidas?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "ESSENTIAL",
    weight: 1.5,
    options: [
      { value: 1, text: "Inexistente (A prática não existe, não é discutida ou nunca foi implementada)" },
      { value: 2, text: "Inicial (Existem ações pontuais ou informais, mas sem padronização ou acompanhamento)" },
      { value: 3, text: "Parcialmente Implementado (A prática está implementada em parte da empresa, com algum controle ou monitoramento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, aplicada de forma consistente e monitorada regularmente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, possui metas, indicadores, melhoria contínua e/ou envolve cadeia de valor)" },
    ]
  },
  2: {
    number: 2,
    prompt: "Existe controle de consumo de água e energia?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  3: {
    number: 3,
    prompt: "A empresa separa resíduos e destina corretamente resíduos perigosos?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "ESSENTIAL",
    weight: 1.5,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  4: {
    number: 4,
    prompt: "Sua empresa possui um plano formal de gestão de resíduos que inclui a redução, reutilização e reciclagem?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  5: {
    number: 5,
    prompt: "Sua empresa estabelece metas claras e mensuráveis para a redução de resíduos e monitora o progresso?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "DIFFERENTIAL",
    weight: 1,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  6: {
    number: 6,
    prompt: "Sua empresa implementa programas de educação para colaboradores e fornecedores sobre gestão de resíduos e economia circular?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "COMPLEMENTARY",
    weight: 0.75,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  7: {
    number: 7,
    prompt: "Sua empresa monitora e busca reduzir o consumo de água em suas operações?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  8: {
    number: 8,
    prompt: "Sua empresa implementa tecnologias ou processos que promovem o reuso ou reciclagem de água?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "DIFFERENTIAL",
    weight: 1,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  9: {
    number: 9,
    prompt: "Sua empresa avalia os riscos relacionados à escassez hídrica em suas operações e cadeia de valor?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  10: {
    number: 10,
    prompt: "Quais são as fontes de energia utilizadas e há iniciativas para o uso de energias renováveis?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  11: {
    number: 11,
    prompt: "Sua empresa possui metas e ou um plano de transição para aumentar a participação de energias renováveis?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "DIFFERENTIAL",
    weight: 1,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  12: {
    number: 12,
    prompt: "Sua empresa possui iniciativas para proteger a biodiversidade local ou restaurar ecossistemas?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  13: {
    number: 13,
    prompt: "Sua empresa realiza avaliações de impacto na biodiversidade antes de iniciar novos projetos?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "ESSENTIAL",
    weight: 1.5,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  14: {
    number: 14,
    prompt: "Sua empresa busca ativamente fornecedores que demonstrem compromisso com a conservação da biodiversidade?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "DIFFERENTIAL",
    weight: 1,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  15: {
    number: 15,
    prompt: "Sua empresa mede e reporta suas emissões de Gases de Efeito Estufa (GEE)?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "ESSENTIAL",
    weight: 1.5,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  16: {
    number: 16,
    prompt: "Sua empresa possui um plano de descarbonização com metas de redução de GEE de curto, médio e longo prazo?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "ESSENTIAL",
    weight: 1.5,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  17: {
    number: 17,
    prompt: "Sua empresa engaja sua cadeia de valor (fornecedores e clientes) na redução de emissões de GEE (Escopo 3)?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  18: {
    number: 18,
    prompt: "A empresa prioriza fornecedores locais?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia Circular",
    type: "ESSENTIAL",
    weight: 1.5,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  19: {
    number: 19,
    prompt: "A empresa utiliza embalagens sustentáveis ou recicláveis?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia Circular",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  20: {
    number: 20,
    prompt: "Destina resíduos orgânicos para reaproveitamento?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia Circular",
    type: "ESSENTIAL",
    weight: 1.5,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  21: {
    number: 21,
    prompt: "Como sua empresa faz a gestão do ACV (Avaliação do Ciclo de Vida) de seus produtos ou serviços?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia Circular",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  22: {
    number: 22,
    prompt: "Sua empresa utiliza os resultados da ACV para inovar e redesenhar produtos ou processos?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia Circular",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  23: {
    number: 23,
    prompt: "Sua empresa comunica de forma transparente os resultados da ACV aos seus stakeholders?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia Circular",
    type: "DIFFERENTIAL",
    weight: 1,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  24: {
    number: 24,
    prompt: "Como sua empresa integra princípios da economia circular em seu modelo de negócios (design para durabilidade, etc.)?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia Circular",
    type: "ESSENTIAL",
    weight: 1.5,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  25: {
    number: 25,
    prompt: "Sua empresa possui parcerias para criar cadeias de valor circular ou simbiose industriais?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia Circular",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  26: {
    number: 26,
    prompt: "Sua empresa oferece programas de logística reversa ou take-back para seus produtos?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia Circular",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  27: {
    number: 27,
    prompt: "Sua empresa utiliza matérias-primas de origem biológica renovável ou subproduto de outras indústrias?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia Circular",
    type: "DIFFERENTIAL",
    weight: 1,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  28: {
    number: 28,
    prompt: "Sua empresa investe em P&D para substituir materiais de origem fóssil por alternativas biológicas?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia Circular",
    type: "DIFFERENTIAL",
    weight: 1,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  29: {
    number: 29,
    prompt: "Sua empresa adota práticas de agricultura regenerativa ou sustentável?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia Circular",
    type: "COMPLEMENTARY",
    weight: 0.75,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  30: {
    number: 30,
    prompt: "Sua empresa colabora com agricultores ou instituições de pesquisa para desenvolver práticas bioeconômicas inovadoras?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia Circular",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  31: {
    number: 31,
    prompt: "Sua empresa avalia e reporta os benefícios ambientais e sociais de suas práticas bioeconômicas?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia Circular",
    type: "ESSENTIAL",
    weight: 1.5,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  32: {
    number: 32,
    prompt: "Todos os colaboradores estão formalizados?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "ESSENTIAL",
    weight: 1.5,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  33: {
    number: 33,
    prompt: "A empresa fornece EPIs e treinamentos de segurança?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "ESSENTIAL",
    weight: 1.5,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  34: {
    number: 34,
    prompt: "Existe canal de comunicação com colaboradores?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  35: {
    number: 35,
    prompt: "Sua empresa possui um código de conduta ou política ética que aborda direitos humanos e trabalho justo?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  36: {
    number: 36,
    prompt: "Sua empresa realiza due diligence em sua cadeia de suprimentos para mitigar riscos de direitos humanos?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "DIFFERENTIAL",
    weight: 1,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  37: {
    number: 37,
    prompt: "Sua empresa possui mecanismos para garantir que os salários e benefícios sejam justos e equitativos?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  38: {
    number: 38,
    prompt: "Sua empresa promove a diversidade e inclusão (gênero, raça, idade, PCD - Pessoas com Deficiência) em seu quadro de funcionários e liderança?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  39: {
    number: 39,
    prompt: "Sua empresa estabelece metas e indicadores para aumentar a representatividade de grupos sub-representados?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  40: {
    number: 40,
    prompt: "Sua empresa oferece um ambiente de trabalho inclusivo, com políticas de não discriminação e acessibilidade?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "ESSENTIAL",
    weight: 1.5,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  41: {
    number: 41,
    prompt: "Sua empresa investe em programas de desenvolvimento profissional e treinamento para seus colaboradores?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  42: {
    number: 42,
    prompt: "Sua empresa oferece oportunidades de desenvolvimento de carreira e mobilidade interna?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "DIFFERENTIAL",
    weight: 1,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  43: {
    number: 43,
    prompt: "Sua empresa avalia a eficácia dos programas de treinamento no aprimoramento das competências dos colaboradores?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  44: {
    number: 44,
    prompt: "Como sua empresa se relaciona com a comunidade local e quais são os impactos sociais positivos gerados?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "DIFFERENTIAL",
    weight: 1,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  45: {
    number: 45,
    prompt: "Sua empresa realiza consultas e engajamento com a comunidade local para entender suas necessidades?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  46: {
    number: 46,
    prompt: "Sua empresa investe em programas de desenvolvimento socioeconômico local (emprego, educação, saúde)?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  47: {
    number: 47,
    prompt: "Sua empresa garante condições de trabalho seguras e saudáveis para todos os colaboradores?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  48: {
    number: 48,
    prompt: "Sua empresa realiza avaliações de risco ergonômico e psicossocial no ambiente de trabalho?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "ESSENTIAL",
    weight: 1.5,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  49: {
    number: 49,
    prompt: "Sua empresa oferece programas de promoção da saúde e prevenção de doenças para seus colaboradores?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "DIFFERENTIAL",
    weight: 1,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  50: {
    number: 50,
    prompt: "Sua equipe reflete uma mistura de sabedoria experiente e ideias inovadoras do pessoal jovem?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "COMPLEMENTARY",
    weight: 0.75,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  51: {
    number: 51,
    prompt: "Sua empresa possui programas formais de mentoria ou sucessão para troca de conhecimento entre gerações?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  52: {
    number: 52,
    prompt: "Como sua empresa incentiva a inovação, valorizando a contribuição de todos os colaboradores?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "ESSENTIAL",
    weight: 1.5,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  53: {
    number: 53,
    prompt: "A empresa possui toda a documentação legal e licenças de operação em dia?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  54: {
    number: 54,
    prompt: "Existem papéis e responsabilidades definidos entre sócios e gestores?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  55: {
    number: 55,
    prompt: "A empresa possui valores ou código de conduta simplificado?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  56: {
    number: 56,
    prompt: "Como a empresa organiza contratos e documentos legais?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  57: {
    number: 57,
    prompt: "A empresa realiza controle contábil e financeiro organizado?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  58: {
    number: 58,
    prompt: "Sua empresa possui um conselho ou comitê de governança que supervisiona as práticas ESG?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  59: {
    number: 59,
    prompt: "Qual a frequência das reuniões e como as decisões ESG são integradas à estratégia geral?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  60: {
    number: 60,
    prompt: "A composição do conselho/comitê reflete diversidade (gênero, raça, idade, experiência)?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  61: {
    number: 61,
    prompt: "Como sua empresa garante a transparência e a prestação de contas sobre seu desempenho ESG?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  62: {
    number: 62,
    prompt: "Sua empresa realiza auditorias externas independentes para verificar os dados e relatórios ESG?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  63: {
    number: 63,
    prompt: "Sua empresa possui um canal de denúncias éticas acessível e confidencial?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  64: {
    number: 64,
    prompt: "Sua empresa possui políticas claras de proteção de dados pessoais (LGPD)?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  65: {
    number: 65,
    prompt: "Sua empresa realiza avaliações de impacto à proteção de dados (DPIA) para novos projetos?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  66: {
    number: 66,
    prompt: "Sua empresa possui um Encarregado de Dados (DPO) ou comitê responsável pela proteção de dados?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  67: {
    number: 67,
    prompt: "A matriz de dupla materialidade já está integrada à estratégia geral da empresa?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  68: {
    number: 68,
    prompt: "Sua empresa envolve stakeholders no processo de identificação e priorização de temas materiais?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  69: {
    number: 69,
    prompt: "Como os temas materiais influenciam a alocação de recursos e o desenvolvimento de novos produtos/serviços?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  70: {
    number: 70,
    prompt: "Como a comunicação interna e externa influencia as tomadas de decisão visando inovação?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  71: {
    number: 71,
    prompt: "Sua empresa possui um processo formal para coletar, analisar e responder ao feedback de stakeholders?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "DIFFERENTIAL",
    weight: 1,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  72: {
    number: 72,
    prompt: "Como a empresa utiliza as informações de comunicação para identificar tendências e antecipar riscos ESG?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  73: {
    number: 73,
    prompt: "Sua empresa possui mecanismos para identificar, avaliar e gerenciar riscos e oportunidades ESG?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  74: {
    number: 74,
    prompt: "Sua empresa integra a avaliação de riscos e oportunidades ESG em seu planejamento estratégico?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
  75: {
    number: 75,
    prompt: "Sua empresa realiza due diligence ESG em sua cadeia de suprimentos e em potenciais parceiros?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: [
      { value: 1, text: "Inexistente (A prática não existe ou nunca foi considerada)" },
      { value: 2, text: "Inicial (Existem iniciativas pontuais ou informais, sem padronização)" },
      { value: 3, text: "Parcialmente Implementado (A prática ocorre em parte da empresa e possui algum acompanhamento)" },
      { value: 4, text: "Estruturado (A prática é formalizada, monitorada e aplicada de forma consistente)" },
      { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, com metas, indicadores, inovação e engajamento da cadeia de valor)" },
    ]
  },
};

export const diagnosticQuestionsList: DiagnosticQuestion[] = Object.values(AgroQuestions);
export const agroDiagnosticQuestions: DiagnosticQuestion[] = diagnosticQuestionsList;

const standardMaturityOptions: DiagnosticOption[] = [
  { value: 1, text: "Inexistente (A prática não existe, não é discutida ou nunca foi implementada)" },
  { value: 2, text: "Inicial (Existem ações pontuais ou informais, mas sem padronização ou acompanhamento)" },
  { value: 3, text: "Parcialmente Implementado (A prática está implementada em parte da empresa, com algum controle ou monitoramento)" },
  { value: 4, text: "Estruturado (A prática é formalizada, aplicada de forma consistente e monitorada regularmente)" },
  { value: 5, text: "Avançado / Estratégico (A prática é integrada à estratégia da empresa, possui metas, indicadores, melhoria contínua e/ou envolve cadeia de valor)" },
];

export const oilAndGasDiagnosticQuestions: DiagnosticQuestion[] = [
  // EIXO 1 — AMBIENTAL E CLIMÁTICO (21 Questões)
  {
    number: 1,
    prompt: "A empresa possui todas as licenças, autorizações e requisitos ambientais aplicáveis às suas atividades?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 2,
    prompt: "A empresa possui um sistema ou procedimento para identificar, controlar e monitorar seus principais impactos ambientais?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 3,
    prompt: "A empresa monitora o consumo de água, energia, combustíveis e outros recursos naturais utilizados em suas operações?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 4,
    prompt: "A empresa possui metas ou iniciativas para reduzir o consumo de água em suas operações?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 5,
    prompt: "A empresa adota tecnologias ou práticas de reuso, tratamento ou reciclagem da água?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "DIFFERENTIAL",
    weight: 1.0,
    options: standardMaturityOptions,
  },
  {
    number: 6,
    prompt: "A empresa avalia riscos relacionados à disponibilidade, escassez ou contaminação da água em suas operações?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 7,
    prompt: "A empresa identifica e monitora as fontes de energia e combustíveis utilizadas em suas operações?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 8,
    prompt: "A empresa possui iniciativas ou metas para aumentar a eficiência energética e reduzir o consumo de combustíveis fósseis?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 9,
    prompt: "A empresa utiliza ou avalia a utilização de fontes de energia renovável ou de menor impacto ambiental?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "DIFFERENTIAL",
    weight: 1.0,
    options: standardMaturityOptions,
  },
  {
    number: 10,
    prompt: "A empresa realiza a segregação, armazenamento, transporte e destinação adequada dos resíduos gerados, especialmente resíduos perigosos?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 11,
    prompt: "A empresa possui um plano ou procedimento formal de gestão e redução de resíduos?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 12,
    prompt: "A empresa estabelece metas ou indicadores para redução, reutilização, reciclagem ou reaproveitamento de materiais?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "DIFFERENTIAL",
    weight: 1.0,
    options: standardMaturityOptions,
  },
  {
    number: 13,
    prompt: "A empresa possui programas de treinamento ou orientação ambiental para colaboradores e terceiros relacionados à gestão de resíduos e prevenção da poluição?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "DIFFERENTIAL",
    weight: 1.0,
    options: standardMaturityOptions,
  },
  {
    number: 14,
    prompt: "A empresa identifica os potenciais impactos de suas atividades sobre biodiversidade, ecossistemas ou áreas ambientalmente sensíveis?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 15,
    prompt: "A empresa adota medidas de prevenção, mitigação, recuperação ou compensação de impactos ambientais quando aplicável?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 16,
    prompt: "A empresa considera critérios ambientais na seleção e contratação de seus próprios fornecedores e prestadores de serviços?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 17,
    prompt: "A empresa realiza ou possui capacidade de realizar o inventário de suas emissões de Gases de Efeito Estufa?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 18,
    prompt: "A empresa possui dados sobre consumo de combustíveis, energia elétrica, transporte ou outras fontes relevantes para o cálculo de emissões?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 19,
    prompt: "A empresa possui metas, iniciativas ou planos para redução de suas emissões de GEE?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 20,
    prompt: "A empresa identifica quais de suas atividades, produtos ou serviços podem contribuir para as emissões da cadeia de valor de seus clientes?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 21,
    prompt: "A empresa possui capacidade de fornecer periodicamente dados ambientais e climáticos necessários para que seus clientes calculem e monitorem as emissões indiretas de Escopo 3?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },

  // EIXO 2 — SOCIAL (17 Questões)
  {
    number: 22,
    prompt: "Todos os trabalhadores e colaboradores da empresa atuam de acordo com as exigências legais e trabalhistas aplicáveis?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 23,
    prompt: "A empresa possui mecanismos para garantir condições justas de trabalho, remuneração e benefícios?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 24,
    prompt: "A empresa possui código de conduta, política ou diretrizes relacionadas a direitos humanos, trabalho digno e não discriminação?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 25,
    prompt: "A empresa avalia ou monitora riscos relacionados a direitos humanos em sua própria operação e cadeia de fornecedores?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 26,
    prompt: "A empresa fornece os Equipamentos de Proteção Individual e Coletiva necessários às atividades desenvolvidas?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 27,
    prompt: "A empresa realiza treinamentos periódicos de saúde, segurança e prevenção de acidentes?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 28,
    prompt: "A empresa possui procedimentos para identificar, avaliar e controlar riscos ocupacionais?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 29,
    prompt: "A empresa monitora acidentes, incidentes, quase acidentes e outros indicadores de saúde e segurança?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 30,
    prompt: "A empresa possui ações voltadas à promoção da saúde física e prevenção de doenças relacionadas ao trabalho?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 31,
    prompt: "A empresa considera riscos ergonômicos e psicossociais em suas práticas de gestão de pessoas?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 32,
    prompt: "A empresa promove diversidade e inclusão em seu quadro de colaboradores e em posições de liderança?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "DIFFERENTIAL",
    weight: 1.0,
    options: standardMaturityOptions,
  },
  {
    number: 33,
    prompt: "A empresa possui políticas ou práticas para prevenir discriminação, assédio e outras formas de violência no ambiente de trabalho?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 34,
    prompt: "A empresa estabelece ações, metas ou indicadores relacionados à inclusão de grupos sub-representados?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "DIFFERENTIAL",
    weight: 1.0,
    options: standardMaturityOptions,
  },
  {
    number: 35,
    prompt: "A empresa investe em capacitação e desenvolvimento profissional de seus colaboradores?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 36,
    prompt: "A empresa possui mecanismos para estimular inovação, compartilhamento de conhecimento e desenvolvimento de novas competências?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "DIFFERENTIAL",
    weight: 1.0,
    options: standardMaturityOptions,
  },
  {
    number: 37,
    prompt: "A empresa possui práticas de sucessão, mentoria ou transferência de conhecimento entre profissionais mais experientes e novas gerações?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "DIFFERENTIAL",
    weight: 1.0,
    options: standardMaturityOptions,
  },
  {
    number: 38,
    prompt: "A empresa identifica e acompanha os impactos sociais de suas operações sobre comunidades, territórios e demais partes interessadas, adotando ações para gerar impactos positivos ou mitigar impactos negativos?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },

  // EIXO 3 — GOVERNANÇA, ÉTICA E GESTÃO ESG (23 Questões)
  {
    number: 39,
    prompt: "A empresa mantém sua documentação societária, fiscal, trabalhista, regulatória e operacional atualizada?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 40,
    prompt: "Existem papéis, responsabilidades e níveis de decisão claramente definidos entre sócios, gestores e colaboradores?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 41,
    prompt: "A empresa possui processos organizados para gestão de contratos, documentos e obrigações com clientes e fornecedores?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 42,
    prompt: "A empresa possui controles contábeis e financeiros adequados ao porte e à complexidade de suas operações?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 43,
    prompt: "A empresa possui código de ética, código de conduta ou política equivalente?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 44,
    prompt: "A empresa possui diretrizes ou controles para prevenção de corrupção, fraude, conflito de interesses e outras práticas ilícitas?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 45,
    prompt: "A empresa possui um canal ou mecanismo para comunicação e tratamento de denúncias, irregularidades ou comportamentos antiéticos?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 46,
    prompt: "A empresa realiza treinamentos ou ações de conscientização sobre ética, integridade e conduta?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 47,
    prompt: "A empresa possui uma pessoa, equipe ou responsável definido para acompanhar questões ESG, sustentabilidade ou conformidade?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 48,
    prompt: "A alta liderança participa ou acompanha decisões relacionadas à sustentabilidade, riscos e desempenho ESG?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 49,
    prompt: "A empresa possui indicadores ou metas para acompanhar seu desempenho ambiental, social e de governança?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 50,
    prompt: "A empresa realiza reuniões ou processos periódicos para analisar resultados, riscos e oportunidades relacionados à sustentabilidade?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 51,
    prompt: "A empresa comunica informações relevantes sobre suas práticas ESG aos clientes, colaboradores ou demais partes interessadas?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "DIFFERENTIAL",
    weight: 1.0,
    options: standardMaturityOptions,
  },
  {
    number: 52,
    prompt: "A empresa possui processos para coletar, armazenar e atualizar dados ESG de forma organizada e verificável?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 53,
    prompt: "A empresa consegue disponibilizar evidências e documentos que comprovem as informações ESG declaradas?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 54,
    prompt: "A empresa realiza auditorias, verificações internas ou avaliações externas relacionadas à conformidade e sustentabilidade?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "DIFFERENTIAL",
    weight: 1.0,
    options: standardMaturityOptions,
  },
  {
    number: 55,
    prompt: "A empresa possui critérios para avaliar riscos e requisitos ESG de seus próprios fornecedores e parceiros?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 56,
    prompt: "A empresa realiza algum tipo de due diligence ou verificação de conformidade antes de contratar fornecedores ou parceiros críticos?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 57,
    prompt: "A empresa consegue identificar riscos ESG relevantes associados aos produtos, serviços ou matérias-primas adquiridos de terceiros?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 58,
    prompt: "A empresa identifica os temas ESG mais relevantes para seu negócio, seus clientes e demais partes interessadas?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 59,
    prompt: "A empresa possui mecanismos para receber, analisar e responder às demandas, reclamações ou expectativas de clientes, comunidades, trabalhadores e outros stakeholders?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 60,
    prompt: "A empresa possui políticas ou procedimentos para proteção de dados pessoais e informações confidenciais?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 61,
    prompt: "A empresa possui responsáveis e controles para identificar, avaliar e reduzir riscos relacionados à segurança da informação e à proteção de dados?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },

  // EIXO 4 — BIOECONOMIA, ECONOMIA CIRCULAR E INOVAÇÃO SUSTENTÁVEL (14 Questões)
  {
    number: 62,
    prompt: "A empresa avalia os impactos ambientais de seus produtos ou serviços ao longo de seu ciclo de vida?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia e Inovação",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 63,
    prompt: "A empresa utiliza informações sobre ciclo de vida para identificar oportunidades de redução de impactos ambientais ou emissões?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia e Inovação",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 64,
    prompt: "A empresa considera critérios de durabilidade, manutenção, reparabilidade, reutilização ou reciclabilidade no desenvolvimento ou aquisição de produtos e materiais?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia e Inovação",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 65,
    prompt: "A empresa possui iniciativas para reduzir o consumo de matérias-primas virgens por meio de reutilização, recuperação ou uso de materiais reciclados?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia e Inovação",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 66,
    prompt: "A empresa possui práticas para reaproveitamento, recuperação ou valorização de resíduos e subprodutos gerados em suas operações?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia e Inovação",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 67,
    prompt: "A empresa possui parcerias com outras empresas ou organizações para reaproveitamento de materiais, resíduos ou subprodutos?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia e Inovação",
    type: "DIFFERENTIAL",
    weight: 1.0,
    options: standardMaturityOptions,
  },
  {
    number: 68,
    prompt: "A empresa possui sistemas ou iniciativas de logística reversa, retorno, recolhimento ou recuperação de produtos e materiais?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia e Inovação",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 69,
    prompt: "A empresa utiliza ou avalia o uso de matérias-primas renováveis, de origem biológica sustentável ou provenientes de fontes circulares?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia e Inovação",
    type: "DIFFERENTIAL",
    weight: 1.0,
    options: standardMaturityOptions,
  },
  {
    number: 70,
    prompt: "A empresa investe ou participa de iniciativas para substituir materiais, insumos ou processos de maior impacto por alternativas de menor carbono ou origem renovável?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia e Inovação",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 71,
    prompt: "A empresa desenvolve, utiliza ou comercializa soluções que contribuam para redução da dependência de recursos não renováveis?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia e Inovação",
    type: "DIFFERENTIAL",
    weight: 1.0,
    options: standardMaturityOptions,
  },
  {
    number: 72,
    prompt: "A empresa investe ou participa de projetos de pesquisa, desenvolvimento e inovação voltados à sustentabilidade, descarbonização ou eficiência de recursos?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia e Inovação",
    type: "DIFFERENTIAL",
    weight: 1.0,
    options: standardMaturityOptions,
  },
  {
    number: 73,
    prompt: "A empresa possui parcerias com universidades, centros de pesquisa, startups ou outras organizações para desenvolver soluções sustentáveis?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia e Inovação",
    type: "DIFFERENTIAL",
    weight: 1.0,
    options: standardMaturityOptions,
  },
  {
    number: 74,
    prompt: "A empresa avalia ou mensura os benefícios ambientais, sociais ou econômicos das soluções inovadoras que desenvolve ou utiliza?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia e Inovação",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 75,
    prompt: "A empresa consegue demonstrar como seus produtos, serviços ou soluções contribuem para redução de emissões, resíduos, consumo de recursos ou outros impactos ao longo da cadeia de valor de seus clientes?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia e Inovação",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
];
export const AgroProdQuestions: Record<number, DiagnosticQuestion> = {
  1: {
    number: 1,
    prompt: "A empresa possui as licenças ambientais aplicáveis às suas atividades?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "ESSENTIAL",
    weight: 1.50,
    options: standardMaturityOptions
  },
  2: {
    number: 2,
    prompt: "Os resíduos gerados possuem destinação ambientalmente adequada?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "ESSENTIAL",
    weight: 1.50,
    options: standardMaturityOptions
  },
  3: {
    number: 3,
    prompt: "Existe procedimento para recolhimento ou destinação correta de embalagens de produtos, quando aplicável?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "ESSENTIAL",
    weight: 1.50,
    options: standardMaturityOptions
  },
  4: {
    number: 4,
    prompt: "A empresa monitora ou controla seu consumo de água?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions
  },
  5: {
    number: 5,
    prompt: "Existe controle do consumo de energia elétrica ou combustível?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions
  },
  6: {
    number: 6,
    prompt: "A empresa comercializa produtos com menor impacto ambiental ou alternativas sustentáveis?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions
  },
  7: {
    number: 7,
    prompt: "A empresa já recebeu autuação ambiental nos últimos cinco anos?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "ESSENTIAL",
    weight: 1.50,
    options: standardMaturityOptions
  },
  8: {
    number: 8,
    prompt: "Os colaboradores recebem treinamento sobre práticas ambientais?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "DIFFERENTIAL",
    weight: 1.00,
    options: standardMaturityOptions
  },
  9: {
    number: 9,
    prompt: "A empresa orienta seus clientes quanto ao uso correto dos produtos visando minimizar impactos ambientais?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions
  },
  10: {
    number: 10,
    prompt: "Existem metas ou ações para reduzir impactos ambientais?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions
  },
  11: {
    number: 11,
    prompt: "A empresa comercializa produtos ou soluções que contribuem para uma agricultura mais sustentável (bioinsumos, fertilizantes de menor impacto, tecnologias para uso eficiente de recursos, entre outros)?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia Circular",
    type: "ESSENTIAL",
    weight: 1.50,
    options: standardMaturityOptions
  },
  12: {
    number: 12,
    prompt: "A empresa conhece e consegue informar a origem dos principais produtos que comercializa?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia Circular",
    type: "ESSENTIAL",
    weight: 1.50,
    options: standardMaturityOptions
  },
  13: {
    number: 13,
    prompt: "A empresa adota práticas para reduzir desperdícios de materiais, embalagens ou recursos durante suas operações?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia Circular",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions
  },
  14: {
    number: 14,
    prompt: "A empresa orienta ou participa de programas de recolhimento, reciclagem ou destinação adequada de embalagens e materiais utilizados pelos clientes?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia Circular",
    type: "ESSENTIAL",
    weight: 1.50,
    options: standardMaturityOptions
  },
  15: {
    number: 15,
    prompt: "A empresa busca constantemente novas tecnologias, produtos ou soluções que reduzam impactos ambientais na produção agrícola?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia Circular",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions
  },
  16: {
    number: 16,
    prompt: "A empresa oferece orientação técnica para promover o uso correto e eficiente dos produtos comercializados?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia Circular",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions
  },
  17: {
    number: 17,
    prompt: "A empresa possui ações para reduzir o uso de embalagens ou prioriza embalagens recicláveis, reutilizáveis ou de menor impacto ambiental?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia Circular",
    type: "DIFFERENTIAL",
    weight: 1.00,
    options: standardMaturityOptions
  },
  18: {
    number: 18,
    prompt: "A empresa possui metas, projetos ou iniciativas voltadas ao fortalecimento da bioeconomia e da agricultura sustentável?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia Circular",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions
  },
  19: {
    number: 19,
    prompt: "A empresa cumpre a legislação trabalhista e mantém seus colaboradores regularmente contratados?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "ESSENTIAL",
    weight: 1.50,
    options: standardMaturityOptions
  },
  20: {
    number: 20,
    prompt: "A empresa adota medidas para proteger a saúde e a segurança dos colaboradores durante suas atividades?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "ESSENTIAL",
    weight: 1.50,
    options: standardMaturityOptions
  },
  21: {
    number: 21,
    prompt: "Os colaboradores recebem treinamentos relacionados às atividades que desempenham e ao uso seguro dos produtos ou equipamentos?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions
  },
  22: {
    number: 22,
    prompt: "A empresa possui práticas que previnem discriminação, assédio, trabalho infantil, trabalho forçado ou qualquer forma de violação dos direitos humanos?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "ESSENTIAL",
    weight: 1.50,
    options: standardMaturityOptions
  },
  23: {
    number: 23,
    prompt: "A empresa mantém canais de atendimento e orienta seus clientes quanto ao uso correto e seguro dos produtos comercializados?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions
  },
  24: {
    number: 24,
    prompt: "A empresa participa ou apoia iniciativas voltadas ao desenvolvimento da comunidade onde atua?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "DIFFERENTIAL",
    weight: 1.00,
    options: standardMaturityOptions
  },
  25: {
    number: 25,
    prompt: "A empresa promove ações para valorização, desenvolvimento ou bem-estar de seus colaboradores?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions
  },
  26: {
    number: 26,
    prompt: "A empresa demonstra compromisso com práticas de responsabilidade social como parte de sua gestão?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions
  },
  27: {
    number: 27,
    prompt: "A empresa mantém sua documentação fiscal, cadastral e regulatória atualizada e regular?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.50,
    options: standardMaturityOptions
  },
  28: {
    number: 28,
    prompt: "A empresa possui princípios de conduta ética conhecidos e praticados por seus colaboradores?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.50,
    options: standardMaturityOptions
  },
  29: {
    number: 29,
    prompt: "A empresa monitora e busca atender às legislações aplicáveis ao seu ramo de atuação?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.50,
    options: standardMaturityOptions
  },
  30: {
    number: 30,
    prompt: "A empresa mantém organizados os documentos necessários para comprovar suas operações, produtos e serviços?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions
  },
  31: {
    number: 31,
    prompt: "A empresa consegue identificar a origem dos produtos comercializados e fornecer evidências quando solicitado?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.50,
    options: standardMaturityOptions
  },
  32: {
    number: 32,
    prompt: "A empresa possui critérios para selecionar e acompanhar seus próprios fornecedores?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions
  },
  33: {
    number: 33,
    prompt: "A empresa fornece informações claras, completas e tempestivas aos seus clientes quando solicitado?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions
  },
  34: {
    number: 34,
    prompt: "A empresa identifica e trata risks que possam comprometer seus produtos, serviços ou fornecimento?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions
  },
  35: {
    number: 35,
    prompt: "A empresa revisa periodicamente seus processos buscando melhorar a qualidade, a sustentabilidade e a eficiência de suas operações?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions
  },
  36: {
    number: 36,
    prompt: "A direção da empresa demonstra compromisso com práticas de sustentabilidade e com o atendimento aos requisitos dos clientes?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.50,
    options: standardMaturityOptions
  }
};

export const agroProdQuestionsList: DiagnosticQuestion[] = Object.values(AgroProdQuestions);

const agroIndMaturityOptions: DiagnosticOption[] = [
  { value: 1, text: "Inexistente – A prática não existe ou nunca foi considerada pela empresa." },
  { value: 2, text: "Inicial – Existem iniciativas pontuais ou informais, sem padronização ou registro." },
  { value: 3, text: "Parcialmente Implementado – A prática está implementada em parte da empresa e possui algum acompanhamento." },
  { value: 4, text: "Estruturado – A prática é formalizada, aplicada de forma consistente e monitorada." },
  { value: 5, text: "Avançado / Estratégico – A prática está integrada à gestão da empresa, possui indicadores, metas e é continuamente aperfeiçoada." },
];

export const AgroIndQuestions: Record<number, DiagnosticQuestion> = {
  1: {
    number: 1,
    prompt: "A empresa mantém suas licenças, autorizações e demais requisitos ambientais aplicáveis regularmente atualizados?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "ESSENTIAL",
    weight: 1.50,
    options: agroIndMaturityOptions
  },
  2: {
    number: 2,
    prompt: "A empresa realiza a segregação, armazenamento e destinação adequada dos resíduos gerados em suas operações?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "ESSENTIAL",
    weight: 1.50,
    options: agroIndMaturityOptions
  },
  3: {
    number: 3,
    prompt: "A empresa monitora e busca reduzir o consumo de energia em seus processos produtivos?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: agroIndMaturityOptions
  },
  4: {
    number: 4,
    prompt: "A empresa monitora o consumo de água e adota ações para seu uso eficiente?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: agroIndMaturityOptions
  },
  5: {
    number: 5,
    prompt: "A empresa identifica e controla emissões atmosféricas, poeiras, ruídos ou outros impactos ambientais decorrentes de suas atividades?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: agroIndMaturityOptions
  },
  6: {
    number: 6,
    prompt: "A empresa desenvolve ou comercializa produtos que contribuam para redução dos impactos ambientais de seus clientes?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: agroIndMaturityOptions
  },
  7: {
    number: 7,
    prompt: "A empresa possui procedimentos para armazenamento, manuseio e descarte seguro de produtos químicos e substâncias perigosas, quando aplicável?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "ESSENTIAL",
    weight: 1.50,
    options: agroIndMaturityOptions
  },
  8: {
    number: 8,
    prompt: "Os colaboradores recebem treinamentos relacionados às práticas ambientais da empresa?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "DIFFERENTIAL",
    weight: 1.00,
    options: agroIndMaturityOptions
  },
  9: {
    number: 9,
    prompt: "A empresa possui metas ou iniciativas voltadas à redução dos impactos ambientais de seus processos?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: agroIndMaturityOptions
  },
  10: {
    number: 10,
    prompt: "A empresa investe em tecnologias, processos ou equipamentos que reduzam impactos ambientais e aumentem a eficiência operacional?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: agroIndMaturityOptions
  },
  11: {
    number: 11,
    prompt: "A empresa desenvolve, fabrica ou comercializa produtos que contribuam para reduzir impactos ambientais ou aumentar a sustentabilidade de seus clientes?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia Circular",
    type: "ESSENTIAL",
    weight: 1.50,
    options: agroIndMaturityOptions
  },
  12: {
    number: 12,
    prompt: "A empresa conhece e consegue informar a origem das principais matérias-primas ou produtos utilizados em suas operações?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia Circular",
    type: "ESSENTIAL",
    weight: 1.50,
    options: agroIndMaturityOptions
  },
  13: {
    number: 13,
    prompt: "A empresa adota práticas para reduzir desperdícios de materiais, insumos ou recursos utilizados em seus processos?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia Circular",
    type: "STRATEGIC",
    weight: 1.25,
    options: agroIndMaturityOptions
  },
  14: {
    number: 14,
    prompt: "A empresa participa ou incentiva programas de recolhimento, reciclagem ou destinação adequada de produtos, componentes ou embalagens após o uso?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia Circular",
    type: "ESSENTIAL",
    weight: 1.50,
    options: agroIndMaturityOptions
  },
  15: {
    number: 15,
    prompt: "A empresa investe em tecnologias, processos ou soluções que contribuam para a sustentabilidade de seus produtos ou operações?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia Circular",
    type: "STRATEGIC",
    weight: 1.25,
    options: agroIndMaturityOptions
  },
  16: {
    number: 16,
    prompt: "A empresa oferece orientações técnicas para promover o uso correto, eficiente e sustentável de seus produtos ou equipamentos?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia Circular",
    type: "STRATEGIC",
    weight: 1.25,
    options: agroIndMaturityOptions
  },
  17: {
    number: 17,
    prompt: "A empresa adota práticas para reduzir o uso de embalagens ou prioriza materiais recicláveis, reutilizáveis ou de menor impacto ambiental?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia Circular",
    type: "DIFFERENTIAL",
    weight: 1.00,
    options: agroIndMaturityOptions
  },
  18: {
    number: 18,
    prompt: "A empresa possui metas, projetos ou iniciativas voltadas ao fortalecimento da bioeconomia, da economia circular ou da sustentabilidade?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia Circular",
    type: "STRATEGIC",
    weight: 1.25,
    options: agroIndMaturityOptions
  },
  19: {
    number: 19,
    prompt: "A empresa cumpre a legislação trabalhista e mantém seus colaboradores regularmente contratados?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "ESSENTIAL",
    weight: 1.50,
    options: agroIndMaturityOptions
  },
  20: {
    number: 20,
    prompt: "A empresa adota medidas para proteger a saúde e a segurança dos colaboradores durante suas atividades?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "ESSENTIAL",
    weight: 1.50,
    options: agroIndMaturityOptions
  },
  21: {
    number: 21,
    prompt: "Os colaboradores recebem treinamentos relacionados às atividades que desempenham e ao uso seguro dos equipamentos, máquinas ou produtos?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: agroIndMaturityOptions
  },
  22: {
    number: 22,
    prompt: "A empresa possui práticas que previnem discriminação, assédio, trabalho infantil, trabalho forçado ou qualquer forma de violação dos direitos humanos?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "ESSENTIAL",
    weight: 1.50,
    options: agroIndMaturityOptions
  },
  23: {
    number: 23,
    prompt: "A empresa mantém canais de atendimento e orienta seus clientes quanto ao uso correto, seguro e eficiente de seus produtos ou equipamentos?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: agroIndMaturityOptions
  },
  24: {
    number: 24,
    prompt: "A empresa participa ou apoia iniciativas voltadas ao desenvolvimento da comunidade onde atua?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "DIFFERENTIAL",
    weight: 1.00,
    options: agroIndMaturityOptions
  },
  25: {
    number: 25,
    prompt: "A empresa promove ações para valorização, desenvolvimento ou bem-estar de seus colaboradores?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: agroIndMaturityOptions
  },
  26: {
    number: 26,
    prompt: "A empresa demonstra compromisso com práticas de responsabilidade social como parte de sua gestão?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: agroIndMaturityOptions
  },
  27: {
    number: 27,
    prompt: "A empresa mantém sua documentação fiscal, cadastral e regulatória atualizada e regular?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.50,
    options: agroIndMaturityOptions
  },
  28: {
    number: 28,
    prompt: "A empresa possui princípios de conduta ética conhecidos e praticados por seus colaboradores?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.50,
    options: agroIndMaturityOptions
  },
  29: {
    number: 29,
    prompt: "A empresa monitora e busca atender às legislações aplicáveis ao seu ramo de atuação?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.50,
    options: agroIndMaturityOptions
  },
  30: {
    number: 30,
    prompt: "A empresa mantém organizados os documentos necessários para comprovar suas operações, produtos e serviços?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: agroIndMaturityOptions
  },
  31: {
    number: 31,
    prompt: "A empresa consegue identificar a origem dos produtos, matérias-primas ou componentes utilizados e fornecer evidências quando solicitado?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.50,
    options: agroIndMaturityOptions
  },
  32: {
    number: 32,
    prompt: "A empresa possui critérios para selecionar e acompanhar seus próprios fornecedores?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: agroIndMaturityOptions
  },
  33: {
    number: 33,
    prompt: "A empresa fornece informações claras, completas e tempestivas aos seus clientes quando solicitado?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: agroIndMaturityOptions
  },
  34: {
    number: 34,
    prompt: "A empresa identifica e trata riscos que possam comprometer seus produtos, serviços ou fornecimento?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: agroIndMaturityOptions
  },
  35: {
    number: 35,
    prompt: "A empresa revisa periodicamente seus processos buscando melhorar a qualidade, a sustentabilidade e a eficiência de suas operações?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: agroIndMaturityOptions
  },
  36: {
    number: 36,
    prompt: "A direção da empresa demonstra compromisso com práticas de sustentabilidade e com o atendimento aos requisitos dos clientes?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.50,
    options: agroIndMaturityOptions
  }
};

export const agroIndQuestionsList: DiagnosticQuestion[] = Object.values(AgroIndQuestions);
