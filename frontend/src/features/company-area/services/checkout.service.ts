function resolveApiUrl(): string {
  const envUrl = (process.env.NEXT_PUBLIC_API_URL ?? "/api").trim().replace(/\/+$/, "");
  return envUrl.endsWith("/api") ? envUrl : `${envUrl}/api`;
}

const API_URL = resolveApiUrl();

export interface CheckoutOrderItem {
  name: string;
  quantity: number;
  unitPriceCents: number;
}

export interface CheckoutOrder {
  id: string;
  status: string;
  totalCents: number;
  createdAt: string;
  paidAt: string | null;
  items: CheckoutOrderItem[];
}

export class CheckoutRequestError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
    this.name = "CheckoutRequestError";
  }
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

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new CheckoutRequestError(data?.message ?? "Request failed", response.status);
  }

  return data as T;
}

export const checkoutService = {
  getOrder(orderId: string) {
    return request<CheckoutOrder>(`/checkout/orders/${encodeURIComponent(orderId)}`, {
      method: "GET",
    });
  },

  getPendingOrder() {
    return request<CheckoutOrder | null>("/checkout/orders/pending", {
      method: "GET",
    });
  },

  cancelOrder(orderId: string) {
    return request<{ success: boolean; id: string; status: string }>(`/checkout/orders/${encodeURIComponent(orderId)}/cancel`, {
      method: "POST",
    });
  },

  getCatalogPrices() {
    return request<{ prices: Record<string, number> }>("/checkout/catalog-prices", {
      method: "GET",
    });
  },

  createPreference(
    token: string,
    productCode: "PRE_DIAGNOSTIC" | "PRE_DIAGNOSTIC_PLUS" | "FULL_DIAGNOSTIC" | "FULL_DIAGNOSTIC_PLUS" | "INVITE_PACK" | "LIVRO_ESG" | "CONSULTING_1H" | "BIOIMPACTO_EMPRESARIAL",
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
