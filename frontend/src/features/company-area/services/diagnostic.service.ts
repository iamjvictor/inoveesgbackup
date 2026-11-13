const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface DiagnosticHistoryItem {
  id: string;
  kind: "PRE_DIAGNOSTIC" | "FULL_DIAGNOSTIC" | "SUPPLIER_DIAGNOSTIC";
  status: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  score?: {
    id: string;
    diagnosticId: string;
    overallScore: string | number;
    environmentalScore: string | number | null;
    bioeconomyCircularScore: string | number | null;
    socialScore: string | number | null;
    governanceScore: string | number | null;
    maturityLevel: string | null;
  } | null;
  responses?: {
    id: string;
    axis: "ENVIRONMENTAL" | "BIOECONOMY_CIRCULAR" | "SOCIAL" | "GOVERNANCE";
    questionText: string;
    answerText: string | null;
    score: number | null;
  }[];
}

export interface BioimpactoHistory {
  orderId: string;
  startsAt: string;
  expiresAt: string;
  diagnosticId: string | null;
  windows: Array<{ number: number; startsAt: string; endsAt: string; status: "OPEN" | "CLOSED";
    approved: number; rejected: number; pending: number; score: number | null }>;
}

export interface DiagnosticStartOption {
  value: number;
  text: string;
}

export interface DiagnosticStartQuestion {
  number: number;
  prompt: string;
  axis: "ENVIRONMENTAL" | "BIOECONOMY_CIRCULAR" | "SOCIAL" | "GOVERNANCE";
  category: string;
  weight?: number;
  type?: "ESSENTIAL" | "STRATEGIC" | "DIFFERENTIAL" | "COMPLEMENTARY";
  options: DiagnosticStartOption[];
}

export interface DiagnosticStartPayload {
  diagnosticId: string;
  industrySegment: string;
  questions: DiagnosticStartQuestion[];
}

export interface DiagnosticAnswerDraft {
  answers: Record<string, string>;
  editedQuestionIds: string[];
}

export function parseDiagnosticAnswerDraft(raw: string | null): DiagnosticAnswerDraft {
  if (!raw) return { answers: {}, editedQuestionIds: [] };

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { answers: {}, editedQuestionIds: [] };
    }

    const value = parsed as Record<string, unknown>;
    if (value.version === 2 && value.answers && typeof value.answers === "object" && !Array.isArray(value.answers)) {
      const answers = Object.fromEntries(
        Object.entries(value.answers as Record<string, unknown>)
          .filter((entry): entry is [string, string] => typeof entry[1] === "string")
      );
      const editedQuestionIds = Array.isArray(value.editedQuestionIds)
        ? value.editedQuestionIds.filter((id): id is string => typeof id === "string" && id in answers)
        : [];
      return { answers, editedQuestionIds };
    }

    // Legacy caches stored every rendered question, including blank answers.
    // Treat only non-empty legacy values as edits so stale blanks cannot hide
    // answers already persisted by the server.
    const answers = Object.fromEntries(
      Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string")
    );
    return {
      answers,
      editedQuestionIds: Object.keys(answers).filter((id) => answers[id].length > 0),
    };
  } catch {
    return { answers: {}, editedQuestionIds: [] };
  }
}

export function getDiagnosticAnswerOverrides(draft: DiagnosticAnswerDraft): Record<string, string> {
  return Object.fromEntries(draft.editedQuestionIds.map((id) => [id, draft.answers[id] ?? ""]));
}

export interface DiagnosticCurrentResponse {
  hasDiagnostic: boolean;
  industrySegment?: string;
  questions: DiagnosticStartQuestion[];
  diagnostic: {
    id: string;
    kind: "PRE_DIAGNOSTIC" | "FULL_DIAGNOSTIC" | "SUPPLIER_DIAGNOSTIC";
    status: string;
    percentageCompletion?: number | null;
    completedAt?: string | null;
    score?: {
      overallScore?: number | null;
      environmentalScore?: number | null;
      bioeconomyCircularScore?: number | null;
      socialScore?: number | null;
      governanceScore?: number | null;
      provenOverallScore?: number | null;
      provenEnvironmentalScore?: number | null;
      provenBioeconomyCircularScore?: number | null;
      provenSocialScore?: number | null;
      provenGovernanceScore?: number | null;
      maturityLevel?: string | null;
    } | null;
    _count?: {
      responses: number;
    };
    responses?: Array<{
      questionOrder: number;
      axis: "ENVIRONMENTAL" | "BIOECONOMY_CIRCULAR" | "SOCIAL" | "GOVERNANCE";
      answerText?: string | null;
    }>;
    evidences?: Array<{
      id: string;
      requestId?: string | null;
      verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
      evidenceCategory?: string | null;
      fileName?: string | null;
      filePath?: string | null;
      fileUrl?: string | null;
      fileSizeBytes?: number | null;
      mimeType?: string | null;
      storageBucket?: string | null;
      documentType?: string | null;
      reviews?: Array<{
        reviewedAt: string;
        newStatus: "PENDING" | "VERIFIED" | "REJECTED";
        reviewer: { fullName?: string | null; email?: string | null };
      }>;
      uploadStatus?: "PENDING" | "UPLOADING" | "COMPLETED" | "FAILED";
      uploadedAt?: string | null;
    }>;
  } | null;
}

export interface DiagnosticSubmitResponse {
  overallScore?: number;
  environmentalScore?: number;
  bioeconomyCircularScore?: number;
  socialScore?: number;
  governanceScore?: number;
  maturityLevel?: string;
  [key: string]: unknown;
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
    throw new ApiError(data?.message ?? "Request failed", response.status, data?.code);
  }

  return data as T;
}

export const diagnosticService = {
  getBioimpactoHistory() {
    return request<BioimpactoHistory | null>("/diagnostic/bioimpacto/history", { method: "GET", credentials: "include" });
  },
  startDiagnostic(token: string) {
    return request<DiagnosticStartPayload>("/diagnostic/start", {
      method: "POST",
      credentials: "include",
      headers: {

      },
    });
  },

  simulatePreDiagnosticPurchase(token: string) {
    return request<{ checkoutUrl: string; diagnosticId?: string; orderId: string; productCode: string; totalCents: number }>("/checkout/preference", {
      method: "POST",
      credentials: "include",
      headers: {

      },
      body: JSON.stringify({ productCode: "PRE_DIAGNOSTIC", quantity: 1 }),
    });
  },

  confirmPayment(token: string, diagnosticId: string, simulateStatus: "success" | "failure") {
    return request<{ success: boolean; diagnosticId: string }>("/diagnostic/confirm-payment", {
      method: "POST",
      credentials: "include",
      headers: {

      },
      body: JSON.stringify({ diagnosticId, simulateStatus }),
    });
  },

  getCurrentDiagnostic(_token?: string) {
    return request<DiagnosticCurrentResponse>("/diagnostic/current", {
      method: "GET",
      credentials: "include",
    });
  },

  getDiagnosticHistory(token: string) {
    return request<DiagnosticHistoryItem[]>("/diagnostic/history", {
      method: "GET",
      credentials: "include",
      headers: {

      },
    });
  },

  submitDiagnostic(
    token: string,
    diagnosticId: string,
    responsibilityDeclarationAccepted: boolean,
    finalize = true,
    responses?: Array<{
      questionCode: string;
      questionOrder: number;
      axis: "ENVIRONMENTAL" | "BIOECONOMY_CIRCULAR" | "SOCIAL" | "GOVERNANCE";
      questionText: string;
      questionType: "MULTIPLE_CHOICE" | "TEXT";
      answerText: string;
      options?: string[];
    }>
  ) {
    return request<DiagnosticSubmitResponse>(`/diagnostic/${diagnosticId}/submit`, {
      method: "POST",
      credentials: "include",
      headers: {

      },
      body: JSON.stringify({
        ...(responses ? { responses } : {}),
        responsibilityDeclarationAccepted,
        finalize,
      }),
    });
  },

  getReportUrl(): string {
    return `${API_URL}/diagnostic/current/report`;
  },
};
