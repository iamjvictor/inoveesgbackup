import type { AuthAccessContext, PurchasedServiceAccessItem } from "./accessModel.js";

const SERVICE_CATALOG: Record<string, { serviceId: string; name: string; description: string }> = {
  PRE_DIAGNOSTIC: {
    serviceId: "pre-diag",
    name: "Pré-Diagnóstico ESG",
    description: "Diagnóstico rápido de maturidade. Relatório não verificado.",
  },
  PRE_DIAGNOSTIC_PLUS: {
    serviceId: "pre-diag-plus",
    name: "Pré-Diagnóstico ESG + Consultoria",
    description: "Pré-Diagnóstico com 1h de consultoria estratégica.",
  },
  CONSULTING_1H: {
    serviceId: "consulting-1h",
    name: "Consultoria ESG — Call de 1 hora",
    description: "Sessão individual de consultoria ESG com duração de 1 hora.",
  },
  INVITE_PACK: {
    serviceId: "invite-pack",
    name: "Pacote de Convites",
    description: "Aquisição de convites para cadastrar fornecedores na plataforma.",
  },
  LIVRO_ESG: {
    serviceId: "livro-esg",
    name: "Livro Bioeconomia & ESG",
    description: "Livro digital ou físico sobre Bioeconomia & ESG.",
  },
  ASSESSORIA_EVIDENCIAS: {
    serviceId: "assessoria-evidencias",
    name: "Assessoria de Evidências",
    description: "Acompanhamento e análise de evidências para validação do diagnóstico.",
  },
};

const EVIDENCE_PRODUCTS = ["ASSESSORIA_EVIDENCIAS", "ASSESSORIA_COMPLETA", "FULL_DIAGNOSTIC"];

export function hasEvidenceProductAccess(productCodes: string[]): boolean {
  return productCodes.some((code) =>
    EVIDENCE_PRODUCTS.includes(code.trim().toUpperCase().replace(/-/g, "_")),
  );
}

function toIsoDate(value: Date | string | null | undefined) {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}

function normalizeService(productCode: string) {
  return (
    SERVICE_CATALOG[productCode] ?? {
      serviceId: productCode.toLowerCase().replace(/_/g, "-"),
      name: productCode.replace(/_/g, " "),
      description: null,
    }
  );
}

export function buildAuthAccessContext(user: any): AuthAccessContext | null {
  const organization = user?.organizationUsers?.[0]?.organization;

  if (!organization) {
    return null;
  }

  const roles = (organization.roles ?? [])
    .filter((role: any) => !role.removedAt)
    .map((role: any) => ({
      role: role.role,
      source: role.source,
      assignedAt: toIsoDate(role.assignedAt),
      removedAt: role.removedAt ? toIsoDate(role.removedAt) : null,
    }));

  const hasCompanyRole = roles.some((role: any) => role.role === "COMPANY");
  const hasSupplierRole = roles.some((role: any) => role.role === "SUPPLIER");
  const effectiveRole = hasCompanyRole ? "COMPANY" : "SUPPLIER";

  const purchasedServices: PurchasedServiceAccessItem[] = (organization.orders ?? [])
    .filter((order: any) => order.status === "PAID")
    .flatMap((order: any) =>
      (order.items ?? [])
        .filter((item: any) => item?.product?.code)
        .map((item: any) => {
          const service = normalizeService(item.product.code);
          const quantity = Number(item.quantity ?? 1);
          const unitPriceCents = Number(item.unitPriceCents ?? 0);

          return {
            orderId: order.id,
            orderType: order.orderType,
            orderStatus: order.status,
            productCode: item.product.code,
            serviceId: service.serviceId,
            name: item.product.name || service.name,
            description: item.product.description ?? service.description,
            quantity,
            unitPriceCents,
            totalCents: unitPriceCents * quantity,
            purchasedAt: toIsoDate(order.paidAt ?? order.placedAt ?? order.createdAt),
          };
        })
    );

  const purchasedProductCodes = [...new Set(purchasedServices.map((service) => service.productCode))];

  // Normalize all codes to lowercase with hyphens for consistent comparison
  const normalizedCodes = purchasedProductCodes.map(code =>
    code.toLowerCase().replace(/_/g, "-")
  );

  // Products that grant access to the pre-diagnostic feature
  const preDiagnosticProducts = [
    "pre-diagnostic",
    "pre-diagnostic-plus",
    "pre-diag",
    "pre-diag-plus",
    "diag-consultoria",
    "full-diagnostic",
    "assessoria-completa",
    "assessoria-evidencias",
  ];

  // Products that grant assessment/evidence access (deeper analysis)
  const assessmentProducts = [
    "pre-diagnostic",
    "pre-diagnostic-plus",
    "pre-diag",
    "pre-diag-plus",
    "diag-consultoria",
    "full-diagnostic",
    "assessoria-completa",
    "assessoria-evidencias",
  ];

  const hasPreDiagnosticAccess =
    normalizedCodes.some(code => preDiagnosticProducts.includes(code)) ||
    (organization.subscriptions?.some((s: any) => s.status === "ACTIVE") ?? false) ||
    (organization.entitlements?.some((e: any) => e.status === "ACTIVE") ?? false);

  return {
    organizationId: organization.id,
    roles,
    effectiveRole,
    hasCompanyRole,
    hasSupplierRole,
    isSupplierOnly: hasSupplierRole && !hasCompanyRole,
    purchasedServices,
    purchasedProductCodes,
    hasInvitePack: purchasedProductCodes.includes("INVITE_PACK"),
    hasAssessmentAccess: normalizedCodes.some(code => assessmentProducts.includes(code)),
    hasEvidenceAccess: hasEvidenceProductAccess(purchasedProductCodes),
    hasPreDiagnosticAccess,
  };
}
