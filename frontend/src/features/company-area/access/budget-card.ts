const OPEN_BUDGET_STATUSES = new Set([
  "SOLICITADO",
  "EM_ANALISE",
  "RESPONDIDO",
  "PROPOSTA_ENVIADA",
  "NEGOCIACAO",
  "ACEITO",
]);

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBudgetPrice(proposedPriceCents: number): string {
  return brlFormatter.format(proposedPriceCents / 100).replace(/\u00a0/g, " ");
}

export function hasOpenBudget(status: string): boolean {
  return OPEN_BUDGET_STATUSES.has(status.trim().toUpperCase());
}

export function shouldShowBudgetCard(hasBudget: boolean, hasConsulting: boolean, rotationIndex: number): boolean {
  return hasBudget && (!hasConsulting || rotationIndex % 2 === 1);
}

export function getInitialCardRotationIndex(hasBudget: boolean): number {
  return hasBudget ? 1 : 0;
}

export function isBudgetOwnedByUser(budget: { requestedByUserId?: string | null }, userId: string): boolean {
  return Boolean(userId && budget.requestedByUserId && budget.requestedByUserId === userId);
}

export function getBudgetDisplayPrice(status: string, proposedPriceCents: number | null | undefined): string {
  const hasProposal = ["RESPONDIDO", "ACEITO", "ATIVO"].includes(status.trim().toUpperCase());
  return hasProposal && proposedPriceCents != null
    ? formatBudgetPrice(proposedPriceCents)
    : "Aguardando proposta";
}
