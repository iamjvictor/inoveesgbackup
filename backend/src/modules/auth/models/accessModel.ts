import type { BusinessRole } from "@prisma/client";

export type AuthRoleSnapshot = {
  role: BusinessRole;
  source: string;
  assignedAt: string;
  removedAt: string | null;
};

export type PurchasedServiceAccessItem = {
  orderId: string;
  orderType: string;
  orderStatus: string;
  productCode: string;
  serviceId: string;
  name: string;
  description: string | null;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  purchasedAt: string;
};

export type AuthAccessContext = {
  organizationId: string;
  roles: AuthRoleSnapshot[];
  effectiveRole: BusinessRole;
  hasCompanyRole: boolean;
  hasSupplierRole: boolean;
  isSupplierOnly: boolean;
  purchasedServices: PurchasedServiceAccessItem[];
  purchasedProductCodes: string[];
  hasInvitePack: boolean;
  hasAssessmentAccess: boolean;
  hasEvidenceAccess: boolean;
  hasPreDiagnosticAccess: boolean;
};
