import test from "node:test";
import assert from "node:assert/strict";
import { getDatabaseErrorStatusCode, isDatabaseUnavailableError } from "./databaseErrors.js";

test("classifies Prisma P1001 as a database connectivity error", () => {
  const error = Object.assign(new Error("Can't reach database server"), { code: "P1001" });

  assert.equal(isDatabaseUnavailableError(error), true);
  assert.equal(getDatabaseErrorStatusCode(error), 503);
});

test("classifies pooler reachability messages as a database connectivity error", () => {
  const error = new Error("Can't reach database server at aws-1-us-west-1.pooler.supabase.com:5432");

  assert.equal(isDatabaseUnavailableError(error), true);
  assert.equal(getDatabaseErrorStatusCode(error), 503);
});

test("keeps domain and validation errors as bad requests", () => {
  const error = new Error("Respostas são obrigatórias para salvar o pilar");

  assert.equal(isDatabaseUnavailableError(error), false);
  assert.equal(getDatabaseErrorStatusCode(error), 400);
});
