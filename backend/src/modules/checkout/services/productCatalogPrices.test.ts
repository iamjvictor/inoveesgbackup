import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

// These checks verify the checked-in Prisma migrations, not a live database.
const migrationsPath = resolve(fileURLToPath(new URL("../../../../prisma/migrations", import.meta.url)));
const migrationFiles = readdirSync(migrationsPath)
  .sort()
  .map((name) => resolve(migrationsPath, name, "migration.sql"))
  .filter((path) => {
    try { readFileSync(path); return true; } catch { return false; }
  });
const migrationSql = migrationFiles.map((path) => readFileSync(path, "utf8")).join("\n");

function insertedPriceCents(code: string): number | null {
  const escapedCode = code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matches = [...migrationSql.matchAll(new RegExp(`'${escapedCode}'[\\s\\S]{0,500}?([0-9]{4,8})`, "g"))];
  const values = matches.map((match) => Number(match[1])).filter((value) => value >= 0);
  return values.at(-1) ?? null;
}

test("migration catalog prices match the requested one-time product prices", () => {
  const expected = {
    PRE_DIAGNOSTIC: 25_000,
    PRE_DIAGNOSTIC_PLUS: 55_000,
    FULL_DIAGNOSTIC: 795_000,
    FULL_DIAGNOSTIC_PLUS: 875_000,
  };

  for (const [code, priceCents] of Object.entries(expected)) {
    assert.equal(insertedPriceCents(code), priceCents, `${code} should be R$ ${(priceCents / 100).toFixed(2)}`);
  }

  const packageOnePriceMigration = migrationFiles
    .map((path) => readFileSync(path, "utf8").replace(/--[^\n]*/g, ""))
    .find((sql) => /UPDATE\s+"products"[\s\S]*?WHERE\s+"code"\s*=\s*'PRE_DIAGNOSTIC_PLUS'/i.test(sql));
  assert.match(
    packageOnePriceMigration ?? "",
    /UPDATE\s+"products"\s+SET\s+"priceCents"\s*=\s*55000[\s\S]*?WHERE\s+"code"\s*=\s*'PRE_DIAGNOSTIC_PLUS'/i,
    "Pacote 1 migration must persist R$ 550 for PRE_DIAGNOSTIC_PLUS",
  );
});
