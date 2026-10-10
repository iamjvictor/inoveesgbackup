const temporarilyUnavailableDemandServiceIds = new Set([
  "cadeia-fornecedores",
  "capacitacao",
  "livro-esg",
]);

export function isDemandServiceAvailable(serviceId: string) {
  return !temporarilyUnavailableDemandServiceIds.has(serviceId);
}

export function shouldShowComingSoonOverlay(isAvailable: boolean) {
  return !isAvailable;
}
