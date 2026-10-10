import { Axis } from "@prisma/client";
import { agroEvidenceScoringProfile, type EvidenceScoringProfile } from "../catalogs/agroEvidenceCatalog.js";

export const evidenceScoreAxes = [
  Axis.ENVIRONMENTAL,
  Axis.BIOECONOMY_CIRCULAR,
  Axis.SOCIAL,
  Axis.GOVERNANCE,
] as const;

export const evidencePillarPointTotals = agroEvidenceScoringProfile.pillarTotals;

type EvidenceIndexInput = {
  requirementId: string;
  points: number;
  scoringAxes?: string[] | null;
  verified: boolean;
};

function mapScoringAxis(value: string): (typeof evidenceScoreAxes)[number] | null {
  const normalized = value.trim().toUpperCase();
  if (normalized === "E" || normalized === "AMBIENTAL") return Axis.ENVIRONMENTAL;
  if (normalized === "B" || normalized === "BIOECONOMIA" || normalized === "BIOECONOMIA CIRCULAR") return Axis.BIOECONOMY_CIRCULAR;
  if (normalized === "S" || normalized === "SOCIAL") return Axis.SOCIAL;
  if (normalized === "G" || normalized === "GOVERNANÇA" || normalized === "GOVERNANCA") return Axis.GOVERNANCE;
  return null;
}

export function calculateEvidenceIndices(
  evidences: EvidenceIndexInput[],
  profile: EvidenceScoringProfile = agroEvidenceScoringProfile,
) {
  const approvedRequirements = new Map<string, EvidenceIndexInput>();
  for (const evidence of evidences) {
    const current = approvedRequirements.get(evidence.requirementId);
    if (!current || evidence.verified) approvedRequirements.set(evidence.requirementId, evidence);
  }

  const approvedPointsByAxis = Object.fromEntries(evidenceScoreAxes.map((axis) => [axis, 0])) as Record<(typeof evidenceScoreAxes)[number], number>;
  let icebPoints = 0;
  for (const evidence of approvedRequirements.values()) {
    if (!evidence.verified) continue;
    icebPoints += evidence.points;
    for (const scoringAxis of evidence.scoringAxes ?? []) {
      const axis = mapScoringAxis(scoringAxis);
      if (axis) approvedPointsByAxis[axis] += evidence.points;
    }
  }

  return {
    pillars: Object.fromEntries(
      evidenceScoreAxes.map((axis) => [axis, calculateEvidenceProvenScore(approvedPointsByAxis[axis], profile.pillarTotals[axis])]),
    ) as Record<(typeof evidenceScoreAxes)[number], number>,
    pillarPoints: Object.fromEntries(
      evidenceScoreAxes.map((axis) => [axis, {
        approvedPoints: approvedPointsByAxis[axis],
        totalAvailablePoints: profile.pillarTotals[axis],
      }]),
    ) as Record<(typeof evidenceScoreAxes)[number], { approvedPoints: number; totalAvailablePoints: number }>,
    icebPoints: { approvedPoints: icebPoints, totalAvailablePoints: profile.icebTotalPoints },
    iceb: calculateEvidenceProvenScore(icebPoints, profile.icebTotalPoints),
  };
}

export function buildInitialEvidenceScoreRows(
  organizationId: string,
  profile: EvidenceScoringProfile = agroEvidenceScoringProfile,
) {
  return evidenceScoreAxes.map((axis) => ({
    organizationId,
    axis,
    approvedPoints: 0,
    totalAvailablePoints: profile.pillarTotals[axis],
    provenScore: 0,
    approvedEvidenceCount: 0,
  }));
}

export function calculateEvidenceProvenScore(approvedPoints: number, totalPoints: number) {
  if (totalPoints <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((approvedPoints / totalPoints) * 100)));
}
