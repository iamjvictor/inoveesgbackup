export const BUSINESS_CATEGORIES = [
  { code: "AGRONEGOCIO", name: "Agronegócio" },
  { code: "OLEO_E_GAS", name: "Óleo e Gás" },
  { code: "INFRAESTRUTURA", name: "Infraestrutura" },
] as const;

export const BUSINESS_SEGMENTS = {
  AGRONEGOCIO: [
    { code: "AGROINDUSTRIA", name: "Agroindústria" },
    { code: "PRODUCAO", name: "Produção" },
  ],
  OLEO_E_GAS: [
    { code: "OLEO_E_GAS", name: "Óleo e Gás" },
  ],
  INFRAESTRUTURA: [
    { code: "INFRAESTRUTURA", name: "Infraestrutura" },
  ],
} as const;
