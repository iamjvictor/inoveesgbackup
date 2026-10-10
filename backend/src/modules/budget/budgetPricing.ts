const PROPOSAL_STATUSES = new Set(["RESPONDIDO", "ACEITO", "ATIVO"]);

export function getBudgetProposalPriceCents(
  status: string,
  proposedPriceCents: number | null | undefined,
  _serviceBasePriceCents?: number | null,
): number | null {
  return PROPOSAL_STATUSES.has(status.trim().toUpperCase()) && proposedPriceCents != null
    ? proposedPriceCents
    : null;
}
