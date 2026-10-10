import test from "node:test";
import assert from "node:assert/strict";
import { Axis } from "@prisma/client";
import { agroEvidenceCatalog, agroEvidenceScoringProfile } from "../catalogs/agroEvidenceCatalog.js";
import {
  buildInitialEvidenceScoreRows,
  calculateEvidenceProvenScore,
  calculateEvidenceIndices,
} from "./evidenceScore.js";

test("Agro catalog contains the spreadsheet EVs and derives its scoring profile", () => {
  assert.equal(agroEvidenceCatalog.length, 40);
  assert.deepEqual(agroEvidenceCatalog.find((item) => item.code === "EV03"), {
    code: "EV03",
    title: "Metas e plano ambiental",
    points: 3,
    scoringAxes: [Axis.ENVIRONMENTAL, Axis.GOVERNANCE, Axis.BIOECONOMY_CIRCULAR],
  });
  assert.deepEqual(agroEvidenceCatalog.find((item) => item.code === "EV23"), {
    code: "EV23",
    title: "Fornecedores locais/comunitários",
    points: 2,
    scoringAxes: [Axis.SOCIAL, Axis.GOVERNANCE, Axis.BIOECONOMY_CIRCULAR],
  });
  assert.equal(agroEvidenceScoringProfile.icebTotalPoints, 100);
  assert.deepEqual(agroEvidenceScoringProfile.pillarTotals, {
    [Axis.ENVIRONMENTAL]: 73,
    [Axis.BIOECONOMY_CIRCULAR]: 76,
    [Axis.SOCIAL]: 51,
    [Axis.GOVERNANCE]: 79,
  });
});

test("buildInitialEvidenceScoreRows creates one zeroed score for each company pillar", () => {
  assert.deepEqual(buildInitialEvidenceScoreRows("organization-id"), [
    { organizationId: "organization-id", axis: Axis.ENVIRONMENTAL, approvedPoints: 0, totalAvailablePoints: 73, provenScore: 0, approvedEvidenceCount: 0 },
    { organizationId: "organization-id", axis: Axis.BIOECONOMY_CIRCULAR, approvedPoints: 0, totalAvailablePoints: 76, provenScore: 0, approvedEvidenceCount: 0 },
    { organizationId: "organization-id", axis: Axis.SOCIAL, approvedPoints: 0, totalAvailablePoints: 51, provenScore: 0, approvedEvidenceCount: 0 },
    { organizationId: "organization-id", axis: Axis.GOVERNANCE, approvedPoints: 0, totalAvailablePoints: 79, provenScore: 0, approvedEvidenceCount: 0 },
  ]);
});

test("calculateEvidenceProvenScore converts approved evidence points into a 0-100 score", () => {
  assert.equal(calculateEvidenceProvenScore(0, 10), 0);
  assert.equal(calculateEvidenceProvenScore(4, 10), 40);
  assert.equal(calculateEvidenceProvenScore(12, 10), 100);
  assert.equal(calculateEvidenceProvenScore(4, 0), 0);
});

test("calculateEvidenceIndices applies one evidence to every mapped pillar and ICEB once", () => {
  const result = calculateEvidenceIndices([
    {
      requirementId: "EV23",
      points: 2,
      scoringAxes: ["Social", "Governança", "Bioeconomia"],
      verified: true,
    },
  ]);

  assert.deepEqual(result.pillars, {
    [Axis.ENVIRONMENTAL]: 0,
    [Axis.BIOECONOMY_CIRCULAR]: 3,
    [Axis.SOCIAL]: 4,
    [Axis.GOVERNANCE]: 3,
  });
  assert.deepEqual(result.pillarPoints, {
    [Axis.ENVIRONMENTAL]: { approvedPoints: 0, totalAvailablePoints: 73 },
    [Axis.BIOECONOMY_CIRCULAR]: { approvedPoints: 2, totalAvailablePoints: 76 },
    [Axis.SOCIAL]: { approvedPoints: 2, totalAvailablePoints: 51 },
    [Axis.GOVERNANCE]: { approvedPoints: 2, totalAvailablePoints: 79 },
  });
  assert.deepEqual(result.icebPoints, { approvedPoints: 2, totalAvailablePoints: 100 });
  assert.equal(result.iceb, 2);
});
