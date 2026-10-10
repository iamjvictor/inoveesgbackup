import { adminClientFetch } from "@/features/admin/shared/client-api";
import type { AdminBudgetBoardModel } from "@/features/admin/shared/types";

export async function getBudgetBoardModel(page = 1, limit = 10): Promise<AdminBudgetBoardModel> {
  return adminClientFetch<AdminBudgetBoardModel>("/admin/budgets/list", {
    method: "POST",
    body: JSON.stringify({ page, limit }),
  });
}
