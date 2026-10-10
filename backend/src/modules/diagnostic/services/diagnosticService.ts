import { DiagnosticRepository } from "../repositories/diagnosticRepository.js";
import { AuthRepository } from "../../auth/repositories/authRepository.js";
import { buildAuthAccessContext } from "../../auth/models/accessContext.js";
import { prisma } from "../../../lib/prisma.js";
import { Axis, EvidenceCategory, Prisma, UploadStatus, VerificationStatus } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";
import { cache } from "../../../lib/cache.js";
import { supabaseAdminClient } from "../../../lib/supabase.js";
import { env } from "../../../config/env.js";
import { CheckoutService } from "../../checkout/services/checkoutService.js";
import {
  agroDiagnosticQuestions,
  diagnosticQuestionsList,
  agroProdQuestionsList,
  agroIndQuestionsList,
  oilAndGasDiagnosticQuestions,
  infrastructureDiagnosticQuestions,
  type DiagnosticQuestion,
  type DiagnosticStartPayload,
} from "../models/diagnosticModel.js";
import { InviteRepository } from "../../invite/repositories/inviteRepository.js";
import { generateESGReportPDF } from "./pdfGeneratorService.js";
import { buildInitialEvidenceScoreRows } from "../../evidence/services/evidenceScore.js";
import { getAgroEvidence } from "../../evidence/catalogs/agroEvidenceCatalog.js";

const diagnosticRepository = new DiagnosticRepository();
const authRepository = new AuthRepository();
const inviteRepository = new InviteRepository();
const checkoutService = new CheckoutService();
const execFile = promisify(execFileCallback);

type DiagnosticResponseAxisInput = "ENVIRONMENTAL" | "BIOECONOMY_CIRCULAR" | "SOCIAL" | "GOVERNANCE";

type DiagnosticQuestionWeightLookup = Map<number, number>;

type EvidenceGroupCode = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

type EvidenceUploadInput = {
  groupCode: EvidenceGroupCode;
  files: Array<{
    fileName: string;
    mimeType: string;
    base64Data: string;
    sizeBytes: number;
    documentType?: string;
    requirementCode?: string;
    expectedDocument?: string;
    acceptedTypes?: string[];
    primaryAxis?: string;
    scoringAxes?: string[];
    points?: number;
    strategicObjectives?: string[];
    gapIfMissing?: string;
    recommendedService?: string;
  }>;
};

type EvidenceRequirementInput = {
  code: string;
  name: string;
  groupCode: EvidenceGroupCode;
  categoryCode: string;
  segmentCode?: string | null;
  mimeType: string;
  expectedDocument?: string;
  acceptedTypes?: string[];
  primaryAxis?: string;
  scoringAxes?: string[];
  points?: number;
  strategicObjectives?: string[];
  gapIfMissing?: string;
  recommendedService?: string;
};

type CalculatedDiagnosticScore = {
  overallScore: number;
  environmentalScore: number;
  bioeconomyCircularScore: number;
  socialScore: number;
  governanceScore: number;
  maturityLevel: "NASCENT" | "DEVELOPING" | "ESTABLISHED" | "MANAGED" | "OPTIMIZED";
};

export function hasEvidenceUploadAccess(productCodes: string[]): boolean {
  return productCodes.some((code) =>
    ["ASSESSORIA_EVIDENCIAS", "ASSESSORIA_COMPLETA", "FULL_DIAGNOSTIC"].includes(
      code.trim().toUpperCase().replace(/-/g, "_"),
    ),
  );
}

function toPrismaAxis(axis: DiagnosticResponseAxisInput): Axis {
  switch (axis) {
    case "ENVIRONMENTAL":
      return Axis.ENVIRONMENTAL;
    case "BIOECONOMY_CIRCULAR":
      return Axis.BIOECONOMY_CIRCULAR;
    case "SOCIAL":
      return Axis.SOCIAL;
    case "GOVERNANCE":
      return Axis.GOVERNANCE;
  }
}

function normalizeIndustrySegment(segment?: string | null) {
  const normalized = (segment ?? "").trim().toLowerCase();

  if (normalized.includes("agroneg") || normalized.includes("agro")) {
    return "Agronegócio";
  }

  if (normalized.includes("civil")) {
    return "Construção Civil";
  }

  if (normalized.includes("óleo") || normalized.includes("gas") || normalized.includes("gás")) {
    return "Óleo e Gás";
  }

  if (normalized.includes("infraestrutura")) {
    return "Infraestrutura";
  }

  return null;
}

function mergeEvidenceScoresIntoDiagnostic(diagnostic: any) {
  if (!diagnostic) return diagnostic;

  const evidenceScores = diagnostic.organization?.evidenceScores ?? [];
  if (!evidenceScores.length) return diagnostic;

  const provenByAxis = new Map<string, number>(evidenceScores.map((item: any) => [item.axis as string, Number(item.provenScore ?? 0)]));
  const provenScores: number[] = [
    provenByAxis.get(Axis.ENVIRONMENTAL) ?? 0,
    provenByAxis.get(Axis.BIOECONOMY_CIRCULAR) ?? 0,
    provenByAxis.get(Axis.SOCIAL) ?? 0,
    provenByAxis.get(Axis.GOVERNANCE) ?? 0,
  ];
  const provenOverallScore = Math.round(provenScores.reduce((total, score) => total + score, 0) / provenScores.length);
  const { organization: _organization, ...diagnosticWithoutOrganization } = diagnostic;

  return {
    ...diagnosticWithoutOrganization,
    score: diagnostic.score
      ? {
          ...diagnostic.score,
          provenOverallScore,
          provenEnvironmentalScore: provenByAxis.get(Axis.ENVIRONMENTAL) ?? 0,
          provenBioeconomyCircularScore: provenByAxis.get(Axis.BIOECONOMY_CIRCULAR) ?? 0,
          provenSocialScore: provenByAxis.get(Axis.SOCIAL) ?? 0,
          provenGovernanceScore: provenByAxis.get(Axis.GOVERNANCE) ?? 0,
        }
      : diagnostic.score,
  };
}

export function getDiagnosticQuestionsForSegment(
  segmentName?: string | null,
  segmentCode?: string | null,
  categoryCode?: string | null,
  kind?: string | null
): DiagnosticQuestion[] {
  const normalizedSegment = normalizeIndustrySegment(segmentName);
  const normalizedCode = (segmentCode ?? "").trim().toUpperCase();
  const normalizedCategoryCode = (categoryCode ?? "").trim().toUpperCase();

  console.info("[diagnostic.question-selection] Inputs received", {
    kind: kind ?? null,
    segmentName: segmentName ?? null,
    normalizedSegment,
    segmentCode: segmentCode ?? null,
    normalizedCode,
    categoryCode: categoryCode ?? null,
    normalizedCategoryCode: normalizedCategoryCode || null,
  });

  // For suppliers, only the business segment defines the reduced questionnaire.
  if (kind === "SUPPLIER_DIAGNOSTIC") {
    if (normalizedCode === "PRODUCAO" || segmentName?.toLowerCase().includes("produç") || segmentName?.toLowerCase().includes("produc")) {
      console.info("[diagnostic.question-selection] Selected supplier production questionnaire", {
        selectedList: "agroProdQuestionsList",
        questionsCount: agroProdQuestionsList.length,
        reason: normalizedCode === "PRODUCAO" ? "segmentCode" : "segmentName",
      });
      return agroProdQuestionsList;
    }
    // Agroindustrial / Machinery / Packaging
    if (
      normalizedCode === "AGROINDUSTRIA" ||
      segmentName?.toLowerCase().includes("agroind") ||
      segmentName?.toLowerCase().includes("maquin") ||
      segmentName?.toLowerCase().includes("equip") ||
      segmentName?.toLowerCase().includes("embalag")
    ) {
      console.info("[diagnostic.question-selection] Selected supplier agroindustrial questionnaire", {
        selectedList: "agroIndQuestionsList",
        questionsCount: agroIndQuestionsList.length,
        reason: normalizedCode === "AGROINDUSTRIA" ? "segmentCode" : "segmentName",
      });
      return agroIndQuestionsList;
    }
  }

  if (normalizedCode === "OLEO_E_GAS" || normalizedCategoryCode === "OLEO_E_GAS" || normalizedSegment === "Óleo e Gás") {
    console.info("[diagnostic.question-selection] Selected oil and gas questionnaire", {
      selectedList: "oilAndGasDiagnosticQuestions",
      questionsCount: oilAndGasDiagnosticQuestions.length,
    });
    return oilAndGasDiagnosticQuestions;
  }

  if (
    normalizedCode === "INFRAESTRUTURA" ||
    normalizedCategoryCode === "INFRAESTRUTURA" ||
    normalizedSegment === "Infraestrutura"
  ) {
    console.info("[diagnostic.question-selection] Selected infrastructure questionnaire", {
      selectedList: "infrastructureDiagnosticQuestions",
      questionsCount: infrastructureDiagnosticQuestions.length,
    });
    return infrastructureDiagnosticQuestions;
  }

  // Company/autodeclarable diagnostics always use the larger questionnaire.
  // The category is recorded for the decision and future category-specific lists;
  // specificActivity intentionally does not participate in this selection.
  console.info("[diagnostic.question-selection] Selected company questionnaire", {
    selectedList: "agroDiagnosticQuestions",
    questionsCount: agroDiagnosticQuestions.length,
    kind: kind ?? null,
    categoryCode: normalizedCategoryCode || null,
    segmentCode: normalizedCode || null,
    normalizedSegment,
  });

  return agroDiagnosticQuestions;
}

function getDiagnosticSelectionKind(params: {
  hasSupplierRole: boolean;
  hasCompanyRole: boolean;
  persistedDiagnosticKind?: string | null;
}) {
  if (params.hasSupplierRole && !params.hasCompanyRole) {
    return "SUPPLIER_DIAGNOSTIC";
  }

  if (params.persistedDiagnosticKind === "PRE_DIAGNOSTIC") {
    return "PRE_DIAGNOSTIC";
  }

  return "FULL_DIAGNOSTIC";
}

function buildQuestionWeightLookup(questions: DiagnosticQuestion[]): DiagnosticQuestionWeightLookup {
  return new Map(
    questions.map((question) => [
      question.number,
      question.weight ?? 1,
    ])
  );
}

function escapeSqlLiteral(value: string) {
  return value.replace(/'/g, "''");
}

function sqlLiteral(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined) {
    return "NULL";
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "NULL";
  }

  if (typeof value === "boolean") {
    return value ? "TRUE" : "FALSE";
  }

  return `'${escapeSqlLiteral(value)}'`;
}

function mapGroupCodeToEvidenceCategory(groupCode: EvidenceGroupCode): EvidenceCategory {
  switch (groupCode) {
    case "A":
      return EvidenceCategory.REGULARIZATION;
    case "B":
      return EvidenceCategory.CONSERVATION;
    case "C":
      return EvidenceCategory.NATURAL_RESOURCES;
    case "D":
      return EvidenceCategory.SUSTAINABLE_PRODUCTION;
    case "E":
      return EvidenceCategory.PEOPLE_AND_SOCIAL;
    case "F":
      return EvidenceCategory.GOVERNANCE;
    case "G":
      return EvidenceCategory.TRACEABILITY_AND_QUALITY;
    case "H":
      return EvidenceCategory.PHOTOGRAPHIC;
  }
}

function mapGroupCodeToAxis(groupCode: EvidenceGroupCode): Axis {
  return groupCode === "D" ? Axis.BIOECONOMY_CIRCULAR
    : groupCode === "E" ? Axis.SOCIAL
      : groupCode === "F" || groupCode === "G" || groupCode === "H" ? Axis.GOVERNANCE
        : Axis.ENVIRONMENTAL;
}

function mapAxisLabelToPrismaAxis(axis: string | undefined, fallback: Axis) {
  switch ((axis ?? "").trim().toLowerCase()) {
    case "ambiental":
      return Axis.ENVIRONMENTAL;
    case "bioeconomia":
    case "bioeconomia circular":
      return Axis.BIOECONOMY_CIRCULAR;
    case "social":
      return Axis.SOCIAL;
    case "governança":
    case "governanca":
      return Axis.GOVERNANCE;
    default:
      return fallback;
  }
}

function mapMimeTypeToAcceptedType(mimeType: string) {
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType === "image/jpeg") return "JPG";
  if (mimeType === "image/png") return "PNG";
  if (mimeType.includes("word")) return mimeType.includes("openxml") ? "DOCX" : "DOC";
  if (mimeType.includes("excel")) return mimeType.includes("openxml") ? "XLSX" : "XLS";
  return mimeType;
}

export function buildEvidenceRequirementData(input: EvidenceRequirementInput) {
  const agroCatalogEntry = input.categoryCode.toUpperCase() === "AGRONEGOCIO"
    ? getAgroEvidence(input.code)
    : null;
  const primaryAxis = mapAxisLabelToPrismaAxis(input.primaryAxis, mapGroupCodeToAxis(input.groupCode));
  const axisLabel = primaryAxis === Axis.BIOECONOMY_CIRCULAR ? "Bioeconomia"
    : primaryAxis === Axis.SOCIAL ? "Social"
      : primaryAxis === Axis.GOVERNANCE ? "Governança"
        : "Ambiental";

  return {
    code: input.code,
    categoryCode: input.categoryCode,
    segmentCode: input.segmentCode ?? null,
    name: agroCatalogEntry?.title ?? input.name,
    expectedDocument: input.expectedDocument ?? input.name,
    acceptedTypes: input.acceptedTypes?.length ? input.acceptedTypes : [mapMimeTypeToAcceptedType(input.mimeType)],
    groupCode: input.groupCode,
    primaryAxis,
    scoringAxes: agroCatalogEntry?.scoringAxes.map((axis) => axis === Axis.ENVIRONMENTAL ? "Ambiental"
      : axis === Axis.BIOECONOMY_CIRCULAR ? "Bioeconomia"
        : axis === Axis.SOCIAL ? "Social" : "Governança")
      ?? (input.scoringAxes?.length ? input.scoringAxes : [axisLabel]),
    points: agroCatalogEntry?.points ?? input.points ?? 0,
    strategicObjectives: input.strategicObjectives ?? [],
    gapIfMissing: input.gapIfMissing ?? null,
    recommendedService: input.recommendedService ?? null,
    active: true,
  };
}

type EvidenceRequirementMetadataKey =
  | "requirementCode"
  | "expectedDocument"
  | "acceptedTypes"
  | "primaryAxis"
  | "scoringAxes"
  | "points"
  | "strategicObjectives"
  | "gapIfMissing"
  | "recommendedService";

export function buildEvidencePersistenceData<T extends Record<string, any>>(
  input: T,
  requestId: string,
  uploadedByUserId: string,
): Omit<T, EvidenceRequirementMetadataKey> & { requestId: string; uploadedByUserId: string } {
  const {
    requirementCode,
    expectedDocument,
    acceptedTypes,
    primaryAxis,
    scoringAxes,
    points,
    strategicObjectives,
    gapIfMissing,
    recommendedService,
    ...evidence
  } = input;

  return {
    ...evidence,
    requestId,
    uploadedByUserId,
  };
}

function sanitizeFileName(fileName: string) {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function buildEvidenceStoragePath(params: {
  organizationId: string;
  diagnosticId: string;
  groupCode: EvidenceGroupCode;
  fileName: string;
}) {
  return `organizations/${params.organizationId}/diagnostics/${params.diagnosticId}/groups/${params.groupCode}/${Date.now()}-${sanitizeFileName(params.fileName)}`;
}

function decodeBase64File(base64Data: string) {
  const rawBase64 = base64Data.includes(",") ? base64Data.split(",").pop() ?? "" : base64Data;
  return Buffer.from(rawBase64, "base64");
}

async function compressPdfBeforeStorage(file: EvidenceUploadInput["files"][number], buffer: Buffer) {
  if (file.mimeType !== "application/pdf") {
    return { buffer, fileName: file.fileName, mimeType: file.mimeType };
  }

  const workDir = await mkdtemp(join(tmpdir(), "inoveesg-pdf-"));
  const inputPath = join(workDir, "input.pdf");
  const outputPath = join(workDir, "compressed.pdf");

  try {
    await writeFile(inputPath, buffer);
    await execFile("gs", [
      "-sDEVICE=pdfwrite",
      "-dCompatibilityLevel=1.4",
      "-dPDFSETTINGS=/ebook",
      "-dNOPAUSE",
      "-dQUIET",
      "-dBATCH",
      `-sOutputFile=${outputPath}`,
      inputPath,
    ]);

    const compressedBuffer = await readFile(outputPath);
    if (compressedBuffer.length < buffer.length) {
      return { buffer: compressedBuffer, fileName: file.fileName, mimeType: "application/pdf" };
    }
  } catch (error) {
    console.warn("[DiagnosticService.compressPdfBeforeStorage] PDF compression unavailable, using original", {
      fileName: file.fileName,
      error: normalizeEvidenceUploadError(error),
    });
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }

  return { buffer, fileName: file.fileName, mimeType: file.mimeType };
}

function normalizeEvidenceUploadError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function transformSupplierDiagnosticScore(value: number | null | undefined) {
  const raw = Number(value ?? 0);
  return Math.max(0, Math.min(40, Math.round((raw - 20) * 0.5)));
}

function roundToHalfStar(value: number) {
  const integerPart = Math.floor(value);
  const decimalPart = value - integerPart;

  if (decimalPart > 0.25 && decimalPart <= 0.75) {
    return integerPart + 0.5;
  }

  if (decimalPart > 0.75) {
    return integerPart + 1;
  }

  return integerPart;
}

function getSupplierMaturityLabelFromStars(stars: number) {
  if (stars >= 2) return "Nível 2 — Básico";
  if (stars >= 1.5) return "Nível 1,5 — Risco moderado";
  if (stars >= 1) return "Nível 1 — Risco alto";
  if (stars >= 0.5) return "Nível 0,5 — Risco muito alto";
  return "Nível 0 — Altíssimo risco";
}

function transformSupplierDiagnosticPayload(diagnostic: any) {
  if (!diagnostic) {
    return diagnostic;
  }

  const score = diagnostic.score
    ? {
        ...diagnostic.score,
        overallScore: transformSupplierDiagnosticScore(diagnostic.score.overallScore),
        environmentalScore: transformSupplierDiagnosticScore(diagnostic.score.environmentalScore),
        bioeconomyCircularScore: transformSupplierDiagnosticScore(diagnostic.score.bioeconomyCircularScore),
        socialScore: transformSupplierDiagnosticScore(diagnostic.score.socialScore),
        governanceScore: transformSupplierDiagnosticScore(diagnostic.score.governanceScore),
        provenOverallScore: transformSupplierDiagnosticScore(diagnostic.score.provenOverallScore),
        provenEnvironmentalScore: transformSupplierDiagnosticScore(diagnostic.score.provenEnvironmentalScore),
        provenBioeconomyCircularScore: transformSupplierDiagnosticScore(diagnostic.score.provenBioeconomyCircularScore),
        provenSocialScore: transformSupplierDiagnosticScore(diagnostic.score.provenSocialScore),
        provenGovernanceScore: transformSupplierDiagnosticScore(diagnostic.score.provenGovernanceScore),
      }
    : diagnostic.score;

  const overallStars = score ? roundToHalfStar(Number(score.overallScore ?? 0) / 20) : 0;
  const maturityLabel = getSupplierMaturityLabelFromStars(overallStars);

  return {
    ...diagnostic,
    score,
    responses: diagnostic.responses,
    evidences: diagnostic.evidences,
    supplierDisplay: {
      overallStars,
      maturityLabel,
    },
  };
}

function hasConsultoriaAccess(profile: Awaited<ReturnType<AuthRepository["findBySupabaseUserId"]>>) {
  const organization = profile?.organizationUsers?.[0]?.organization;

  if (!organization) {
    return false;
  }

  const activeSubscriptions =
    organization.subscriptions?.filter((subscription: { status: string }) => subscription.status === "ACTIVE") ?? [];
  if (activeSubscriptions.length > 0) {
    return true;
  }

  const activeEntitlementCodes =
    organization.entitlements
      ?.filter((entitlement: { status: string; featureFlag: { code: string } }) => entitlement.status === "ACTIVE")
      .map((entitlement: { featureFlag: { code: string } }) => entitlement.featureFlag.code.toUpperCase()) ?? [];

  const consultoriaEntitlementCodes = new Set([
    "DIAGNOSTIC_CONSULTORIA",
    "ASSESSORIA_CONTINUA",
    "ASSESSORIA_ESG",
    "CONSULTORIA_ESG",
    "FULL_DIAGNOSTIC",
  ]);

  if (activeEntitlementCodes.some((code: string) => consultoriaEntitlementCodes.has(code))) {
    return true;
  }

  const paidProductCodes =
    organization.orders?.flatMap((order: { items?: Array<{ product: { code: string } }> }) =>
      order.items?.map((item: { product: { code: string } }) => item.product.code.toLowerCase()) ?? []
    ) ?? [];

  return paidProductCodes.some((code: string) =>
    ["diag-consultoria", "assessoria-completa", "consultoria-esg", "full-diagnostic"].includes(code)
  );
}

export class DiagnosticService {
  private async ensureEvidenceBucketExists(bucketName: string) {
    console.info("[DiagnosticService.ensureEvidenceBucketExists] Verificando bucket", {
      bucketName,
    });

    const { data: buckets, error: listError } = await supabaseAdminClient.storage.listBuckets();
    if (listError) {
      console.warn("[DiagnosticService.ensureEvidenceBucketExists] listBuckets falhou", {
        bucketName,
        error: normalizeEvidenceUploadError(listError),
      });
    }

    const exists = buckets?.some((bucket) => bucket.name === bucketName) ?? false;
    if (exists) {
      console.info("[DiagnosticService.ensureEvidenceBucketExists] Bucket já existe", {
        bucketName,
      });
      return;
    }

    console.info("[DiagnosticService.ensureEvidenceBucketExists] Criando bucket", {
      bucketName,
    });

    const { error: createError } = await supabaseAdminClient.storage.createBucket(bucketName, {
      public: false,
      fileSizeLimit: 20 * 1024 * 1024,
      allowedMimeTypes: [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ],
    });

    if (createError) {
      throw new Error(`Não foi possível criar o bucket de evidências: ${normalizeEvidenceUploadError(createError)}`);
    }
  }

  async uploadEvidenceFiles(supabaseUserId: string, diagnosticId: string, input: EvidenceUploadInput) {
    console.info("[DiagnosticService.uploadEvidenceFiles] Iniciando upload de evidências", {
      supabaseUserId,
      diagnosticId,
      groupCode: input.groupCode,
      filesCount: input.files.length,
    });

    const organizationId = await authRepository.findOrganizationIdBySupabaseUserId(supabaseUserId);
    if (!organizationId) {
      throw new Error("Empresa não encontrada para o usuário atual");
    }

    const accessContext = await authRepository.getAccessContextBySupabaseUserId(supabaseUserId);
    console.info("[DiagnosticService.uploadEvidenceFiles] Produtos comprados conferidos", {
      supabaseUserId,
      organizationId,
      purchasedProductCodes: accessContext?.purchasedProductCodes ?? [],
      hasEvidenceUploadAccess: hasEvidenceUploadAccess(accessContext?.purchasedProductCodes ?? []),
    });

    if (!accessContext || !hasEvidenceUploadAccess(accessContext.purchasedProductCodes)) {
      throw new Error("É necessário adquirir o produto Assessoria de Evidências para enviar arquivos");
    }

    const diagnostic = await diagnosticRepository.findById(diagnosticId);
    if (!diagnostic) {
      throw new Error("Diagnóstico não encontrado");
    }

    if (diagnostic.organizationId !== organizationId) {
      throw new Error("Diagnóstico não pertence à sua empresa");
    }

    const [organization, uploader] = await Promise.all([
      prisma.organization.findUnique({
        where: { id: organizationId },
        select: {
          businessCategory: { select: { code: true } },
          businessSegment: { select: { code: true } },
        },
      }),
      prisma.user.findUnique({
        where: { supabaseUserId },
        select: { id: true },
      }),
    ]);

    if (!uploader) {
      throw new Error("Usuário não encontrado para registrar o upload");
    }

    const categoryCode = organization?.businessCategory?.code ?? "UNKNOWN";
    const segmentCode = organization?.businessSegment?.code ?? "UNKNOWN";

    console.info("[DiagnosticService.uploadEvidenceFiles] Contexto do solicitante resolvido", {
      diagnosticId,
      organizationId,
      supabaseUserId,
      uploaderUserId: uploader.id,
      categoryCode,
      segmentCode,
    });

    const bucketName = "diagnostic-evidences";
    await this.ensureEvidenceBucketExists(bucketName);

    const uploadedObjects: Array<{ path: string; fileName: string }> = [];
    const uploadedAt = new Date();

    try {
          const uploadedFiles: Array<{
            diagnosticId: string;
            organizationId: string;
        diagnosticResponseId: string | null;
        evidenceCategory: EvidenceCategory;
        storageBucket: string;
        fileName: string;
        filePath: string;
        fileSizeBytes: number;
        mimeType: string;
        fileUrl: string | null;
        uploadStatus: UploadStatus;
        verificationStatus: VerificationStatus;
        uploadedAt: Date;
        documentType: string;
        requirementCode: string;
        expectedDocument?: string;
        acceptedTypes?: string[];
        primaryAxis?: string;
        scoringAxes?: string[];
        points?: number;
        strategicObjectives?: string[];
        gapIfMissing?: string;
        recommendedService?: string;
      }> = [];

      for (const [index, file] of input.files.entries()) {
          const originalBuffer = decodeBase64File(file.base64Data);
          const optimizedFile = await compressPdfBeforeStorage(file, originalBuffer);
          const storagePath = buildEvidenceStoragePath({
            organizationId,
            diagnosticId,
            groupCode: input.groupCode,
            fileName: optimizedFile.fileName,
          });

          console.info("[DiagnosticService.uploadEvidenceFiles] Enviando arquivo para storage", {
            diagnosticId,
            organizationId,
            groupCode: input.groupCode,
            fileName: file.fileName,
            mimeType: optimizedFile.mimeType,
            sizeBytes: file.sizeBytes,
            storagePath,
            index,
          });

          const { error: uploadError } = await supabaseAdminClient.storage
            .from(bucketName)
            .upload(storagePath, optimizedFile.buffer, {
              contentType: optimizedFile.mimeType,
              upsert: false,
            });

          if (uploadError) {
            throw new Error(`Falha ao enviar arquivo ${file.fileName}: ${normalizeEvidenceUploadError(uploadError)}`);
          }

          uploadedObjects.push({
            path: storagePath,
            fileName: optimizedFile.fileName,
          });

          console.info("[DiagnosticService.uploadEvidenceFiles] Arquivo enviado com sucesso", {
            fileName: file.fileName,
            storagePath,
          });

          uploadedFiles.push({
            diagnosticId,
            organizationId,
            diagnosticResponseId: null,
            evidenceCategory: mapGroupCodeToEvidenceCategory(input.groupCode),
            storageBucket: bucketName,
            fileName: file.fileName,
            filePath: storagePath,
            fileSizeBytes: optimizedFile.buffer.length,
            mimeType: optimizedFile.mimeType,
            fileUrl: null as string | null,
            uploadStatus: UploadStatus.COMPLETED,
            verificationStatus: VerificationStatus.PENDING,
            uploadedAt,
            documentType: file.documentType ?? file.fileName,
            requirementCode: file.requirementCode ?? `GROUP_${input.groupCode}`,
            expectedDocument: file.expectedDocument,
            acceptedTypes: file.acceptedTypes,
            primaryAxis: file.primaryAxis,
            scoringAxes: file.scoringAxes,
            points: file.points,
            strategicObjectives: file.strategicObjectives,
            gapIfMissing: file.gapIfMissing,
            recommendedService: file.recommendedService,
          });
      }

      console.info("[DiagnosticService.uploadEvidenceFiles] Persistindo metadados no banco", {
        diagnosticId,
        organizationId,
        count: uploadedFiles.length,
      });

      const saved = await prisma.$transaction(async (tx) => {
        const requestIdsByCode = new Map<string, string>();

        for (const file of uploadedFiles) {
          if (requestIdsByCode.has(file.requirementCode)) continue;

          const requirementData = buildEvidenceRequirementData({
            code: file.requirementCode,
            name: file.documentType,
            groupCode: input.groupCode,
            categoryCode,
            segmentCode,
            mimeType: file.mimeType,
            expectedDocument: file.expectedDocument,
            acceptedTypes: file.acceptedTypes,
            primaryAxis: file.primaryAxis,
            scoringAxes: file.scoringAxes,
            points: file.points,
            strategicObjectives: file.strategicObjectives,
            gapIfMissing: file.gapIfMissing,
            recommendedService: file.recommendedService,
          });
          const requirement = await tx.evidenceRequirement.upsert({
            where: {
              code_categoryCode_segmentCode: {
                code: requirementData.code,
                categoryCode: requirementData.categoryCode,
                segmentCode: requirementData.segmentCode ?? "UNKNOWN",
              },
            },
            update: {
              name: requirementData.name,
              expectedDocument: requirementData.expectedDocument,
              acceptedTypes: requirementData.acceptedTypes,
              groupCode: requirementData.groupCode,
              primaryAxis: requirementData.primaryAxis,
              scoringAxes: requirementData.scoringAxes,
              points: requirementData.points,
              strategicObjectives: requirementData.strategicObjectives,
              gapIfMissing: requirementData.gapIfMissing,
              recommendedService: requirementData.recommendedService,
            },
            create: requirementData,
            select: { id: true },
          });

          const request = await tx.diagnosticEvidenceRequest.upsert({
            where: {
              diagnosticId_requirementId: {
                diagnosticId,
                requirementId: requirement.id,
              },
            },
            update: {
              status: "RECEIVED",
              assignedUserId: uploader.id,
              completedAt: null,
            },
            create: {
              diagnosticId,
              requirementId: requirement.id,
              assignedUserId: uploader.id,
              status: "RECEIVED",
            },
            select: { id: true },
          });

          requestIdsByCode.set(file.requirementCode, request.id);
        }

        const insertResult = await tx.evidence.createMany({
          data: uploadedFiles.map((file) => buildEvidencePersistenceData(
            file,
            requestIdsByCode.get(file.requirementCode)!,
            uploader.id,
          )),
        });

        const persisted = await tx.evidence.findMany({
          where: {
            diagnosticId,
            filePath: {
              in: uploadedObjects.map((object) => object.path),
            },
          },
          select: {
            id: true,
            fileName: true,
            filePath: true,
            fileUrl: true,
            storageBucket: true,
            evidenceCategory: true,
            uploadedAt: true,
            
            fileSizeBytes: true,
            mimeType: true,
            uploadStatus: true,
            verificationStatus: true,
            requestId: true,
            uploadedByUserId: true,
            documentType: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        });

        // O primeiro upload abre o controle de pontuação da análise de evidências.
        // Os quatro pilares são criados zerados e depois atualizados pelo admin.
        await tx.evidenceScore.createMany({
          data: buildInitialEvidenceScoreRows(organizationId),
          skipDuplicates: true,
        });

        return { insertResult, persisted };
      }, {
        maxWait: 15_000,
        timeout: 30_000,
      });

      console.info("[DiagnosticService.uploadEvidenceFiles] Metadados persistidos com sucesso", {
        diagnosticId,
        organizationId,
        groupCode: input.groupCode,
        insertedCount: saved.insertResult.count,
        uploadedObjects: uploadedObjects.length,
        requestIds: [...new Set(saved.persisted.map((evidence) => evidence.requestId).filter(Boolean))],
        evidenceIds: saved.persisted.map((evidence) => evidence.id),
        createdEvidences: saved.persisted.map((evidence) => ({
          id: evidence.id,
          fileName: evidence.fileName,
          filePath: evidence.filePath,
          evidenceCategory: evidence.evidenceCategory,
          uploadStatus: evidence.uploadStatus,
          verificationStatus: evidence.verificationStatus,
        })),
      });

      await cache.delete(`diagnostic:current:${organizationId}`);
      await cache.delete(`auth:profile:v2:${supabaseUserId}`);

      return {
        success: true,
        diagnosticId,
        groupCode: input.groupCode,
        uploadedCount: uploadedObjects.length,
        uploadedAt,
        bucketName,
        evidences: saved.persisted,
      };
    } catch (error) {
      console.error("[DiagnosticService.uploadEvidenceFiles] Falha no upload, iniciando limpeza", {
        diagnosticId,
        organizationId,
        error: normalizeEvidenceUploadError(error),
        uploadedObjects: uploadedObjects.length,
      });

      await Promise.all(
        uploadedObjects.map(async (object) => {
          console.warn("[DiagnosticService.uploadEvidenceFiles] Removendo arquivo órfão", {
            path: object.path,
            fileName: object.fileName,
          });
          await supabaseAdminClient.storage.from(bucketName).remove([object.path]);
        })
      );

      throw error;
    }
  }

  private async saveCalculatedScore(diagnosticId: string, score: CalculatedDiagnosticScore) {
    console.log("[DiagnosticService.saveCalculatedScore] Salvando score calculado no banco", {
      diagnosticId,
      score,
    });

    const t0 = Date.now();
    const result = await prisma.$transaction(async (tx) => {
      const diagnosticScore = await tx.diagnosticScore.upsert({
        where: { diagnosticId },
        update: {
          overallScore: score.overallScore,
          environmentalScore: score.environmentalScore,
          bioeconomyCircularScore: score.bioeconomyCircularScore,
          socialScore: score.socialScore,
          governanceScore: score.governanceScore,
          maturityLevel: score.maturityLevel,
          calculatedAt: new Date(),
        },
        create: {
          diagnosticId,
          overallScore: score.overallScore,
          environmentalScore: score.environmentalScore,
          bioeconomyCircularScore: score.bioeconomyCircularScore,
          socialScore: score.socialScore,
          governanceScore: score.governanceScore,
          maturityLevel: score.maturityLevel,
        },
      });

      await tx.diagnostic.update({
        where: { id: diagnosticId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          responsibilityDeclarationAccepted: true,
        },
      });

      return diagnosticScore;
    });

    console.log("[DiagnosticService.saveCalculatedScore] Score salvo com sucesso", {
      diagnosticId,
      durationMs: Date.now() - t0,
    });

    return result;
  }

  async startDiagnostic(supabaseUserId: string): Promise<DiagnosticStartPayload> {
    console.info("[diagnostic.service.startDiagnostic] Starting diagnostic flow", {
      supabaseUserId,
    });

    const profile = await authRepository.findBySupabaseUserId(supabaseUserId);
    const organization = profile?.organizationUsers?.[0]?.organization;

    if (!organization) {
      console.warn("[diagnostic.service.startDiagnostic] Organization not found for user", {
        supabaseUserId,
      });
      throw new Error("Empresa não encontrada para o usuário atual");
    }

    const hasSupplierRole = organization.roles?.some((r: any) => r.role === "SUPPLIER") ?? false;
    const hasCompanyRole = organization.roles?.some((r: any) => r.role === "COMPANY") ?? false;
    const isSupplierOrg = hasSupplierRole && !hasCompanyRole;

    const currentDiagnostic = await diagnosticRepository.findOpenByOrganizationId(organization.id);
    const kind = getDiagnosticSelectionKind({
      hasSupplierRole,
      hasCompanyRole,
      persistedDiagnosticKind: currentDiagnostic?.kind,
    });

    const industrySegment = normalizeIndustrySegment(organization.industrySegment);
    const questions = getDiagnosticQuestionsForSegment(
      organization.industrySegment,
      organization.businessSegment?.code,
      organization.businessCategory?.code,
      kind
    );
    const resolvedIndustrySegment = industrySegment ?? organization.industrySegment ?? "Geral";
    const consultoriaAccess = hasConsultoriaAccess(profile);

    console.info("[diagnostic.service.startDiagnostic] Organization resolved", {
      supabaseUserId,
      organizationId: organization.id,
      organizationName: organization.tradeName,
      roles: organization.roles?.map((role: any) => ({
        role: role.role,
        source: role.source,
        removedAt: role.removedAt,
      })) ?? [],
      hasSupplierRole,
      hasCompanyRole,
      isSupplierOrg,
      computedKind: kind,
      rawIndustrySegment: organization.industrySegment,
      normalizedIndustrySegment: industrySegment,
      businessCategory: organization.businessCategory
        ? {
            code: organization.businessCategory.code,
            name: organization.businessCategory.name,
          }
        : null,
      businessSegment: organization.businessSegment
        ? {
            code: organization.businessSegment.code,
            name: organization.businessSegment.name,
          }
        : null,
      questionsCount: questions.length,
      firstQuestionNumber: questions[0]?.number ?? null,
      lastQuestionNumber: questions[questions.length - 1]?.number ?? null,
      consultoriaAccess,
    });

    const latestCompletedDiagnostic = currentDiagnostic
      ? null
      : await diagnosticRepository.findLatestCompletedByOrganizationId(organization.id);

    const accessContext = buildAuthAccessContext(profile);
    const hasPreDiagnosticAccess = accessContext?.hasPreDiagnosticAccess ?? false;

    if (hasCompanyRole && !hasPreDiagnosticAccess) {
      console.warn("[diagnostic.service.startDiagnostic] Access blocked: company has not purchased pre-diagnostic or any subscription", {
        organizationId: organization.id,
      });
      throw new Error("Você precisa adquirir o Pré-Diagnóstico ou um plano de assessoria para iniciar a avaliação.");
    }

    if (!currentDiagnostic && latestCompletedDiagnostic && !consultoriaAccess) {
      console.warn("[diagnostic.service.startDiagnostic] Refill blocked without consultoria access", {
        organizationId: organization.id,
        latestCompletedDiagnosticId: latestCompletedDiagnostic.id,
      });
      throw new Error("Você já concluiu este diagnóstico. Para refazer, contrate um plano de consultoria.");
    }

    const diagnostic =
      currentDiagnostic ?? (await diagnosticRepository.createDraftDiagnostic(
        organization.id,
        `Diagnóstico ESG - ${resolvedIndustrySegment}`,
        kind
      ));

    console.info("[diagnostic.service.startDiagnostic] Diagnostic session ready", {
      organizationId: organization.id,
      diagnosticId: diagnostic.id,
      persistedDiagnosticKind: diagnostic.kind,
      diagnosticStatus: diagnostic.status,
      reusedExistingDiagnostic: !!currentDiagnostic,
      createdNewDiagnostic: !currentDiagnostic,
    });

    await cache.delete(`diagnostic:current:${organization.id}`);

    console.info("[diagnostic.service.startDiagnostic] Cache invalidated", {
      cacheKey: `diagnostic:current:${organization.id}`,
    });

    return {
      diagnosticId: diagnostic.id,
      industrySegment: resolvedIndustrySegment,
      questions: questions.map((question) => ({
        ...question,
        weight: question.weight ?? 1,
      })),
    };
  }

  async createCheckoutSession(
    supabaseUserId: string,
    productCode: "PRE_DIAGNOSTIC" | "PRE_DIAGNOSTIC_PLUS" = "PRE_DIAGNOSTIC"
  ) {
    console.info("[diagnostic.service.createCheckoutSession] Delegating to checkout service", {
      supabaseUserId,
      productCode,
    });

    const session = await checkoutService.createPreference(supabaseUserId, productCode);

    return {
      checkoutUrl: session.checkoutUrl,
      diagnosticId: session.diagnosticId ?? null,
      orderId: session.orderId,
      productCode: session.productCode,
      totalCents: session.totalCents,
    };
  }

  async confirmPayment(diagnosticId: string, simulateStatus: "success" | "failure") {
    console.info("[diagnostic.service.confirmPayment] Confirming simulated payment", {
      diagnosticId,
      simulateStatus,
    });

    const diagnostic = await diagnosticRepository.findById(diagnosticId);

    if (!diagnostic) {
      throw new Error("Diagnóstico não encontrado");
    }

    // Invalidate cache
    await cache.delete(`diagnostic:current:${diagnostic.organizationId}`);

    // Busca o pedido correspondente para atualizar
    const orders = await prisma.order.findMany({
      where: {
        organizationId: diagnostic.organizationId,
        orderType: "ONE_TIME",
        status: "PENDING_PAYMENT",
      },
      include: {
        items: true,
      },
    });

    const order = orders.find(o => 
      o.items.some(item => (item.metadata as any)?.diagnosticId === diagnosticId)
    );

    if (simulateStatus === "success") {
      await diagnosticRepository.updateStatus(diagnosticId, "ACTIVE");

      if (order) {
        // Atualiza pedido para PAID
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "PAID",
            paidAt: new Date(),
          },
        });

        // Cria o registro na tabela de pagamentos
        await prisma.payment.create({
          data: {
            orderId: order.id,
            provider: "SIMULATED",
            providerReference: `pay-prediag-${order.id}-${Date.now()}`,
            method: "PIX",
            status: "PAID",
            amountCents: order.totalCents,
            paidAt: new Date(),
          },
        });
      }
    } else {
      await diagnosticRepository.updateStatus(diagnosticId, "CANCELED");

      if (order) {
        // Atualiza pedido para FAILED
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "FAILED",
            canceledAt: new Date(),
          },
        });
      }
    }

    // Invalidate auth profile cache for organization users
    const orgUsers = await prisma.organizationUser.findMany({
      where: { organizationId: diagnostic.organizationId },
      include: { user: true },
    });
    for (const ou of orgUsers) {
      await cache.delete(`auth:profile:v2:${ou.user.supabaseUserId}`);
    }

    return {
      success: simulateStatus === "success",
      diagnosticId,
    };
  }

  async getCurrentDiagnostic(supabaseUserId: string) {
    console.info("[diagnostic.service.getCurrentDiagnostic] Fetching current diagnostic", {
      supabaseUserId,
    });

    const profile = await authRepository.findBySupabaseUserId(supabaseUserId);
    const organization = profile?.organizationUsers?.[0]?.organization;
    const organizationId = organization?.id ?? null;
    const hasSupplierRole = organization?.roles?.some((r: any) => r.role === "SUPPLIER") ?? false;
    const hasCompanyRole = organization?.roles?.some((r: any) => r.role === "COMPANY") ?? false;
    const isSupplierOrg = hasSupplierRole && !hasCompanyRole;

    if (!organizationId) {
      console.warn("[diagnostic.service.getCurrentDiagnostic] Organization not found for user", {
        supabaseUserId,
      });
      throw new Error("Empresa não encontrada para o usuário atual");
    }

    const cacheKey = `diagnostic:current:${organizationId}`;
    const cached = await cache.get<{ diagnostic: any; hasDiagnostic: boolean }>(cacheKey);
    if (cached !== undefined) {
      console.info("[diagnostic.service.getCurrentDiagnostic] Cache hit", {
        organizationId,
        cacheKey,
      });

      const transformedCachedDiagnostic = isSupplierOrg
        ? transformSupplierDiagnosticPayload(mergeEvidenceScoresIntoDiagnostic(cached.diagnostic))
        : mergeEvidenceScoresIntoDiagnostic(cached.diagnostic);

      console.info("[diagnostic.service.getCurrentDiagnostic] Diagnostic payloads", {
        organizationId,
        isSupplierOrg,
        rawScore: cached.diagnostic?.score ?? null,
        transformedScore: transformedCachedDiagnostic?.score ?? null,
        supplierDisplay: transformedCachedDiagnostic?.supplierDisplay ?? null,
      });

      return {
        diagnostic: transformedCachedDiagnostic,
        hasDiagnostic: cached.hasDiagnostic,
      };
    }

    console.info("[diagnostic.service.getCurrentDiagnostic] Cache miss", {
      organizationId,
      cacheKey,
    });

    const diagnostic = await diagnosticRepository.findCurrentByOrganizationId(organizationId);
    const diagnosticWithEvidenceScores = mergeEvidenceScoresIntoDiagnostic(diagnostic);
    const transformedDiagnostic = isSupplierOrg ? transformSupplierDiagnosticPayload(diagnosticWithEvidenceScores) : diagnosticWithEvidenceScores;

    console.info("[diagnostic.service.getCurrentDiagnostic] Diagnostic payloads", {
      organizationId,
      isSupplierOrg,
      rawScore: diagnostic?.score ?? null,
      transformedScore: transformedDiagnostic?.score ?? null,
      supplierDisplay: transformedDiagnostic?.supplierDisplay ?? null,
    });

    const result = {
      diagnostic,
      hasDiagnostic: !!diagnostic,
    };

    await cache.set(cacheKey, result, 60 * 1000);
    console.info("[diagnostic.service.getCurrentDiagnostic] Diagnostic cached", {
      organizationId,
      cacheKey,
      hasDiagnostic: !!diagnosticWithEvidenceScores,
      diagnosticId: diagnosticWithEvidenceScores?.id ?? null,
    });
    return {
      diagnostic: transformedDiagnostic,
      hasDiagnostic: !!diagnostic,
    };
  }

  async saveResponses(
    supabaseUserId: string,
    diagnosticId: string,
    responsesInput: Array<{
      questionCode: string;
      questionOrder: number;
      axis: DiagnosticResponseAxisInput;
      questionText: string;
      questionType: "MULTIPLE_CHOICE" | "TEXT";
      answerText: string;
      options?: string[];
    }>
  ) {
    console.info("[diagnostic.service.saveResponses] Saving responses", {
      supabaseUserId,
      diagnosticId,
      responsesCount: responsesInput.length,
    });

    const organizationId = await authRepository.findOrganizationIdBySupabaseUserId(supabaseUserId);

    if (!organizationId) {
      console.error("[diagnostic.service.saveResponses] Organization not found for user", {
        supabaseUserId,
      });
      throw new Error("Empresa não encontrada para o usuário atual");
    }

    const diagnostic = await diagnosticRepository.findById(diagnosticId);
    if (!diagnostic) {
      console.error("[diagnostic.service.saveResponses] Diagnostic not found", {
        diagnosticId,
      });
      throw new Error("Diagnóstico não encontrado");
    }

    if (diagnostic.organizationId !== organizationId) {
      console.error("[diagnostic.service.saveResponses] Diagnostic does not belong to organization", {
        diagnosticId,
        diagnosticOrganizationId: diagnostic.organizationId,
        organizationId,
      });
      throw new Error("Diagnóstico não pertence à sua empresa");
    }

    const profile = await authRepository.findBySupabaseUserId(supabaseUserId);
    const organization = profile?.organizationUsers?.[0]?.organization;
    const questionWeightLookup = buildQuestionWeightLookup(getDiagnosticQuestionsForSegment(
      organization?.industrySegment,
      organization?.businessSegment?.code,
      organization?.businessCategory?.code,
      diagnostic.kind
    ));

    console.info("[diagnostic.service.saveResponses] Starting database transaction", {
      organizationId,
      diagnosticId,
      responsesCount: responsesInput.length,
    });
    const t0 = Date.now();
    try {
      const result = await prisma.$transaction(async (tx) => {
        const responsesToUpsert = responsesInput.map((res) => {
          let score: number | null = null;

          if (res.questionType === "MULTIPLE_CHOICE" && res.options && res.options.length > 0) {
            const index = res.options.indexOf(res.answerText);
            if (index !== -1) {
              if (res.options.length === 5) {
                score = index + 1;
              } else if (res.options.length > 1) {
                score = Math.round(1 + (index / (res.options.length - 1)) * 4);
              } else {
                score = 1;
              }
            }
          }

          const resolvedWeight = questionWeightLookup.get(res.questionOrder) ?? 1;

          return {
            diagnosticId,
            questionCode: res.questionCode,
            questionOrder: res.questionOrder,
            axis: toPrismaAxis(res.axis),
            questionText: res.questionText,
            questionType: res.questionType,
            answerText: res.answerText,
            score,
            weight: resolvedWeight.toFixed(2),
          };
        });

        console.info("[diagnostic.service.saveResponses] Creating response batch", {
          diagnosticId,
          responsesCount: responsesToUpsert.length,
        });

        for (const [index, responseData] of responsesToUpsert.entries()) {
          const responseId = randomUUID();
          console.info("[diagnostic.service.saveResponses] Creating response row", {
            diagnosticId,
            index,
            questionCode: responseData.questionCode,
            questionOrder: responseData.questionOrder,
            axis: responseData.axis,
          });

          const upsertSql = `
            INSERT INTO "diagnostic_responses" (
              "id",
              "diagnosticId",
              "questionCode",
              "questionOrder",
              "axis",
              "questionText",
              "questionType",
              "answerText",
              "score",
              "weight",
              "answeredAt",
              "updatedAt"
            )
            VALUES (
              ${sqlLiteral(responseId)}::uuid,
              ${sqlLiteral(diagnosticId)}::uuid,
              ${sqlLiteral(responseData.questionCode)},
              ${sqlLiteral(responseData.questionOrder)},
              ${sqlLiteral(responseData.axis)},
              ${sqlLiteral(responseData.questionText)},
              ${sqlLiteral(responseData.questionType)},
              ${sqlLiteral(responseData.answerText)},
              ${sqlLiteral(responseData.score)},
              ${sqlLiteral(Number(responseData.weight))},
              NOW(),
              NOW()
            )
            ON CONFLICT ("diagnosticId", "questionOrder") DO UPDATE SET
              "questionCode" = EXCLUDED."questionCode",
              "axis" = EXCLUDED."axis",
              "questionText" = EXCLUDED."questionText",
              "questionType" = EXCLUDED."questionType",
              "answerText" = EXCLUDED."answerText",
              "score" = EXCLUDED."score",
              "weight" = EXCLUDED."weight",
              "answeredAt" = EXCLUDED."answeredAt",
              "updatedAt" = NOW()
          `;

          await tx.$executeRawUnsafe(upsertSql);
        }

        const saved = await tx.diagnosticResponse.findMany({
          where: { diagnosticId },
          orderBy: { questionOrder: "asc" },
        });

        return saved;
      }, {
        maxWait: 15_000,
        timeout: 60_000,
      });

      console.info("[diagnostic.service.saveResponses] Transaction completed", {
        organizationId,
        diagnosticId,
        durationMs: Date.now() - t0,
        savedResponses: result.length,
      });

      console.info("[diagnostic.service.saveResponses] Invalidating cache after successful save", {
        organizationId,
        cacheKey: `diagnostic:current:${organizationId}`,
      });
      await cache.delete(`diagnostic:current:${organizationId}`);

      return result;
    } catch (error) {
      console.error("[diagnostic.service.saveResponses] Transaction failed", {
        organizationId,
        diagnosticId,
        durationMs: Date.now() - t0,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  async calculateScore(supabaseUserId: string, diagnosticId: string, responsibilityDeclarationAccepted: boolean) {
    console.log(`[DiagnosticService.calculateScore] Início do cálculo de score:`, {
      supabaseUserId,
      diagnosticId,
    });

    const organizationId = await authRepository.findOrganizationIdBySupabaseUserId(supabaseUserId);

    if (!organizationId) {
      console.error(`[DiagnosticService.calculateScore] Erro: Empresa não encontrada para o usuário ${supabaseUserId}`);
      throw new Error("Empresa não encontrada para o usuário atual");
    }

    const diagnostic = await diagnosticRepository.findById(diagnosticId);
    if (!diagnostic) {
      console.error(`[DiagnosticService.calculateScore] Erro: Diagnóstico ${diagnosticId} não encontrado`);
      throw new Error("Diagnóstico não encontrado");
    }

    if (diagnostic.organizationId !== organizationId) {
      console.error(`[DiagnosticService.calculateScore] Erro: Diagnóstico ${diagnosticId} (Org: ${diagnostic.organizationId}) não pertence à empresa do usuário (Org: ${organizationId})`);
      throw new Error("Diagnóstico não pertence à sua empresa");
    }

    if (!responsibilityDeclarationAccepted) {
      console.error("[DiagnosticService.calculateScore] Responsabilidade não declarada pelo usuário", {
        diagnosticId,
        organizationId,
      });
      throw new Error("Você precisa declarar a responsabilidade pelas informações prestadas para concluir o diagnóstico");
    }

    const profile = await authRepository.findBySupabaseUserId(supabaseUserId);
    const organization = profile?.organizationUsers?.[0]?.organization;
    const questions = getDiagnosticQuestionsForSegment(
      organization?.industrySegment,
      organization?.businessSegment?.code,
      organization?.businessCategory?.code,
      diagnostic.kind
    );
    const questionWeightLookup = buildQuestionWeightLookup(questions);
    const totalQuestions = questions.length;

    console.log(`[DiagnosticService.calculateScore] Invalidando cache do diagnóstico para a empresa ${organizationId}`);
    await cache.delete(`diagnostic:current:${organizationId}`);

    // Buscar todas as respostas salvas do diagnóstico
    console.log(`[DiagnosticService.calculateScore] Buscando respostas no banco de dados para o diagnóstico ${diagnosticId}...`);
    const savedResponses = await prisma.diagnosticResponse.findMany({
      where: { diagnosticId },
    });

    console.log(`[DiagnosticService.calculateScore] Total de respostas encontradas: ${savedResponses.length}`);

    const toPercentage = (rawScore1to5: number) => parseFloat((rawScore1to5 * 20).toFixed(2));
    const calculateWeightedAverage1to5 = (responsesList: Array<{ score: number; weight: number }>) => {
      if (responsesList.length === 0) return 0;

      const weightedSum = responsesList.reduce((acc, curr) => acc + curr.score * curr.weight, 0);
      const totalWeight = responsesList.reduce((acc, curr) => acc + curr.weight, 0);

      if (totalWeight === 0) return 0;

      return weightedSum / totalWeight;
    };

    const scoredResponses = savedResponses
      .filter((response): response is typeof response & { score: number } => response.score !== null)
      .map((response) => ({
        axis: response.axis,
        score: response.score,
        weight: response.weight ? Number(response.weight) : questionWeightLookup.get(response.questionOrder) ?? 1,
      }));

    if (scoredResponses.length < totalQuestions) {
      throw new Error("Você deve responder todas as perguntas antes de finalizar o diagnóstico");
    }

    const envResponses = scoredResponses.filter((r) => r.axis === "ENVIRONMENTAL");
    const bioResponses = scoredResponses.filter((r) => r.axis === "BIOECONOMY_CIRCULAR");
    const socResponses = scoredResponses.filter((r) => r.axis === "SOCIAL");
    const govResponses = scoredResponses.filter((r) => r.axis === "GOVERNANCE");

    const environmentalRawScore = calculateWeightedAverage1to5(envResponses);
    const bioeconomyCircularRawScore = calculateWeightedAverage1to5(bioResponses);
    const socialRawScore = calculateWeightedAverage1to5(socResponses);
    const governanceRawScore = calculateWeightedAverage1to5(govResponses);

    const overallRawScore =
      (environmentalRawScore * 0.2) +
      (bioeconomyCircularRawScore * 0.2) +
      (socialRawScore * 0.3) +
      (governanceRawScore * 0.3);

    const cappedOverallRawScore = Math.min(overallRawScore, 4.0);

    const environmentalScore = toPercentage(environmentalRawScore);
    const bioeconomyCircularScore = toPercentage(bioeconomyCircularRawScore);
    const socialScore = toPercentage(socialRawScore);
    const governanceScore = toPercentage(governanceRawScore);

    const overallScore = toPercentage(cappedOverallRawScore);

    let maturityLevel: CalculatedDiagnosticScore["maturityLevel"] = "NASCENT";
    if (cappedOverallRawScore >= 4.5) maturityLevel = "OPTIMIZED";
    else if (cappedOverallRawScore >= 4.0) maturityLevel = "MANAGED";
    else if (cappedOverallRawScore >= 3.0) maturityLevel = "ESTABLISHED";
    else if (cappedOverallRawScore >= 2.0) maturityLevel = "DEVELOPING";

    console.log(`[DiagnosticService.calculateScore] Score Calculado:`, {
      axisScores: {
        environmentalScore,
        bioeconomyCircularScore,
        socialScore,
        governanceScore,
      },
      overallScore,
      maturityLevel,
      details: {
        answeredQuestions: scoredResponses.length,
        totalQuestions,
      },
    });

    console.log(`[DiagnosticService.calculateScore] Salvando scores e atualizando diagnóstico...`);
    const t0 = Date.now();
    try {
      const diagnosticScore = await this.saveCalculatedScore(diagnosticId, {
        overallScore,
        environmentalScore,
        bioeconomyCircularScore,
        socialScore,
        governanceScore,
        maturityLevel,
      });

      const result = {
        success: true,
        overallScore,
        environmentalScore,
        bioeconomyCircularScore,
        socialScore,
        governanceScore,
        maturityLevel,
        diagnosticScore,
      };

      console.log(`[DiagnosticService.calculateScore] Sucesso! Scores salvos e diagnóstico atualizado em ${Date.now() - t0}ms`);

      // Invalidate cached auth profile to update diagnostic status instantly in layout/context
      await cache.delete(`auth:profile:v2:${supabaseUserId}`);

      return result;
    } catch (error) {
      console.error(`[DiagnosticService.calculateScore] Erro ao salvar scores e atualizar diagnóstico:`, error);
      throw error;
    }
  }

  async getDiagnosticHistory(supabaseUserId: string) {
    console.info("[diagnostic.service.getDiagnosticHistory] Fetching diagnostic history", {
      supabaseUserId,
    });

    const organizationId = await authRepository.findOrganizationIdBySupabaseUserId(supabaseUserId);

    if (!organizationId) {
      console.warn("[diagnostic.service.getDiagnosticHistory] Organization not found for user", {
        supabaseUserId,
      });
      throw new Error("Empresa não encontrada para o usuário atual");
    }

    const diagnostics = await diagnosticRepository.findAllCompletedByOrganizationId(organizationId);
    return diagnostics;
  }

  async generateReportPDF(supabaseUserId: string): Promise<Buffer> {
    console.info("[diagnostic.service.generateReportPDF] [STAGE 1] Iniciando geração de PDF do relatório", {
      supabaseUserId,
    });

    const profile = await authRepository.findBySupabaseUserId(supabaseUserId);
    const organization = profile?.organizationUsers?.[0]?.organization;
    const organizationId = organization?.id ?? null;

    if (!organizationId || !organization) {
      console.warn("[diagnostic.service.generateReportPDF] [STAGE 1 - ERROR] Empresa não encontrada para o usuário", {
        supabaseUserId,
      });
      throw new Error("Empresa não encontrada para o usuário atual");
    }

    console.info("[diagnostic.service.generateReportPDF] [STAGE 2] Empresa/Organização localizada", {
      organizationId,
      legalName: organization.legalName,
      tradeName: organization.tradeName,
      cnpj: organization.cnpj,
      industrySegment: organization.industrySegment,
    });

    const hasSupplierRole = organization.roles?.some((r: any) => r.role === "SUPPLIER") ?? false;
    const hasCompanyRole = organization.roles?.some((r: any) => r.role === "COMPANY") ?? false;
    const isSupplierOrg = hasSupplierRole && !hasCompanyRole;

    console.info("[diagnostic.service.generateReportPDF] [STAGE 3] Perfis da organização avaliados", {
      hasSupplierRole,
      hasCompanyRole,
      isSupplierOrg,
    });

    const diagnostic = await diagnosticRepository.findCurrentByOrganizationId(organizationId);
    if (!diagnostic || diagnostic.status !== "COMPLETED") {
      console.warn("[diagnostic.service.generateReportPDF] [STAGE 4 - ERROR] Diagnóstico ativo não está concluído ou não existe", {
        organizationId,
        diagnosticId: diagnostic?.id,
        status: diagnostic?.status,
      });
      throw new Error("Não há diagnóstico concluído para gerar o relatório");
    }

    console.info("[diagnostic.service.generateReportPDF] [STAGE 4] Diagnóstico concluído localizado", {
      diagnosticId: diagnostic.id,
      kind: diagnostic.kind,
      status: diagnostic.status,
      completedAt: diagnostic.completedAt,
    });

    const scoreObj = diagnostic.score;
    const isPreDiagnostic = diagnostic.kind === "PRE_DIAGNOSTIC";
    const evidenceScores = await prisma.evidenceScore.findMany({
      where: { organizationId },
      select: { axis: true, provenScore: true },
    });
    const provenByAxis = new Map<string, number>(
      evidenceScores.map((item) => [item.axis, Number(item.provenScore ?? 0)]),
    );
    const evidenceProvenScores = [
      provenByAxis.get(Axis.ENVIRONMENTAL) ?? 0,
      provenByAxis.get(Axis.BIOECONOMY_CIRCULAR) ?? 0,
      provenByAxis.get(Axis.SOCIAL) ?? 0,
      provenByAxis.get(Axis.GOVERNANCE) ?? 0,
    ];

    const overallScore = scoreObj ? Math.round(Number(scoreObj.overallScore || 0)) : 0;
    const envScore = scoreObj ? Math.round(Number(scoreObj.environmentalScore || 0)) : 0;
    const bioScore = scoreObj ? Math.round(Number(scoreObj.bioeconomyCircularScore || 0)) : 0;
    const socScore = scoreObj ? Math.round(Number(scoreObj.socialScore || 0)) : 0;
    const govScore = scoreObj ? Math.round(Number(scoreObj.governanceScore || 0)) : 0;

    const globalProven = Math.round(evidenceProvenScores.reduce((total, score) => total + score, 0) / evidenceProvenScores.length);
    const envProven = evidenceProvenScores[0];
    const bioProven = evidenceProvenScores[1];
    const socProven = evidenceProvenScores[2];
    const govProven = evidenceProvenScores[3];

    console.info("[diagnostic.service.generateReportPDF] [STAGE 5] Pontuações carregadas do banco", {
      isPreDiagnostic,
      evidenceScoreRows: evidenceScores.length,
      overallScore,
      envScore,
      bioScore,
      socScore,
      govScore,
      globalProven,
      envProven,
      bioProven,
      socProven,
      govProven,
    });

    const getInterpretation = (score: number, axis: string) => {
      const axisName = axis === "E" ? "ambiental" : axis === "B" ? "de bioeconomia circular" : axis === "S" ? "social" : "de governança";
      const excellentThreshold = isSupplierOrg ? 32 : 80;
      const structuredThreshold = isSupplierOrg ? 24 : 60;
      const intermediateThreshold = isSupplierOrg ? 16 : 40;

      if (score >= excellentThreshold) {
        return `Excelente maturidade ${axisName}. Práticas avançadas consolidadas com ótimo acompanhamento de metas e indicadores.`;
      } else if (score >= structuredThreshold) {
        return `Desempenho ${axisName} estruturado. Processos em execução regular com oportunidades pontuais de aprimoramento.`;
      } else if (score >= intermediateThreshold) {
        return `Maturidade ${axisName} em nível intermediário. Políticas iniciadas, demandando maior formalização e auditoria.`;
      } else {
        return `Nível ${axisName} crítico/inicial. Alta necessidade de estruturação de processos e conformidade básica.`;
      }
    };

    const model = {
      globalScore: overallScore,
      globalProvenScore: globalProven,
      isPreDiagnostic,
      isSupplierOrg,
      axisScores: [
        {
          axis: "E",
          score: envScore,
          provenScore: envProven,
          interpretation: getInterpretation(envScore, "E"),
        },
        {
          axis: "B",
          score: bioScore,
          provenScore: bioProven,
          interpretation: getInterpretation(bioScore, "B"),
        },
        {
          axis: "S",
          score: socScore,
          provenScore: socProven,
          interpretation: getInterpretation(socScore, "S"),
        },
        {
          axis: "G",
          score: govScore,
          provenScore: govProven,
          interpretation: getInterpretation(govScore, "G"),
        },
      ],
    };

    console.info("[diagnostic.service.generateReportPDF] [STAGE 6] Carregando convites da empresa");
    const invites = isSupplierOrg ? [] : await inviteRepository.listInvites(organizationId);
    console.info("[diagnostic.service.generateReportPDF] [STAGE 6] Convites carregados", {
      isSupplierOrg,
      invitesCount: invites.length,
    });

    console.info("[diagnostic.service.generateReportPDF] [STAGE 7] Executando o gerador de PDF (Puppeteer + HTML template)...", {
      companyName: organization.legalName || organization.tradeName,
      cnpj: organization.cnpj,
      segment: organization.industrySegment,
    });

    const localizacao = organization.municipioEstado || (organization.city && organization.state ? `${organization.city} - ${organization.state}` : "Não informado");
    const porte = organization.porte || organization.size || "Não informado";
    const naturezaJuridica = organization.naturezaJuridica || "Não informado";
    const address = organization.enderecoCompleto ||
      [organization.addressLine1, organization.addressLine2, organization.city, organization.state, organization.postalCode]
        .filter(Boolean)
        .join(", ") ||
      "Não informado";

    const pdfBuffer = await generateESGReportPDF({
      isSupplierOrg,
      model,
      companyName: organization.legalName || organization.tradeName || "Minha Empresa",
      tradeName: organization.tradeName || organization.legalName || "Não informado",
      cnpj: organization.cnpj || "00.000.000/0001-00",
      segment: organization.industrySegment || "Serviços",
      invites,
      porte,
      localizacao,
      naturezaJuridica,
      responsibleName: profile.fullName || "Não informado",
      responsibleRole: profile.cargoFuncao || "Não informado",
      responsibleEmail: profile.email || organization.primaryEmail || "Não informado",
      responsiblePhone: profile.phone || organization.phone || "Não informado",
      participationLevel: profile.grauParticipacao || "Não informado",
      address,
      website: organization.website || "Não informado",
      numberOfCollaborators: organization.size || organization.porte || "Não informado",
      operationTime: organization.tempoOperacao || "Não informado",
      companyLogoUrl: organization.logoUrl || undefined,
    });

    console.info("[diagnostic.service.generateReportPDF] [STAGE 8] PDF gerado com sucesso", {
      pdfBufferLength: pdfBuffer.length,
    });

    return pdfBuffer;
  }
}
