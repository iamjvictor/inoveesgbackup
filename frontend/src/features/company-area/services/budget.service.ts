

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export interface BudgetInput {
  productCode?: string;
  items?: Array<{
    id: string;
    name?: string;
    type?: string;
  }>;
  sector?: string;
  employeeCount?: string;
  annualRevenue?: string;
  objective?: string;
  timeline?: string;
  focusAreas?: string[];
  hasPriorInventory?: string;
  phone?: string;
  notes?: string;
  months?: number;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
    void fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
      window.location.href = "/?auth=true";
      return new Promise(() => {});
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? "Request failed");
  }

  return data as T;
}

export const budgetService = {
  createRequest(payload: BudgetInput, token: string) {
    return request<any>("/budget", {
      method: "POST",
      credentials: "include",
      headers: {

      },
      body: JSON.stringify(payload),
    });
  },

  listRequests(token: string) {
    return request<any[]>("/budget", {
      method: "GET",
      credentials: "include",
      headers: {

      },
    });
  },

  acceptRequest(id: string, token: string) {
    return request<any>(`/budget/${id}/accept`, {
      method: "POST",
      credentials: "include",
      headers: {

      },
    });
  },

  declineRequest(id: string, token: string) {
    return request<any>(`/budget/${id}/decline`, {
      method: "POST",
      credentials: "include",
      headers: {

      },
    });
  },
};
