import test from "node:test";
import assert from "node:assert/strict";
import { getBioimpactoPriceCents } from "./bioimpactoPricing.js";

test("maps company size to annual Bioimpacto prices", () => {
  assert.equal(getBioimpactoPriceCents({ porte: "Pequena empresa" }), 3_800_000);
  assert.equal(getBioimpactoPriceCents({ porte: "Média empresa" }), 5_600_000);
  assert.equal(getBioimpactoPriceCents({ porte: "Grande empresa" }), 8_000_000);
  assert.equal(getBioimpactoPriceCents({ porte: "MEI" }), 3_800_000);
  assert.equal(getBioimpactoPriceCents({}), null);
});

test("charges the highest profile tier signaled by revenue, employees or suppliers", () => {
  assert.equal(getBioimpactoPriceCents({ porte: "Pequena empresa", annualRevenue: "De R$ 4,8 milhões a R$ 20 milhões" }), 5_600_000);
  assert.equal(getBioimpactoPriceCents({ porte: "Pequena empresa", size: "100 a 499" }), 8_000_000);
  assert.equal(getBioimpactoPriceCents({ porte: "Média empresa", numberOfSuppliers: "Mais de 100" }), 8_000_000);
  assert.equal(getBioimpactoPriceCents({ porte: "Grande empresa", size: "1 a 5" }), 8_000_000);
});
