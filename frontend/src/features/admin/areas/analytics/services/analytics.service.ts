import { adminClientFetch } from "@/features/admin/shared/client-api";
import type { AdminAnalyticsBoardModel } from "@/features/admin/shared/types";

export async function getAnalyticsBoardModel(): Promise<AdminAnalyticsBoardModel> {
  return adminClientFetch<AdminAnalyticsBoardModel>("/admin/analytics/load", {
    method: "POST",
  });
}
