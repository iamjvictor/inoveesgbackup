import test from "node:test";
import assert from "node:assert/strict";
import { getErrorModalCopy } from "./error-modal-copy.ts";

test("provides a retry message for database unavailability", () => {
  assert.deepEqual(getErrorModalCopy("DATABASE_UNAVAILABLE"), {
    title: "Serviço temporariamente indisponível",
    message: "Não foi possível comunicar com o servidor agora. Tente novamente em instantes.",
    retryLabel: "Tentar novamente",
  });
});

test("provides a generic reusable error message by default", () => {
  assert.deepEqual(getErrorModalCopy(), {
    title: "Não foi possível concluir a operação",
    message: "Ocorreu um erro inesperado. Tente novamente.",
    retryLabel: "Tentar novamente",
  });
});
