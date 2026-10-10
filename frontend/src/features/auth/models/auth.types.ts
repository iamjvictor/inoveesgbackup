export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  companyName: string;
  cnpj: string;
  industrySegment?: string;
  businessCategoryCode?: string;
  businessSegmentCode?: string;
  specificActivity?: string;
  size?: string;
  numberOfSuppliers?: string;
  annualRevenue?: string;
  ref?: string;
  cpf: string;
  cargoFuncao: string;
  grauParticipacao: string;
  tradeName: string;
  addressLine1: string;
  addressNumber: string;
  addressComplement?: string;
  country: string;
  state: string;
  city: string;
  site?: string;
  redesSociais?: string;
  naturezaJuridica: string;
  porte: string;
  tempoOperacao: string;
  alcanceMercado: string;
  esgJaPossui: string[];
  esgInteresse: string[];
}

export interface AuthOrganization {
  id: string;
  legalName: string;
  tradeName: string | null;
  cnpj: string;
  specificActivity: string | null;
}

export interface AuthRoleSnapshot {
  role: "COMPANY" | "SUPPLIER";
  source: string;
  assignedAt: string;
  removedAt: string | null;
}

export interface PurchasedServiceAccessItem {
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
}

export interface AuthAccessContext {
  organizationId: string;
  roles: AuthRoleSnapshot[];
  effectiveRole: "COMPANY" | "SUPPLIER";
  hasCompanyRole: boolean;
  hasSupplierRole: boolean;
  isSupplierOnly: boolean;
  purchasedServices: PurchasedServiceAccessItem[];
  purchasedProductCodes: string[];
  hasInvitePack: boolean;
  hasAssessmentAccess: boolean;
  hasEvidenceAccess: boolean;
  hasPreDiagnosticAccess: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  role?: string;
}

export interface LoginResponse {
  expiresIn: number;
  user: AuthUser | null;
}


export interface AdminLoginResponse {
  expiresIn: number;
  user: AuthUser | null;
}

export interface RegisterResponse {
  expiresIn: number;
  user: AuthUser;
  organization: AuthOrganization;
}
