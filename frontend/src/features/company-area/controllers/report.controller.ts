import { reportSummary } from "../models/mock-data";
import { getResultsViewModel } from "./results.controller";

export function getReportViewModel() {
  const results = getResultsViewModel();

  return {
    summary: reportSummary,
    globalScore: results.globalScore,
    axisScores: results.axisScores,
    actions: results.actions,
  };
}
