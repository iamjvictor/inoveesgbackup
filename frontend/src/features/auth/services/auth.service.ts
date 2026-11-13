import type {
  AuthAccessContext,
  LoginInput,
  AdminLoginResponse,
  LoginResponse,
  RegisterInput,
  RegisterResponse,
} from "../models/auth.types";

function resolveApiUrl(): string {
  const envUrl = (process.env.NEXT_PUBLIC_API_URL ?? "/api").trim().replace(/\/+$/, "");
  return envUrl.endsWith("/api") ? envUrl : `${envUrl}/api`;
}

const API_URL = resolveApiUrl();

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.");
  }

  if (response.status === 401) {
    const isAuthAction = path === "/auth/login" || path === "/auth/admin/login" || path === "/auth/register";
    if (!isAuthAction) {
      if (typeof window !== "undefined") {
        void fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" }).catch(() => undefined);
        window.location.href = "/?auth=true";
        return new Promise(() => {});
      }
    }
  }

  const contentType = response.headers.get("content-type") ?? "";
  let data: any = null;

  if (contentType.includes("application/json")) {
    data = await response.json().catch(() => null);
  } else {
    const text = await response.text().catch(() => "");
    if (text && (text.startsWith("{") || text.startsWith("["))) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(data?.message ?? "Serviço de autenticação temporariamente indisponível (404).");
    }
    if (response.status === 401) {
      throw new Error(data?.message ?? "E-mail ou senha incorretos.");
    }
    if (response.status === 403) {
      throw new Error(data?.message ?? "Acesso não autorizado.");
    }
    if (response.status >= 500) {
      throw new Error(data?.message ?? "Erro interno no servidor. Tente novamente em alguns instantes.");
    }
    throw new Error(data?.message ?? `Falha na requisição (${response.status})`);
  }

  return (data ?? {}) as T;
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
  
  getMe(_token?: string, forceFresh = false) {
    return request<any>(`/auth/me${forceFresh ? "?fresh=true" : ""}`, {
      method: "GET",
    });
  },

  getAccessContext(_token?: string, forceFresh = false) {
    return request<AuthAccessContext>(`/auth/me/access${forceFresh ? "?fresh=true" : ""}`, {
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
