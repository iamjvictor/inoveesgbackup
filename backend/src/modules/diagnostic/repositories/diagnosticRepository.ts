import { prisma } from "../../../lib/prisma.js";
import { DiagnosticKind, DiagnosticStatus } from "@prisma/client";

export class DiagnosticRepository {
  async findOpenByOrganizationId(organizationId: string) {
    console.info("[diagnostic.repository.findOpenByOrganizationId] Searching open diagnostic", {
      organizationId,
    });

    return prisma.diagnostic.findFirst({
      where: {
        organizationId,
        status: { in: ["DRAFT", "ACTIVE"] },
      },
      select: {
        id: true,
        kind: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async findLatestCompletedByOrganizationId(organizationId: string) {
    console.info("[diagnostic.repository.findLatestCompletedByOrganizationId] Searching latest completed diagnostic", {
      organizationId,
    });

    return prisma.diagnostic.findFirst({
      where: {
        organizationId,
        status: "COMPLETED",
      },
      select: {
        id: true,
        kind: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async findAllCompletedByOrganizationId(organizationId: string) {
    console.info("[diagnostic.repository.findAllCompletedByOrganizationId] Searching all completed diagnostics", {
      organizationId,
    });

    return prisma.diagnostic.findMany({
      where: {
        organizationId,
        status: "COMPLETED",
      },
      select: {
        id: true,
        kind: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true,
        score: true,
        responses: {
          select: {
            id: true,
            axis: true,
            questionText: true,
            answerText: true,
            score: true,
          }
        }
      },
      orderBy: {
        completedAt: "desc",
      },
    });
  }


  async createDraftDiagnostic(
    organizationId: string,
    _title?: string,
    kind: DiagnosticKind = "FULL_DIAGNOSTIC",
    status: DiagnosticStatus = "DRAFT",
  ) {
    console.info("[diagnostic.repository.createDraftDiagnostic] Creating draft diagnostic", {
      organizationId,
      kind,
    });

    return prisma.diagnostic.create({
      data: {
        organizationId,
        kind,
        status,
      },
      select: {
        id: true,
        kind: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async createPreDiagnostic(organizationId: string, status: DiagnosticStatus = "ACTIVE") {
    console.info("[diagnostic.repository.createPreDiagnostic] Creating pre-diagnostic", {
      organizationId,
      status,
    });

    return prisma.diagnostic.create({
      data: {
        organizationId,
        kind: "PRE_DIAGNOSTIC",
        status,
      },
    });
  }

  async findById(id: string) {
    console.info("[diagnostic.repository.findById] Loading diagnostic by id", { id });

    return prisma.diagnostic.findUnique({
      where: { id },
    });
  }

  async updateStatus(id: string, status: DiagnosticStatus) {
    console.info("[diagnostic.repository.updateStatus] Updating diagnostic status", {
      id,
      status,
    });

    return prisma.diagnostic.update({
      where: { id },
      data: { status },
    });
  }

  /** Lean lookup: only id + status + hasResponses flag — no JOIN on responses rows. */
  async findCurrentByOrganizationId(
    organizationId: string,
    kinds?: ("PRE_DIAGNOSTIC" | "FULL_DIAGNOSTIC")[],
  ) {
    console.info("[diagnostic.repository.findCurrentByOrganizationId] Fetching current diagnostic", {
      organizationId,
    });

    return prisma.diagnostic.findFirst({
      where: {
        organizationId,
        status: { in: ["ACTIVE", "DRAFT", "COMPLETED"] },
        ...(kinds ? { kind: { in: kinds } } : {}),
      },
      select: {
        id: true,
        status: true,
        kind: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true,
        _count: { select: { responses: true } },
        score: true,
        organization: {
          select: {
            evidenceScores: {
              select: {
                axis: true,
                approvedPoints: true,
                totalAvailablePoints: true,
                provenScore: true,
                approvedEvidenceCount: true,
              },
            },
          },
        },
        responses: {
          select: {
            questionOrder: true,
            axis: true,
            answerText: true,
          },
          orderBy: {
            questionOrder: "asc",
          },
        },
        evidences: {
          select: {
            id: true,
            fileName: true,
            filePath: true,
            fileUrl: true,
            fileSizeBytes: true,
            mimeType: true,
            storageBucket: true,
            uploadStatus: true,
            verificationStatus: true,
            evidenceCategory: true,
            uploadedAt: true,
            requestId: true,
            documentType: true,
            reviews: {
              orderBy: { reviewedAt: "desc" },
              take: 1,
              select: {
                reviewedAt: true,
                newStatus: true,
                reviewer: {
                  select: {
                    fullName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /** Full lookup: includes all response rows (used only when submitting/calculating). */
  async findCurrentByOrganizationIdWithResponses(organizationId: string) {
    console.info(
      "[diagnostic.repository.findCurrentByOrganizationIdWithResponses] Fetching current diagnostic with responses",
      { organizationId }
    );

    return prisma.diagnostic.findFirst({
      where: {
        organizationId,
        status: { in: ["ACTIVE", "DRAFT"] },
      },
      include: {
        responses: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
