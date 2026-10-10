"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";
const inflightRequests = new Map<string, Promise<unknown>>();

export async function adminClientFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const requestKey = `${init?.method ?? "GET"}:${path}:${typeof init?.body === "string" ? init.body : ""}`;

  const inflightRequest = inflightRequests.get(requestKey);
  if (inflightRequest) {
    return inflightRequest as Promise<T>;
  }

  const request = fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  }).then(async (response) => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.message ?? `Failed to fetch admin data from ${path}`);
    }

    return response.json() as Promise<T>;
  });

  inflightRequests.set(requestKey, request);
  void request.finally(() => inflightRequests.delete(requestKey)).catch(() => undefined);

  return request;
}
