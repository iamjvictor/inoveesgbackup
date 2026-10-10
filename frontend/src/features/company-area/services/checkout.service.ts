const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

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

export const checkoutService = {
  getCatalogPrices() {
    return request<{ prices: Record<string, number> }>("/checkout/catalog-prices", {
      method: "GET",
    });
  },

  createPreference(
    token: string,
    productCode: "PRE_DIAGNOSTIC" | "PRE_DIAGNOSTIC_PLUS" | "FULL_DIAGNOSTIC" | "FULL_DIAGNOSTIC_PLUS" | "INVITE_PACK" | "LIVRO_ESG" | "CONSULTING_1H",
    quantity = 1
  ) {
    return request<{ checkoutUrl: string; orderId?: string; diagnosticId?: string }>("/checkout/preference", {
      method: "POST",
      credentials: "include",
      headers: {

      },
      body: JSON.stringify({ productCode, quantity }),
    });
  },
};
