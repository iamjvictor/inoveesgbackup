export type EvidenceGroupCode = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

export interface EvidenceUploadGroup {
  code: EvidenceGroupCode;
  title: string;
  description: string;
  examples: string;
  badge: string;
  documentTypes: string[];
  tone: "emerald" | "amber" | "sky" | "violet" | "slate";
}

export interface StagedEvidenceFile {
  id: string;
  name: string;
  documentType: string;
  sizeBytes: number;
  sizeLabel: string;
  mimeType: string;
  uploadedAt: string;
  base64Data?: string;
  rawFile?: File;
}

export interface EvidenceRequirementMetadata {
  expectedDocument: string;
  acceptedTypes: string[];
  primaryAxis: string;
  scoringAxes: string[];
  points: number;
  strategicObjectives: string[];
  gapIfMissing: string;
  recommendedService: string;
}

export interface UploadedEvidenceFile {
  id: string;
  fileName: string;
  documentType?: string;
  filePath: string;
  fileUrl?: string | null;
  storageBucket: string;
  evidenceCategory: string;
  uploadedAt: string;
  fileSizeBytes: number;
  mimeType: string;
  uploadStatus: "PENDING" | "UPLOADING" | "COMPLETED" | "FAILED";
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  reviews?: Array<{
    reviewedAt: string;
    newStatus: "PENDING" | "VERIFIED" | "REJECTED";
    reviewer: { fullName?: string | null; email?: string | null };
  }>;
}

export const EVIDENCE_STORAGE_BUCKET = "diagnostic-evidences";

export const EVIDENCE_ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx", ".xls", ".xlsx"] as const;

export const EVIDENCE_UPLOAD_GROUPS: EvidenceUploadGroup[] = [
  {
    code: "A",
    title: "Regularização da propriedade e da atividade",
    description: "Documentos que comprovam licenças, registros e autorizações da operação.",
    examples: "CAR, CCIR, CAF, licenças e outorgas.",
    badge: "Regularização",
    documentTypes: ["CAR", "CCIR", "CAF", "Licenças", "Outorgas", "Registros da atividade"],
    tone: "emerald",
  },
  {
    code: "B",
    title: "Conservação ambiental",
    description: "Evidências de preservação, recuperação e proteção de áreas sensíveis.",
    examples: "APP, Reserva Legal, nascentes, biodiversidade.",
    badge: "Conservação",
    documentTypes: ["APP", "Reserva Legal", "Nascentes", "Recuperação ambiental", "Biodiversidade"],
    tone: "sky",
  },
  {
    code: "C",
    title: "Gestão dos recursos naturais",
    description: "Controle de uso de solo, água, irrigação, energia e eficiência produtiva.",
    examples: "Consumo, manejo de água, energia e indicadores.",
    badge: "Recursos",
    documentTypes: ["Solo", "Água", "Irrigação", "Energia", "Eficiência produtiva"],
    tone: "amber",
  },
  {
    code: "D",
    title: "Produção sustentável e bioeconomia",
    description: "Práticas ligadas a inovação sustentável, circularidade e bioinsumos.",
    examples: "Bioinsumos, compostagem, regeneração, economia circular.",
    badge: "Bioeconomia",
    documentTypes: ["Bioinsumos", "Compostagem", "Economia circular", "Agricultura regenerativa", "Inovação sustentável"],
    tone: "violet",
  },
  {
    code: "E",
    title: "Pessoas e desenvolvimento social",
    description: "Treinamentos, segurança do trabalho e ações sociais documentadas.",
    examples: "SST, capacitações, iniciativas comunitárias.",
    badge: "Social",
    documentTypes: ["Treinamentos", "Segurança do trabalho", "Ações sociais", "Desenvolvimento comunitário"],
    tone: "emerald",
  },
  {
    code: "F",
    title: "Gestão e governança",
    description: "Políticas internas, organograma, planejamento e certificações.",
    examples: "Código de conduta, políticas e certificados.",
    badge: "Governança",
    documentTypes: ["Organograma", "Planejamento estratégico", "Políticas internas", "Certificações"],
    tone: "slate",
  },
  {
    code: "G",
    title: "Rastreabilidade e qualidade",
    description: "Rastreio de lotes, qualidade, fornecedores e origem dos insumos.",
    examples: "Controle de lotes, cadeia de fornecedores, certificações.",
    badge: "Rastreio",
    documentTypes: ["Controle de lotes", "Produção", "Fornecedores", "Qualidade", "Certificações de origem"],
    tone: "amber",
  },
  {
    code: "H",
    title: "Evidências fotográficas",
    description: "Imagens de áreas produtivas, estruturas e boas práticas implementadas.",
    examples: "Fotos de campo, estruturas, equipamentos e áreas preservadas.",
    badge: "Fotos",
    documentTypes: ["Áreas produtivas", "Estruturas", "Áreas preservadas", "Equipamentos", "Boas práticas"],
    tone: "sky",
  },
];

export function formatEvidenceFileSize(sizeBytes: number) {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(1)} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

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

  if (response.status === 401 && typeof window !== "undefined") {
    void fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
    window.location.href = "/?auth=true";
    return new Promise(() => {});
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message ?? "Request failed");
  }

  return data as T;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.includes(",") ? result.split(",").pop() ?? "" : result);
    };
    reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}

async function compressImageFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || typeof createImageBitmap === "undefined") {
    return file;
  }

  const image = await createImageBitmap(file);
  const maxDimension = 1920;
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
  if (!blob || blob.size >= file.size) return file;

  const compressedName = file.name.replace(/\.[^.]+$/, ".jpg");
  return new File([blob], compressedName, {
    type: "image/jpeg",
    lastModified: file.lastModified,
  });
}

export async function uploadEvidenceFiles(
  diagnosticId: string,
  groupCode: EvidenceGroupCode,
  files: Array<{ file: File; documentType: string; requirementCode: string; metadata: EvidenceRequirementMetadata }>
) {
  const payload = {
    groupCode,
    files: await Promise.all(
      files.map(async ({ file, documentType, requirementCode, metadata }) => {
        const optimizedFile = await compressImageFile(file);
        return {
          fileName: optimizedFile.name,
          mimeType: optimizedFile.type || "application/octet-stream",
          base64Data: await fileToBase64(optimizedFile),
          sizeBytes: optimizedFile.size,
          documentType,
          requirementCode,
          ...metadata,
        };
      })
    ),
  };

  return request<{
    success: boolean;
    diagnosticId: string;
    groupCode: EvidenceGroupCode;
    uploadedCount: number;
    uploadedAt: string;
    bucketName: string;
    evidences: UploadedEvidenceFile[];
  }>(`/diagnostic/${diagnosticId}/evidences`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
