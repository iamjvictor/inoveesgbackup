export type BioimpactoSize = "small" | "medium" | "large";

const prices: Record<BioimpactoSize, number> = {
  small: 3_800_000,
  medium: 5_600_000,
  large: 8_000_000,
};

export function getBioimpactoPriceCents(profile: {
  porte?: string | null;
  annualRevenue?: string | null;
  size?: string | null;
  numberOfSuppliers?: string | null;
}): number | null {
  const { porte, annualRevenue, size, numberOfSuppliers } = profile;
  const normalized = porte?.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  let tier = normalized === "media empresa" ? 1 : normalized === "grande empresa" ? 2 :
    ["mei", "microempresa", "pequena empresa"].includes(normalized ?? "") ? 0 : -1;

  const revenue = annualRevenue?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (revenue?.includes("acima de r$ 100 milhoes") || revenue?.includes("de r$ 20 milhoes a r$ 100 milhoes")) tier = Math.max(tier, 2);
  else if (revenue?.includes("de r$ 4,8 milhoes a r$ 20 milhoes")) tier = Math.max(tier, 1);
  else if (revenue?.includes("ate r$ 360 mil") || revenue?.includes("de r$ 360 mil a r$ 4,8 milhoes")) tier = Math.max(tier, 0);

  const employees = size?.match(/\d+/g)?.map(Number);
  if (employees?.length) tier = Math.max(tier, Math.max(...employees) >= 100 ? 2 : Math.max(...employees) >= 20 ? 1 : 0);
  else if (size?.includes("500+")) tier = Math.max(tier, 2);

  const suppliers = numberOfSuppliers?.match(/\d+/g)?.map(Number);
  if (numberOfSuppliers?.toLowerCase().includes("mais de 100")) tier = Math.max(tier, 2);
  else if (suppliers?.length) tier = Math.max(tier, Math.max(...suppliers) > 50 ? 2 : Math.max(...suppliers) > 15 ? 1 : 0);

  return tier < 0 ? null : [prices.small, prices.medium, prices.large][tier];
}
