import { adminClientFetch } from "@/features/admin/shared/client-api";
import type { AdminBooksBoardModel } from "@/features/admin/shared/types";

export async function getBooksBoardModel(page = 1, limit = 10): Promise<AdminBooksBoardModel> {
  return adminClientFetch<AdminBooksBoardModel>("/admin/livros/load", {
    method: "POST",
    body: JSON.stringify({ page, limit }),
  });
}
