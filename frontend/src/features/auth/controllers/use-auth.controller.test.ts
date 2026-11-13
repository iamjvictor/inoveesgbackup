import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeAuthError } from "./sanitize-auth-error.ts";

test("sanitizes HTML / SyntaxError from failed JSON responses (e.g. 404 or 500 HTML)", () => {
  const rawError = 'Unexpected token \'<\', "<!DOCTYPE "... is not valid JSON';
  
  assert.equal(
    sanitizeAuthError(rawError, "login"),
    "Serviço temporariamente indisponível. Verifique se o servidor está ativo e tente novamente."
  );

  assert.equal(
    sanitizeAuthError(rawError, "adminLogin"),
    "Não foi possível conectar ao serviço de autenticação administrativa."
  );

  assert.equal(
    sanitizeAuthError(rawError, "register"),
    "Erro de comunicação com o servidor. Tente novamente em alguns instantes."
  );
});

test("sanitizes 404 Not Found error responses", () => {
  const error404 = "Failed to load resource: the server responded with a status of 404 ()";
  assert.equal(
    sanitizeAuthError(error404, "login"),
    "Não foi possível conectar ao servidor. Tente novamente mais tarde."
  );

  const error404Short = "Serviço temporariamente indisponível (404)";
  assert.equal(
    sanitizeAuthError(error404Short, "login"),
    "Serviço temporariamente indisponível (404). Tente novamente mais tarde."
  );
});

test("sanitizes network failures and server down errors", () => {
  assert.equal(
    sanitizeAuthError("TypeError: fetch failed", "login"),
    "Não foi possível conectar ao servidor. Tente novamente mais tarde."
  );

  assert.equal(
    sanitizeAuthError("connect ECONNREFUSED 127.0.0.1:4000", "login"),
    "Não foi possível conectar ao servidor. Tente novamente mais tarde."
  );
});

test("sanitizes internal server / database / schema leakage", () => {
  assert.equal(
    sanitizeAuthError("PrismaClientKnownRequestError: Invalid `prisma.user.findUnique()` invocation", "login"),
    "Ocorreu um erro interno. Tente novamente em alguns instantes."
  );
});

test("allows clean business errors to be displayed to the user", () => {
  assert.equal(
    sanitizeAuthError("E-mail ou senha incorretos", "login"),
    "E-mail ou senha incorretos"
  );

  assert.equal(
    sanitizeAuthError("Este e-mail já está cadastrado.", "register"),
    "Este e-mail já está cadastrado."
  );
});
