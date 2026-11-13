import test from "node:test";
import assert from "node:assert/strict";
import { DiagnosticController } from "./diagnosticController.js";

function responseRecorder() {
  const result: { statusCode?: number; body?: unknown } = {};
  const response = {
    status(code: number) {
      result.statusCode = code;
      return this;
    },
    json(body: unknown) {
      result.body = body;
      return this;
    },
  };
  return { response, result };
}

test("GET current delegates to the read method and never starts a diagnostic", async () => {
  let currentCalls = 0;
  let startCalls = 0;
  const expected = { hasDiagnostic: true, diagnostic: { id: "selected" }, industrySegment: "Infraestrutura", questions: [] };
  const controller = new DiagnosticController({
    async getCurrentDiagnostic() { currentCalls += 1; return expected; },
    async startDiagnostic() { startCalls += 1; throw new Error("GET must not start a diagnostic"); },
  } as any);
  const { response, result } = responseRecorder();

  await controller.getCurrentDiagnostic({ user: { id: "user-id" } } as any, response as any);

  assert.equal(result.statusCode, 200);
  assert.deepEqual(result.body, expected);
  assert.equal(currentCalls, 1);
  assert.equal(startCalls, 0);
});

test("GET current rejects unauthenticated requests without calling the service", async () => {
  let currentCalls = 0;
  const controller = new DiagnosticController({
    async getCurrentDiagnostic() { currentCalls += 1; return { hasDiagnostic: false, questions: [] }; },
  } as any);
  const { response, result } = responseRecorder();

  await controller.getCurrentDiagnostic({} as any, response as any);

  assert.equal(result.statusCode, 401);
  assert.equal(currentCalls, 0);
});
