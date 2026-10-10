import test from "node:test";
import assert from "node:assert/strict";
import { strategicDiagnosticPricing } from "./strategic-diagnostic-pricing.ts";

test("emphasizes installments and keeps the full price below", () => {
  assert.deepEqual(strategicDiagnosticPricing, {
    installments: "R$ 662,50 x12",
    fullPrice: "À vista: R$ 7.950,00",
    consultingInstallments: "+ R$ 66,50 x12",
    consultingFullPrice: "À vista + R$ 800,00",
    combinedInstallments: "R$ 729,00 x12",
    combinedFullPrice: "À vista: R$ 8.750,00",
  });
});
