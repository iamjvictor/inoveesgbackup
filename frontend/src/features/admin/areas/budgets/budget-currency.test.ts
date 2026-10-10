import test from "node:test";
import assert from "node:assert/strict";
import { parseBrazilianCurrency } from "./budget-currency";

test("parses Brazilian currency with thousands and decimal separators", () => {
  assert.equal(parseBrazilianCurrency("30.455,99"), 30455.99);
  assert.equal(parseBrazilianCurrency("30455,99"), 30455.99);
  assert.equal(parseBrazilianCurrency("R$ 30.455,99"), 30455.99);
});
