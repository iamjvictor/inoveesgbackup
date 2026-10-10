import { cookies } from "next/headers";

const API_URL = process.env.BACKEND_URL
  ? `${process.env.BACKEND_URL.replace(/\/$/, "")}/api`
  : "http://localhost:4000/api";

export type AdminSessionUser = {
  id: string;
  email: string;
  fullName: string | null;
  role?: string;
};

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("inoveesg_token")?.value;

  if (!token) {
    return null;
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  const user = (await response.json()) as AdminSessionUser;

  if (user?.role !== "ADMIN") {
    return null;
  }

  return {
    token,
    user,
  };
}
