import test from "node:test";
import assert from "node:assert/strict";
import { sendEmail } from "./sendEmail.js";

test("sendEmail rejects empty recipient gracefully without throwing", async () => {
  const result = await sendEmail("WELCOME", "", { name: "Teste" });
  assert.equal(result.success, false);
  assert.equal(result.error, "Destinatário inválido");
});

test("sendEmail rejects whitespace recipient gracefully without throwing", async () => {
  const result = await sendEmail("WELCOME", "   ", { name: "Teste" });
  assert.equal(result.success, false);
  assert.equal(result.error, "Destinatário inválido");
});
