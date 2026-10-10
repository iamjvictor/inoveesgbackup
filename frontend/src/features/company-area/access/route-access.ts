export function canAccessEvidenceRoute({ hasEvidenceAccess }: { hasEvidenceAccess: boolean; hasPreDiagnosticAccess?: boolean }) {
  return hasEvidenceAccess;
}

export function canAccessSuppliersRoute({ hasInviteAccess }: { hasInviteAccess: boolean }) {
  return hasInviteAccess;
}
