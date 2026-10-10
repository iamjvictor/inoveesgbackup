import { adminClientFetch } from "@/features/admin/shared/client-api";
import type { AdminClientBoardModel } from "@/features/admin/shared/types";

export async function getClientBoardModel(page = 1, limit = 10): Promise<AdminClientBoardModel> {
  return adminClientFetch<AdminClientBoardModel>("/admin/clients/list", {
    method: "POST",
    body: JSON.stringify({ page, limit }),
  });
}
