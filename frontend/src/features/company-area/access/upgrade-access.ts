export function canRequestUpgradeBudget(planId: string): boolean {
  return planId === "diag-estrat" || planId === "bioimpacto-empresarial";
}
