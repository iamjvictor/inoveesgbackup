import { adminClientFetch } from "@/features/admin/shared/client-api";
import type { AdminSupplierBoardModel } from "@/features/admin/shared/types";

export async function getSupplierBoardModel(page = 1, limit = 10): Promise<AdminSupplierBoardModel> {
  return adminClientFetch<AdminSupplierBoardModel>("/admin/suppliers/list", {
    method: "POST",
    body: JSON.stringify({ page, limit }),
  });
}
