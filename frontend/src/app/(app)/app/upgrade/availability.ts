const temporarilyUnavailableDemandServiceIds = new Set([
  "cadeia-fornecedores",
  "capacitacao",
  "livro-esg",
]);

export function isDemandServiceAvailable(serviceId: string) {
  return serviceId === "bioimpacto-empresarial" || !temporarilyUnavailableDemandServiceIds.has(serviceId);
}

export function shouldShowComingSoonOverlay(isAvailable: boolean) {
  return !isAvailable;
}
