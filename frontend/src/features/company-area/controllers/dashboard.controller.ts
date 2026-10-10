import {
  companyProfile,
  dashboardKpis,
  diagnosticSections,
  inviteBalance,
  suppliers,
  workspaceStages,
  workspaceTasks,
} from "../models/mock-data";

export function getDashboardViewModel() {
  const pendingSuppliers = suppliers.filter((supplier) => supplier.status !== "respondido").length;
  const completedSections = diagnosticSections.filter((section) => section.status === "concluido").length;

  return {
    companyProfile,
    kpis: dashboardKpis,
    sections: diagnosticSections,
    inviteBalance,
    pendingSuppliers,
    completedSections,
    workflow: workspaceStages,
    tasks: workspaceTasks,
  };
}
