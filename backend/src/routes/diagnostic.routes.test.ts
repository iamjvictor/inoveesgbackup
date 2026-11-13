import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { createServer } from "node:http";
import { DiagnosticController } from "../modules/diagnostic/controllers/diagnosticController.js";
import { createDiagnosticRoutes } from "./diagnostic.routes.js";

test("registered GET /current keeps its controller context and does not start diagnostics", async () => {
  let currentCalls = 0;
  let startCalls = 0;
  const expected = {
    hasDiagnostic: true,
    diagnostic: { id: "selected-diagnostic" },
    industrySegment: "Infraestrutura",
    questions: [{ number: 1, prompt: "Pergunta" }],
  };
  const controller = new DiagnosticController({
    async getCurrentDiagnostic() { currentCalls += 1; return expected; },
    async startDiagnostic() { startCalls += 1; throw new Error("GET deve ser leitura"); },
  } as any);
  const app = express();
  app.use("/api/diagnostic", createDiagnosticRoutes(controller, (request, _response, next) => {
    (request as any).user = { id: "test-user" };
    next();
  }));
  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/diagnostic/current`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), expected);
    assert.equal(currentCalls, 1);
    assert.equal(startCalls, 0);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
