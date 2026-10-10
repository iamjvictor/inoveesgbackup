export type Axis = "E" | "B" | "S" | "G";
export type QuestionPriority = "ESSENTIAL" | "STRATEGIC" | "DIFFERENTIAL" | "COMPLEMENTARY";

export type SectionStatus = "nao_iniciado" | "em_andamento" | "concluido";

export type SupplierStatus = "convidado" | "em_andamento" | "respondido" | "pendente" | "expirado";

export type CompanyRole = "avaliada" | "fornecedor" | "assinante";

export type WorkspaceStageStatus = "critico" | "em_andamento" | "concluido" | "bloqueado";

export interface DashboardKpi {
  id: string;
  label: string;
  value: string;
  detail: string;
}

export interface CompanyProfile {
  name: string;
  sector: string;
  cycle: string;
  plan: string;
  diagnosticStatus: "contratado" | "rascunho" | "concluido";
  roles: CompanyRole[];
}

export interface DiagnosticSection {
  id: string;
  title: string;
  axis: Axis;
  status: SectionStatus;
  answered: number;
  total: number;
  updatedAt: string;
}

export interface DiagnosticQuestion {
  id: string;
  sectionId: string;
  axis: Axis;
  category: string;
  weight?: number;
  type?: QuestionPriority;
  prompt: string;
  hint: string;
  answer: string;
  hasEvidence: boolean;
  options?: string[];
}

export interface EvidenceItem {
  id: string;
  questionId: string;
  title: string;
  fileName: string;
  axis: Axis;
  uploadedAt: string;
  owner: string;
  status: "validado" | "pendente";
}

export interface ScoreAxis {
  axis: Axis;
  score: number;
  interpretation: string;
}

export interface ImprovementAction {
  id: string;
  title: string;
  owner: string;
  priority: "alta" | "media";
  dueDate: string;
}

export interface Supplier {
  id: string;
  companyName: string;
  contactEmail: string;
  status: SupplierStatus;
  progress: number;
  invitedAt: string;
  lastUpdate: string;
}

export interface InviteBalance {
  acquired: number;
  used: number;
  available: number;
}

export interface WorkspaceStage {
  id: string;
  title: string;
  description: string;
  status: WorkspaceStageStatus;
  metric: string;
  href: string;
}

export interface WorkspaceTask {
  id: string;
  title: string;
  description: string;
  href: string;
  tone: "default" | "warning";
}

export interface InvitePackage {
  id: string;
  name: string;
  minInvites: number;
  maxInvites: number;
  pricePerInvite: number;
  highlight?: boolean;
}

export interface ReportSummary {
  generatedAt: string;
  maturity: string;
  strengths: string[];
  gaps: string[];
  nextCycleDate: string;
}
