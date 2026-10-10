import { adminClientFetch } from "@/features/admin/shared/client-api";
import type { AdminOverviewModel } from "@/features/admin/shared/types";

export async function getAdminOverviewModel(): Promise<AdminOverviewModel> {
  return adminClientFetch<AdminOverviewModel>("/admin/overview/load", {
    method: "POST",
  });
}
