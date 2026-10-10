import { adminClientFetch } from "@/features/admin/shared/client-api";
import type { AdminFinanceBoardModel } from "@/features/admin/shared/types";

export async function getFinanceBoardModel(page = 1, limit = 10, productId = "ALL", status = "ALL"): Promise<AdminFinanceBoardModel> {
  return adminClientFetch<AdminFinanceBoardModel>("/admin/financeiro/load", {
    method: "POST",
    body: JSON.stringify({ page, limit, productId, status }),
  });
}
