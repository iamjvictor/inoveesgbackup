import { Axis, Prisma, VerificationStatus } from "@prisma/client";

import { cache } from "../../../lib/cache.js";
import { prisma } from "../../../lib/prisma.js";
import { supabaseAdminClient } from "../../../lib/supabase.js";
import { buildAuthAccessContext } from "../../auth/models/accessContext.js";
import {
  AdminRepository,
  type AdminAnalyticsAxisRow,
  type AdminAnalyticsMonthRow,
  type AdminAnalyticsSummaryRow,
  type AdminBudgetRow,
  type AdminClientRow,
  type AdminUpcomingAppointmentRow,
  type AdminEvidenceRow,
  type AdminBookSaleRow,
  type AdminBookSummaryRow,
  type AdminFinanceOrderRow,
  type AdminFinanceProductOptionRow,
  type AdminFinancePaymentRow,
  type AdminFinanceProductRow,
  type AdminSupplierRow,
} from "../repositories/adminRepository.js";
import { AuthRepository } from "../../auth/repositories/authRepository.js";
import { calculateEvidenceIndices, evidencePillarPointTotals, evidenceScoreAxes } from "../../evidence/services/evidenceScore.js";
import { getBudgetProposalPriceCents } from "../../budget/budgetPricing.js";
import { invalidateCurrentDiagnosticCache } from "../../diagnostic/services/diagnosticCache.js";

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
  status: "PENDING" | "IN_REVIEW" | "PROPOSAL_SENT" | "APPROVED" | "REJECTED" | "ACTIVE";
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
  health: "healthy" | "watch" | "critical";
  lastDiagnosticAt: string;
  score: number;
  evidencePending: number;
  supplierCoverage: string;
  activeUsers: number;
  consultingStatus?: "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELED" | "NO_SHOW";
  consultingDate?: string | null;
  consultingStartsAt?: string | null;
  consultingSessionLimit?: number;
  consultingSessionsUsed?: number;
  consultingAppointments?: Array<{ id: string; status: string; startsAt: string | null; endsAt: string | null; meetingUrl: string | null }>;
}

export interface AdminSupplierSummary {
  id: string;
  companyName: string;
  contactEmail: string;
  segment: string;
  status: "INVITED" | "ACTIVE" | "RESPONDED" | "OVERDUE" | "REGISTERED";
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
  axis: "E" | "B" | "S" | "G";
  questionCode: string;
  status: "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED";
  uploadDate: string;
  reviewer: string;
  fileName: string;
  severity: "low" | "medium" | "high";
}

export interface AdminEvidencePillarSummary {
  axis: AxisKey;
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
    axis: AxisKey;
    status: ReviewStatus;
    uploadDate: string;
    reviewedBy: string | null;
    reviewedAt: string | null;
  }>;
}

export interface AdminAxisInsight {
  axis: "E" | "B" | "S" | "G";
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
  groupedByStatus: Record<string, number>;
  openValue: string;
  pagination: AdminPaginationMeta;
}

export interface AdminClientBoardModel {
  metrics: AdminMetric[];
  clients: AdminClientSummary[];
  healthDistribution: Record<string, number>;
  pagination: AdminPaginationMeta;
}

export interface AdminSupplierBoardModel {
  metrics: AdminMetric[];
  suppliers: AdminSupplierSummary[];
  pipeline: Record<string, number>;
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

type AxisKey = "E" | "B" | "S" | "G";
type BudgetStatus = "PENDING" | "IN_REVIEW" | "PROPOSAL_SENT" | "APPROVED" | "REJECTED" | "ACTIVE";
type ReviewStatus = "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED";
type ClientHealth = "healthy" | "watch" | "critical";
type SupplierPipeline = "INVITED" | "ACTIVE" | "RESPONDED" | "OVERDUE" | "REGISTERED";
type DiagnosticSummary = {
  id: string;
  kind: string;
  status: string;
  completedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  score: {
    overallScore: Prisma.Decimal | number | null;
    environmentalScore: Prisma.Decimal | number | null;
    bioeconomyCircularScore: Prisma.Decimal | number | null;
    socialScore: Prisma.Decimal | number | null;
    governanceScore: Prisma.Decimal | number | null;
    provenOverallScore: Prisma.Decimal | number | null;
    provenEnvironmentalScore: Prisma.Decimal | number | null;
    provenBioeconomyCircularScore: Prisma.Decimal | number | null;
    provenSocialScore: Prisma.Decimal | number | null;
    provenGovernanceScore: Prisma.Decimal | number | null;
  } | null;
};

type LoadedOrganization = Awaited<ReturnType<typeof loadOrganizationsSummary>>[number];
type LoadedOrganizationWithDiagnostics = Awaited<ReturnType<typeof loadOrganizationsForAnalytics>>[number];
type LoadedEvidenceSummary = Awaited<ReturnType<typeof loadEvidenceSummariesPage>>["items"][number];

interface PaginationInput {
  page: number;
  limit: number;
}

interface PaginatedResult<T> {
  items: T[];
  pagination: AdminPaginationMeta;
}

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;
const adminRepository = new AdminRepository();
const authRepository = new AuthRepository();
let globalMetricsPromise: Promise<AdminMetric[]> | null = null;

const axisLabels: Record<AxisKey, string> = {
  E: "Ambiental",
  B: "Bioeconomia Circular",
  S: "Social",
  G: "Governança",
};

function formatDate(value: Date | string | null | undefined) {
  if (!value) {
    return "Não informado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value: Date | string | null | undefined) {
  if (!value) {
    return "Não informado";
  }

  const date = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));

  const time = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));

  return `${date} às ${time}`;
}

function formatMonthLabel(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
  })
    .format(value)
    .replace(".", "");
}

function formatCurrencyFromCents(value: number) {
  return `R$ ${(value / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
  })}`;
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function toNumber(value: Prisma.Decimal | number | bigint | null | undefined) {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value);
}

function safePercent(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

function clampPage(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return Math.floor(parsed);
}

function clampLimit(value: unknown, fallback = DEFAULT_PAGE_SIZE) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(Math.floor(parsed), MAX_PAGE_SIZE);
}

function buildPaginationMeta(totalItems: number, pagination: PaginationInput): AdminPaginationMeta {
  const totalPages = Math.max(1, Math.ceil(totalItems / pagination.limit));

  return {
    page: pagination.page,
    limit: pagination.limit,
    totalItems,
    totalPages,
    hasNextPage: pagination.page < totalPages,
    hasPreviousPage: pagination.page > 1,
  };
}

function parsePagination(page?: unknown, limit?: unknown): PaginationInput {
  return {
    page: clampPage(page),
    limit: clampLimit(limit),
  };
}

async function measureAdminStep<T>(label: string, operation: Promise<T>) {
  const t0 = Date.now();
  try {
    return await operation;
  } finally {
    console.log(`[adminService] ${label} → ${Date.now() - t0}ms`);
  }
}

function mapAxis(axis: string | null | undefined): AxisKey {
  switch (axis) {
    case "ENVIRONMENTAL":
    case "E":
      return "E";
    case "BIOECONOMY_CIRCULAR":
    case "B":
      return "B";
    case "SOCIAL":
    case "S":
      return "S";
    case "GOVERNANCE":
    case "G":
      return "G";
    default:
      return "E";
  }
}

function mapBudgetStatus(status: string): BudgetStatus {
  switch (status) {
    case "SOLICITADO":
      return "PENDING";
    case "RESPONDIDO":
      return "PROPOSAL_SENT";
    case "ACEITO":
      return "APPROVED";
    case "RECUSADO":
      return "REJECTED";
    case "ATIVO":
      return "ACTIVE";
    default:
      return "PENDING";
  }
}

function mapSupplierPipeline(status: string): SupplierPipeline {
  switch (status) {
    case "IN_PROGRESS":
      return "ACTIVE";
    case "COMPLETED":
      return "RESPONDED";
    case "EXPIRED":
    case "INACTIVE":
      return "OVERDUE";
    case "INVITED":
    default:
      return "INVITED";
  }
}

function mapReviewStatus(uploadStatus: string, verificationStatus: string): ReviewStatus {
  if (verificationStatus === "VERIFIED") {
    return "VERIFIED";
  }

  if (verificationStatus === "REJECTED") {
    return "REJECTED";
  }

  if (uploadStatus === "COMPLETED") {
    return "UNDER_REVIEW";
  }

  return "PENDING";
}

function formatFinanceOrderType(orderType: string) {
  switch (orderType) {
    case "SUBSCRIPTION":
      return "Assinatura";
    case "INVITE_PACK":
      return "Pacote de convites";
    case "ONE_TIME":
      return "Compra avulsa";
    default:
      return orderType;
  }
}

function formatFinancePaymentMethod(method: string) {
  switch (method) {
    case "PIX":
      return "PIX";
    case "CREDIT_CARD":
      return "Cartão de crédito";
    case "BANK_SLIP":
      return "Boleto";
    case "TRANSFER":
      return "Transferência";
    default:
      return method;
  }
}

function formatFinanceProductKind(kind: string) {
  switch (kind) {
    case "SUBSCRIPTION":
      return "Assinatura";
    case "INVITE_PACK":
      return "Pacote de convites";
    case "ONE_TIME":
      return "Avulso";
    default:
      return kind;
  }
}

function formatBookPaymentStatus(status: string) {
  switch (status) {
    case "PAID":
      return "Pago";
    case "AUTHORIZED":
      return "Autorizado";
    case "PENDING":
      return "Pendente";
    case "FAILED":
      return "Falhou";
    case "CANCELED":
      return "Cancelado";
    case "REFUNDED":
      return "Estornado";
    case "EXPIRED":
      return "Expirado";
    default:
      return status;
  }
}

function formatBookOrderStatus(status: string) {
  switch (status) {
    case "PAID":
      return "Pago";
    case "PENDING_PAYMENT":
      return "Aguardando pagamento";
    case "PARTIALLY_PAID":
      return "Parcial";
    case "FAILED":
      return "Falhou";
    case "CANCELED":
      return "Cancelado";
    case "REFUNDED":
      return "Estornado";
    default:
      return status;
  }
}

function formatBookAddress(row: {
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  enderecoCompleto: string | null;
  municipioEstado: string | null;
}) {
  if (row.enderecoCompleto) {
    return row.enderecoCompleto;
  }

  if (row.municipioEstado) {
    return row.municipioEstado;
  }

  return [row.addressLine1, row.addressLine2, row.city, row.state, row.postalCode].filter(Boolean).join(", ") || "Não informado";
}

function severityFromReview(status: ReviewStatus) {
  if (status === "VERIFIED") return "low" as const;
  if (status === "UNDER_REVIEW") return "medium" as const;
  return "high" as const;
}

function healthFromScore(score: number) {
  if (score >= 75) return "healthy" as const;
  if (score >= 50) return "watch" as const;
  return "critical" as const;
}

function isCompanyOrganization(org: LoadedOrganization) {
  return org.roles.some((role) => role.role === "COMPANY");
}

function isSupplierOrganization(org: LoadedOrganization) {
  return (
    org.roles.some((role) => role.role === "SUPPLIER") ||
    org.supplierBuyerLinks.length > 0 ||
    org.subjectDiagnostics.some((diagnostic) => diagnostic.kind === "SUPPLIER_DIAGNOSTIC")
  );
}

function getLatestDiagnostic(org: LoadedOrganization, kind?: string) {
  if (kind) {
    const diagnostic = org.subjectDiagnostics.find((item) => item.kind === kind);
    if (diagnostic) return diagnostic;
  }

  return org.subjectDiagnostics[0] ?? null;
}

function getLatestCompletedDiagnostic(org: LoadedOrganization, kind?: string) {
  return (
    org.subjectDiagnostics.find((item) => item.status === "COMPLETED" && (!kind || item.kind === kind)) ??
    null
  );
}

function getPrimaryPlan(org: LoadedOrganization) {
  const subscription = org.subscriptions[0];
  const product = subscription?.plan?.product;
  return product?.name ?? "Sem plano";
}

function getSupplierCoverage(org: LoadedOrganization) {
  const links = org.buyerSupplierLinks;
  if (!links.length) {
    return "0%";
  }

  const responded = links.filter((link) => link.status === "COMPLETED").length;
  return formatPercent((responded / links.length) * 100);
}

function collectDiagnostics(organizations: LoadedOrganizationWithDiagnostics[]) {
  return organizations.flatMap((org) =>
    org.subjectDiagnostics.map((diagnostic) => ({
      org,
      diagnostic,
    }))
  );
}

function collectEvidenceSummaries(organizations: LoadedOrganizationWithDiagnostics[]) {
  const evidences = organizations.flatMap((org) =>
    org.subjectDiagnostics.flatMap((diagnostic) =>
      diagnostic.evidences.map((evidence) => ({
        org,
        diagnostic,
        evidence,
      }))
    )
  );

  return evidences.sort((a, b) => {
    const dateA = new Date(a.evidence.uploadedAt ?? a.evidence.createdAt).getTime();
    const dateB = new Date(b.evidence.uploadedAt ?? b.evidence.createdAt).getTime();
    return dateB - dateA;
  });
}

function buildBudgetRequest(request: any): AdminBudgetRequest {
  const org = request.organization;
  const focusAreas: AxisKey[] = [];

  for (const interest of org.esgInteresse ?? []) {
    if (interest === "ENVIRONMENTAL" || interest === "E") focusAreas.push("E");
    if (interest === "BIOECONOMY_CIRCULAR" || interest === "B") focusAreas.push("B");
    if (interest === "SOCIAL" || interest === "S") focusAreas.push("S");
    if (interest === "GOVERNANCE" || interest === "G") focusAreas.push("G");
  }

  if (focusAreas.length === 0) {
    focusAreas.push("E", "B", "S", "G");
  }

  const basePriceCents = getBudgetProposalPriceCents(request.status, request.proposedPriceCents) ?? 0;

  return {
    id: request.id,
    organizationName: org.tradeName ?? org.legalName,
    legalName: org.legalName,
    sector: org.industrySegment ?? org.businessSegment?.name ?? "Não informado",
    employeeCount: org.size ?? "Não informado",
    annualRevenue: org.annualRevenue ?? "Não informado",
    objective: request.months ? `${request.product?.name ?? "Serviço"} (${request.months} meses)` : request.product?.name ?? "Serviço ESG",
    timeline: request.months ? `${request.months} meses` : "Não informado",
    focusAreas,
    hasPriorInventory: Array.isArray(org.esgJaPossui) && org.esgJaPossui.length > 0 ? "Sim" : "Não",
    phone: org.phone ?? "Não informado",
    notes: request.product?.service?.pricingType ? request.product.service.pricingType : null,
    proposalValue: formatCurrencyFromCents(basePriceCents),
    status: mapBudgetStatus(request.status),
    createdAt: formatDate(request.createdAt),
    updatedAt: formatDate(request.updatedAt),
    tags: [
      org.porte ? org.porte.toLowerCase() : "sem porte",
      org.businessCategory?.name ? org.businessCategory.name.toLowerCase() : null,
      org.businessSegment?.name ? org.businessSegment.name.toLowerCase() : null,
    ].filter(Boolean) as string[],
  };
}

function buildBudgetRequestFromRow(row: AdminBudgetRow): AdminBudgetRequest {
  const focusAreas: AxisKey[] = [];

  for (const interest of row.esgInteresse ?? []) {
    if (interest === "ENVIRONMENTAL" || interest === "E") focusAreas.push("E");
    if (interest === "BIOECONOMY_CIRCULAR" || interest === "B") focusAreas.push("B");
    if (interest === "SOCIAL" || interest === "S") focusAreas.push("S");
    if (interest === "GOVERNANCE" || interest === "G") focusAreas.push("G");
  }

  if (focusAreas.length === 0) {
    focusAreas.push("E", "B", "S", "G");
  }

  return {
    id: row.id,
    organizationName: row.organizationName ?? row.legalName,
    legalName: row.legalName,
    sector: row.industrySegment ?? row.businessSegmentName ?? "Não informado",
    employeeCount: row.size ?? "Não informado",
    annualRevenue: row.annualRevenue ?? "Não informado",
    objective: row.months ? `${row.productName ?? "Serviço"} (${row.months} meses)` : row.productName ?? "Serviço ESG",
    timeline: row.months ? `${row.months} meses` : "Não informado",
    focusAreas,
    hasPriorInventory: Array.isArray(row.esgJaPossui) && row.esgJaPossui.length > 0 ? "Sim" : "Não",
    phone: row.phone ?? "Não informado",
    notes: row.pricingType,
    proposalValue: formatCurrencyFromCents(getBudgetProposalPriceCents(row.status, row.proposedPriceCents) ?? 0),
    status: mapBudgetStatus(row.status),
    createdAt: formatDate(row.createdAt),
    updatedAt: formatDate(row.updatedAt),
    tags: [
      row.porte ? row.porte.toLowerCase() : "sem porte",
      row.businessCategoryName ? row.businessCategoryName.toLowerCase() : null,
      row.businessSegmentName ? row.businessSegmentName.toLowerCase() : null,
    ].filter(Boolean) as string[],
    paymentDetails: row.paymentPaidAt ? {
      paidAt: formatDate(row.paymentPaidAt),
      amountPaid: formatCurrencyFromCents(row.paymentAmountCents ?? 0),
      paymentMethod: row.paymentMethod ?? "PIX",
      provider: row.paymentProvider,
      providerReference: row.paymentProviderRef,
    } : null,
    cnpj: row.cnpj,
    primaryEmail: row.primaryEmail,
    website: row.website,
    numberOfSuppliers: row.numberOfSuppliers,
    description: row.description,
    enderecoCompleto: row.enderecoCompleto,
    municipioEstado: row.municipioEstado,
    redesSociais: row.redesSociais,
    naturezaJuridica: row.naturezaJuridica,
    tempoOperacao: row.tempoOperacao,
    alcanceMercado: row.alcanceMercado,
    specificActivity: row.specificActivity,
    businessCategoryName: row.businessCategoryName,
    businessSegmentName: row.businessSegmentName,
    esgJaPossui: row.esgJaPossui,
    esgInteresse: row.esgInteresse,
  };
}

function buildClientSummary(
  org: LoadedOrganization,
  pendingEvidenceByDiagnosticId: Map<string, number> = new Map()
): AdminClientSummary | null {
  const latestDiagnostic = getLatestDiagnostic(org);
  const latestCompleted = getLatestCompletedDiagnostic(org) ?? latestDiagnostic;
  const score = Number(latestCompleted?.score?.overallScore ?? latestDiagnostic?.score?.overallScore ?? 0);
  const diagnosticStatus =
    latestDiagnostic?.status === "COMPLETED"
      ? "COMPLETED"
      : latestDiagnostic
        ? "DRAFT"
        : org.subscriptions.length > 0
          ? "CONTRACTED"
          : "DRAFT";
  const plan = getPrimaryPlan(org);
  const evidencePending = latestDiagnostic?.id ? pendingEvidenceByDiagnosticId.get(latestDiagnostic.id) ?? 0 : 0;
  const lastDiagnosticAt = latestCompleted?.completedAt ?? latestCompleted?.updatedAt ?? latestDiagnostic?.updatedAt ?? org.updatedAt;

  return {
    id: org.id,
    tradeName: org.tradeName ?? org.legalName,
    legalName: org.legalName,
    segment: org.industrySegment ?? org.businessSegment?.name ?? "Não informado",
    plan,
    diagnosticStatus,
    health: healthFromScore(score),
    lastDiagnosticAt: formatDate(lastDiagnosticAt),
    score: Math.round(score),
    evidencePending,
    supplierCoverage: getSupplierCoverage(org),
    activeUsers: org.users.length,
  };
}

function buildSupplierSummary(
  org: LoadedOrganization,
  pendingEvidenceByDiagnosticId: Map<string, number> = new Map()
): AdminSupplierSummary | null {
  const supplierDiagnostic = getLatestDiagnostic(org, "SUPPLIER_DIAGNOSTIC") ?? getLatestDiagnostic(org);
  const completedSupplierDiagnostic = getLatestCompletedDiagnostic(org, "SUPPLIER_DIAGNOSTIC") ?? supplierDiagnostic;
  const score = Number(completedSupplierDiagnostic?.score?.overallScore ?? supplierDiagnostic?.score?.overallScore ?? 0);
  const link = org.supplierBuyerLinks[0] ?? null;
  const evidencePending = supplierDiagnostic?.id ? pendingEvidenceByDiagnosticId.get(supplierDiagnostic.id) ?? 0 : 0;
  const progress = link
    ? link.status === "COMPLETED"
      ? 100
      : link.status === "IN_PROGRESS"
        ? 60
        : link.status === "EXPIRED"
          ? 35
          : 0
    : evidencePending > 0
      ? 25
      : 0;
  const invitedAt = link?.invitedAt ?? supplierDiagnostic?.createdAt ?? org.createdAt;
  const lastUpdate = [
    link?.updatedAt,
    supplierDiagnostic?.updatedAt,
    completedSupplierDiagnostic?.updatedAt,
  ]
    .filter(Boolean)
    .sort((a, b) => new Date(b as Date | string).getTime() - new Date(a as Date | string).getTime())[0];

  return {
    id: org.id,
    companyName: org.tradeName ?? org.legalName,
    contactEmail: org.primaryEmail ?? "Não informado",
    segment: org.industrySegment ?? org.businessSegment?.name ?? "Não informado",
    status: mapSupplierPipeline(link?.status ?? "INVITED"),
    progress,
    score: Math.round(score),
    evidencePending,
    invitedAt: formatDate(invitedAt),
    lastUpdate: formatDate(lastUpdate),
  };
}

function buildClientSummaryFromRow(row: AdminClientRow): AdminClientSummary {
  const score = toNumber(row.overallScore);
  const diagnosticStatus =
    row.diagnosticStatus === "COMPLETED"
      ? "COMPLETED"
      : row.diagnosticStatus
        ? "DRAFT"
        : row.planName
          ? "CONTRACTED"
          : "DRAFT";
  const supplierTotal = toNumber(row.supplierTotal);
  const supplierCompleted = toNumber(row.supplierCompleted);

  let consultingStatus: "PENDING" | "SCHEDULED" | "COMPLETED" | "CANCELED" | "NO_SHOW" = "PENDING";
  if (row.appointmentStatus === "COMPLETED") {
    consultingStatus = "COMPLETED";
  } else if (row.appointmentStatus === "NO_SHOW") {
    consultingStatus = "NO_SHOW";
  } else if (row.appointmentStatus === "CANCELED") {
    consultingStatus = "CANCELED";
  } else if (row.appointmentStatus === "CONFIRMED" || row.appointmentStatus === "REQUESTED") {
    consultingStatus = "SCHEDULED";
  }

  return {
    id: row.id,
    tradeName: row.tradeName ?? row.legalName,
    legalName: row.legalName,
    segment: row.industrySegment ?? row.businessSegmentName ?? "Não informado",
    plan: row.planName ?? "Sem plano",
    orderId: row.orderId ?? undefined,
    diagnosticStatus,
    health: healthFromScore(score),
    lastDiagnosticAt: formatDate(row.diagnosticCompletedAt ?? row.diagnosticUpdatedAt),
    score: Math.round(score),
    evidencePending: toNumber(row.pendingEvidenceCount),
    supplierCoverage: supplierTotal > 0 ? formatPercent((supplierCompleted / supplierTotal) * 100) : "0%",
    activeUsers: toNumber(row.activeUsers),
    consultingStatus,
    consultingDate: row.appointmentStartsAt ? formatDateTime(row.appointmentStartsAt) : null,
    consultingStartsAt: row.appointmentStartsAt?.toISOString() ?? null,
    consultingSessionLimit: row.consultingSessionLimit ?? 0,
    consultingSessionsUsed: toNumber(row.consultingSessionsUsed),
    consultingAppointments: Array.isArray(row.consultingAppointmentsJson)
      ? row.consultingAppointmentsJson.map((appointment: any) => ({
          id: String(appointment.id),
          status: String(appointment.status),
          startsAt: appointment.startsAt ?? null,
          endsAt: appointment.endsAt ?? null,
          meetingUrl: appointment.meetingUrl ?? null,
        }))
      : [],
  };
}

function buildSupplierSummaryFromRow(row: AdminSupplierRow): AdminSupplierSummary {
  const score = toNumber(row.overallScore);
  const status = row.linkStatus ? mapSupplierPipeline(row.linkStatus) : "REGISTERED";
  const evidencePending = toNumber(row.pendingEvidenceCount);
  const progress =
    status === "RESPONDED"
      ? 100
      : status === "ACTIVE"
        ? 60
        : status === "OVERDUE"
          ? 35
          : status === "REGISTERED"
            ? (score > 0 ? 100 : 0)
            : evidencePending > 0
              ? 25
              : 0;

  let purchasedProducts: Array<{ name: string; status: string }> = [];
  if (row.purchasedProductsJson) {
    try {
      purchasedProducts = typeof row.purchasedProductsJson === "string"
        ? JSON.parse(row.purchasedProductsJson)
        : row.purchasedProductsJson;
    } catch (e) {
      console.error("Failed to parse purchasedProductsJson", e);
    }
  }

  let linkedCompanies: Array<{ id: string; name: string; status: string }> = [];
  if (row.linkedCompaniesJson) {
    try {
      linkedCompanies = typeof row.linkedCompaniesJson === "string"
        ? JSON.parse(row.linkedCompaniesJson)
        : row.linkedCompaniesJson;
    } catch (e) {
      console.error("Failed to parse linkedCompaniesJson", e);
    }
  }

  return {
    id: row.id,
    companyName: row.tradeName ?? row.legalName,
    contactEmail: row.primaryEmail ?? "Não informado",
    segment: row.industrySegment ?? row.businessSegmentName ?? "Não informado",
    status,
    progress,
    score: Math.round(score),
    evidencePending,
    invitedAt: formatDate(row.invitedAt ?? row.diagnosticCreatedAt),
    lastUpdate: formatDate(row.linkUpdatedAt ?? row.diagnosticUpdatedAt),
    purchasedProducts,
    linkedCompanies,
  };
}

function buildEvidenceSummary(item: LoadedEvidenceSummary): AdminEvidenceSummary {
  const reviewStatus = mapReviewStatus(item.uploadStatus, item.verificationStatus);
  const buyerOrganization =
    item.diagnostic.organization.supplierBuyerLinks[0]?.buyerOrganization ??
    item.diagnostic.organization.buyerSupplierLinks[0]?.supplierOrganization ??
    null;
  const companyName =
    item.diagnostic.kind === "SUPPLIER_DIAGNOSTIC"
      ? buyerOrganization?.tradeName ??
        buyerOrganization?.legalName ??
        item.diagnostic.organization.tradeName ??
        item.diagnostic.organization.legalName ??
        "Não informado"
      : item.diagnostic.organization.tradeName ?? item.diagnostic.organization.legalName ?? "Não informado";
  const supplierName =
    item.diagnostic.kind === "SUPPLIER_DIAGNOSTIC"
      ? item.diagnostic.organization.tradeName ?? item.diagnostic.organization.legalName ?? "Não informado"
      : item.diagnostic.organization.buyerSupplierLinks[0]?.supplierOrganization.tradeName ??
        item.diagnostic.organization.buyerSupplierLinks[0]?.supplierOrganization.legalName ??
        item.diagnostic.organization.tradeName ??
        item.diagnostic.organization.legalName ??
        "Não informado";

  return {
    id: item.id,
    title: item.diagnosticResponse?.questionText ?? item.description ?? item.fileName,
    companyName,
    supplierName,
    axis: mapAxis(item.diagnosticResponse?.axis),
    questionCode: item.diagnosticResponse?.questionCode ?? (item.diagnosticResponse?.questionOrder ? `Q${item.diagnosticResponse.questionOrder}` : "Q-?"),
    status: reviewStatus,
    uploadDate: formatDate(item.uploadedAt ?? item.createdAt),
    reviewer:
      reviewStatus === "VERIFIED"
        ? "Validado"
        : reviewStatus === "REJECTED"
          ? "Rejeitado"
          : reviewStatus === "UNDER_REVIEW"
            ? "Em análise"
            : "Aguardando",
    fileName: item.fileName,
    severity: severityFromReview(reviewStatus),
  };
}

function buildEvidenceSummaryFromRow(row: AdminEvidenceRow): AdminEvidenceSummary {
  const reviewStatus = mapReviewStatus(row.uploadStatus, row.verificationStatus);

  return {
    id: row.id,
    title: row.title ?? row.fileName,
    companyName: row.companyName ?? "Não informado",
    supplierName: row.supplierName ?? "Não informado",
    axis: mapAxis(row.axis),
    questionCode: row.questionCode ?? (row.questionOrder ? `Q${row.questionOrder}` : "Q-?"),
    status: reviewStatus,
    uploadDate: formatDate(row.uploadedAt ?? row.createdAt),
    reviewer:
      reviewStatus === "VERIFIED"
        ? "Validado"
        : reviewStatus === "REJECTED"
          ? "Rejeitado"
          : reviewStatus === "UNDER_REVIEW"
            ? "Em análise"
            : "Aguardando",
    fileName: row.fileName,
    severity: severityFromReview(reviewStatus),
  };
}

function getEvidenceDiagnostic(org: any) {
  return (
    org.subjectDiagnostics.find((diagnostic: any) => diagnostic.status === "COMPLETED") ??
    org.subjectDiagnostics[0] ??
    null
  );
}

function getAxisScores(score: any, axis: AxisKey) {
  switch (axis) {
    case "E":
      return {
        score: Number(score?.environmentalScore ?? 0),
        provenScore: Number(score?.provenEnvironmentalScore ?? score?.environmentalScore ?? 0),
      };
    case "B":
      return {
        score: Number(score?.bioeconomyCircularScore ?? 0),
        provenScore: Number(score?.provenBioeconomyCircularScore ?? score?.bioeconomyCircularScore ?? 0),
      };
    case "S":
      return {
        score: Number(score?.socialScore ?? 0),
        provenScore: Number(score?.provenSocialScore ?? score?.socialScore ?? 0),
      };
    case "G":
    default:
      return {
        score: Number(score?.governanceScore ?? 0),
        provenScore: Number(score?.provenGovernanceScore ?? score?.governanceScore ?? 0),
      };
  }
}

function buildEvidencePillarsFromDiagnostic(diagnostic: any, companyEvidences: any[] = [], companyEvidenceScores: any[] = []): AdminEvidencePillarSummary[] {
  const axes: AxisKey[] = ["E", "B", "S", "G"];

  return axes.map((axis) => {
    const axisResponses = (diagnostic?.responses ?? []).filter((response: any) => mapAxis(response.axis) === axis);
    const axisEvidences = companyEvidences.filter((evidence: any) => mapAxis(
      evidence.request?.requirement?.primaryAxis ?? evidence.diagnosticResponse?.axis,
    ) === axis);
    const verifiedEvidence = axisEvidences.filter((evidence: any) => evidence.verificationStatus === "VERIFIED").length;
    const pendingEvidence = axisEvidences.filter((evidence: any) => evidence.verificationStatus === "PENDING").length;
    const score = getAxisScores(diagnostic?.score, axis);
    const evidenceScoreAxis = {
      E: Axis.ENVIRONMENTAL,
      B: Axis.BIOECONOMY_CIRCULAR,
      S: Axis.SOCIAL,
      G: Axis.GOVERNANCE,
    }[axis];
    const provenScore = Number(
      companyEvidenceScores.find((item: any) => item.axis === evidenceScoreAxis)?.provenScore ?? 0,
    );
    const storedEvidenceScore = companyEvidenceScores.find((item: any) => item.axis === evidenceScoreAxis);

    return {
      axis,
      label: axisLabels[axis],
      score: Math.round(score.score),
      provenScore: Math.round(provenScore),
      approvedPoints: Number(storedEvidenceScore?.approvedPoints ?? 0),
      totalAvailablePoints: Number(storedEvidenceScore?.totalAvailablePoints ?? evidencePillarPointTotals[evidenceScoreAxis]),
      evidenceTotal: axisEvidences.length,
      verifiedEvidence,
      pendingEvidence,
      responseTotal: axisResponses.length,
      gap: Math.max(0, Math.round(score.score - provenScore)),
    };
  });
}

function buildEvidenceCompanySummary(org: any): AdminEvidenceCompanySummary | null {
  const accessContext = buildAuthAccessContext({
    organizationUsers: [
      {
        organization: org,
      },
    ],
  });

  if (!accessContext) {
    return null;
  }

  const diagnostic = getEvidenceDiagnostic(org);
  const score = diagnostic?.score;
  const overallScore = Number(score?.overallScore ?? 0);
  // A nota comprovada só existe depois que evidências são aprovadas.
  // Não usar a nota declarada como fallback: isso faria a tela exibir uma
  // comprovação que ainda não foi feita.
  const companyEvidenceScores = org.evidenceScores ?? [];
  const companyEvidences = org.evidences ?? [];
  const evidenceIndices = calculateEvidenceIndices(companyEvidences.flatMap((evidence: any) => {
    const requirement = evidence.request?.requirement;
    return requirement ? [{
      requirementId: requirement.id,
      points: Number(requirement.points ?? 0),
      scoringAxes: Array.isArray(requirement.scoringAxes) ? requirement.scoringAxes.filter((value: unknown): value is string => typeof value === "string") : [],
      verified: evidence.verificationStatus === "VERIFIED",
    }] : [];
  }));
  const provenOverallScore = companyEvidenceScores.length
    ? Math.round(
      (companyEvidenceScores as Array<{ provenScore: Prisma.Decimal | number }>).reduce(
        (total, item) => total + Number(item.provenScore ?? 0),
        0,
      ) / 4,
    )
    : 0;
  const pillars = buildEvidencePillarsFromDiagnostic(diagnostic, companyEvidences, companyEvidenceScores);
  const evidencePending = companyEvidences.filter(
    (evidence: any) => evidence.verificationStatus === "PENDING",
  ).length;
  const evidenceVerified = companyEvidences.filter(
    (evidence: any) => evidence.verificationStatus === "VERIFIED",
  ).length;
  const evidenceAnalyzed = companyEvidences.filter(
    (evidence: any) => evidence.verificationStatus === "VERIFIED" || evidence.verificationStatus === "REJECTED",
  ).length;

  if (evidencePending === 0) {
    return null;
  }
  const documents = companyEvidences.map((evidence: any) => {
    const status = mapReviewStatus(evidence.uploadStatus, evidence.verificationStatus);
    return {
      id: evidence.id,
      evidenceName: evidence.request?.requirement?.name ?? evidence.documentType ?? evidence.fileName,
      documentType: evidence.documentType ?? evidence.fileName,
      fileName: evidence.fileName,
      axis: mapAxis(evidence.request?.requirement?.primaryAxis ?? evidence.diagnosticResponse?.axis),
      status,
      uploadDate: formatDate(evidence.uploadedAt ?? evidence.createdAt),
      reviewedBy: evidence.reviews?.[0]
        ? evidence.reviews[0].reviewer.fullName ?? evidence.reviews[0].reviewer.email ?? "Usuário responsável"
        : null,
      reviewedAt: evidence.reviews?.[0]?.reviewedAt?.toISOString() ?? null,
    };
  });
  const accessLabel = accessContext.purchasedServices[0]?.name ?? (
    accessContext.hasEvidenceAccess || accessContext.hasAssessmentAccess
      ? "Acesso a evidências"
      : "Acesso de diagnóstico"
  );

  return {
    id: org.id,
    companyName: org.tradeName ?? org.legalName,
    legalName: org.legalName,
    category: org.businessCategory?.name ?? "Não informado",
    segment: org.businessSegment?.name ?? org.industrySegment ?? "Não informado",
    accessLabel,
    diagnosticStatus:
      diagnostic?.status === "COMPLETED"
        ? "COMPLETED"
        : diagnostic
          ? "DRAFT"
          : "CONTRACTED",
    score: Math.round(overallScore),
    provenScore: Math.round(provenOverallScore),
    icebScore: evidenceIndices.iceb,
    evidencePending,
    evidenceVerified,
    evidenceAnalyzed,
    lastDiagnosticAt: formatDate(diagnostic?.completedAt ?? diagnostic?.updatedAt ?? org.updatedAt),
    pillars,
    documents,
  };
}

function buildEvidenceSummaryFromAnalyticsItem(item: { org: LoadedOrganizationWithDiagnostics; diagnostic: any; evidence: any }): AdminEvidenceSummary {
  const { org, diagnostic, evidence } = item;
  const response = diagnostic.responses.find((entry: any) => entry.id === evidence.diagnosticResponseId);
  const buyerOrganization =
    org.supplierBuyerLinks[0]?.buyerOrganization ??
    org.buyerSupplierLinks[0]?.supplierOrganization ??
    null;
  const companyName =
    diagnostic.kind === "SUPPLIER_DIAGNOSTIC"
      ? buyerOrganization?.tradeName ?? buyerOrganization?.legalName ?? org.tradeName ?? org.legalName
      : org.tradeName ?? org.legalName;
  const supplierName =
    diagnostic.kind === "SUPPLIER_DIAGNOSTIC"
      ? org.tradeName ?? org.legalName
      : org.buyerSupplierLinks[0]?.supplierOrganization.tradeName ??
        org.buyerSupplierLinks[0]?.supplierOrganization.legalName ??
        org.tradeName ??
        org.legalName;
  const reviewStatus = mapReviewStatus(evidence.uploadStatus, evidence.verificationStatus);
  const questionCode = response?.questionCode ?? (response?.questionOrder ? `Q${response.questionOrder}` : "Q-?");

  return {
    id: evidence.id,
    title: response?.questionText ?? evidence.description ?? evidence.fileName,
    companyName,
    supplierName,
    axis: mapAxis(response?.axis),
    questionCode,
    status: reviewStatus,
    uploadDate: formatDate(evidence.uploadedAt ?? evidence.createdAt),
    reviewer:
      reviewStatus === "VERIFIED"
        ? "Validado"
        : reviewStatus === "REJECTED"
          ? "Rejeitado"
          : reviewStatus === "UNDER_REVIEW"
            ? "Em análise"
            : "Aguardando",
    fileName: evidence.fileName,
    severity: severityFromReview(reviewStatus),
  };
}

function buildAxisInsights(diagnostics: Array<{ diagnostic: any }>): AdminAxisInsight[] {
  const axes: AxisKey[] = ["E", "B", "S", "G"];

  return axes.map((axis) => {
    const values = diagnostics
      .map(({ diagnostic }) => diagnostic.score)
      .filter(Boolean)
      .map((score) => ({
        score: Number(
          axis === "E"
            ? score.environmentalScore ?? 0
            : axis === "B"
              ? score.bioeconomyCircularScore ?? 0
              : axis === "S"
                ? score.socialScore ?? 0
                : score.governanceScore ?? 0
        ),
        proven: Number(
          axis === "E"
            ? score.provenEnvironmentalScore ?? score.environmentalScore ?? 0
            : axis === "B"
              ? score.provenBioeconomyCircularScore ?? score.bioeconomyCircularScore ?? 0
              : axis === "S"
                ? score.provenSocialScore ?? score.socialScore ?? 0
                : score.provenGovernanceScore ?? score.governanceScore ?? 0
        ),
      }));

    const axisResponses = diagnostics.flatMap(({ diagnostic }) =>
      diagnostic.responses
        .filter((response: any) => mapAxis(response.axis) === axis)
        .map((response: any) => response)
    );

    const axisEvidences = diagnostics.flatMap(({ diagnostic }) =>
      diagnostic.responses
        .filter((response: any) => mapAxis(response.axis) === axis)
        .flatMap((response: any) => response.evidences.map((evidence: any) => evidence))
    );

    const pendingItems = axisEvidences.filter((evidence: any) => evidence.verificationStatus === "PENDING").length;
    const verifiedItems = axisEvidences.filter((evidence: any) => evidence.verificationStatus === "VERIFIED").length;
    const totalEvidenceItems = axisEvidences.length;
    const averageScore = values.length
      ? values.reduce((total, item) => total + item.score, 0) / values.length
      : 0;
    const responseRate = axisResponses.length
      ? (axisResponses.filter((response: any) => response.score !== null && response.score !== undefined).length /
          axisResponses.length) * 100
      : 0;
    const evidenceCoverage = totalEvidenceItems ? (verifiedItems / totalEvidenceItems) * 100 : 0;
    const trend = values.length
      ? values.reduce((total, item) => total + (item.score - item.proven), 0) / values.length
      : 0;

    return {
      axis,
      label: axisLabels[axis],
      score: Math.round(averageScore),
      responseRate: Math.round(responseRate),
      evidenceCoverage: Math.round(evidenceCoverage),
      pendingItems,
      trend: Math.round(trend),
    };
  });
}

function buildTrend(organizations: LoadedOrganizationWithDiagnostics[]): AdminTrendPoint[] {
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: formatMonthLabel(date),
    };
  });

  const completedDiagnostics = collectDiagnostics(organizations).filter(
    ({ diagnostic }) => diagnostic.status === "COMPLETED" && diagnostic.score
  );

  return months.map(({ key, label }) => {
    const scores = completedDiagnostics
      .filter(({ diagnostic }) => {
        const date = new Date(diagnostic.completedAt ?? diagnostic.updatedAt);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}` === key;
      })
      .map(({ diagnostic }) => Number(diagnostic.score?.overallScore ?? 0));

    const value = scores.length ? Math.round(scores.reduce((total, current) => total + current, 0) / scores.length) : 0;
    return { label, value };
  });
}

function buildMaturityBands(organizations: LoadedOrganizationWithDiagnostics[]) {
  const scores = collectDiagnostics(organizations)
    .filter(({ diagnostic }) => diagnostic.status === "COMPLETED" && diagnostic.score)
    .map(({ diagnostic }) => Number(diagnostic.score?.overallScore ?? 0));

  const buckets = [
    { label: "Inicial", tone: "rose" as const, min: 0, max: 25, count: 0 },
    { label: "Básico", tone: "amber" as const, min: 26, max: 50, count: 0 },
    { label: "Estruturado", tone: "slate" as const, min: 51, max: 75, count: 0 },
    { label: "Avançado", tone: "emerald" as const, min: 76, max: 100, count: 0 },
  ];

  for (const score of scores) {
    const bucket = buckets.find((item) => score >= item.min && score <= item.max);
    if (bucket) {
      bucket.count += 1;
    }
  }

  const total = scores.length || 1;

  return buckets.map((bucket) => ({
    label: bucket.label,
    value: Math.round((bucket.count / total) * 100),
    tone: bucket.tone,
  }));
}

function buildAxisInsightsFromRows(rows: AdminAnalyticsAxisRow[]): AdminAxisInsight[] {
  const rowByAxis = new Map(rows.map((row) => [row.axis, row]));
  const axes: AxisKey[] = ["E", "B", "S", "G"];

  return axes.map((axis) => {
    const row = rowByAxis.get(axis);
    const score = toNumber(row?.averageScore);
    const provenScore = toNumber(row?.averageProvenScore ?? row?.averageScore);
    const responseTotal = toNumber(row?.responseTotal);
    const responseAnswered = toNumber(row?.responseAnswered);
    const evidenceTotal = toNumber(row?.evidenceTotal);
    const evidenceVerified = toNumber(row?.evidenceVerified);

    return {
      axis,
      label: axisLabels[axis],
      score: Math.round(score),
      responseRate: safePercent(responseAnswered, responseTotal),
      evidenceCoverage: safePercent(evidenceVerified, evidenceTotal),
      pendingItems: toNumber(row?.evidencePending),
      trend: Math.round(score - provenScore),
    };
  });
}

function buildTrendFromRows(rows: AdminAnalyticsMonthRow[]): AdminTrendPoint[] {
  return rows.map((row) => {
    const [year, month] = row.monthKey.split("-").map(Number);
    return {
      label: formatMonthLabel(new Date(year, month - 1, 1)),
      value: Math.round(toNumber(row.averageScore)),
    };
  });
}

function buildMaturityBandsFromSummary(summary: AdminAnalyticsSummaryRow | undefined) {
  const total = toNumber(summary?.completedDiagnostics) || 1;

  return [
    { label: "Inicial", value: safePercent(toNumber(summary?.bandInicial), total), tone: "rose" as const },
    { label: "Básico", value: safePercent(toNumber(summary?.bandBasico), total), tone: "amber" as const },
    { label: "Estruturado", value: safePercent(toNumber(summary?.bandEstruturado), total), tone: "slate" as const },
    { label: "Avançado", value: safePercent(toNumber(summary?.bandAvancado), total), tone: "emerald" as const },
  ];
}

function buildInsights(
  clientHighlights: AdminClientSummary[],
  supplierHighlights: AdminSupplierSummary[],
  evidenceHighlights: AdminEvidenceSummary[],
  axisInsights: AdminAxisInsight[]
): AdminInsightCard[] {
  const criticalClient = clientHighlights.find((client) => client.health === "critical");
  const pendingEvidences = evidenceHighlights.filter((evidence) => evidence.status === "PENDING").length;
  const lowAxis = [...axisInsights].sort((a, b) => a.score - b.score)[0];
  const supplierResponseRate =
    supplierHighlights.length > 0
      ? Math.round(
          (supplierHighlights.filter((supplier) => supplier.status === "RESPONDED").length / supplierHighlights.length) *
            100
        )
      : 0;

  return [
    {
      title: lowAxis ? `${lowAxis.label} precisa de reforço` : "Sem base analítica suficiente",
      description: lowAxis
        ? `O pilar ${lowAxis.label} está com score médio de ${lowAxis.score}/100 e ${lowAxis.pendingItems} itens pendentes.`
        : "Ainda não há diagnósticos suficientes para sintetizar os pilares.",
      tone: lowAxis && lowAxis.score < 60 ? "amber" : "slate",
    },
    {
      title: criticalClient ? `${criticalClient.tradeName} está em atenção` : "Carteira estável no momento",
      description: criticalClient
        ? `${criticalClient.tradeName} aparece com score ${criticalClient.score}/100 e ${criticalClient.evidencePending} evidências pendentes.`
        : "Nenhuma conta crítica apareceu entre os clientes mais recentes.",
      tone: criticalClient ? "rose" : "emerald",
    },
    {
      title: pendingEvidences > 0 ? "Fila de evidências aberta" : "Fila de evidências controlada",
      description:
        pendingEvidences > 0
          ? `${pendingEvidences} evidências ainda aguardam validação técnica.`
          : "Não há evidências pendentes no recorte atual do painel.",
      tone: pendingEvidences > 0 ? "amber" : "emerald",
    },
    {
      title: supplierResponseRate < 70 ? "Resposta da cadeia abaixo do ideal" : "Resposta da cadeia saudável",
      description:
        supplierResponseRate < 70
          ? `A taxa de fornecedores respondidos está em ${supplierResponseRate}%.`
          : `A taxa de fornecedores respondidos está em ${supplierResponseRate}%.`,
      tone: supplierResponseRate < 70 ? "amber" : "emerald",
    },
  ];
}

function buildOverviewInsights(
  clientHighlights: AdminClientSummary[],
  supplierHighlights: AdminSupplierSummary[],
  evidenceHighlights: AdminEvidenceSummary[],
  metrics: AdminMetric[]
): AdminInsightCard[] {
  const criticalClient = clientHighlights.find((client) => client.health === "critical");
  const pendingEvidences = metrics.find((metric) => metric.id === "evidence-pending");
  const lowConfidenceSuppliers = supplierHighlights.filter((supplier) => supplier.status !== "RESPONDED").length;
  const strongestSupplier = supplierHighlights[0];

  return [
    {
      title: criticalClient ? `${criticalClient.tradeName} está em atenção` : "Carteira estável no momento",
      description: criticalClient
        ? `${criticalClient.tradeName} aparece com score ${criticalClient.score}/100 e ${criticalClient.evidencePending} evidências pendentes.`
        : "Nenhuma conta crítica apareceu entre os clientes exibidos.",
      tone: criticalClient ? "rose" : "emerald",
    },
    {
      title:
        pendingEvidences && Number(pendingEvidences.value) > 0
          ? "Fila de evidências aberta"
          : "Fila de evidências controlada",
      description:
        pendingEvidences && Number(pendingEvidences.value) > 0
          ? `${pendingEvidences.value} evidências ainda aguardam validação técnica.`
          : "Não há evidências pendentes no recorte atual do painel.",
      tone: pendingEvidences && Number(pendingEvidences.value) > 0 ? "amber" : "emerald",
    },
    {
      title: lowConfidenceSuppliers > 0 ? "Cadeia ainda tem lacunas" : "Cadeia com resposta saudável",
      description:
        strongestSupplier && lowConfidenceSuppliers > 0
          ? `${lowConfidenceSuppliers} fornecedores ainda não responderam. O mais avançado está em ${strongestSupplier.progress}%.`
          : "A cadeia exibida no painel está com boa resposta.",
      tone: lowConfidenceSuppliers > 0 ? "amber" : "emerald",
    },
  ];
}

async function loadGlobalMetrics() {
  const cacheKey = "admin:global-metrics:v2";
  const cachedMetrics = await cache.get<AdminMetric[]>(cacheKey);
  if (cachedMetrics) {
    return cachedMetrics;
  }

  if (globalMetricsPromise) {
    return globalMetricsPromise;
  }

  globalMetricsPromise = buildGlobalMetrics(cacheKey);
  void globalMetricsPromise.finally(() => {
    globalMetricsPromise = null;
  }).catch(() => undefined);

  return globalMetricsPromise;
}

async function buildGlobalMetrics(cacheKey: string) {
  const {
    openBudgets,
    activeClients,
    pendingEvidences,
    paidBudgetsCount,
    paidBudgetsTotalCents,
  } = await adminRepository.getGlobalMetricCounts();

  const metrics = [
    {
      id: "budgets-open",
      label: "Orçamentos pendentes",
      value: String(openBudgets),
      detail: `${openBudgets} aguardando resposta`,
      tone: "amber" as const,
    },
    {
      id: "clients-active",
      label: "Clientes ativos",
      value: String(activeClients),
      detail: `${activeClients} organizações com perfil de cliente`,
      tone: "emerald" as const,
    },
    {
      id: "evidence-pending",
      label: "Evidências pendentes",
      value: String(pendingEvidences),
      detail: `${pendingEvidences} em validação`,
      tone: "rose" as const,
    },
    {
      id: "budgets-total-revenue",
      label: "Faturamento total",
      value: formatCurrencyFromCents(paidBudgetsTotalCents),
      detail: `${paidBudgetsCount} ${paidBudgetsCount === 1 ? "orçamento pago" : "orçamentos pagos"}`,
      tone: "emerald" as const,
    },
  ] satisfies AdminMetric[];

  await cache.set(cacheKey, metrics, 30_000);
  return metrics;
}

async function loadOrganizationsSummary(options?: {
  where?: Prisma.OrganizationWhereInput;
  pagination?: PaginationInput;
}) {
  const pagination = options?.pagination;

  return prisma.organization.findMany({
    where: options?.where,
    skip: pagination ? (pagination.page - 1) * pagination.limit : undefined,
    take: pagination?.limit,
    select: {
      id: true,
      legalName: true,
      tradeName: true,
      primaryEmail: true,
      industrySegment: true,
      size: true,
      annualRevenue: true,
      phone: true,
      porte: true,
      archivedAt: true,
      createdAt: true,
      updatedAt: true,
      esgInteresse: true,
      esgJaPossui: true,
      roles: {
        select: {
          role: true,
        },
      },
      users: {
        select: {
          id: true,
        },
      },
      businessCategory: {
        select: {
          name: true,
          code: true,
        },
      },
      businessSegment: {
        select: {
          name: true,
          code: true,
        },
      },
      subscriptions: {
        where: {
          status: {
            in: ["ACTIVE", "TRIALING", "PAST_DUE"],
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        include: {
          plan: {
            include: {
              product: {
                select: {
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      },
      buyerSupplierLinks: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          status: true,
        },
      },
      supplierBuyerLinks: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          status: true,
          invitedAt: true,
          updatedAt: true,
        },
      },
      subjectDiagnostics: {
        orderBy: {
          updatedAt: "desc",
        },
        select: {
          id: true,
          kind: true,
          status: true,
          completedAt: true,
          createdAt: true,
          updatedAt: true,
          score: {
            select: {
              overallScore: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function loadOrganizationsForAnalytics() {
  return prisma.organization.findMany({
    include: {
      roles: {
        select: {
          role: true,
        },
      },
      users: {
        select: {
          id: true,
        },
      },
      businessCategory: {
        select: {
          name: true,
          code: true,
        },
      },
      businessSegment: {
        select: {
          name: true,
          code: true,
        },
      },
      subscriptions: {
        where: {
          status: {
            in: ["ACTIVE", "TRIALING", "PAST_DUE"],
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        include: {
          plan: {
            include: {
              product: {
                select: {
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      },
      buyerSupplierLinks: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          supplierOrganization: {
            select: {
              id: true,
              tradeName: true,
              legalName: true,
              industrySegment: true,
              primaryEmail: true,
            },
          },
        },
      },
      supplierBuyerLinks: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          buyerOrganization: {
            select: {
              id: true,
              tradeName: true,
              legalName: true,
              industrySegment: true,
              primaryEmail: true,
            },
          },
        },
      },
      subjectDiagnostics: {
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          score: true,
          responses: {
            orderBy: {
              questionOrder: "asc",
            },
            include: {
              evidences: {
                select: {
                  id: true,
                  fileName: true,
                  filePath: true,
                  fileUrl: true,
                  uploadStatus: true,
                  verificationStatus: true,
                  evidenceCategory: true,
                  uploadedAt: true,
                  createdAt: true,
                  updatedAt: true,
                  diagnosticId: true,
                  diagnosticResponseId: true,
                },
              },
            },
          },
          evidences: {
            select: {
              id: true,
              fileName: true,
              filePath: true,
              fileUrl: true,
              uploadStatus: true,
              verificationStatus: true,
              evidenceCategory: true,
              uploadedAt: true,
              createdAt: true,
              updatedAt: true,
              diagnosticId: true,
              diagnosticResponseId: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function loadEvidenceOrganizations() {
  return prisma.organization.findMany({
    where: {
      archivedAt: null,
      roles: {
        some: {
          role: "COMPANY",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      legalName: true,
      tradeName: true,
      cnpj: true,
      industrySegment: true,
      createdAt: true,
      updatedAt: true,
      roles: {
        select: {
          role: true,
        },
      },
      businessCategory: {
        select: {
          name: true,
        },
      },
      businessSegment: {
        select: {
          name: true,
        },
      },
      subscriptions: {
        where: {
          status: {
            in: ["ACTIVE", "TRIALING", "PAST_DUE"],
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        include: {
          plan: {
            include: {
              product: {
                select: {
                  code: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      entitlements: {
        where: {
          status: "ACTIVE",
        },
        select: {
          id: true,
          status: true,
          featureFlag: {
            select: {
              code: true,
              name: true,
            },
          },
        },
      },
      orders: {
        where: {
          status: "PAID",
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          orderType: true,
          status: true,
          paidAt: true,
          placedAt: true,
          createdAt: true,
          items: {
            select: {
              quantity: true,
              unitPriceCents: true,
              product: {
                select: {
                  code: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
        },
      },
      subjectDiagnostics: {
        orderBy: {
          updatedAt: "desc",
        },
        select: {
          id: true,
          kind: true,
          status: true,
          completedAt: true,
          createdAt: true,
          updatedAt: true,
          score: {
            select: {
              overallScore: true,
              environmentalScore: true,
              bioeconomyCircularScore: true,
              socialScore: true,
              governanceScore: true,
              provenOverallScore: true,
              provenEnvironmentalScore: true,
              provenBioeconomyCircularScore: true,
              provenSocialScore: true,
              provenGovernanceScore: true,
            },
          },
          evidences: {
            select: {
              id: true,
              fileName: true,
              documentType: true,
              description: true,
              uploadedAt: true,
              createdAt: true,
              diagnosticResponseId: true,
              uploadStatus: true,
              verificationStatus: true,
              request: {
                select: {
                  requirement: {
                    select: {
                      name: true,
                      primaryAxis: true,
                    },
                  },
                },
              },
              reviews: {
                orderBy: { reviewedAt: "desc" },
                take: 1,
                select: {
                  reviewedAt: true,
                  reviewer: {
                    select: {
                      fullName: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
          responses: {
            orderBy: {
              questionOrder: "asc",
            },
            select: {
              axis: true,
              evidences: {
                select: {
                  id: true,
                  fileName: true,
                  description: true,
                  uploadedAt: true,
                  createdAt: true,
                  diagnosticResponseId: true,
                  verificationStatus: true,
                  uploadStatus: true,
                },
              },
            },
          },
        },
      },
      evidenceScores: {
        select: {
          axis: true,
          approvedPoints: true,
          totalAvailablePoints: true,
          provenScore: true,
          approvedEvidenceCount: true,
        },
      },
      evidences: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          organizationId: true,
          diagnosticId: true,
          fileName: true,
          documentType: true,
          description: true,
          uploadedAt: true,
          createdAt: true,
          diagnosticResponseId: true,
          uploadStatus: true,
          verificationStatus: true,
          diagnosticResponse: { select: { axis: true } },
          request: {
            select: {
              requirement: { select: { id: true, name: true, primaryAxis: true, points: true, scoringAxes: true } },
            },
          },
          reviews: {
            orderBy: { reviewedAt: "desc" },
            take: 1,
            select: {
              reviewedAt: true,
              reviewer: { select: { fullName: true, email: true } },
            },
          },
        },
      },
    },
  });
}

async function loadBudgetRequestsPage(pagination?: PaginationInput) {
  const [items, totalItems] = await Promise.all([
    prisma.budgetRequest.findMany({
      skip: pagination ? (pagination.page - 1) * pagination.limit : undefined,
      take: pagination?.limit,
      include: {
        organization: {
          include: {
            businessCategory: {
              select: {
                name: true,
              },
            },
            businessSegment: {
              select: {
                name: true,
              },
            },
          },
        },
        product: {
          include: {
            service: {
              select: {
                basePriceCents: true,
                pricingType: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.budgetRequest.count(),
  ]);

  return {
    items,
    pagination: buildPaginationMeta(totalItems, {
      page: pagination?.page ?? 1,
      limit: pagination?.limit ?? DEFAULT_PAGE_SIZE,
    }),
  };
}

async function loadEvidenceSummariesPage(pagination?: PaginationInput) {
  const [items, totalItems] = await Promise.all([
    prisma.evidence.findMany({
      skip: pagination ? (pagination.page - 1) * pagination.limit : undefined,
      take: pagination?.limit,
      orderBy: [
        { uploadedAt: "desc" },
        { createdAt: "desc" },
      ],
      include: {
        diagnostic: {
          include: {
            organization: {
              include: {
                buyerSupplierLinks: {
                  orderBy: {
                    createdAt: "desc",
                  },
                  include: {
                    supplierOrganization: {
                      select: {
                        tradeName: true,
                        legalName: true,
                        primaryEmail: true,
                      },
                    },
                  },
                },
                supplierBuyerLinks: {
                  orderBy: {
                    createdAt: "desc",
                  },
                  include: {
                    buyerOrganization: {
                      select: {
                        tradeName: true,
                        legalName: true,
                        primaryEmail: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        diagnosticResponse: {
          select: {
            questionCode: true,
            questionOrder: true,
            questionText: true,
            axis: true,
          },
        },
      },
    }),
    prisma.evidence.count(),
  ]);

  return {
    items,
    pagination: buildPaginationMeta(totalItems, {
      page: pagination?.page ?? 1,
      limit: pagination?.limit ?? DEFAULT_PAGE_SIZE,
    }),
  };
}

async function loadPendingEvidenceCountsByDiagnosticIds(diagnosticIds: string[]) {
  if (!diagnosticIds.length) {
    return new Map<string, number>();
  }

  const groups = await prisma.evidence.groupBy({
    by: ["diagnosticId"],
    where: {
      diagnosticId: {
        in: diagnosticIds,
      },
      verificationStatus: "PENDING",
    },
    _count: {
      _all: true,
    },
  });

  return new Map(groups.map((group) => [group.diagnosticId, group._count._all]));
}

async function loadOrganizations() {
  return prisma.organization.findMany({
    include: {
      roles: {
        select: {
          role: true,
        },
      },
      users: {
        select: {
          id: true,
        },
      },
      businessCategory: {
        select: {
          name: true,
          code: true,
        },
      },
      businessSegment: {
        select: {
          name: true,
          code: true,
        },
      },
      subscriptions: {
        where: {
          status: {
            in: ["ACTIVE", "TRIALING", "PAST_DUE"],
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        include: {
          plan: {
            include: {
              product: {
                select: {
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      },
      buyerSupplierLinks: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          supplierOrganization: {
            select: {
              id: true,
              tradeName: true,
              legalName: true,
              industrySegment: true,
              primaryEmail: true,
            },
          },
        },
      },
      supplierBuyerLinks: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          buyerOrganization: {
            select: {
              id: true,
              tradeName: true,
              legalName: true,
              industrySegment: true,
              primaryEmail: true,
            },
          },
        },
      },
      subjectDiagnostics: {
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          score: true,
          responses: {
            orderBy: {
              questionOrder: "asc",
            },
            include: {
              evidences: {
                select: {
                  id: true,
                  fileName: true,
                  filePath: true,
                  fileUrl: true,
                  uploadStatus: true,
                  verificationStatus: true,
                  evidenceCategory: true,
                  uploadedAt: true,
                  createdAt: true,
                  updatedAt: true,
                  diagnosticId: true,
                  diagnosticResponseId: true,
                },
              },
            },
          },
          evidences: {
            select: {
              id: true,
              fileName: true,
              filePath: true,
              fileUrl: true,
              uploadStatus: true,
              verificationStatus: true,
              evidenceCategory: true,
              uploadedAt: true,
              createdAt: true,
              updatedAt: true,
              diagnosticId: true,
              diagnosticResponseId: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

async function loadBudgetRequests() {
  return prisma.budgetRequest.findMany({
    include: {
      organization: {
        include: {
          businessCategory: {
            select: {
              name: true,
            },
          },
          businessSegment: {
            select: {
              name: true,
            },
          },
        },
      },
      product: {
        include: {
          service: {
            select: {
              basePriceCents: true,
              pricingType: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

function buildSnapshotMetrics(organizations: LoadedOrganizationWithDiagnostics[], budgetRequests: any[]): AdminMetric[] {
  const allSupplierLinks = organizations.flatMap((org) => org.buyerSupplierLinks);
  const allEvidences = organizations.flatMap((org) =>
    org.subjectDiagnostics.flatMap((diagnostic) => diagnostic.evidences)
  );

  const openBudgets = budgetRequests.filter((request) => ["SOLICITADO", "RESPONDIDO"].includes(request.status));
  const activeClients = organizations.filter((org) => isCompanyOrganization(org) && org.archivedAt === null);
  const pendingEvidences = allEvidences.filter((evidence) => evidence.verificationStatus === "PENDING");
  const respondedSuppliers = allSupplierLinks.filter((link) => link.status === "COMPLETED").length;

  return [
    {
      id: "budgets-open",
      label: "Orçamentos em aberto",
      value: String(openBudgets.length),
      detail: `${openBudgets.length} aguardando revisão`,
      tone: "amber",
    },
    {
      id: "clients-active",
      label: "Clientes ativos",
      value: String(activeClients.length),
      detail: `${activeClients.length} organizações com perfil de cliente`,
      tone: "emerald",
    },
    {
      id: "evidence-pending",
      label: "Evidências pendentes",
      value: String(pendingEvidences.length),
      detail: `${pendingEvidences.length} em validação`,
      tone: "rose",
    },
    {
      id: "suppliers-responded",
      label: "Fornecedores respondidos",
      value: `${respondedSuppliers}/${allSupplierLinks.length || 1}`,
      detail: `${allSupplierLinks.length ? Math.round((respondedSuppliers / allSupplierLinks.length) * 100) : 0}% de resposta na base`,
      tone: "slate",
    },
  ];
}

function buildEvidenceBoardMetrics(companies: AdminEvidenceCompanySummary[]): AdminMetric[] {
  const companiesWithAccess = companies.length;
  const pendingEvidences = companies.reduce((total, company) => total + company.evidencePending, 0);
  const analyzedEvidences = companies.reduce((total, company) => total + company.evidenceAnalyzed, 0);

  return [
    {
      id: "evidence-companies",
      label: "Empresas no fluxo",
      value: String(companiesWithAccess),
      detail: "Com documentos para análise",
      tone: "emerald" as const,
    },
    {
      id: "evidence-pending",
      label: "Documentos pendentes",
      value: String(pendingEvidences),
      detail: "Aguardando análise",
      tone: "amber" as const,
    },
    {
      id: "evidence-analyzed",
      label: "Evidências analisadas",
      value: String(analyzedEvidences),
      detail: "Validadas ou rejeitadas",
      tone: "slate" as const,
    },
  ];
}

function buildClientSummaries(
  organizations: LoadedOrganization[],
  pendingEvidenceByDiagnosticId: Map<string, number> = new Map()
): AdminClientSummary[] {
  return organizations
    .filter((org) => isCompanyOrganization(org))
    .map((org) => buildClientSummary(org, pendingEvidenceByDiagnosticId))
    .filter((client): client is AdminClientSummary => Boolean(client))
    .sort((a, b) => {
      if (a.health !== b.health) {
        const healthWeight: Record<ClientHealth, number> = {
          critical: 0,
          watch: 1,
          healthy: 2,
        };

        return healthWeight[a.health] - healthWeight[b.health];
      }

      return a.score - b.score;
    });
}

function buildSupplierSummaries(
  organizations: LoadedOrganization[],
  pendingEvidenceByDiagnosticId: Map<string, number> = new Map()
): AdminSupplierSummary[] {
  return organizations
    .filter((org) => isSupplierOrganization(org))
    .map((org) => buildSupplierSummary(org, pendingEvidenceByDiagnosticId))
    .filter((supplier): supplier is AdminSupplierSummary => Boolean(supplier))
    .sort((a, b) => {
      const weight: Record<SupplierPipeline, number> = {
        OVERDUE: 0,
        ACTIVE: 1,
        INVITED: 2,
        RESPONDED: 3,
        REGISTERED: 4,
      };

      if (weight[a.status] !== weight[b.status]) {
        return weight[a.status] - weight[b.status];
      }

      return b.score - a.score;
    });
}

function buildEvidenceSummariesFromPage(items: LoadedEvidenceSummary[]): AdminEvidenceSummary[] {
  return items.map((item) => buildEvidenceSummary(item)).sort((a, b) => {
    const reviewWeight: Record<ReviewStatus, number> = {
      PENDING: 0,
      UNDER_REVIEW: 1,
      REJECTED: 2,
      VERIFIED: 3,
    };

    if (reviewWeight[a.status] !== reviewWeight[b.status]) {
      return reviewWeight[a.status] - reviewWeight[b.status];
    }

    return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
  });
}

function buildEvidenceSummaries(organizations: LoadedOrganizationWithDiagnostics[]): AdminEvidenceSummary[] {
  return collectEvidenceSummaries(organizations)
    .map((item) => buildEvidenceSummaryFromAnalyticsItem(item))
    .sort((a, b) => {
      const reviewWeight: Record<ReviewStatus, number> = {
        PENDING: 0,
        UNDER_REVIEW: 1,
        REJECTED: 2,
        VERIFIED: 3,
      };

      if (reviewWeight[a.status] !== reviewWeight[b.status]) {
        return reviewWeight[a.status] - reviewWeight[b.status];
      }

      return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
    });
}

export class AdminService {
  async getOverview(): Promise<AdminOverviewModel> {
    const t0 = Date.now();
    const [metrics, budgetRows, clientRows, supplierRows, evidenceRows, appointmentRows] = await Promise.all([
      measureAdminStep("overview.metrics", loadGlobalMetrics()),
      measureAdminStep("overview.budgets", adminRepository.findBudgetRows({ page: 1, limit: 3 })),
      measureAdminStep("overview.clients", adminRepository.findClientRows({ page: 1, limit: 4 })),
      measureAdminStep("overview.suppliers", adminRepository.findSupplierRows({ page: 1, limit: 4 })),
      measureAdminStep("overview.evidences", adminRepository.findEvidenceRows({ page: 1, limit: 4 })),
      measureAdminStep("overview.appointments", adminRepository.findUpcomingConsultingAppointments(5)),
    ]);

    const queue = budgetRows.map((row) => buildBudgetRequestFromRow(row));
    const clientHighlights = clientRows.map((row) => buildClientSummaryFromRow(row)).slice(0, 4);
    const supplierHighlights = supplierRows.map((row) => buildSupplierSummaryFromRow(row)).slice(0, 4);
    const evidenceHighlights = evidenceRows.map((row) => buildEvidenceSummaryFromRow(row)).slice(0, 4);
    const upcomingAppointments = appointmentRows.map((row: AdminUpcomingAppointmentRow) => ({
      id: row.id,
      organizationName: row.tradeName ?? row.legalName,
      status: row.status as "REQUESTED" | "CONFIRMED",
      startsAt: row.startsAt.toISOString(),
      endsAt: row.endsAt?.toISOString() ?? null,
    }));

    const result: AdminOverviewModel = {
      metrics,
      queue,
      clientHighlights,
      supplierHighlights,
      evidenceHighlights,
      insights: buildOverviewInsights(clientHighlights, supplierHighlights, evidenceHighlights, metrics),
      upcomingAppointments,
    };

    console.log(`[adminService] overview.total → ${Date.now() - t0}ms`);
    return result;
  }

  async getBudgets(pagination: PaginationInput): Promise<AdminBudgetBoardModel> {
    const t0 = Date.now();
    const [metrics, rows] = await Promise.all([
      measureAdminStep("budgets.metrics", loadGlobalMetrics()),
      measureAdminStep("budgets.rows", adminRepository.findBudgetRows(pagination)),
    ]);
    const requests = rows.map((row) => buildBudgetRequestFromRow(row));
    const totalItems = Number(rows[0]?.totalCount ?? 0);

    const groupedByStatus: Record<BudgetStatus, number> = {
      PENDING: 0,
      IN_REVIEW: 0,
      PROPOSAL_SENT: 0,
      APPROVED: 0,
      REJECTED: 0,
      ACTIVE: 0,
    };

    let openValueCents = 0;

    for (const row of rows) {
      const status = mapBudgetStatus(row.status);
      groupedByStatus[status] += 1;

      if (row.status === "SOLICITADO" || row.status === "RESPONDIDO") {
        openValueCents += row.basePriceCents ?? 0;
      }
    }

    const result: AdminBudgetBoardModel = {
      metrics,
      requests,
      groupedByStatus,
      openValue: formatCurrencyFromCents(openValueCents),
      pagination: buildPaginationMeta(totalItems, pagination),
    };

    console.log(`[adminService] budgets.total → ${Date.now() - t0}ms`);
    return result;
  }

  async getClients(pagination: PaginationInput): Promise<AdminClientBoardModel> {
    const t0 = Date.now();
    const [metrics, rows] = await Promise.all([
      measureAdminStep("clients.metrics", loadGlobalMetrics()),
      measureAdminStep("clients.rows", adminRepository.findClientRows(pagination)),
    ]);

    const clients = rows.map((row) => buildClientSummaryFromRow(row));
    const totalItems = Number(rows[0]?.totalCount ?? 0);

    const healthDistribution: Record<ClientHealth, number> = {
      healthy: 0,
      watch: 0,
      critical: 0,
    };

    for (const client of clients) {
      healthDistribution[client.health] += 1;
    }

    const result: AdminClientBoardModel = {
      metrics,
      clients,
      healthDistribution,
      pagination: buildPaginationMeta(totalItems, pagination),
    };

    console.log(`[adminService] clients.total → ${Date.now() - t0}ms`);
    return result;
  }

  async getConsulting(pagination: PaginationInput): Promise<AdminClientBoardModel> {
    const t0 = Date.now();
    const [metrics, rows] = await Promise.all([
      measureAdminStep("consulting.metrics", loadGlobalMetrics()),
      measureAdminStep("consulting.rows", adminRepository.findConsultingRows(pagination)),
    ]);

    console.log("[getConsulting] Found consulting client rows:", rows.map(r => ({
      organizationId: r.id,
      tradeName: r.tradeName,
      legalName: r.legalName,
      purchasedProduct: r.planName
    })));

    const clients = rows.map((row) => buildClientSummaryFromRow(row));
    const totalItems = Number(rows[0]?.totalCount ?? 0);

    const healthDistribution: Record<ClientHealth, number> = {
      healthy: 0,
      watch: 0,
      critical: 0,
    };

    for (const client of clients) {
      healthDistribution[client.health] += 1;
    }

    const result: AdminClientBoardModel = {
      metrics,
      clients,
      healthDistribution,
      pagination: buildPaginationMeta(totalItems, pagination),
    };

    console.log(`[adminService] consulting.total → ${Date.now() - t0}ms`);
    return result;
  }

  async getSuppliers(pagination: PaginationInput): Promise<AdminSupplierBoardModel> {
    const t0 = Date.now();
    const [metrics, rows] = await Promise.all([
      measureAdminStep("suppliers.metrics", loadGlobalMetrics()),
      measureAdminStep("suppliers.rows", adminRepository.findSupplierRows(pagination)),
    ]);

    const suppliers = rows.map((row) => buildSupplierSummaryFromRow(row));
    const totalItems = Number(rows[0]?.totalCount ?? 0);

    const pipeline: Record<SupplierPipeline, number> = {
      INVITED: 0,
      ACTIVE: 0,
      RESPONDED: 0,
      OVERDUE: 0,
      REGISTERED: 0,
    };

    for (const supplier of suppliers) {
      pipeline[supplier.status] += 1;
    }

    const result: AdminSupplierBoardModel = {
      metrics,
      suppliers,
      pipeline,
      pagination: buildPaginationMeta(totalItems, pagination),
    };

    console.log(`[adminService] suppliers.total → ${Date.now() - t0}ms`);
    return result;
  }

  async getEvidences(pagination: PaginationInput): Promise<AdminEvidenceBoardModel> {
    const t0 = Date.now();
    const organizations = await measureAdminStep("evidences.organizations", loadEvidenceOrganizations());
    const companies = organizations
      .map((org) => buildEvidenceCompanySummary(org))
      .filter((company): company is AdminEvidenceCompanySummary => company !== null)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.companyName.localeCompare(b.companyName);
      });
    const paginatedCompanies = companies.slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit);
    const result: AdminEvidenceBoardModel = {
      metrics: buildEvidenceBoardMetrics(companies),
      companies: paginatedCompanies,
      pagination: buildPaginationMeta(companies.length, pagination),
    };

    console.log(`[adminService] evidences.total → ${Date.now() - t0}ms`);
    return result;
  }

  async getAnalytics(): Promise<AdminAnalyticsBoardModel> {
    const t0 = Date.now();
    const [summary, axisRows, monthRows, clientRows, supplierRows, evidenceRows] = await Promise.all([
      measureAdminStep("analytics.summary", adminRepository.getAnalyticsSummaryRow()),
      measureAdminStep("analytics.axes", adminRepository.getAnalyticsAxisRows()),
      measureAdminStep("analytics.trend", adminRepository.getAnalyticsMonthRows()),
      measureAdminStep("analytics.clients", adminRepository.findClientRows({ page: 1, limit: 4 })),
      measureAdminStep("analytics.suppliers", adminRepository.findSupplierRows({ page: 1, limit: 4 })),
      measureAdminStep("analytics.evidences", adminRepository.findEvidenceRows({ page: 1, limit: 4 })),
    ]);
    const axisInsights = buildAxisInsightsFromRows(axisRows);
    const trend = buildTrendFromRows(monthRows);
    const maturityBands = buildMaturityBandsFromSummary(summary);
    const clientHighlights = clientRows.map((row) => buildClientSummaryFromRow(row));
    const supplierHighlights = supplierRows.map((row) => buildSupplierSummaryFromRow(row));
    const evidenceHighlights = evidenceRows.map((row) => buildEvidenceSummaryFromRow(row));
    const notes = buildInsights(clientHighlights, supplierHighlights, evidenceHighlights, axisInsights).slice(0, 3);
    const averageScore = Math.round(toNumber(summary?.averageScore));
    const provenGap = Math.round(toNumber(summary?.provenGap));
    const averageDaysToClose = Math.round(toNumber(summary?.averageDaysToClose));
    const evidenceCoverage = safePercent(toNumber(summary?.evidenceVerified), toNumber(summary?.evidenceTotal));

    const result = {
      metrics: [
        {
          id: "global-score",
          label: "Score médio consolidado",
          value: `${averageScore}`,
          detail: "Média dos pilares ativos",
          tone: "emerald" as const,
        },
        {
          id: "proven-gap",
          label: "Gap comprovado",
          value: `${provenGap}`,
          detail: "Diferença entre declarado e comprovado",
          tone: "amber" as const,
        },
        {
          id: "time-to-close",
          label: "Tempo médio de fechamento",
          value: `${averageDaysToClose} dias`,
          detail: "Da abertura ao fechamento",
          tone: "slate" as const,
        },
        {
          id: "evidence-coverage",
          label: "Cobertura de evidências",
          value: `${evidenceCoverage}%`,
          detail: "Média das evidências validadas",
          tone: "rose" as const,
        },
      ],
      axisInsights,
      trend,
      maturityBands,
      notes,
    };

    console.log(`[adminService] analytics.total → ${Date.now() - t0}ms`);
    return result;
  }

  async getFinance(pagination: PaginationInput = { page: 1, limit: 10 }, productId = "ALL", status = "ALL"): Promise<AdminFinanceBoardModel> {
    const t0 = Date.now();
    const [summary, orders, payments, products, productsOptions, filteredOrderCount] = await Promise.all([
      measureAdminStep("finance.summary", adminRepository.getFinanceSummaryRow()),
      measureAdminStep("finance.orders", adminRepository.findFinanceOrders({ ...pagination, productId, status })),
      measureAdminStep("finance.payments", adminRepository.findFinancePayments(6)),
      measureAdminStep("finance.products", adminRepository.findFinanceProducts(8)),
      measureAdminStep("finance.productOptions", adminRepository.findFinanceProductOptions()),
      measureAdminStep("finance.orderCount", adminRepository.countFinanceOrders(productId, status)),
    ]);

    const totalOrders = toNumber(summary?.totalOrders);
    const pendingOrders = toNumber(summary?.pendingOrders);
    const paidOrders = toNumber(summary?.paidOrders);
    const totalPayments = toNumber(summary?.totalPayments);
    const paidPayments = toNumber(summary?.paidPayments);
    const activeProducts = toNumber(summary?.activeProducts);
    const activeSubscriptions = toNumber(summary?.activeSubscriptions);
    const grossRevenue = toNumber(summary?.grossRevenueCents);
    const pendingRevenue = toNumber(summary?.pendingRevenueCents);
    const averageTicket = toNumber(summary?.averageTicketCents);

    const result: AdminFinanceBoardModel = {
      metrics: [
        {
          id: "finance-orders",
          label: "Pedidos totais",
          value: String(totalOrders),
          detail: `${paidOrders} pagos e ${pendingOrders} pendentes`,
          tone: "emerald",
        },
        {
          id: "finance-revenue",
          label: "Receita realizada",
          value: formatCurrencyFromCents(grossRevenue),
          detail: `${paidPayments} pagamentos confirmados`,
          tone: "amber",
        },
        {
          id: "finance-pending",
          label: "Valores em aberto",
          value: formatCurrencyFromCents(pendingRevenue),
          detail: "Pedidos aguardando confirmação",
          tone: "rose",
        },
        {
          id: "finance-products",
          label: "Produtos ativos",
          value: String(activeProducts),
          detail: `${activeSubscriptions} assinaturas ativas na base`,
          tone: "slate",
        },
      ],
      purchases: {
        totalOrders,
        pendingOrders,
        paidOrders,
        recentOrders: orders.map((row: AdminFinanceOrderRow) => ({
          id: row.id,
          organizationName: row.organizationName ?? row.legalName,
          legalName: row.legalName,
          orderType: formatFinanceOrderType(row.orderType),
          status: row.status,
          totalValue: formatCurrencyFromCents(toNumber(row.totalCents)),
          itemCount: toNumber(row.itemCount),
          products: (row.productNames ?? "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          productKinds: (row.productKinds ?? "")
            .split(",")
            .map((item) => formatFinanceProductKind(item.trim()))
            .filter(Boolean),
          createdAt: formatDate(row.createdAt),
          paidAt: formatDate(row.paidAt),
        })),
        pagination: buildPaginationMeta(toNumber(filteredOrderCount), pagination),
        productOptions: (productsOptions as AdminFinanceProductOptionRow[]).map((product) => ({
          id: product.id,
          name: product.name,
        })),
      },
      sales: {
        totalPayments,
        paidPayments,
        grossRevenue: formatCurrencyFromCents(grossRevenue),
        pendingRevenue: formatCurrencyFromCents(pendingRevenue),
        averageTicket: formatCurrencyFromCents(averageTicket),
        recentPayments: payments.map((row: AdminFinancePaymentRow) => ({
          id: row.id,
          organizationName: row.organizationName ?? row.legalName,
          legalName: row.legalName,
          orderId: row.orderId,
          orderType: formatFinanceOrderType(row.orderType),
          orderStatus: row.orderStatus,
          method: formatFinancePaymentMethod(row.method),
          status: row.status,
          amountValue: formatCurrencyFromCents(toNumber(row.amountCents)),
          provider: row.provider ?? "Não informado",
          paidAt: formatDate(row.paidAt),
          createdAt: formatDate(row.createdAt),
        })),
      },
      products: {
        activeProducts,
        activeSubscriptions,
        recentProducts: products.map((row: AdminFinanceProductRow) => ({
          id: row.id,
          code: row.code,
          name: row.name,
          kind: formatFinanceProductKind(row.productKind),
          active: row.active,
          orderCount: toNumber(row.orderCount),
          paidOrderCount: toNumber(row.paidOrderCount),
          grossValue: formatCurrencyFromCents(toNumber(row.grossCents)),
          lastOrderAt: formatDate(row.lastOrderAt),
        })),
      },
    };

    console.log(`[adminService] finance.total → ${Date.now() - t0}ms`);
    return result;
  }

  async getBooks(pagination: PaginationInput): Promise<AdminBooksBoardModel> {
    const t0 = Date.now();
    const [summary, rows] = await Promise.all([
      measureAdminStep("books.summary", adminRepository.getBookSummaryRow()),
      measureAdminStep("books.rows", adminRepository.findBookSalesRows(pagination)),
    ]);

    const result: AdminBooksBoardModel = {
      metrics: [
        {
          id: "books-sold",
          label: "Livros vendidos",
          value: String(toNumber(summary?.totalBooksSold)),
          detail: `${toNumber(summary?.totalOrders)} pedidos com o livro`,
          tone: "emerald",
        },
        {
          id: "books-revenue",
          label: "Faturamento dos livros",
          value: formatCurrencyFromCents(toNumber(summary?.grossRevenueCents)),
          detail: `${toNumber(summary?.paidOrders)} vendas pagas`,
          tone: "amber",
        },
        {
          id: "books-buyers",
          label: "Empresas compradoras",
          value: String(toNumber(summary?.buyersCount)),
          detail: "CNPJs distintos com a compra",
          tone: "slate",
        },
        {
          id: "books-pending",
          label: "Pagamentos em aberto",
          value: formatCurrencyFromCents(toNumber(summary?.pendingRevenueCents)),
          detail: `${toNumber(summary?.pendingOrders)} pedidos aguardando pagamento`,
          tone: "rose",
        },
      ],
      summary: {
        totalOrders: toNumber(summary?.totalOrders),
        totalBooksSold: toNumber(summary?.totalBooksSold),
        paidOrders: toNumber(summary?.paidOrders),
        pendingOrders: toNumber(summary?.pendingOrders),
        buyersCount: toNumber(summary?.buyersCount),
        grossRevenue: formatCurrencyFromCents(toNumber(summary?.grossRevenueCents)),
        paidRevenue: formatCurrencyFromCents(toNumber(summary?.paidRevenueCents)),
        pendingRevenue: formatCurrencyFromCents(toNumber(summary?.pendingRevenueCents)),
        averageBookPrice: formatCurrencyFromCents(toNumber(summary?.averageBookPriceCents)),
      },
      sales: rows.map((row: AdminBookSaleRow) => ({
        id: row.id,
        companyName: row.organizationName ?? row.legalName,
        legalName: row.legalName,
        cnpj: row.cnpj,
        address: formatBookAddress(row),
        orderStatus: formatBookOrderStatus(row.orderStatus),
        paymentStatus: formatBookPaymentStatus(row.paymentStatus),
        paymentMethod: row.paymentMethod ? formatFinancePaymentMethod(row.paymentMethod) : "Não informado",
        paymentProvider: row.paymentProvider ?? "Não informado",
        quantity: toNumber(row.bookQuantity),
        bookRevenue: formatCurrencyFromCents(toNumber(row.bookRevenueCents)),
        orderTotal: formatCurrencyFromCents(toNumber(row.orderTotalCents)),
        createdAt: formatDateTime(row.createdAt),
        paidAt: formatDateTime(row.paidAt),
      })),
      pagination: buildPaginationMeta(Number(rows[0]?.totalCount ?? 0), pagination),
    };

    console.log(`[adminService] books.total → ${Date.now() - t0}ms`);
    return result;
  }

  async respondToBudget(id: string, proposalValueCents: number) {
    const budgetRequest = await prisma.budgetRequest.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });

    if (!budgetRequest) {
      throw new Error("Solicitação de orçamento não encontrada.");
    }

    const updated = await prisma.budgetRequest.update({
      where: { id },
      data: {
        status: "RESPONDIDO",
        proposedPriceCents: proposalValueCents,
      },
    });

    return updated;
  }

  async getEvidencePreview(supabaseUserId: string, evidenceId: string) {
    const admin = await authRepository.findAdminUserBySupabaseUserId(supabaseUserId);
    if (!admin) throw new Error("Acesso administrativo não autorizado");

    const evidence = await prisma.evidence.findUnique({
      where: { id: evidenceId },
      select: { id: true, fileName: true, mimeType: true, filePath: true, storageBucket: true },
    });
    if (!evidence) throw new Error("Evidência não encontrada");

    const { data, error } = await supabaseAdminClient.storage
      .from(evidence.storageBucket)
      .createSignedUrl(evidence.filePath, 10 * 60);
    if (error || !data?.signedUrl) throw new Error("Não foi possível gerar a pré-visualização do arquivo");

    return { evidenceId: evidence.id, fileName: evidence.fileName, mimeType: evidence.mimeType, signedUrl: data.signedUrl };
  }

  async getEvidenceNotes(supabaseUserId: string, evidenceId: string) {
    const admin = await authRepository.findAdminUserBySupabaseUserId(supabaseUserId);
    if (!admin) throw new Error("Acesso administrativo não autorizado");

    const evidence = await prisma.evidence.findUnique({
      where: { id: evidenceId },
      select: { id: true },
    });
    if (!evidence) throw new Error("Evidência não encontrada");

    const notes = await prisma.evidenceNote.findMany({
      where: { evidenceId },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: { select: { fullName: true, email: true } },
      },
    });

    return notes.map((note) => ({
      id: note.id,
      content: note.content,
      authorName: note.author.fullName?.trim() || note.author.email,
      createdAt: note.createdAt.toISOString(),
    }));
  }

  async createEvidenceNote(supabaseUserId: string, evidenceId: string, content: string) {
    const admin = await authRepository.findAdminUserBySupabaseUserId(supabaseUserId);
    if (!admin) throw new Error("Acesso administrativo não autorizado");

    const evidence = await prisma.evidence.findUnique({
      where: { id: evidenceId },
      select: { id: true },
    });
    if (!evidence) throw new Error("Evidência não encontrada");

    const note = await prisma.evidenceNote.create({
      data: {
        evidenceId,
        authorUserId: admin.user.id,
        content,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: { select: { fullName: true, email: true } },
      },
    });

    return {
      id: note.id,
      content: note.content,
      authorName: note.author.fullName?.trim() || note.author.email,
      createdAt: note.createdAt.toISOString(),
    };
  }

  async reviewEvidence(supabaseUserId: string, evidenceId: string, status: "VERIFIED" | "REJECTED", comment?: string) {
    const admin = await authRepository.findAdminUserBySupabaseUserId(supabaseUserId);
    if (!admin) throw new Error("Acesso administrativo não autorizado");

    return prisma.$transaction(async (tx) => {
      const evidence = await tx.evidence.findUnique({
        where: { id: evidenceId },
        select: {
          id: true,
          organizationId: true,
          diagnosticId: true,
          diagnostic: { select: { organizationId: true } },
          request: {
            select: {
              requirement: {
                select: { primaryAxis: true },
              },
            },
          },
          verificationStatus: true,
        },
      });
      if (!evidence) throw new Error("Evidência não encontrada");

      await tx.evidenceReview.create({
        data: {
          evidenceId,
          reviewerUserId: admin.user.id,
          previousStatus: evidence.verificationStatus,
          newStatus: status === "VERIFIED" ? VerificationStatus.VERIFIED : VerificationStatus.REJECTED,
          comment: comment?.trim() || null,
        },
      });

      const updatedEvidence = await tx.evidence.update({
        where: { id: evidenceId },
        data: {
          verificationStatus: status === "VERIFIED" ? VerificationStatus.VERIFIED : VerificationStatus.REJECTED,
          verifiedAt: new Date(),
        },
        select: { id: true, verificationStatus: true },
      });

      if (evidence.request?.requirement) {
        const companyEvidences = await tx.evidence.findMany({
          where: { organizationId: evidence.organizationId },
          select: {
            verificationStatus: true,
            request: {
              select: {
                requirement: { select: { id: true, points: true, scoringAxes: true } },
              },
            },
          },
        });
        const indices = calculateEvidenceIndices(companyEvidences.flatMap((companyEvidence) => {
          const requirement = companyEvidence.request?.requirement;
          return requirement ? [{
            requirementId: requirement.id,
            points: requirement.points,
            scoringAxes: Array.isArray(requirement.scoringAxes) ? requirement.scoringAxes.filter((value): value is string => typeof value === "string") : [],
            verified: companyEvidence.verificationStatus === VerificationStatus.VERIFIED,
          }] : [];
        }));
        await Promise.all(evidenceScoreAxes.map((axis) => tx.evidenceScore.upsert({
          where: { organizationId_axis: { organizationId: evidence.organizationId, axis } },
          update: {
            approvedPoints: indices.pillarPoints[axis].approvedPoints,
            totalAvailablePoints: indices.pillarPoints[axis].totalAvailablePoints,
            provenScore: indices.pillars[axis],
            approvedEvidenceCount: companyEvidences.filter((companyEvidence) => companyEvidence.verificationStatus === VerificationStatus.VERIFIED).length,
          },
          create: {
            organizationId: evidence.organizationId,
            axis,
            approvedPoints: indices.pillarPoints[axis].approvedPoints,
            totalAvailablePoints: indices.pillarPoints[axis].totalAvailablePoints,
            provenScore: indices.pillars[axis],
            approvedEvidenceCount: companyEvidences.filter((companyEvidence) => companyEvidence.verificationStatus === VerificationStatus.VERIFIED).length,
          },
        })));
      }

      await Promise.all([
        invalidateCurrentDiagnosticCache(evidence.diagnostic.organizationId),
        cache.delete(`auth:profile:v2:${supabaseUserId}`),
      ]);

      console.info("[AdminService.reviewEvidence] Cache de evidências invalidado", {
        evidenceId,
        diagnosticId: evidence.diagnosticId,
        organizationId: evidence.diagnostic.organizationId,
        reviewerSupabaseUserId: supabaseUserId,
      });

      return updatedEvidence;
    });
  }
}
