import assert from "node:assert/strict";
import test from "node:test";

import { BUSINESS_CATEGORIES, BUSINESS_SEGMENTS } from "./businessCatalog.js";

test("expõe óleo e gás como categoria com segmento próprio", () => {
  assert.deepEqual(BUSINESS_CATEGORIES.find((category) => category.code === "OLEO_E_GAS"), {
    code: "OLEO_E_GAS",
    name: "Óleo e Gás",
  });
  assert.deepEqual(BUSINESS_SEGMENTS.OLEO_E_GAS, [
    { code: "OLEO_E_GAS", name: "Óleo e Gás" },
  ]);
});

test("expõe infraestrutura como categoria com segmento próprio", () => {
  assert.deepEqual(BUSINESS_CATEGORIES.find((item) => item.code === "INFRAESTRUTURA"), {
    code: "INFRAESTRUTURA",
    name: "Infraestrutura",
  });
  assert.deepEqual(BUSINESS_SEGMENTS.INFRAESTRUTURA, [
    { code: "INFRAESTRUTURA", name: "Infraestrutura" },
  ]);
});
