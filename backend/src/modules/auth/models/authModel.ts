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
  esgJaPossui?: string[];
  esgInteresse?: string[];
}

export interface LoginInput {
  email: string;
  password: string;
}
