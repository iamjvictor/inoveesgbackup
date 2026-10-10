export type AdminAxis = "E" | "B" | "S" | "G";

export type BudgetRequestStatus = "PENDING" | "IN_REVIEW" | "PROPOSAL_SENT" | "APPROVED" | "REJECTED" | "ACTIVE";

export type EvidenceReviewStatus = "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED";

export type ClientHealthStatus = "healthy" | "watch" | "critical";

export type SupplierPipelineStatus = "INVITED" | "ACTIVE" | "RESPONDED" | "OVERDUE" | "REGISTERED";

export interface AdminMetric {
  id: string;
  label: string;
  value: string;
  detail: string;
  tone?: "emerald" | "amber" | "slate" | "rose";
}

export interface AdminBudgetRequest {
  id: string;
  organizationName: string;
  legalName: string;
  sector: string;
  employeeCount: string;
  annualRevenue: string;
  objective: string;
  timeline: string;
  focusAreas: Array<"E" | "B" | "S" | "G">;
  hasPriorInventory: string;
  phone: string;
  notes?: string | null;
  proposalValue: string;
  status: BudgetRequestStatus;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  paymentDetails?: {
    paidAt: string;
    amountPaid: string;
    paymentMethod: string;
    provider?: string | null;
    providerReference?: string | null;
  } | null;
  cnpj?: string | null;
  primaryEmail?: string | null;
  website?: string | null;
  numberOfSuppliers?: string | null;
  description?: string | null;
  enderecoCompleto?: string | null;
  municipioEstado?: string | null;
  redesSociais?: string | null;
  naturezaJuridica?: string | null;
  tempoOperacao?: string | null;
  alcanceMercado?: string | null;
  specificActivity?: string | null;
  businessCategoryName?: string | null;
  businessSegmentName?: string | null;
  esgJaPossui?: string[] | null;
  esgInteresse?: string[] | null;
}

export interface AdminClientSummary {
  id: string;
  tradeName: string;
  legalName: string;
  segment: string;
  plan: string;
  orderId?: string;
  diagnosticStatus: "CONTRACTED" | "DRAFT" | "COMPLETED";
  health: ClientHealthStatus;
  lastDiagnosticAt: string;
  score: number;
  evidencePending: number;
  supplierCoverage: string;
  activeUsers: number;
  consultingStatus?: "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELED";
  consultingDate?: string | null;
  consultingStartsAt?: string | null;
}

export interface AdminSupplierSummary {
  id: string;
  companyName: string;
  contactEmail: string;
  segment: string;
  status: SupplierPipelineStatus;
  progress: number;
  score: number;
  evidencePending: number;
  invitedAt: string;
  lastUpdate: string;
  purchasedProducts?: Array<{
    name: string;
    status: string;
  }>;
  linkedCompanies?: Array<{
    id: string;
    name: string;
    status: string;
  }>;
}

export interface AdminEvidenceSummary {
  id: string;
  title: string;
  companyName: string;
  supplierName: string;
  axis: AdminAxis;
  questionCode: string;
  status: EvidenceReviewStatus;
  uploadDate: string;
  reviewer: string;
  fileName: string;
  severity: "low" | "medium" | "high";
}

export interface AdminEvidenceNote {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export interface AdminEvidencePillarSummary {
  axis: AdminAxis;
  label: string;
  score: number;
  provenScore: number;
  approvedPoints: number;
  totalAvailablePoints: number;
  evidenceTotal: number;
  verifiedEvidence: number;
  pendingEvidence: number;
  responseTotal: number;
  gap: number;
}

export interface AdminEvidenceCompanySummary {
  id: string;
  companyName: string;
  legalName: string;
  category: string;
  segment: string;
  accessLabel: string;
  diagnosticStatus: "CONTRACTED" | "DRAFT" | "COMPLETED";
  score: number;
  provenScore: number;
  icebScore: number;
  evidencePending: number;
  evidenceVerified: number;
  evidenceAnalyzed: number;
  lastDiagnosticAt: string;
  pillars: AdminEvidencePillarSummary[];
  documents: Array<{
    id: string;
    evidenceName: string;
    documentType: string;
    fileName: string;
    axis: "E" | "B" | "S" | "G";
    status: AdminEvidenceSummary["status"];
    uploadDate: string;
    reviewedBy: string | null;
    reviewedAt: string | null;
  }>;
}

export interface AdminAxisInsight {
  axis: AdminAxis;
  label: string;
  score: number;
  responseRate: number;
  evidenceCoverage: number;
  pendingItems: number;
  trend: number;
}

export interface AdminTrendPoint {
  label: string;
  value: number;
}

export interface AdminInsightCard {
  title: string;
  description: string;
  tone: "emerald" | "amber" | "rose" | "slate";
}

export interface AdminPaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AdminOverviewModel {
  metrics: AdminMetric[];
  queue: AdminBudgetRequest[];
  clientHighlights: AdminClientSummary[];
  supplierHighlights: AdminSupplierSummary[];
  evidenceHighlights: AdminEvidenceSummary[];
  insights: AdminInsightCard[];
  upcomingAppointments: AdminUpcomingAppointment[];
}

export interface AdminUpcomingAppointment {
  id: string;
  organizationName: string;
  status: "REQUESTED" | "CONFIRMED";
  startsAt: string;
  endsAt: string | null;
}

export interface AdminBudgetBoardModel {
  metrics: AdminMetric[];
  requests: AdminBudgetRequest[];
  groupedByStatus: Record<BudgetRequestStatus, number>;
  openValue: string;
  pagination: AdminPaginationMeta;
}

export interface AdminClientBoardModel {
  metrics: AdminMetric[];
  clients: AdminClientSummary[];
  healthDistribution: Record<ClientHealthStatus, number>;
  pagination: AdminPaginationMeta;
}

export interface AdminSupplierBoardModel {
  metrics: AdminMetric[];
  suppliers: AdminSupplierSummary[];
  pipeline: Record<SupplierPipelineStatus, number>;
  pagination: AdminPaginationMeta;
}

export interface AdminEvidenceBoardModel {
  metrics: AdminMetric[];
  companies: AdminEvidenceCompanySummary[];
  pagination: AdminPaginationMeta;
}

export interface AdminAnalyticsBoardModel {
  metrics: AdminMetric[];
  axisInsights: AdminAxisInsight[];
  trend: AdminTrendPoint[];
  maturityBands: Array<{ label: string; value: number; tone: "emerald" | "amber" | "rose" | "slate" }>;
  notes: AdminInsightCard[];
}

export interface AdminFinanceOrderSummary {
  id: string;
  organizationName: string;
  legalName: string;
  orderType: string;
  status: string;
  totalValue: string;
  itemCount: number;
  products: string[];
  productKinds: string[];
  createdAt: string;
  paidAt: string;
}

export interface AdminFinancePaymentSummary {
  id: string;
  organizationName: string;
  legalName: string;
  orderId: string;
  orderType: string;
  orderStatus: string;
  method: string;
  status: string;
  amountValue: string;
  provider: string;
  paidAt: string;
  createdAt: string;
}

export interface AdminFinanceProductSummary {
  id: string;
  code: string;
  name: string;
  kind: string;
  active: boolean;
  orderCount: number;
  paidOrderCount: number;
  grossValue: string;
  lastOrderAt: string;
}

export interface AdminFinanceBoardModel {
  metrics: AdminMetric[];
  purchases: {
    totalOrders: number;
    pendingOrders: number;
    paidOrders: number;
    recentOrders: AdminFinanceOrderSummary[];
    pagination: AdminPaginationMeta;
    productOptions: Array<{ id: string; name: string }>;
  };
  sales: {
    totalPayments: number;
    paidPayments: number;
    grossRevenue: string;
    pendingRevenue: string;
    averageTicket: string;
    recentPayments: AdminFinancePaymentSummary[];
  };
  products: {
    activeProducts: number;
    activeSubscriptions: number;
    recentProducts: AdminFinanceProductSummary[];
  };
}

export interface AdminBookSaleSummary {
  id: string;
  companyName: string;
  legalName: string;
  cnpj: string;
  address: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentProvider: string;
  quantity: number;
  bookRevenue: string;
  orderTotal: string;
  createdAt: string;
  paidAt: string;
}

export interface AdminBooksBoardModel {
  metrics: AdminMetric[];
  summary: {
    totalOrders: number;
    totalBooksSold: number;
    paidOrders: number;
    pendingOrders: number;
    buyersCount: number;
    grossRevenue: string;
    paidRevenue: string;
    pendingRevenue: string;
    averageBookPrice: string;
  };
  sales: AdminBookSaleSummary[];
  pagination: AdminPaginationMeta;
}
