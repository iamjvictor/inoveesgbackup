import test from "node:test";
import assert from "node:assert/strict";
import { resolveCheckoutLabels } from "./checkoutService.js";

test("catalogs the standalone one-hour consulting product", () => {
  assert.deepEqual(resolveCheckoutLabels("CONSULTING_1H"), {
    title: "Consultoria ESG — Call de 1 hora",
    description: "Sessão individual de consultoria ESG com duração de 1 hora.",
  });
});

test("catalogs the strategic diagnostic as a full diagnostic product", () => {
  assert.deepEqual(resolveCheckoutLabels("FULL_DIAGNOSTIC"), {
    title: "Diagnóstico Estratégico ESG",
    description: "Diagnóstico estratégico ESG com análise de evidências, plano de melhoria e selo de verificação.",
  });
});

test("catalogs the strategic diagnostic consulting upsell", () => {
  assert.deepEqual(resolveCheckoutLabels("FULL_DIAGNOSTIC_PLUS"), {
    title: "Diagnóstico Estratégico ESG + Consultoria",
    description: "Diagnóstico estratégico ESG com análise de evidências, plano de melhoria, selo de verificação e duas consultorias de 1 hora.",
  });
});
