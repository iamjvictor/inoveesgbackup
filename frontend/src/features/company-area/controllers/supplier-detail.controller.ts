import type { SupplierInvite } from "../services/invite.service";
import type { SupplierStatus } from "../models/types";

export type SupplierDetail = {
  invite: SupplierInvite;
  companyName: string;
  contactEmail: string;
  status: SupplierStatus;
  progress: number;
  invitedAt: string;
  lastUpdate: string;
  diagnostic: SupplierInvite["requestedDiagnostics"][number] | null;
};

export function findSupplierInvite(invites: SupplierInvite[], supplierId: string): SupplierInvite | null {
  return invites.find(
    (invite) => invite.id === supplierId || invite.supplierOrganizationId === supplierId,
  ) ?? null;
}

function getSupplierStatus(invite: SupplierInvite, diagnostic: SupplierDetail["diagnostic"]): SupplierStatus {
  if (diagnostic?.status === "COMPLETED") return "respondido";
  if (diagnostic?.status === "DRAFT" || diagnostic?.status === "ACTIVE") return "em_andamento";
  if (invite.status === "EXPIRED") return "expirado";
  if (invite.status === "SENT" || invite.status === "ACCEPTED") return "convidado";
  return "pendente";
}

export function mapSupplierInviteToDetail(invite: SupplierInvite): SupplierDetail {
  const diagnostic = invite.requestedDiagnostics[0] ?? null;
  const status = getSupplierStatus(invite, diagnostic);
  const progress = diagnostic?.percentageCompletion ?? (status === "respondido" ? 100 : 0);

  return {
    invite,
    companyName:
      invite.supplierOrganization?.tradeName
      || invite.supplierOrganization?.legalName
      || `Pendente (${invite.supplierEmail})`,
    contactEmail: invite.supplierOrganization?.primaryEmail || invite.supplierEmail,
    status,
    progress: Math.max(0, Math.min(100, Number(progress))),
    invitedAt: invite.createdAt,
    lastUpdate: diagnostic?.updatedAt || invite.acceptedAt || invite.createdAt,
    diagnostic,
  };
}
