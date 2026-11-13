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
    prompt: "Plano formal de gestão de resíduos?",
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
    prompt: "Metas de redução de resíduos?",
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
    prompt: "Programas de educação sobre resíduos?",
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
    prompt: "Monitora e reduz consumo de água?",
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
    prompt: "Tecnologias de reuso de água?",
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
    prompt: "Avalia riscos de escassez hídrica?",
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
    prompt: "Em que nível a empresa adota práticas de gestão, segregação, armazenamento, transporte e destinação ambientalmente adequada dos resíduos gerados em suas obras e operações, incluindo resíduos perigosos?",
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
    prompt: "Plano de transição energética?",
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
    prompt: "Proteção da biodiversidade?",
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
    prompt: "Avaliação de impacto na biodiversidade?",
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
    prompt: "Seleção de fornecedores comprometidos com biodiversidade?",
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
    prompt: "Mede e reporta emissões de GEE?",
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
    prompt: "Plano de descarbonização?",
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
    prompt: "Engaja a cadeia de valor na redução das emissões (Escopo 3)?",
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
    prompt: "A empresa utiliza matérias-primas renováveis, recicladas ou de origem sustentável?",
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
    prompt: "A empresa possui critérios para seleção de fornecedores de matérias-primas sustentáveis?",
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
    prompt: "A empresa adota princípios de economia circular no desenvolvimento de produtos ou processos?",
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
    prompt: "Em que nível a empresa incorpora práticas de reutilização, recuperação e utilização de materiais reciclados para reduzir o consumo de matérias-primas virgens?",
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
    prompt: "Existe logística reversa para produtos ou embalagens?",
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
    prompt: "A empresa mede indicadores relacionados à circularidade dos materiais?",
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
    prompt: "Em que nível a empresa incorpora práticas de logística reversa, retorno, recolhimento e recuperação de produtos, equipamentos e materiais utilizados em seus empreendimentos?",
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
    prompt: "Existe incentivo à inovação voltada para produtos ou processos bioeconômicos?",
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
    prompt: "A empresa realiza Avaliação do Ciclo de Vida (ACV) de produtos ou processos?",
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
    prompt: "A empresa possui indicadores para redução do consumo de matérias-primas virgens?",
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
    prompt: "Existe cooperação com universidades, startups ou centros de pesquisa para inovação em bioeconomia?",
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
    prompt: "A empresa comunica aos clientes os benefícios ambientais de seus produtos ou serviços?",
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
    prompt: "A empresa acompanha indicadores relacionados aos Objetivos de Desenvolvimento Sustentável (ODS) associados à bioeconomia?",
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
    prompt: "Existe estratégia formal para ampliar a participação da bioeconomia no modelo de negócios?",
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
    prompt: "Em que nível a empresa adota práticas para assegurar o cumprimento das exigências legais e trabalhistas aplicáveis aos trabalhadores envolvidos na construção, operação e manutenção de seus empreendimentos?",
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
    prompt: "A empresa possui política formal de saúde e segurança do trabalho?",
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
    prompt: "São monitorados acidentes e indicadores de SST?",
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
    prompt: "Os colaboradores recebem treinamentos periódicos?",
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
    prompt: "Existe programa de desenvolvimento de lideranças?",
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
    prompt: "A empresa realiza avaliação de desempenho dos colaboradores?",
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
    prompt: "Existem ações voltadas ao bem-estar físico e mental dos colaboradores?",
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
    prompt: "A empresa promove diversidade, equidade e inclusão?",
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
    prompt: "Existem políticas contra discriminação e assédio?",
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
    prompt: "Existe canal para denúncias relacionadas ao ambiente de trabalho?",
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
    prompt: "A empresa realiza pesquisas de clima organizacional?",
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
    prompt: "A empresa desenvolve ações de relacionamento com a comunidade?",
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
    prompt: "Existem programas de investimento social privado ou voluntariado?",
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
    prompt: "A empresa prioriza fornecedores locais ou da agricultura familiar quando aplicável?",
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
    prompt: "São avaliados critérios sociais na seleção de fornecedores?",
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
    prompt: "A empresa monitora satisfação de clientes e consumidores?",
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
    prompt: "Existe política de proteção de dados e privacidade dos clientes?",
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
    prompt: "A empresa comunica de forma transparente seus produtos e serviços?",
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
    prompt: "São desenvolvidas ações de educação ou conscientização para clientes e comunidade?",
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
    prompt: "A empresa acompanha indicadores sociais para tomada de decisão?",
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
    prompt: "Existe estratégia formal para geração de valor social no território onde atua?",
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
    prompt: "A empresa possui missão, visão e valores formalizados?",
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
    prompt: "A alta direção participa das decisões relacionadas ao ESG?",
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
    prompt: "Existe política formal de ESG ou sustentabilidade?",
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
    prompt: "Em que nível a empresa possui práticas estruturadas de controle contábil e financeiro adequadas ao porte, à complexidade e ao ciclo de seus projetos e operações?",
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
    prompt: "A empresa acompanha indicadores ESG periodicamente?",
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
    prompt: "Existe responsável ou comitê para gestão ESG?",
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
    prompt: "Em que nível a empresa possui mecanismos estruturados para recebimento, tratamento e acompanhamento de denúncias, irregularidades e comportamentos antiéticos?",
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
    prompt: "Em que nível a empresa incorpora ações de capacitação e conscientização sobre ética, integridade e conduta em suas práticas de gestão?",
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
    prompt: "Em que nível a empresa possui responsabilidades definidas para gestão e acompanhamento de questões ESG, sustentabilidade e conformidade?",
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
    prompt: "Existe procedimento para investigação e tratamento das denúncias?",
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
    prompt: "A empresa realiza avaliação periódica de riscos?",
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
    prompt: "Os riscos ESG são incorporados ao processo decisório?",
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
    prompt: "Existe política anticorrupção?",
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
    prompt: "Os colaboradores recebem treinamento sobre ética e compliance?",
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
    prompt: "A empresa atende aos requisitos da LGPD?",
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
    prompt: "Existe processo para gestão documental e registros?",
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
    prompt: "Em que nível a empresa incorpora critérios ESG na avaliação e gestão de riscos de fornecedores, empreiteiros, subcontratados e parceiros?",
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
    prompt: "Em que nível a empresa realiza processos de avaliação prévia e verificação de conformidade de fornecedores e parceiros críticos antes de sua contratação?",
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
    prompt: "A empresa divulga resultados ESG ou relatório de sustentabilidade?",
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
    prompt: "Em que nível a empresa identifica e avalia os temas ESG mais relevantes para seus empreendimentos e para suas principais partes interessadas?",
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
    prompt: "A empresa realiza auditorias internas ou avaliações periódicas dos processos?",
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
    prompt: "As decisões estratégicas consideram riscos climáticos, sociais e regulatórios?",
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
    prompt: "Existe estratégia formal para fortalecimento contínuo da governança corporativa?",
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
    prompt: "Em que nível a empresa adota práticas para assegurar a regularização das licenças, autorizações e requisitos ambientais aplicáveis às suas atividades?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 2,
    prompt: "Em que nível a empresa identifica, avalia, controla e monitora os principais impactos ambientais associados às suas atividades?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 3,
    prompt: "Em que nível a empresa monitora o consumo de água, energia, combustíveis e outros recursos naturais utilizados em suas operações?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 4,
    prompt: "Em que nível a empresa adota práticas para reduzir o consumo de água em suas operações?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 5,
    prompt: "Em que nível a empresa incorpora práticas e tecnologias de captação, tratamento, reuso ou reciclagem de água em suas operações?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "DIFFERENTIAL",
    weight: 1.0,
    options: standardMaturityOptions,
  },
  {
    number: 6,
    prompt: "Em que nível a empresa identifica, avalia e gerencia riscos relacionados à disponibilidade, escassez, qualidade ou contaminação da água em suas operações?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 7,
    prompt: "Em que nível a empresa identifica e monitora as fontes de energia e os combustíveis utilizados em suas operações?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 8,
    prompt: "Em que nível a empresa adota práticas de eficiência energética para reduzir o consumo de energia e combustíveis fósseis?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 9,
    prompt: "Em que nível a empresa incorpora fontes de energia renovável ou de menor impacto ambiental em suas operações?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "DIFFERENTIAL",
    weight: 1.0,
    options: standardMaturityOptions,
  },
  {
    number: 10,
    prompt: "Em que nível a empresa adota práticas de segregação, armazenamento, transporte e destinação ambientalmente adequada dos resíduos gerados, especialmente os perigosos?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 11,
    prompt: "Em que nível a empresa adota práticas estruturadas de prevenção, gestão e redução dos resíduos gerados em suas operações?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 12,
    prompt: "Em que nível a empresa incorpora práticas de redução, reutilização, reciclagem e reaproveitamento de materiais e resíduos, acompanhando seu desempenho?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "DIFFERENTIAL",
    weight: 1.0,
    options: standardMaturityOptions,
  },
  {
    number: 13,
    prompt: "Em que nível a empresa incorpora ações de capacitação e orientação ambiental para colaboradores e terceiros, com foco na gestão de resíduos e na prevenção da poluição?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "DIFFERENTIAL",
    weight: 1.0,
    options: standardMaturityOptions,
  },
  {
    number: 14,
    prompt: "Em que nível a empresa identifica e avalia os potenciais impactos de suas atividades sobre a biodiversidade, os ecossistemas e as áreas ambientalmente sensíveis?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 15,
    prompt: "Em que nível a empresa adota medidas de prevenção, mitigação, recuperação ou compensação dos impactos ambientais de suas atividades, quando aplicável?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 16,
    prompt: "Em que nível critérios ambientais são incorporados à seleção e à contratação dos fornecedores e prestadores de serviços da empresa?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 17,
    prompt: "Em que nível a empresa realiza a quantificação e o monitoramento das emissões de Gases de Efeito Estufa (GEE) associadas às suas atividades?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 18,
    prompt: "Em que nível a empresa coleta, organiza e mantém dados sobre consumo de combustíveis, energia elétrica, transporte e outras fontes relevantes para a quantificação das emissões de GEE?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 19,
    prompt: "Em que nível a empresa adota práticas para reduzir as emissões de GEE associadas às suas atividades?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 20,
    prompt: "Em que nível a empresa identifica e avalia a contribuição de suas atividades, produtos ou serviços para as emissões de GEE na cadeia de valor de seus clientes?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 21,
    prompt: "Em que nível a empresa mantém práticas estruturadas para disponibilizar periodicamente dados ambientais e climáticos que permitam aos clientes calcular e monitorar suas emissões indiretas de Escopo 3?",
    axis: "ENVIRONMENTAL" as Axis,
    category: "Pilar Ambiental",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },

  // EIXO 2 — SOCIAL (17 Questões)
  {
    number: 22,
    prompt: "Em que nível a empresa adota práticas para assegurar o cumprimento das exigências legais e trabalhistas aplicáveis aos seus trabalhadores e colaboradores?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 23,
    prompt: "Em que nível a empresa adota práticas para assegurar condições justas de trabalho, remuneração e benefícios aos seus trabalhadores?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 24,
    prompt: "Em que nível a empresa incorpora princípios de direitos humanos, trabalho digno e não discriminação em suas práticas de gestão?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 25,
    prompt: "Em que nível a empresa identifica, avalia e monitora riscos relacionados a direitos humanos em suas operações e na cadeia de fornecedores?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 26,
    prompt: "Em que nível a empresa adota práticas para assegurar a disponibilização, utilização e gestão adequada dos Equipamentos de Proteção Individual e Coletiva necessários às atividades desenvolvidas?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 27,
    prompt: "Em que nível a empresa incorpora treinamentos de saúde, segurança e prevenção de acidentes às suas práticas de gestão dos trabalhadores?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 28,
    prompt: "Em que nível a empresa identifica, avalia e controla os riscos ocupacionais associados às suas atividades?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 29,
    prompt: "Em que nível a empresa realiza o monitoramento e a gestão de acidentes, incidentes, quase acidentes e demais aspectos relacionados à saúde e segurança do trabalho?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 30,
    prompt: "Em que nível a empresa incorpora práticas de promoção da saúde física e prevenção de doenças relacionadas ao trabalho à sua gestão de pessoas?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 31,
    prompt: "Em que nível a empresa identifica, avalia e gerencia riscos ergonômicos e psicossociais relacionados ao trabalho?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 32,
    prompt: "Em que nível a empresa incorpora práticas de diversidade e inclusão em seu quadro de colaboradores e posições de liderança?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "DIFFERENTIAL",
    weight: 1.0,
    options: standardMaturityOptions,
  },
  {
    number: 33,
    prompt: "Em que nível a empresa adota práticas de prevenção e enfrentamento à discriminação, ao assédio e a outras formas de violência no ambiente de trabalho?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 34,
    prompt: "Em que nível a empresa promove a inclusão e a participação de grupos sub-representados em seu ambiente de trabalho?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "DIFFERENTIAL",
    weight: 1.0,
    options: standardMaturityOptions,
  },
  {
    number: 35,
    prompt: "Em que nível a empresa incorpora capacitação e desenvolvimento profissional às suas práticas de gestão dos trabalhadores?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 36,
    prompt: "Em que nível a empresa promove o compartilhamento de conhecimento, o desenvolvimento de novas competências e a inovação entre seus trabalhadores?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "DIFFERENTIAL",
    weight: 1.0,
    options: standardMaturityOptions,
  },
  {
    number: 37,
    prompt: "Em que nível a empresa incorpora práticas de sucessão, mentoria e transferência de conhecimento entre profissionais experientes e novas gerações?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "DIFFERENTIAL",
    weight: 1.0,
    options: standardMaturityOptions,
  },
  {
    number: 38,
    prompt: "Em que nível a empresa identifica, avalia e gerencia os impactos sociais de suas operações sobre comunidades, territórios e demais partes interessadas?",
    axis: "SOCIAL" as Axis,
    category: "Pilar Social",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },

  // EIXO 3 — GOVERNANÇA, ÉTICA E GESTÃO ESG (23 Questões)
  {
    number: 39,
    prompt: "Em que nível a empresa adota práticas para manter atualizada, organizada e regular sua documentação societária, fiscal, trabalhista, regulatória e operacional?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 40,
    prompt: "Em que nível a empresa possui papéis, responsabilidades e níveis de decisão claramente definidos entre sócios, gestores e colaboradores?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 41,
    prompt: "Em que nível a empresa adota processos estruturados para gestão de contratos, documentos e obrigações relacionadas a clientes e fornecedores?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 42,
    prompt: "Em que nível a empresa possui práticas estruturadas de controle contábil e financeiro adequadas ao porte e à complexidade de suas operações?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 43,
    prompt: "Em que nível princípios de ética, integridade e conduta estão incorporados às práticas de gestão da empresa?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 44,
    prompt: "Em que nível a empresa adota práticas de prevenção, identificação e tratamento de corrupção, fraude, conflitos de interesses e outras práticas ilícitas?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 45,
    prompt: "Em que nível a empresa possui mecanismos estruturados para recebimento, tratamento e acompanhamento de denúncias, irregularidades e comportamentos antiéticos?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 46,
    prompt: "Em que nível a empresa incorpora ações de capacitação e conscientização sobre ética, integridade e conduta em suas práticas de gestão?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 47,
    prompt: "Em que nível a empresa possui responsabilidades definidas para gestão e acompanhamento de questões ESG, sustentabilidade e conformidade?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 48,
    prompt: "Em que nível a alta liderança participa da tomada de decisões e do acompanhamento de questões relacionadas à sustentabilidade, aos riscos e ao desempenho ESG?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 49,
    prompt: "Em que nível a empresa realiza o acompanhamento sistemático de seu desempenho ambiental, social e de governança?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 50,
    prompt: "Em que nível a empresa incorpora a análise periódica de resultados, riscos e oportunidades relacionados à sustentabilidade aos seus processos de gestão e tomada de decisão?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 51,
    prompt: "Em que nível a empresa adota práticas de comunicação e transparência sobre suas práticas ESG junto a clientes, colaboradores e demais partes interessadas?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "DIFFERENTIAL",
    weight: 1.0,
    options: standardMaturityOptions,
  },
  {
    number: 52,
    prompt: "Em que nível a empresa adota processos estruturados para coleta, armazenamento, controle, atualização e rastreabilidade dos dados ESG?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 53,
    prompt: "Em que nível a empresa mantém evidências e documentos que permitem comprovar e verificar as informações ESG declaradas?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 54,
    prompt: "Em que nível a empresa incorpora auditorias, verificações internas ou avaliações externas para avaliar sua conformidade e seu desempenho em sustentabilidade?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "DIFFERENTIAL",
    weight: 1.0,
    options: standardMaturityOptions,
  },
  {
    number: 55,
    prompt: "Em que nível a empresa incorpora critérios ESG na avaliação e gestão de riscos de seus fornecedores e parceiros?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 56,
    prompt: "Em que nível a empresa realiza processos de avaliação prévia e verificação de conformidade de fornecedores e parceiros críticos antes de sua contratação?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 57,
    prompt: "Em que nível a empresa identifica, avalia e gerencia riscos ESG associados aos produtos, serviços e matérias-primas adquiridos de terceiros?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 58,
    prompt: "Em que nível a empresa identifica e avalia os temas ESG mais relevantes para seu negócio, seus clientes e demais partes interessadas?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 59,
    prompt: "Em que nível a empresa possui mecanismos estruturados para receber, analisar e responder às demandas, reclamações e expectativas de clientes, comunidades, trabalhadores e demais partes interessadas?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 60,
    prompt: "Em que nível a empresa adota práticas estruturadas para proteção de dados pessoais e informações comerciais e confidenciais?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 61,
    prompt: "Em que nível a empresa identifica, avalia e gerencia riscos relacionados à segurança da informação e à proteção de dados?",
    axis: "GOVERNANCE" as Axis,
    category: "Pilar Governança",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },

  // EIXO 4 — BIOECONOMIA, ECONOMIA CIRCULAR E INOVAÇÃO SUSTENTÁVEL (14 Questões)
  {
    number: 62,
    prompt: "Em que nível a empresa avalia os impactos ambientais de seus produtos ou serviços ao longo de seu ciclo de vida?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia e Inovação",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 63,
    prompt: "Em que nível a empresa utiliza informações sobre ciclo de vida para orientar decisões e identificar oportunidades de redução de impactos ambientais e emissões?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia e Inovação",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 64,
    prompt: "Em que nível critérios de durabilidade, manutenção, reparabilidade, reutilização e reciclabilidade são incorporados ao desenvolvimento ou à aquisição de produtos e materiais?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia e Inovação",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 65,
    prompt: "Em que nível a empresa incorpora práticas de reutilização, recuperação e utilização de materiais reciclados para reduzir o consumo de matérias-primas virgens?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia e Inovação",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 66,
    prompt: "Em que nível a empresa incorpora práticas de reaproveitamento, recuperação e valorização de resíduos e subprodutos gerados em suas operações?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia e Inovação",
    type: "ESSENTIAL",
    weight: 1.5,
    options: standardMaturityOptions,
  },
  {
    number: 67,
    prompt: "Em que nível a empresa desenvolve ou participa de parcerias com outras empresas e organizações para reaproveitamento de materiais, resíduos e subprodutos?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia e Inovação",
    type: "DIFFERENTIAL",
    weight: 1.0,
    options: standardMaturityOptions,
  },
  {
    number: 68,
    prompt: "Em que nível a empresa incorpora práticas de logística reversa, retorno, recolhimento e recuperação de produtos e materiais?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia e Inovação",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 69,
    prompt: "Em que nível a empresa incorpora matérias-primas renováveis, de origem biológica sustentável ou provenientes de fontes circulares em suas atividades?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia e Inovação",
    type: "DIFFERENTIAL",
    weight: 1.0,
    options: standardMaturityOptions,
  },
  {
    number: 70,
    prompt: "Em que nível a empresa incorpora alternativas de menor intensidade de carbono ou de origem renovável em substituição a materiais, insumos e processos de maior impacto ambiental?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia e Inovação",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 71,
    prompt: "Em que nível a empresa desenvolve, utiliza ou comercializa soluções que contribuem para reduzir a dependência de recursos não renováveis?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia e Inovação",
    type: "DIFFERENTIAL",
    weight: 1.0,
    options: standardMaturityOptions,
  },
  {
    number: 72,
    prompt: "Em que nível a empresa incorpora pesquisa, desenvolvimento e inovação voltados à sustentabilidade, à descarbonização e à eficiência no uso de recursos em suas atividades?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia e Inovação",
    type: "DIFFERENTIAL",
    weight: 1.0,
    options: standardMaturityOptions,
  },
  {
    number: 73,
    prompt: "Em que nível a empresa desenvolve parcerias com universidades, centros de pesquisa, startups ou outras organizações para desenvolver soluções sustentáveis?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia e Inovação",
    type: "DIFFERENTIAL",
    weight: 1.0,
    options: standardMaturityOptions,
  },
  {
    number: 74,
    prompt: "Em que nível a empresa avalia os benefícios ambientais, sociais e econômicos das soluções inovadoras que desenvolve ou utiliza?",
    axis: "BIOECONOMY_CIRCULAR" as Axis,
    category: "Pilar Bioeconomia e Inovação",
    type: "STRATEGIC",
    weight: 1.25,
    options: standardMaturityOptions,
  },
  {
    number: 75,
    prompt: "Em que nível a empresa demonstra os benefícios de seus produtos, serviços ou soluções para a redução de emissões, resíduos, consumo de recursos e outros impactos ao longo da cadeia de valor de seus clientes?",
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
