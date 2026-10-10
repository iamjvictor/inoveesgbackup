import { cookies } from "next/headers";

const API_URL = process.env.BACKEND_URL
  ? `${process.env.BACKEND_URL.replace(/\/$/, "")}/api`
  : "http://localhost:4000/api";

export async function adminFetch<T>(
  path: string,
  query?: Record<string, string | number | undefined | null>
): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get("inoveesg_token")?.value;
  const url = new URL(`${API_URL}${path}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.message ?? `Failed to fetch admin data from ${path}`);
  }

  return response.json();
}
