import { priorityActions, scoreByAxis } from "../models/mock-data";

export function getResultsViewModel(options: { isSupplierOrg?: boolean } = {}) {
  const globalScore = Math.round(
    scoreByAxis.reduce((acc, item) => acc + item.score, 0) / scoreByAxis.length
  );

  return {
    globalScore,
    globalProvenScore: 0,
    isPreDiagnostic: true,
    isSupplierOrg: options.isSupplierOrg ?? false,
    axisScores: scoreByAxis.map(item => ({
      ...item,
      provenScore: 0,
    })),
    actions: priorityActions,
  };
}
