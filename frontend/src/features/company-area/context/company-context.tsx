"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "@/features/auth/services/auth.service";
import type { AuthAccessContext } from "@/features/auth/models/auth.types";

interface OrganizationRole {
  role: "COMPANY" | "SUPPLIER";
  source: string;
}

interface OrganizationEntitlement {
  id: string;
  featureFlag: {
    code: string;
    name: string;
  };
  status: string;
}

interface Subscription {
  id: string;
  status: string;
  renewalAt: string | null;
  plan: {
    priceCents: number;
    product: {
      name: string;
      code: string;
    }
  }
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPriceCents: number;
  product: {
    name: string;
    code: string;
    description?: string | null;
  };
  metadata?: any;
}

export interface Payment {
  id: string;
  method: string;
  status: string;
  amountCents: number;
  paidAt: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  orderType: "SUBSCRIPTION" | "ONE_TIME" | "INVITE_PACK";
  status: "DRAFT" | "PENDING_PAYMENT" | "PARTIALLY_PAID" | "PAID" | "FAILED" | "CANCELED";
  totalCents: number;
  paidAt: string | null;
  createdAt: string;
  items: OrderItem[];
  payments: Payment[];
}

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  cpf?: string | null;
  cargoFuncao?: string | null;
  grauParticipacao?: string | null;
  organizationUsers: Array<{
    membershipRole: string;
    organization: {
      id: string;
      legalName: string;
      tradeName: string;
      cnpj?: string;
      logoUrl?: string | null;
      phone?: string | null;
      primaryEmail?: string;
      industrySegment?: string;
      businessCategoryId?: string | null;
      businessSegmentId?: string | null;
      businessCategory?: {
        code: string;
        name: string;
      } | null;
      businessSegment?: {
        code: string;
        name: string;
      } | null;
      specificActivity?: string | null;
      enderecoCompleto?: string | null;
      municipioEstado?: string | null;
      redesSociais?: string | null;
      naturezaJuridica?: string | null;
      porte?: string | null;
      tempoOperacao?: string | null;
      alcanceMercado?: string | null;
      site?: string | null;
      website?: string | null;
      createdAt?: string | Date;
      roles: OrganizationRole[];
      subscriptions: Subscription[];
      entitlements: OrganizationEntitlement[];
      subjectDiagnostics: any[];
      orders?: Order[];
      inviteWallet?: { balance: number } | null;
    };
  }>;
}

interface CompanyContextType {
  user: UserProfile | null;
  company: UserProfile["organizationUsers"][0]["organization"] | null;
  serviceAccess: AuthAccessContext | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  // Access Control Helpers
  hasActivePlan: boolean;
  isSupplierOnly: boolean;
  isUnpaid: boolean;
  hasActiveDiagnostic: boolean;
  hasCompletedDiagnostic: boolean;
  hasOnlyPreDiagnostic: boolean;
  hasInviteAccess: boolean;
  hasAssessmentAccess: boolean;
  hasEvidenceAccess: boolean;
  hasPreDiagnosticAccess: boolean;
  hasConsultingAccess: boolean;
  activeEntitlements: string[];
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [serviceAccess, setServiceAccess] = useState<AuthAccessContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const [profileResult, accessResult] = await Promise.allSettled([
        authService.getMe(),
        authService.getAccessContext(),
      ]);

      if (profileResult.status === "fulfilled") {
        setUser(profileResult.value);
      } else {
        throw profileResult.reason;
      }

      if (accessResult.status === "fulfilled") {
        setServiceAccess(accessResult.value);
      } else {
        setServiceAccess(null);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      setServiceAccess(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const company = user?.organizationUsers?.[0]?.organization || null;
  
  // Logic helpers
  const activeSubscriptions = company?.subscriptions?.filter(s => s.status === "ACTIVE") || [];
  const hasActivePlan = activeSubscriptions.length > 0;
  
  const roles = company?.roles?.map(r => r.role) || [];
  const isSupplierOnly = serviceAccess?.isSupplierOnly ?? (roles.includes("SUPPLIER") && !roles.includes("COMPANY"));
  
  const activeEntitlements = company?.entitlements?.map(e => e.featureFlag.code) || [];
  
  const hasActiveDiagnostic = (company?.subjectDiagnostics?.length || 0) > 0;
  
  const hasCompletedDiagnostic = company?.subjectDiagnostics?.some(d => d.status === "COMPLETED") || false;

  const hasInviteAccess = serviceAccess?.hasInvitePack ||
    (company?.inviteWallet && company.inviteWallet.balance > 0) || 
    (company?.orders?.some(o => o.orderType === "INVITE_PACK" && o.status === "PAID")) || 
    false;

  const hasAssessmentAccess = serviceAccess?.hasAssessmentAccess ?? false;
  const hasEvidenceAccess = serviceAccess?.hasEvidenceAccess ?? false;
  const hasPreDiagnosticAccess = serviceAccess?.hasPreDiagnosticAccess ?? false;
  const consultingProductCodes = ["PRE_DIAGNOSTIC_PLUS", "DIAG_CONSULTORIA", "FULL_DIAGNOSTIC"];
  const hasConsultingAccess = serviceAccess?.purchasedProductCodes?.some((code) =>
    consultingProductCodes.includes(code.toUpperCase()),
  ) ?? company?.orders?.some((order) =>
    order.status === "PAID" && order.items?.some((item) => consultingProductCodes.includes(item.product.code.toUpperCase())),
  ) ?? false;
  
  const hasOnlyPreDiagnostic = (hasActiveDiagnostic && 
    !hasActivePlan && 
    !isSupplierOnly &&
    !hasCompletedDiagnostic) ?? false;


  const isUnpaid = !hasActivePlan && activeEntitlements.length === 0 && !hasActiveDiagnostic && !hasInviteAccess;

  useEffect(() => {
    if (user) {
      console.log("=== Company Area Permissions Log ===");
      console.log("User:", user);
      console.log("Company:", company);
      console.log("Service Access context:", serviceAccess);
      console.log("Active Subscriptions:", activeSubscriptions);
      console.log("Active Entitlements:", activeEntitlements);
      console.log("Roles:", roles);
      console.log("Flags:", {
        hasActivePlan,
        isSupplierOnly,
        hasActiveDiagnostic,
        hasCompletedDiagnostic,
        hasInviteAccess,
        hasAssessmentAccess,
        hasEvidenceAccess,
        hasPreDiagnosticAccess,
        hasOnlyPreDiagnostic,
        isUnpaid
      });
    }
  }, [user, company, serviceAccess]);

  return (
    <CompanyContext.Provider value={{ 
      user, 
      company, 
      serviceAccess,
      isLoading, 
      refreshProfile: fetchProfile,
      hasActivePlan,
      isSupplierOnly,
      isUnpaid,
      hasActiveDiagnostic,
      hasCompletedDiagnostic,
      hasOnlyPreDiagnostic,
      hasInviteAccess,
      hasAssessmentAccess,
      hasEvidenceAccess,
      hasPreDiagnosticAccess,
      hasConsultingAccess,
      activeEntitlements
    }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
}
