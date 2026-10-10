import type {
  AuthAccessContext,
  LoginInput,
  AdminLoginResponse,
  LoginResponse,
  RegisterInput,
  RegisterResponse,
} from "../models/auth.types";

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
    const isAuthAction = path === "/auth/login" || path === "/auth/admin/login" || path === "/auth/register";
    if (!isAuthAction) {
      if (typeof window !== "undefined") {
        void fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
        window.location.href = "/?auth=true";
        return new Promise(() => {});
      }
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? "Request failed");
  }

  return data as T;
}

export const authService = {
  login(payload: LoginInput) {
    return request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  adminLogin(payload: LoginInput) {
    return request<AdminLoginResponse>("/auth/admin/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  register(payload: RegisterInput) {
    return request<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  recoverPassword(email: string) {
    return request<{ message: string }>("/auth/recover", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  completePasswordRecovery(accessToken: string, password: string) {
    return request<{ message: string }>("/auth/recover/complete", {
      method: "POST",
      body: JSON.stringify({ accessToken, password }),
    });
  },
  
  getMe(_token?: string) {
    return request<any>("/auth/me", {
      method: "GET",
    });
  },

  getAccessContext(_token?: string) {
    return request<AuthAccessContext>("/auth/me/access", {
      method: "GET",
    });
  },

  updateProfile(token: string, payload: any) {
    return request<any>("/auth/profile", {
      method: "PUT",
      credentials: "include",
      body: JSON.stringify(payload),
    });
  },

  uploadCompanyLogo(token: string, payload: { fileName: string; mimeType: string; base64Data: string; sizeBytes: number }) {
    return request<{ success: boolean; logoUrl: string; logoStoragePath: string }>("/auth/profile/logo", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(payload),
    });
  },
};
