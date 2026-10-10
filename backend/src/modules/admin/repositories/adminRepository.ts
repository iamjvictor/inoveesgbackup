import { Prisma } from "@prisma/client";

import { prisma } from "../../../lib/prisma.js";

export interface AdminListInput {
  page: number;
  limit: number;
}

export interface AdminClientRow {
  id: string;
  tradeName: string | null;
  legalName: string;
  industrySegment: string | null;
  businessSegmentName: string | null;
  planName: string | null;
  orderId?: string | null;
  diagnosticStatus: string | null;
  diagnosticUpdatedAt: Date | null;
  diagnosticCompletedAt: Date | null;
  overallScore: Prisma.Decimal | number | null;
  pendingEvidenceCount: bigint | number;
  supplierTotal: bigint | number;
  supplierCompleted: bigint | number;
  activeUsers: bigint | number;
  totalCount: bigint | number;
  appointmentStatus: string | null;
  appointmentStartsAt: Date | null;
}

export interface AdminSupplierRow {
  id: string;
  tradeName: string | null;
  legalName: string;
  primaryEmail: string | null;
  industrySegment: string | null;
  businessSegmentName: string | null;
  linkStatus: string | null;
  invitedAt: Date | null;
  linkUpdatedAt: Date | null;
  diagnosticStatus: string | null;
  diagnosticUpdatedAt: Date | null;
  diagnosticCreatedAt: Date | null;
  overallScore: Prisma.Decimal | number | null;
  pendingEvidenceCount: bigint | number;
  totalCount: bigint | number;
  purchasedProductsJson?: any;
  linkedCompaniesJson?: any;
}

export interface AdminBudgetRow {
  id: string;
  organizationName: string | null;
  legalName: string;
  industrySegment: string | null;
  businessSegmentName: string | null;
  businessCategoryName: string | null;
  size: string | null;
  annualRevenue: string | null;
  phone: string | null;
  porte: string | null;
  esgInteresse: string[] | null;
  esgJaPossui: string[] | null;
  productName: string | null;
  months: number | null;
  status: string;
  basePriceCents: number | null;
  proposedPriceCents: number | null;
  pricingType: string | null;
  createdAt: Date;
  updatedAt: Date;
  totalCount: bigint | number;
  paymentPaidAt?: Date | null;
  paymentAmountCents?: number | null;
  paymentMethod?: string | null;
  paymentProvider?: string | null;
  paymentProviderRef?: string | null;
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
}

export interface AdminEvidenceRow {
  id: string;
  title: string | null;
  companyName: string | null;
  supplierName: string | null;
  diagnosticKind: string;
  questionCode: string | null;
  questionOrder: number | null;
  axis: string | null;
  uploadStatus: string;
  verificationStatus: string;
  uploadedAt: Date | null;
  createdAt: Date;
  fileName: string;
  totalCount: bigint | number;
}

export interface AdminFinanceSummaryRow {
  totalOrders: bigint | number;
  paidOrders: bigint | number;
  pendingOrders: bigint | number;
  totalPayments: bigint | number;
  paidPayments: bigint | number;
  activeProducts: bigint | number;
  activeSubscriptions: bigint | number;
  grossRevenueCents: bigint | number;
  pendingRevenueCents: bigint | number;
  averageTicketCents: Prisma.Decimal | number | null;
}

export interface AdminFinanceOrderRow {
  id: string;
  organizationName: string | null;
  legalName: string;
  orderType: string;
  status: string;
  totalCents: bigint | number;
  currency: string;
  itemCount: bigint | number;
  productNames: string | null;
  productKinds: string | null;
  totalCount: bigint | number;
  createdAt: Date;
  paidAt: Date | null;
}

export interface AdminFinanceProductOptionRow {
  id: string;
  name: string;
}

export interface AdminFinanceOrderCountRow {
  totalCount: bigint | number;
}

export interface AdminFinancePaymentRow {
  id: string;
  organizationName: string | null;
  legalName: string;
  orderId: string;
  orderType: string;
  orderStatus: string;
  method: string;
  status: string;
  amountCents: bigint | number;
  currency: string;
  provider: string | null;
  paidAt: Date | null;
  createdAt: Date;
}

export interface AdminFinanceProductRow {
  id: string;
  code: string;
  name: string;
  productKind: string;
  active: boolean;
  orderCount: bigint | number;
  paidOrderCount: bigint | number;
  grossCents: bigint | number;
  lastOrderAt: Date | null;
}

export interface AdminBookSummaryRow {
  totalOrders: bigint | number;
  totalBooksSold: bigint | number;
  paidOrders: bigint | number;
  pendingOrders: bigint | number;
  buyersCount: bigint | number;
  grossRevenueCents: bigint | number;
  paidRevenueCents: bigint | number;
  pendingRevenueCents: bigint | number;
  averageBookPriceCents: Prisma.Decimal | number | null;
}

export interface AdminBookSaleRow {
  id: string;
  organizationName: string | null;
  legalName: string;
  cnpj: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  enderecoCompleto: string | null;
  municipioEstado: string | null;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string | null;
  paymentProvider: string | null;
  bookQuantity: bigint | number;
  bookRevenueCents: bigint | number;
  orderTotalCents: bigint | number;
  currency: string;
  createdAt: Date;
  paidAt: Date | null;
  totalCount: bigint | number;
}

export interface AdminAnalyticsAxisRow {
  axis: string;
  averageScore: Prisma.Decimal | number | null;
  averageProvenScore: Prisma.Decimal | number | null;
  responseTotal: bigint | number;
  responseAnswered: bigint | number;
  evidenceTotal: bigint | number;
  evidenceVerified: bigint | number;
  evidencePending: bigint | number;
}

export interface AdminAnalyticsMonthRow {
  monthKey: string;
  averageScore: Prisma.Decimal | number | null;
}

export interface AdminAnalyticsSummaryRow {
  averageScore: Prisma.Decimal | number | null;
  provenGap: Prisma.Decimal | number | null;
  averageDaysToClose: Prisma.Decimal | number | null;
  evidenceTotal: bigint | number;
  evidenceVerified: bigint | number;
  bandInicial: bigint | number;
  bandBasico: bigint | number;
  bandEstruturado: bigint | number;
  bandAvancado: bigint | number;
  completedDiagnostics: bigint | number;
}

interface AdminGlobalMetricCountsRow {
  openBudgets: bigint | number;
  activeClients: bigint | number;
  pendingEvidences: bigint | number;
  respondedSuppliers: bigint | number;
  totalSupplierLinks: bigint | number;
  paidBudgetsCount: bigint | number;
  paidBudgetsTotalCents: bigint | number;
}

export interface AdminUpcomingAppointmentRow {
  id: string;
  status: string;
  startsAt: Date;
  endsAt: Date | null;
  tradeName: string | null;
  legalName: string;
}

export class AdminRepository {
  async getGlobalMetricCounts() {
    const [counts] = await prisma.$queryRaw<AdminGlobalMetricCountsRow[]>`
      SELECT
        (
          SELECT COUNT(*)
          FROM budget_requests br
          WHERE br.status = 'SOLICITADO'
        )::bigint AS "openBudgets",
        (
          SELECT COUNT(*)
          FROM organizations o
          WHERE o."archivedAt" IS NULL
            AND o.status = 'ACTIVE'
            AND EXISTS (
              SELECT 1
              FROM organization_roles org_role
              WHERE org_role."organizationId" = o.id
                AND org_role.role = 'COMPANY'
            )
        )::bigint AS "activeClients",
        (
          SELECT COUNT(*)
          FROM evidences e
          INNER JOIN diagnostics d ON d.id = e."diagnosticId"
          INNER JOIN organizations o ON o.id = d."organizationId"
          WHERE e."verificationStatus" = 'PENDING'
            AND d.status NOT IN ('CANCELED', 'EXPIRED')
            AND o.status = 'ACTIVE'
            AND o."archivedAt" IS NULL
        )::bigint AS "pendingEvidences",
        (
          SELECT COUNT(*)
          FROM supplier_links sl
          INNER JOIN organizations buyer ON buyer.id = sl."buyerOrganizationId"
          INNER JOIN organizations supplier ON supplier.id = sl."supplierOrganizationId"
          WHERE sl.status = 'COMPLETED'
            AND buyer.status = 'ACTIVE'
            AND supplier.status = 'ACTIVE'
        )::bigint AS "respondedSuppliers",
        (
          SELECT COUNT(*)
          FROM supplier_links sl
          INNER JOIN organizations buyer ON buyer.id = sl."buyerOrganizationId"
          INNER JOIN organizations supplier ON supplier.id = sl."supplierOrganizationId"
          WHERE sl.status IN ('INVITED', 'IN_PROGRESS', 'COMPLETED')
            AND buyer.status = 'ACTIVE'
            AND supplier.status = 'ACTIVE'
        )::bigint AS "totalSupplierLinks",
        (
          SELECT COUNT(DISTINCT br.id)
          FROM budget_requests br
          LEFT JOIN LATERAL (
            SELECT o."paidAt"
            FROM order_items oi
            INNER JOIN orders o ON o.id = oi."orderId"
            WHERE oi.metadata->>'budgetRequestId' = br.id::text
              AND o.status = 'PAID'
            LIMIT 1
          ) pay ON true
          WHERE pay."paidAt" IS NOT NULL OR br.status = 'ATIVO'
        )::bigint AS "paidBudgetsCount",
        (
          SELECT COALESCE(SUM(
            COALESCE(pay."amountPaidCents", CASE WHEN br.status = 'ATIVO' THEN br."proposedPriceCents" ELSE 0 END, 0)
          ), 0)
          FROM budget_requests br
          LEFT JOIN LATERAL (
            SELECT 
              o."paidAt",
              o."totalCents" AS "amountPaidCents"
            FROM order_items oi
            INNER JOIN orders o ON o.id = oi."orderId"
            WHERE oi.metadata->>'budgetRequestId' = br.id::text
              AND o.status = 'PAID'
            LIMIT 1
          ) pay ON true
          WHERE pay."paidAt" IS NOT NULL OR br.status = 'ATIVO'
        )::bigint AS "paidBudgetsTotalCents"
    `;

    return {
      openBudgets: Number(counts?.openBudgets ?? 0),
      activeClients: Number(counts?.activeClients ?? 0),
      pendingEvidences: Number(counts?.pendingEvidences ?? 0),
      respondedSuppliers: Number(counts?.respondedSuppliers ?? 0),
      totalSupplierLinks: Number(counts?.totalSupplierLinks ?? 0),
      paidBudgetsCount: Number(counts?.paidBudgetsCount ?? 0),
      paidBudgetsTotalCents: Number(counts?.paidBudgetsTotalCents ?? 0),
    };
  }

  async findUpcomingConsultingAppointments(limit = 5) {
    return prisma.$queryRaw<AdminUpcomingAppointmentRow[]>`
      SELECT
        ca.id,
        ca.status,
        ca."startsAt",
        ca."endsAt",
        o."tradeName",
        o."legalName"
      FROM consulting_appointments ca
      INNER JOIN organizations o ON o.id = ca."organizationId"
      WHERE ca.status IN ('REQUESTED', 'CONFIRMED')
        AND ca."startsAt" IS NOT NULL
        AND ca."startsAt" >= NOW()
        AND o.status = 'ACTIVE'
        AND o."archivedAt" IS NULL
      ORDER BY ca."startsAt" ASC
      LIMIT ${limit}
    `;
  }

  async countClients() {
    return prisma.organization.count({
      where: {
        archivedAt: null,
        roles: {
          some: {
            role: "COMPANY",
          },
        },
      },
    });
  }

  async countSuppliers() {
    return prisma.organization.count({
      where: {
        archivedAt: null,
        OR: [
          {
            roles: {
              some: {
                role: "SUPPLIER",
              },
            },
          },
          {
            supplierBuyerLinks: {
              some: {},
            },
          },
        ],
      },
    });
  }

  async findBudgetRows(input: AdminListInput) {
    const offset = (input.page - 1) * input.limit;

    return prisma.$queryRaw<AdminBudgetRow[]>`
      SELECT
        br.id,
        o."tradeName" AS "organizationName",
        o."legalName",
        o."industrySegment",
        bs.name AS "businessSegmentName",
        bc.name AS "businessCategoryName",
        o.size,
        o."annualRevenue",
        o.phone,
        o.porte,
        o."esgInteresse",
        o."esgJaPossui",
        p.name AS "productName",
        br.months,
        br.status,
        br."proposedPriceCents",
        s."basePriceCents",
        s."pricingType",
        br."createdAt",
        br."updatedAt",
        pay."paidAt" AS "paymentPaidAt",
        pay."amountPaidCents" AS "paymentAmountCents",
        pay."paymentMethod" AS "paymentMethod",
        pay.provider AS "paymentProvider",
        pay."providerReference" AS "paymentProviderRef",
        o.cnpj,
        o."primaryEmail",
        o.website,
        o."numberOfSuppliers",
        o.description,
        o."enderecoCompleto",
        o."municipioEstado",
        o."redesSociais",
        o."naturezaJuridica",
        o."tempoOperacao",
        o."alcanceMercado",
        o."specificActivity",
        COUNT(*) OVER()::bigint AS "totalCount"
      FROM budget_requests br
      INNER JOIN organizations o
        ON o.id = br."organizationId"
      LEFT JOIN business_segments bs
        ON bs.id = o."businessSegmentId"
      LEFT JOIN business_categories bc
        ON bc.id = o."businessCategoryId"
      LEFT JOIN products p
        ON p.id = br."productId"
      LEFT JOIN services s
        ON s."productId" = p.id
      LEFT JOIN LATERAL (
        SELECT 
          o."paidAt",
          o."totalCents" AS "amountPaidCents",
          p.method AS "paymentMethod",
          p.provider,
          p."providerReference"
        FROM order_items oi
        INNER JOIN orders o ON o.id = oi."orderId"
        LEFT JOIN payments p ON p."orderId" = o.id
        WHERE oi.metadata->>'budgetRequestId' = br.id::text
          AND o.status = 'PAID'
        LIMIT 1
      ) pay ON TRUE
      ORDER BY br."createdAt" DESC
      LIMIT ${input.limit}
      OFFSET ${offset}
    `;
  }

  async findEvidenceRows(input: AdminListInput) {
    const offset = (input.page - 1) * input.limit;

    return prisma.$queryRaw<AdminEvidenceRow[]>`
      SELECT
        e.id,
        COALESCE(dr."questionText", e.description, e."fileName") AS title,
        CASE
          WHEN d.kind = 'SUPPLIER_DIAGNOSTIC'
            THEN COALESCE(buyer_org."tradeName", buyer_org."legalName", org."tradeName", org."legalName")
          ELSE COALESCE(org."tradeName", org."legalName")
        END AS "companyName",
        CASE
          WHEN d.kind = 'SUPPLIER_DIAGNOSTIC'
            THEN COALESCE(org."tradeName", org."legalName")
          ELSE COALESCE(supplier_org."tradeName", supplier_org."legalName", org."tradeName", org."legalName")
        END AS "supplierName",
        d.kind AS "diagnosticKind",
        dr."questionCode",
        dr."questionOrder",
        dr.axis,
        e."uploadStatus",
        e."verificationStatus",
        e."uploadedAt",
        e."createdAt",
        e."fileName",
        COUNT(*) OVER()::bigint AS "totalCount"
      FROM evidences e
      INNER JOIN diagnostics d
        ON d.id = e."diagnosticId"
      INNER JOIN organizations org
        ON org.id = d."organizationId"
      LEFT JOIN diagnostic_responses dr
        ON dr.id = e."diagnosticResponseId"
      LEFT JOIN LATERAL (
        SELECT sl."buyerOrganizationId"
        FROM supplier_links sl
        WHERE sl."supplierOrganizationId" = org.id
        ORDER BY sl."updatedAt" DESC
        LIMIT 1
      ) buyer_link ON TRUE
      LEFT JOIN organizations buyer_org
        ON buyer_org.id = buyer_link."buyerOrganizationId"
      LEFT JOIN LATERAL (
        SELECT sl."supplierOrganizationId"
        FROM supplier_links sl
        WHERE sl."buyerOrganizationId" = org.id
        ORDER BY sl."updatedAt" DESC
        LIMIT 1
      ) supplier_link ON TRUE
      LEFT JOIN organizations supplier_org
        ON supplier_org.id = supplier_link."supplierOrganizationId"
      ORDER BY COALESCE(e."uploadedAt", e."createdAt") DESC
      LIMIT ${input.limit}
      OFFSET ${offset}
    `;
  }

  async getAnalyticsAxisRows() {
    return prisma.$queryRaw<AdminAnalyticsAxisRow[]>`
      SELECT
        axis_values.axis,
        AVG(axis_values.score) AS "averageScore",
        AVG(axis_values.proven_score) AS "averageProvenScore",
        COUNT(dr.id)::bigint AS "responseTotal",
        COUNT(dr.id) FILTER (WHERE dr.score IS NOT NULL)::bigint AS "responseAnswered",
        COUNT(e.id)::bigint AS "evidenceTotal",
        COUNT(e.id) FILTER (WHERE e."verificationStatus" = 'VERIFIED')::bigint AS "evidenceVerified",
        COUNT(e.id) FILTER (WHERE e."verificationStatus" = 'PENDING')::bigint AS "evidencePending"
      FROM diagnostics d
      INNER JOIN diagnostic_scores ds
        ON ds."diagnosticId" = d.id
      CROSS JOIN LATERAL (
        VALUES
          ('E', ds."environmentalScore", ds."provenEnvironmentalScore"),
          ('B', ds."bioeconomyCircularScore", ds."provenBioeconomyCircularScore"),
          ('S', ds."socialScore", ds."provenSocialScore"),
          ('G', ds."governanceScore", ds."provenGovernanceScore")
      ) AS axis_values(axis, score, proven_score)
      LEFT JOIN diagnostic_responses dr
        ON dr."diagnosticId" = d.id
       AND (
         (axis_values.axis = 'E' AND dr.axis = 'ENVIRONMENTAL') OR
         (axis_values.axis = 'B' AND dr.axis = 'BIOECONOMY_CIRCULAR') OR
         (axis_values.axis = 'S' AND dr.axis = 'SOCIAL') OR
         (axis_values.axis = 'G' AND dr.axis = 'GOVERNANCE')
       )
      LEFT JOIN evidences e
        ON e."diagnosticResponseId" = dr.id
      GROUP BY axis_values.axis
      ORDER BY axis_values.axis
    `;
  }

  async getAnalyticsMonthRows() {
    return prisma.$queryRaw<AdminAnalyticsMonthRow[]>`
      SELECT
        TO_CHAR(months.month_start, 'YYYY-MM') AS "monthKey",
        AVG(ds."overallScore") AS "averageScore"
      FROM generate_series(
        date_trunc('month', CURRENT_DATE) - INTERVAL '5 months',
        date_trunc('month', CURRENT_DATE),
        INTERVAL '1 month'
      ) AS months(month_start)
      LEFT JOIN diagnostics d
        ON d.status = 'COMPLETED'
       AND date_trunc('month', COALESCE(d."completedAt", d."updatedAt")) = months.month_start
      LEFT JOIN diagnostic_scores ds
        ON ds."diagnosticId" = d.id
      GROUP BY months.month_start
      ORDER BY months.month_start
    `;
  }

  async getAnalyticsSummaryRow() {
    const [row] = await prisma.$queryRaw<AdminAnalyticsSummaryRow[]>`
      WITH completed AS (
        SELECT
          d.id,
          d."createdAt",
          d."completedAt",
          d."updatedAt",
          ds."overallScore",
          COALESCE(ds."provenOverallScore", ds."overallScore") AS proven_score
        FROM diagnostics d
        INNER JOIN diagnostic_scores ds
          ON ds."diagnosticId" = d.id
        WHERE d.status = 'COMPLETED'
      )
      SELECT
        (SELECT AVG("overallScore") FROM completed) AS "averageScore",
        (SELECT AVG(GREATEST("overallScore" - proven_score, 0)) FROM completed) AS "provenGap",
        (
          SELECT AVG(EXTRACT(EPOCH FROM (COALESCE("completedAt", "updatedAt") - "createdAt")) / 86400)
          FROM completed
        ) AS "averageDaysToClose",
        (SELECT COUNT(*) FROM evidences)::bigint AS "evidenceTotal",
        (SELECT COUNT(*) FROM evidences WHERE "verificationStatus" = 'VERIFIED')::bigint AS "evidenceVerified",
        (SELECT COUNT(*) FROM completed WHERE "overallScore" BETWEEN 0 AND 25)::bigint AS "bandInicial",
        (SELECT COUNT(*) FROM completed WHERE "overallScore" BETWEEN 26 AND 50)::bigint AS "bandBasico",
        (SELECT COUNT(*) FROM completed WHERE "overallScore" BETWEEN 51 AND 75)::bigint AS "bandEstruturado",
        (SELECT COUNT(*) FROM completed WHERE "overallScore" BETWEEN 76 AND 100)::bigint AS "bandAvancado",
        (SELECT COUNT(*) FROM completed)::bigint AS "completedDiagnostics"
    `;

    return row;
  }

  async getFinanceSummaryRow() {
    const [row] = await prisma.$queryRaw<AdminFinanceSummaryRow[]>`
      WITH paid_orders AS (
        SELECT o.id, o."totalCents", o.status
        FROM orders o
        WHERE o.status = 'PAID'
      ),
      pending_orders AS (
        SELECT o.id, o."totalCents"
        FROM orders o
        WHERE o.status = 'PENDING_PAYMENT'
      )
      SELECT
        (SELECT COUNT(*) FROM orders)::bigint AS "totalOrders",
        (SELECT COUNT(*) FROM orders WHERE status = 'PAID')::bigint AS "paidOrders",
        (SELECT COUNT(*) FROM orders WHERE status = 'PENDING_PAYMENT')::bigint AS "pendingOrders",
        (SELECT COUNT(*) FROM payments)::bigint AS "totalPayments",
        (SELECT COUNT(*) FROM payments WHERE status = 'PAID')::bigint AS "paidPayments",
        (SELECT COUNT(*) FROM products WHERE active = true)::bigint AS "activeProducts",
        (SELECT COUNT(*) FROM subscriptions WHERE status IN ('ACTIVE', 'TRIALING', 'PAST_DUE'))::bigint AS "activeSubscriptions",
        COALESCE((SELECT SUM("amountCents") FROM payments WHERE status = 'PAID'), 0)::bigint AS "grossRevenueCents",
        COALESCE((SELECT SUM("totalCents") FROM orders WHERE status = 'PENDING_PAYMENT'), 0)::bigint AS "pendingRevenueCents",
        (SELECT AVG("totalCents") FROM paid_orders) AS "averageTicketCents"
    `;

    return row;
  }

  async findFinanceOrders(input: { page: number; limit: number; productId?: string; status?: string }) {
    const offset = (input.page - 1) * input.limit;
    const productFilter = input.productId && input.productId !== "ALL"
      ? Prisma.sql`AND EXISTS (
          SELECT 1
          FROM order_items oi_filter
          INNER JOIN products p_filter ON p_filter.id = oi_filter."productId"
          WHERE oi_filter."orderId" = o.id
            AND (
              p_filter.id::text = ${input.productId}
              OR p_filter.name = ${input.productId}
            )
        )`
      : Prisma.empty;
    const statusFilter = input.status && input.status !== "ALL"
      ? Prisma.sql`AND o.status = CAST(${input.status} AS "OrderStatus")`
      : Prisma.empty;

    return prisma.$queryRaw<AdminFinanceOrderRow[]>`
      SELECT
        COUNT(*) OVER()::bigint AS "totalCount",
        o.id,
        org."tradeName" AS "organizationName",
        org."legalName",
        o."orderType",
        o.status,
        o."totalCents",
        o.currency,
        COALESCE(items."itemCount", 0)::bigint AS "itemCount",
        items."productNames",
        items."productKinds",
        o."createdAt",
        o."paidAt"
      FROM orders o
      INNER JOIN organizations org
        ON org.id = o."organizationId"
      LEFT JOIN LATERAL (
        SELECT
          COUNT(*) AS "itemCount",
          string_agg(DISTINCT p.name, ', ' ORDER BY p.name) AS "productNames",
          string_agg(DISTINCT p."productKind"::text, ', ' ORDER BY p."productKind"::text) AS "productKinds"
        FROM order_items oi
        INNER JOIN products p
          ON p.id = oi."productId"
        WHERE oi."orderId" = o.id
      ) items ON TRUE
      WHERE TRUE
        ${productFilter}
        ${statusFilter}
      ORDER BY o."createdAt" DESC
      LIMIT ${input.limit}
      OFFSET ${offset}
    `;
  }

  async findFinanceProductOptions() {
    return prisma.$queryRaw<AdminFinanceProductOptionRow[]>`
      SELECT id, name
      FROM products
      WHERE active = true
      ORDER BY name ASC
    `;
  }

  async countFinanceOrders(productId?: string, status?: string) {
    const productFilter = productId && productId !== "ALL"
      ? Prisma.sql`WHERE EXISTS (
          SELECT 1
          FROM order_items oi_filter
          WHERE oi_filter."orderId" = o.id
            AND EXISTS (
              SELECT 1
              FROM products p_filter
              WHERE p_filter.id = oi_filter."productId"
                AND (
                  p_filter.id::text = ${productId}
                  OR p_filter.name = ${productId}
                )
            )
        )`
      : Prisma.empty;
    const statusFilter = status && status !== "ALL"
      ? Prisma.sql`AND o.status = CAST(${status} AS "OrderStatus")`
      : Prisma.empty;

    const [row] = await prisma.$queryRaw<AdminFinanceOrderCountRow[]>`
      SELECT COUNT(*)::bigint AS "totalCount"
      FROM orders o
      ${productFilter}
      ${statusFilter}
    `;

    return row?.totalCount ?? 0;
  }

  async findFinancePayments(limit: number) {
    return prisma.$queryRaw<AdminFinancePaymentRow[]>`
      SELECT
        pay.id,
        org."tradeName" AS "organizationName",
        org."legalName",
        o.id AS "orderId",
        o."orderType",
        o.status AS "orderStatus",
        pay.method,
        pay.status,
        pay."amountCents",
        pay.currency,
        pay.provider,
        pay."paidAt",
        pay."createdAt"
      FROM payments pay
      INNER JOIN orders o
        ON o.id = pay."orderId"
      INNER JOIN organizations org
        ON org.id = o."organizationId"
      ORDER BY COALESCE(pay."paidAt", pay."createdAt") DESC
      LIMIT ${limit}
    `;
  }

  async findFinanceProducts(limit: number) {
    return prisma.$queryRaw<AdminFinanceProductRow[]>`
      SELECT
        p.id,
        p.code,
        p.name,
        p."productKind",
        p.active,
        COALESCE(stats."orderCount", 0)::bigint AS "orderCount",
        COALESCE(stats."paidOrderCount", 0)::bigint AS "paidOrderCount",
        COALESCE(stats."grossCents", 0)::bigint AS "grossCents",
        stats."lastOrderAt"
      FROM products p
      LEFT JOIN LATERAL (
        SELECT
          COUNT(*) AS "orderCount",
          COUNT(*) FILTER (WHERE o.status = 'PAID') AS "paidOrderCount",
          COALESCE(SUM(o."totalCents"), 0) AS "grossCents",
          MAX(o."createdAt") AS "lastOrderAt"
        FROM order_items oi
        INNER JOIN orders o
          ON o.id = oi."orderId"
        WHERE oi."productId" = p.id
      ) stats ON TRUE
      ORDER BY stats."grossCents" DESC NULLS LAST, p."createdAt" DESC
      LIMIT ${limit}
    `;
  }

  async getBookSummaryRow() {
    const [row] = await prisma.$queryRaw<AdminBookSummaryRow[]>`
      WITH book_sales AS (
        SELECT
          o.id,
          o.status,
          o."totalCents",
          o.currency,
          o."createdAt",
          o."paidAt",
          o."organizationId",
          COALESCE(book_items.quantity, 0)::bigint AS quantity,
          COALESCE(book_items.revenue_cents, 0)::bigint AS revenue_cents
        FROM orders o
        INNER JOIN organizations org
          ON org.id = o."organizationId"
        INNER JOIN LATERAL (
          SELECT
            COALESCE(SUM(oi.quantity), 0)::bigint AS quantity,
            COALESCE(SUM(oi.quantity * oi."unitPriceCents"), 0)::bigint AS revenue_cents
          FROM order_items oi
          INNER JOIN products p
            ON p.id = oi."productId"
          WHERE oi."orderId" = o.id
            AND p.code = 'LIVRO_ESG'
        ) book_items ON TRUE
        WHERE COALESCE(book_items.quantity, 0) > 0
      )
      SELECT
        (SELECT COUNT(*) FROM book_sales)::bigint AS "totalOrders",
        COALESCE((SELECT SUM(quantity) FROM book_sales), 0)::bigint AS "totalBooksSold",
        (SELECT COUNT(*) FROM book_sales WHERE status = 'PAID')::bigint AS "paidOrders",
        (SELECT COUNT(*) FROM book_sales WHERE status IN ('PENDING_PAYMENT', 'PARTIALLY_PAID'))::bigint AS "pendingOrders",
        (SELECT COUNT(DISTINCT "organizationId") FROM book_sales)::bigint AS "buyersCount",
        COALESCE((SELECT SUM(revenue_cents) FROM book_sales), 0)::bigint AS "grossRevenueCents",
        COALESCE((SELECT SUM(revenue_cents) FROM book_sales WHERE status = 'PAID'), 0)::bigint AS "paidRevenueCents",
        COALESCE((SELECT SUM(revenue_cents) FROM book_sales WHERE status IN ('PENDING_PAYMENT', 'PARTIALLY_PAID')), 0)::bigint AS "pendingRevenueCents",
        (SELECT AVG(revenue_cents) FROM book_sales) AS "averageBookPriceCents"
    `;

    return row;
  }

  async findBookSalesRows(input: AdminListInput) {
    const offset = (input.page - 1) * input.limit;

    return prisma.$queryRaw<AdminBookSaleRow[]>`
      WITH book_sales AS (
        SELECT
          o.id,
          o.status AS "orderStatus",
          o."totalCents" AS "orderTotalCents",
          o.currency,
          o."createdAt",
          o."paidAt",
          org."tradeName" AS "organizationName",
          org."legalName",
          org.cnpj,
          org."addressLine1",
          org."addressLine2",
          org.city,
          org.state,
          org."postalCode",
          org."enderecoCompleto",
          org."municipioEstado",
          COALESCE(book_items.quantity, 0)::bigint AS quantity,
          COALESCE(book_items.revenue_cents, 0)::bigint AS revenue_cents,
          COALESCE(last_payment.status, 'PENDING') AS "paymentStatus",
          last_payment.method AS "paymentMethod",
          last_payment.provider AS "paymentProvider"
        FROM orders o
        INNER JOIN organizations org
          ON org.id = o."organizationId"
        INNER JOIN LATERAL (
          SELECT
            COALESCE(SUM(oi.quantity), 0)::bigint AS quantity,
            COALESCE(SUM(oi.quantity * oi."unitPriceCents"), 0)::bigint AS revenue_cents
          FROM order_items oi
          INNER JOIN products p
            ON p.id = oi."productId"
          WHERE oi."orderId" = o.id
            AND p.code = 'LIVRO_ESG'
        ) book_items ON TRUE
        LEFT JOIN LATERAL (
          SELECT
            pay.status,
            pay.method,
            pay.provider
          FROM payments pay
          WHERE pay."orderId" = o.id
          ORDER BY COALESCE(pay."paidAt", pay."createdAt") DESC
          LIMIT 1
        ) last_payment ON TRUE
        WHERE COALESCE(book_items.quantity, 0) > 0
      )
      SELECT
        id,
        "organizationName",
        "legalName",
        cnpj,
        "addressLine1",
        "addressLine2",
        city,
        state,
        "postalCode",
        "enderecoCompleto",
        "municipioEstado",
        "orderStatus",
        "paymentStatus",
        "paymentMethod",
        "paymentProvider",
        quantity AS "bookQuantity",
        revenue_cents AS "bookRevenueCents",
        "orderTotalCents",
        currency,
        "createdAt",
        "paidAt",
        COUNT(*) OVER()::bigint AS "totalCount"
      FROM book_sales
      ORDER BY "createdAt" DESC
      LIMIT ${input.limit}
      OFFSET ${offset}
    `;
  }

  async findClientRows(input: AdminListInput) {
    const offset = (input.page - 1) * input.limit;

    return prisma.$queryRaw<AdminClientRow[]>`
      SELECT
        o.id,
        o."tradeName",
        o."legalName",
        o."industrySegment",
        bs.name AS "businessSegmentName",
        plan_product.name AS "planName",
        latest_diagnostic.status AS "diagnosticStatus",
        latest_diagnostic."updatedAt" AS "diagnosticUpdatedAt",
        latest_diagnostic."completedAt" AS "diagnosticCompletedAt",
        diagnostic_score."overallScore",
        COALESCE(pending_evidence.count, 0)::bigint AS "pendingEvidenceCount",
        COALESCE(supplier_counts.total, 0)::bigint AS "supplierTotal",
        COALESCE(supplier_counts.completed, 0)::bigint AS "supplierCompleted",
        COALESCE(active_users.count, 0)::bigint AS "activeUsers",
        COUNT(*) OVER()::bigint AS "totalCount"
      FROM organizations o
      INNER JOIN organization_roles org_role
        ON org_role."organizationId" = o.id
       AND org_role.role = 'COMPANY'
      LEFT JOIN business_segments bs
        ON bs.id = o."businessSegmentId"
      LEFT JOIN LATERAL (
        SELECT s."planId"
        FROM subscriptions s
        WHERE s."organizationId" = o.id
          AND s.status IN ('ACTIVE', 'TRIALING', 'PAST_DUE')
        ORDER BY s."createdAt" DESC
        LIMIT 1
      ) active_subscription ON TRUE
      LEFT JOIN plans active_plan
        ON active_plan.id = active_subscription."planId"
      LEFT JOIN products plan_product
        ON plan_product.id = active_plan."productId"
      LEFT JOIN LATERAL (
        SELECT d.id, d.status, d."updatedAt", d."completedAt"
        FROM diagnostics d
        WHERE d."organizationId" = o.id
        ORDER BY d."updatedAt" DESC
        LIMIT 1
      ) latest_diagnostic ON TRUE
      LEFT JOIN diagnostic_scores diagnostic_score
        ON diagnostic_score."diagnosticId" = latest_diagnostic.id
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS count
        FROM evidences e
        WHERE e."diagnosticId" = latest_diagnostic.id
          AND e."verificationStatus" = 'PENDING'
      ) pending_evidence ON TRUE
      LEFT JOIN LATERAL (
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE sl.status = 'COMPLETED') AS completed
        FROM supplier_links sl
        WHERE sl."buyerOrganizationId" = o.id
      ) supplier_counts ON TRUE
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS count
        FROM organization_users ou
        WHERE ou."organizationId" = o.id
      ) active_users ON TRUE
      WHERE o."archivedAt" IS NULL
      ORDER BY o."createdAt" DESC
      LIMIT ${input.limit}
      OFFSET ${offset}
    `;
  }

  async findSupplierRows(input: AdminListInput) {
    const offset = (input.page - 1) * input.limit;

    return prisma.$queryRaw<AdminSupplierRow[]>`
      SELECT
        o.id,
        o."tradeName",
        o."legalName",
        o."primaryEmail",
        o."industrySegment",
        bs.name AS "businessSegmentName",
        latest_link.status AS "linkStatus",
        latest_link."invitedAt",
        latest_link."updatedAt" AS "linkUpdatedAt",
        latest_diagnostic.status AS "diagnosticStatus",
        latest_diagnostic."updatedAt" AS "diagnosticUpdatedAt",
        latest_diagnostic."createdAt" AS "diagnosticCreatedAt",
        diagnostic_score."overallScore",
        COALESCE(pending_evidence.count, 0)::bigint AS "pendingEvidenceCount",
        COALESCE(purchased_products.products, '[]'::json) AS "purchasedProductsJson",
        COALESCE(linked_companies.companies, '[]'::json) AS "linkedCompaniesJson",
        COUNT(*) OVER()::bigint AS "totalCount"
      FROM organizations o
      LEFT JOIN business_segments bs
        ON bs.id = o."businessSegmentId"
      LEFT JOIN LATERAL (
        SELECT sl.status, sl."invitedAt", sl."updatedAt"
        FROM supplier_links sl
        WHERE sl."supplierOrganizationId" = o.id
        ORDER BY sl."updatedAt" DESC
        LIMIT 1
      ) latest_link ON TRUE
      LEFT JOIN LATERAL (
        SELECT d.id, d.status, d."updatedAt", d."createdAt"
        FROM diagnostics d
        WHERE d."organizationId" = o.id
        ORDER BY d."updatedAt" DESC
        LIMIT 1
      ) latest_diagnostic ON TRUE
      LEFT JOIN diagnostic_scores diagnostic_score
        ON diagnostic_score."diagnosticId" = latest_diagnostic.id
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS count
        FROM evidences e
        WHERE e."diagnosticId" = latest_diagnostic.id
          AND e."verificationStatus" = 'PENDING'
      ) pending_evidence ON TRUE
      LEFT JOIN LATERAL (
        SELECT json_agg(
          json_build_object(
            'name', p.name,
            'status', ord.status
          )
        ) AS products
        FROM orders ord
        INNER JOIN order_items oi ON oi."orderId" = ord.id
        INNER JOIN products p ON p.id = oi."productId"
        WHERE ord."organizationId" = o.id
          AND ord.status IN ('PAID', 'PENDING_PAYMENT')
      ) purchased_products ON TRUE
      LEFT JOIN LATERAL (
        SELECT json_agg(
          json_build_object(
            'id', buyer.id,
            'name', COALESCE(buyer."tradeName", buyer."legalName"),
            'status', sl.status
          )
        ) AS companies
        FROM supplier_links sl
        INNER JOIN organizations buyer ON buyer.id = sl."buyerOrganizationId"
        WHERE sl."supplierOrganizationId" = o.id
      ) linked_companies ON TRUE
      WHERE o."archivedAt" IS NULL
        AND (
          EXISTS (
            SELECT 1
            FROM organization_roles org_role
            WHERE org_role."organizationId" = o.id
              AND org_role.role = 'SUPPLIER'
          )
          OR EXISTS (
            SELECT 1
            FROM supplier_links sl
            WHERE sl."supplierOrganizationId" = o.id
          )
        )
      ORDER BY o."createdAt" DESC
      LIMIT ${input.limit}
      OFFSET ${offset}
    `;
  }

  async findConsultingRows(input: AdminListInput) {
    const offset = (input.page - 1) * input.limit;

    return prisma.$queryRaw<AdminClientRow[]>`
      SELECT
        o.id,
        o."tradeName",
        o."legalName",
        o."industrySegment",
        bs.name AS "businessSegmentName",
        p.name AS "planName",
        ord.id AS "orderId",
        latest_diagnostic.status AS "diagnosticStatus",
        latest_diagnostic."updatedAt" AS "diagnosticUpdatedAt",
        latest_diagnostic."completedAt" AS "diagnosticCompletedAt",
        diagnostic_score."overallScore",
        COALESCE(pending_evidence.count, 0)::bigint AS "pendingEvidenceCount",
        COALESCE(supplier_counts.total, 0)::bigint AS "supplierTotal",
        COALESCE(supplier_counts.completed, 0)::bigint AS "supplierCompleted",
        COALESCE(active_users.count, 0)::bigint AS "activeUsers",
        latest_appointment.status AS "appointmentStatus",
        latest_appointment."startsAt" AS "appointmentStartsAt",
        COUNT(*) OVER()::bigint AS "totalCount"
      FROM organizations o
      INNER JOIN organization_roles org_role
        ON org_role."organizationId" = o.id
       AND org_role.role = 'COMPANY'
      INNER JOIN orders ord 
        ON ord."organizationId" = o.id 
       AND ord.status = 'PAID'
      INNER JOIN order_items ord_item 
        ON ord_item."orderId" = ord.id
      INNER JOIN products p 
        ON p.id = ord_item."productId"
       AND p.code = 'PRE_DIAGNOSTIC_PLUS'
      LEFT JOIN business_segments bs
        ON bs.id = o."businessSegmentId"
      LEFT JOIN LATERAL (
        SELECT s."planId"
        FROM subscriptions s
        WHERE s."organizationId" = o.id
          AND s.status IN ('ACTIVE', 'TRIALING', 'PAST_DUE')
        ORDER BY s."createdAt" DESC
        LIMIT 1
      ) active_subscription ON TRUE
      LEFT JOIN plans active_plan
        ON active_plan.id = active_subscription."planId"
      LEFT JOIN products plan_product
        ON plan_product.id = active_plan."productId"
      LEFT JOIN LATERAL (
        SELECT d.id, d.status, d."updatedAt", d."completedAt"
        FROM diagnostics d
        WHERE d."organizationId" = o.id
        ORDER BY d."updatedAt" DESC
        LIMIT 1
      ) latest_diagnostic ON TRUE
      LEFT JOIN diagnostic_scores diagnostic_score
        ON diagnostic_score."diagnosticId" = latest_diagnostic.id
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS count
        FROM evidences e
        WHERE e."diagnosticId" = latest_diagnostic.id
          AND e."verificationStatus" = 'PENDING'
      ) pending_evidence ON TRUE
      LEFT JOIN LATERAL (
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE sl.status = 'COMPLETED') AS completed
        FROM supplier_links sl
        WHERE sl."buyerOrganizationId" = o.id
      ) supplier_counts ON TRUE
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS count
        FROM organization_users ou
        WHERE ou."organizationId" = o.id
      ) active_users ON TRUE
      LEFT JOIN LATERAL (
        SELECT ca.status, ca."startsAt"
        FROM consulting_appointments ca
        WHERE ca."orderId" = ord.id
        ORDER BY ca."createdAt" DESC
        LIMIT 1
      ) latest_appointment ON TRUE
      WHERE o."archivedAt" IS NULL
      ORDER BY o."createdAt" DESC
      LIMIT ${input.limit}
      OFFSET ${offset}
    `;
  }
}
